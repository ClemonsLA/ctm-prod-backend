import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"
import multer from "multer"
import { ThirdwebStorage } from "@thirdweb-dev/storage";
import { getWalletAddressByIssuer,getCreatorNameOfByWalletAddress } from "../db/db";
import {
    addNftToCollection,
    checkIfIsInCollection,
    checkIfUserIsOwner,
    checkIfUserIsCollectionCreator,
    createCollection,
    deleteNftFromCollection,
    deleteCollection,
    checkICollectionExist,
    checkIfUserIsOwnerInArray,
    addArrayOfNftsToCollection,
    deleteRelationsFromCollection
} from "../db/db-collection";
import { checkIfNftExist, checkIfNftsExistInArray } from "../db/db-listing";
import { getCollection, returnAllCollections } from "../services/collection-services";
import { status } from "../models/check";
import { checkImageType } from "../services/file-services";

const upload = multer()

const storage = new ThirdwebStorage();

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


config();

// POST
// Creating collection
router.post('/create', checkAuthenticated, checkRole(["User", "Label"]), upload.fields([{ name: 'avatarImage', maxCount: 1 }, { name: 'bannerImage', maxCount: 1 }]), async (req, res, next) => {

    /*
     #swagger.tags = ['User', 'Label']
    #swagger.description = 'Creating collection of nfts'
     #swagger.parameters['avatarImage'] = {
              in: 'formData',
              required: true,
              type: 'file',
              description: 'Picture for collection avatar(image/png, image/jpeg, image/jpg, image/webp, image/tiff)',
          }
  #swagger.parameters['bannerImage'] = {
              in: 'formData',
              required: true,
              type: 'file',
              description: 'Picture for collection banner(image/png, image/jpeg, image/jpg, image/webp, image/tiff)',
          }
       #swagger.parameters['RequestBody'] = {
                   in: 'body',
                   required: true,
                   type: 'object',
                   description: 'Required request body to create collection',
                   schema: {
                       name: 'string',
                       description: 'string',
                       nfts: 'Array<0>'
                   }
               }
           #swagger.responses[200] = {
                       description: 'Expected response body at code 200',
                       schema: {
                            "message": "successfully created collection",
                            "success": true
                        }
               }        
       */
    try {
        let { name, /* creatorName,  */description, nfts } = req.body as {
            /* creatorName: string, */
            name: string, // name of the collection
            description: string, // description of the collection
            nfts: number[] // array of nfts id in the collection
        }

        if (!nfts.length) nfts = [];

        /* creatorName = String(creatorName); */
        name = String(name);
        description = String(description);
        nfts = nfts.map(Number)
        


        // Check if every needed data is provided in request
        if (!name || !description || !nfts) {
            return res.status(400).send("Missing data in request");
        }

        //@ts-ignore

        const issuer = req?.user?.issuer;

        // fetching creator wallet address from user database by issuer
        const creatorAddress = String(await getWalletAddressByIssuer(issuer));
        const creator = await getCreatorNameOfByWalletAddress(creatorAddress) as {name : string};
        const creatorName = creator.name;
        // =====Check if the creator address was fetched from database correctly=====
        if (String(creatorAddress).slice(0, 2) != "0x") {
            throw new Error("Error fetching creator from database")
        }

        // check nfts
        let nftsNotOwned = [];
        let nonExistingNfts = [];
        let nftInLoop: Number[] = [];

        for (const nft of nfts.map(Number)) {
            // checking if nft repeats
            if (nftInLoop.includes(nft)) continue;

            // Checking if nft exist 
            const checkExistence = await checkIfNftExist(nft);
            if (checkExistence === true) { }
            else if (checkExistence === false) {
                nonExistingNfts.push(nft);
                continue;
            } else throw new Error("Error during checking existence of" + String(nft));

            // Checking if collection creator is owner of nft
            const checkOwnership = await checkIfUserIsOwner(creatorAddress, nft);
            if (checkOwnership === true) continue;
            else if (checkOwnership === false) nftsNotOwned.push(nft);
            else throw new Error("Error during checking ownership of " + String(nft));
        }

        if (nftsNotOwned.length > 0) return res.status(403).send("Nfts " + nftsNotOwned + " don't belong to user");
        if (nonExistingNfts.length > 0) return res.status(403).send("Nfts " + nftsNotOwned + " don't exists");

        /* FIXME: file processing
        // Check if every needed file is provided in request
         if (!req?.files) {
             return res.status(400).send("Missing files in request");
         }
 
         // File processing  
         //@ts-ignore
         const avatarImage = req?.files['avatarImage'][0];
         //@ts-ignore
         const bannerImage = req?.files['bannerImage'][0];
 
         if (!avatarImage || !bannerImage) {
             return res.status(400).send("avatarImage or bannerImage not provided - Collection can't be created");
         }
 
         let fileErrorMessage = "";
 
         if (!(await checkImageType(avatarImage.buffer))) {
             fileErrorMessage += "Wrong avatar image extension, "
         }
 
         if (!(await checkImageType(bannerImage.buffer))) {
             fileErrorMessage += "Wrong banner image extension"
         }
 
         if (fileErrorMessage !== "") return res.status(400).send(fileErrorMessage);
 
         // Here we get the IPFS URI of where our metadata has been uploaded
         const uriAvatarImage = await storage.upload(avatarImage); // This will look like ipfs://QmWgbcjKWCXhaLzMz4gNBxQpAHktQK6MkLvBkKXbsoWEEy/0
         const uriBannerImage = await storage.upload(bannerImage);
 
         // Here we a URL with a gateway that we can look at in the browser
         const urlAvatarImage = await storage.resolveScheme(uriAvatarImage); // This will lookL like https://ipfs.thirdwebcdn.com/ipfs/QmWgbcjKWCXhaLzMz4gNBxQpAHktQK6MkLvBkKXbsoWEEy/0
         const urlBannerImage = await storage.resolveScheme(uriBannerImage);
  */


        //console.log("avatar: ", uriAvatarImage);
        //console.log("banner: ", uriBannerImage);
        //return res.status(418).send({ uriAvatarImage, uriBannerImage });

        // creating collection in data base
        const collection = await createCollection(creatorAddress, creatorName, name, description, /* urlAvatarImage */"", ""/* urlBannerImage */, nfts);

        // checking if collection was successfully created
        //@ts-ignore
        if (!collection?.status) throw new Error("Unable to create collection: \n" + collection);

        return res.status(200).json({
            message: "successfully created collection",
            success: true
        })


    } catch (error) {
        console.error(error)
        return res.status(500).send("Error - failed to create new collection");
    }
})

