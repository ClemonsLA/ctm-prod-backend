
import express from "express"
import { NFT } from "@thirdweb-dev/sdk";
import { nftContractStandard } from '../data/ContractType';
import bodyParser from "body-parser";
import { MetadataNft, Minting } from "../models/listing";
import { createNFTOnDatabase } from "../db/db-contract";
import multer from "multer"
import { getContractFromPrivateKey, getNftFromContractById } from "../services/Contract-services";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"
import { getWalletAddressByIssuer } from "../db/db";
import { status } from "../models/check";
import { checkImageType, checkMusicType } from "../services/file-services";
import { checkIfGenreExist } from "../db/db-genre";

/*
Api to generate signature for Signature-based Minting with ThirdwebSDK
and mint NFT, all cost are covered by ADMIN_WALLET_PRIVATE_KEY wallet
after successfully minting to thirdweb, nft is added to database
*/

const upload = multer()

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.post("/", checkAuthenticated, checkRole(["User", "Label"]), upload.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'music', maxCount: 1 }]), async (req, res, next) => {
    /*
    #swagger.tags = ['User', 'Label']
    #swagger.description = 'User must be logged in to mint nft'
    #swagger.responses[200] = {  description: 'Successfully minted nft', schema : {"message": "Successfully minted nft.","contractId": 68} } 
    #swagger.parameters['coverImage'] = {
              in: 'formData',
              required: true,
              type: 'file',
              description: 'Picture for music cover image(image/png, image/jpeg, image/jpg, image/webp, image/tiff)',
          }
    #swagger.parameters['music'] = {
              in: 'formData',
              required: true,
              type: 'file',
              description: 'Music file(audio/mp4, audio/mpeg, audio/opus, audio/mpeg4-generic, audio/ogg)',
          }
    */
    try {
        const contractAddress = process.env.NFT_THIRWEB_COLLECTION_ADDRESS!;

        //@ts-ignore
        const issuer = req?.user?.issuer
        const address = String(await getWalletAddressByIssuer(issuer))// Wallet address of person who want to mint the nft 
        
        let { name, description, quantity, genre } = req.body as {
            name: string,  // Name of NFT (probably song title)
            description: string,  // Description of NFT
            quantity: number,  // Quantity of NFTs to be deployed
            genre: number, // Genre of music given as enum 
        };

        quantity = Number(quantity);
        genre = Number(genre);

        // Check if every needed data is provided in request
        if (!name || !description || !quantity || !genre) {
            return res.status(400).send("Missing data in request");
        }

        // Check if quantity is integer
        if (!Number.isInteger(quantity)) return res.status(400).send("quantity must be integer");

        // Check if quantity is greater than 0
        if (quantity <= 0) return res.status(400).send("quantity must be greater than 0");

        // Check if quantity is integer
        if (!Number.isInteger(genre)) return res.status(400).send("genre must be integer");

        // Check if quantity is greater than 0
        if (genre <= 0) return res.status(400).send("genre must be greater than 0");

        // Check if genre exist in database
        if (!checkIfGenreExist(genre)) return res.status(400).send("genre don't exist");

        // Check if every needed file is provided in request
        if (!req?.files) {
            return res.status(400).send("Missing files in request");
        }
        if (Number(quantity) <= 0 || !Number.isInteger(quantity)) {
            return res.status(400).send("Quantity must be positive integer.");
        }


        //@ts-ignore
        const coverImage = req?.files['coverImage'][0];
        //@ts-ignore
        const music = req?.files['music'][0];

        let fileErrorMessage = "";

        if (!(await checkImageType(coverImage.buffer))) {
            fileErrorMessage += "Wrong image extension, "
        }

        if (!(await checkMusicType(music.buffer))) {
            fileErrorMessage += "Wrong music extension"
        }

        if (fileErrorMessage !== "") return res.status(400).send(fileErrorMessage);


        let nftCollection = await getContractFromPrivateKey(contractAddress);

        // Creating metadata of NFT
        const metadata: MetadataNft = {
            metadata: {
                name: name,  // Name of NFT (probably song title)
                description: description,  // Description of NFT
                image: coverImage.buffer,   // Address to or file containing cover image for song
                animation_url: music.buffer,  // Address or file containing music
                attributes: [{
                    creator: address, // Additional information-who is the creator of the nft  
                    genre: genre, // Genre of music given as enum 
                }],
            },
            quantity: quantity,  // Quantity of NFTs to be deployed 
            price: 0,    // Price to be charged for minting NFT 
            to: address,  // Address of crypto wallet of creator of NFT
        };


        // Generating signature based on above metadata

        const signature = await nftCollection?.signature.generate(metadata);
        //@ts-ignore
        const transaction = await (await nftCollection)?.signature.mint(signature);  // Minting NFT wit help of signature containing all metadata and signature itself
        let databaseCreatedNFT;

        if (transaction?.receipt?.status == 1) {   // Checking if NFT is successfully minted
            const id = parseInt(transaction.id._hex, 16); // Taking id of nft from returned transaction and parsing it from hex to decimal number


            let imageUrl;
            let musicUrl;

            // Function getNftFromContractById may not8 get full info so there will be performed maxTries number of ties
            const maxTries = 10;
            for (let i = 0; i < maxTries; i++) {
                const createdNft = await getNftFromContractById(contractAddress, id) as NFT;
                console.log(createdNft, `try number `, i);

                imageUrl = createdNft?.metadata?.image;
                musicUrl = createdNft?.metadata?.animation_url;

                if (!!imageUrl || !!musicUrl) break;
            }

            if (typeof imageUrl != 'string' || typeof musicUrl != 'string') {
                throw new Error("cover image or music not provided in NFT can't create database version of NFT")
            }

            const NFT: Minting = {
                name: name,
                quantity: Number(quantity),
                description: description,
                imageURL: imageUrl,
                musicURL: musicUrl,
                contractId: Number(id),
                contractAddress: contractAddress,
                creatorWalletAddress: address,
                tokenStandard: nftContractStandard,
                genre: Number(genre)
            }

            databaseCreatedNFT = await createNFTOnDatabase(NFT) as status  // Cloning NFT to database
            const contractId = NFT.contractId
            // checking if listing was created on database
            // if (!databaseCreatedNFT?.status) throw new Error("Unable to add nft to database");

            return res.status(200).json({message : "Successfully minted nft.",contractId});
        } else {
            console.error(transaction, databaseCreatedNFT);
            throw new Error("Minting failed");
        }


    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to mint an NFT");
    }
})

export { router }  