router.get("/", async (req, res, next) => {
    /*
     #swagger.tags = ['Open']
     #swagger.description = 'Returns all collections'
     #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                  schema:{
                    "collections": [
                        {
                            "id": 1,
                            "name": "sensor",
                            "nfts": [],
                            "creatorAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                            "createdDate": "2023-07-04T10:42:57.422Z",
                            "rating": 0,
                            "avatarImage": "",
                            "bannerImage": "",
                            "description": "Consequatur reiciendis molestiae sit velit. Vel ut incidunt nobis sapiente nulla et. Est id nobis rem dolor ratione. Ut eos qui impedit.",
                            "creatorName": "undefined"
                            }
                        ]
                    }
        }
     */
    try {
        const collections = await returnAllCollections();
        res.status(200).send({ collections });

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to fetch all collections");
    }
})


router.get("/byId/:collectionId/", async (req, res, next) => {
    /*
    #swagger.tags = ['Open']
    #swagger.description = 'Returns one collection by id'
    #swagger.parameters['RequestBody'] = {
                in: 'body',
                required: true,
                type: 'object',
                description: 'Required request body to get collection by id',
                schema: {
                    collectionId: 'number',
                }
            }
        #swagger.responses[200] = {
                    description: 'Expected response body at code 200',
                    schema: {
                        "collection": {
                            "id": 1,
                            "name": "sensor",
                            "creatorAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                            "creatorName": "undefined",
                            "createdDate": "2023-07-04T10:42:57.422Z",
                            "rating": 0,
                            "avatarImage": "",
                            "bannerImage": "",
                            "description": "Consequatur reiciendis molestiae sit velit. Vel ut incidunt nobis sapiente nulla et. Est id nobis rem dolor ratione. Ut eos qui impedit."
                        },
                        "creator": {
                            "name": "c2",
                            "website": "adfs"
                        },
                        "nfts": []
                    }
            }        
    */
    try {

        let { collectionId } = req.params as {
            collectionId: string,

        }
        if (isNaN(parseInt(collectionId))) {
            return res.status(400).send("Collection id must be a number");
        }

        //Check if collection exist
        const checkCollectionExistence = await checkICollectionExist(parseInt(collectionId));
        if (checkCollectionExistence === true) { }
        else if (checkCollectionExistence === false) return res.status(400).send("Collection " + collectionId + " don't exist");
        else throw new Error("Error during checking if collection " + collectionId + " exist");

        const collection = await getCollection(Number(collectionId));

        res.status(200).send(collection)
        //@ts-ignore
    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to fetch collection");
    }
})
// PUT
// Adding NFT to collection

router.put('/nft', checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
    /*
    #swagger.parameters['RequestBody'] = {
                in: 'body',
                required: true,
                type: 'object',
                description: 'Required request body to add nft to collection',
                schema: {
                    collectionId: 'number',
                    nftId: 'number'
                }
            }
        #swagger.responses[200] = {
                    description: 'Expected response body at code 200. If nft belongs to a label, the wallet address is not null. 
                    Default value for isSellable and isRentable is false, when nft is put up for sale, these values ​​will be changed to true',

                   schema: {
            collection: {
                id: 1,
                nft: [
                    {
                        id: 1,
                        name: 'Chase the moonlite',
                        price: 1,
                        quantity: 1,
                        tokenInStock: 1,
                        tokenListed: 0,
                        description: 'Chase the moonlite description',
                        imageURL: 'https://imageURL/0',
                        musiURL: 'https://musicURL/0',
                        nftMintTime: '1970-01-01 00:00:00.000',
                        nftListTime: null,
                        contractId: 1,
                        contractAddress: '0x0000000000000000000000000000000000000001',
                        creatorWalletAddress: '0x0000000000000000000000000000000000000002',
                        tokenStandard: 'ERC1155',
                        labelWallet: null,
                        isSellable: false,
                        isRentable: false,
                        rentPrice: 1,
                        numberOfRents: 0,
                        numberOfCurrentRents: 0,
                        userLikes: 0,
                        userWhoLiked: [],
                        moderatorPoints: 0,
                        rankingPoints: 0,
                        highestRank: 0,
                        views: 0,
                        downloads: 0,
                        genre: 1,
                        isFlagged: false,
                        flagDescription: 'Flag description',
                        collections: [1]
                    }
                ]
            }
        }
    }
    */
    try {
        let { collectionId, nftId } = req.body as {
            collectionId: number,
            nftId: number
        }

        //@ts-ignore
        const issuer = req?.user?.issuer;

        // fetching creator wallet address from user database by issuer
        const creatorAddress = String(await getWalletAddressByIssuer(issuer));

        collectionId = Number(collectionId);
        nftId = Number(nftId);

        if (!collectionId || !nftId) {
            return res.status(400).send("Missing data in request");
        }

        // Check if issuer is creator of the collection
        const checkCreator = await checkIfUserIsCollectionCreator(creatorAddress, collectionId);
        if (checkCreator === true) { }
        else if (checkCreator === false) return res.status(403).send("User " + creatorAddress + " is not creator of collection " + collectionId);
        else throw new Error("Error during checking if user is collection creator of collection " + String(collectionId));

        // Check if nft is already in collection
        const checkRepeatability = await checkIfIsInCollection(collectionId, nftId)
        if (checkRepeatability === false) { }
        else if (checkRepeatability === true) return res.status(403).send("Nft " + nftId + " is already in collection");
        else throw new Error("Error during checking " + String(nftId));

        // Checking if nft exist 
        const checkExistence = await checkIfNftExist(nftId);
        if (checkExistence === true) { }
        else if (checkExistence === false) return res.status(403).send("Nft" + nftId + " don't exist");
        else throw new Error("Error during checking existence of " + String(nftId));

        // Check if collection creator is owner of nft
        const checkOwnership = await checkIfUserIsOwner(creatorAddress, nftId)
        if (checkOwnership === true) { }
        else if (checkOwnership === false) return res.status(403).send("Nft " + nftId + " don't belong to user");
        else throw new Error("Error during checking " + String(nftId));

        // Adding nft to collection 
        const newNFts = (await addNftToCollection(collectionId, nftId)) as status;

        // checking if collection was successfully created
        if (!newNFts?.status) throw new Error("Unable to add nft to collection: \n" + newNFts);

        return res.status(200).json({//@ts-ignore
            message: "successfully added nft to collection (NFTs: " + newNFts.data + ")",
            success: true
        })

        //@ts-ignore
    } catch ({ error, message }) {
        return res.status(500).send({ error, message });
    }
})
// PUT
// Adding a few NFT to collection
router.put('/fewNft', checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {

    try {
        let { collectionId, nftIds } = req.body as {
            collectionId: number,
            nftIds: number[]
        };

        //@ts-ignore
        const issuer = req?.user?.issuer;
        const creatorAddress = String(await getWalletAddressByIssuer(issuer));

        collectionId = Number(collectionId);

        if (!collectionId || !nftIds) {
            return res.status(400).send("Missing data in request");
        }

        const checkCreator = await checkIfUserIsCollectionCreator(creatorAddress, collectionId);
        if (checkCreator === true) { }
        else if (checkCreator === false) return res.status(403).send(`User ${creatorAddress} is not the creator of collection ${collectionId}`);
        else throw new Error(`Error during checking if user is the collection creator of collection ${collectionId}`);


        const checkExistence = await checkIfNftsExistInArray(nftIds);
        if (checkExistence === true) { }
        else if (checkExistence === false) return res.status(403).send("One or more NFTs don't exist");
        else throw new Error("Error during checking existence of NFTs");

        const checkOwnership = await checkIfUserIsOwnerInArray(creatorAddress, nftIds);
        if (checkOwnership === true) { }
        else if (checkOwnership === false) return res.status(403).send("One or more NFTs don't belong to the user");
        else throw new Error("Error during checking NFTs");

        await deleteRelationsFromCollection(collectionId);

        const newNFts = await addArrayOfNftsToCollection(collectionId, nftIds) as status;


        if (!newNFts?.status) throw new Error("Unable to add NFTs to the collection: \n" + newNFts);

        return res.status(200).json({
            message: `Successfully added NFTs to the collection (NFTs: ${newNFts.data})`,
            success: true
        });
        //@ts-ignore
    } catch ({ error, message }) {
        return res.status(500).send({ error, message });
    }
});

// DELETE
// Deleting nft from collection
router.delete('/nft', checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {

    /*
    #swagger.tags = ['User', 'Label']
    #swagger.description = 'Deleting nft from collection, user must be creator'
    #swagger.parameters['RequestBody'] = {
                in: 'body',
                required: true,
                type: 'object',
                description: 'Required request body to add nft to collection',
                schema: {
                    collectionId: 'number',
                    nftId: 'number'
                }
            }
    #swagger.responses[200] = {
                description: 'Expected response body at code 200.',

                schema: {
                    message: "successfully added nft to collection (NFTs: [1, 2])",
                    success: true
                }
}
    */

    try {
        let { collectionId, nftId } = req.body as {
            collectionId: number,
            nftId: number
        }

        //@ts-ignore
        const issuer = req?.user?.issuer;

        // fetching creator wallet address from user database by issuer
        const creatorAddress = String(await getWalletAddressByIssuer(issuer));

        collectionId = Number(collectionId);
        nftId = Number(nftId);


        if (!collectionId || !nftId) {
            return res.status(400).send("Missing data in request");
        }

        // Check if issuer is creator of the collection
        const checkCreator = await checkIfUserIsCollectionCreator(creatorAddress, collectionId);
        if (checkCreator === true) { }
        else if (checkCreator === false) return res.status(403).send("User " + creatorAddress + " is not creator of collection " + collectionId);
        else throw new Error("Error during checking if user is collection creator of collection " + String(collectionId));

        // Check if nft is in collection
        const checkRepeatability = await checkIfIsInCollection(collectionId, nftId)
        if (checkRepeatability === true) { }
        else if (checkRepeatability === false) return res.status(400).send("Nft " + nftId + " is not in collection");
        else throw new Error("Error during checking repeatability " + String(nftId));

        // Deleting nft from collection 
        const newNFts = await deleteNftFromCollection(collectionId, nftId);

        // checking if collection was successfully deleted
        //@ts-ignore
        if (!newNFts?.status) throw new Error("Unable to delete nft from collection: \n" + newNFts);

        return res.status(200).json({//@ts-ignore
            message: "successfully deleted nft from collection (NFTs: " + newNFts.data + ")",
            success: true
        })

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to delete nft from collection");
    }
})

// Deleting collection
router.delete('/', checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
    /*
   #swagger.tags = ['User', 'Label']
   #swagger.description = 'Deleting the collection, user must be creator'
   #swagger.parameters['RequestBody'] = {
               in: 'body',
               required: true,
               type: 'object',
               description: 'Required request body to add nft to collection',
               schema: {
                   collectionId: 'number'
               }
           }
   #swagger.responses[200] = {
               description: 'Expected response body at code 200.',

               schema: {
                    "message": "successfully deleted collection (NFTs: \n{\"id\":1,\"name\":\"sensor\",\"nfts\":[],\"creatorAddress\":\"0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C\",\"createdDate\":\"2023-07-04T10:42:57.422Z\",\"rating\":0,\"avatarImage\":\"\",\"bannerImage\":\"\",\"description\":\"Consequatur reiciendis molestiae sit velit. Vel ut incidunt nobis sapiente nulla et. Est id nobis rem dolor ratione. Ut eos qui impedit.\",\"creatorName\":\"undefined\"})",
                    "success": true
                }
    }
*/
    try {
        let { collectionId } = req.body as {
            collectionId: number,
        }

        //@ts-ignore
        const issuer = req?.user?.issuer;


        // fetching creator wallet address from user database by issuer
        const creatorAddress = String(await getWalletAddressByIssuer(issuer));

        collectionId = Number(collectionId);


        if (!collectionId) {
            return res.status(400).send("Missing data in request");
        }

        //Check if collection exist
        const checkExistence = await checkICollectionExist(collectionId);
        if (checkExistence === true) { }
        else if (checkExistence === false) return res.status(400).send("Collection " + collectionId + " don't exist");
        else throw new Error("Error during checking if collection " + String(collectionId) + " exist");


        // Check if issuer is creator of the collection
        const checkCreator = await checkIfUserIsCollectionCreator(creatorAddress, collectionId);
        if (checkCreator === true) { }

        else if (checkCreator === false) return res.status(403).send("User " + creatorAddress + " is not creator of collection " + collectionId);
        else throw new Error("Error during checking if user is collection creator of collection " + String(collectionId));

        // Deleting to collection 
        const collection = await deleteCollection(collectionId);

        // checking if collection was successfully created
        //@ts-ignore
        if (!collection?.status) throw new Error("Unable to delete collection: \n" + collection);

        return res.status(200).json({//@ts-ignore
            message: "successfully deleted collection (NFTs: \n" + JSON.stringify(collection.data) + ")",
            success: true
        })

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to delete collection");
    }
})


export { router };




