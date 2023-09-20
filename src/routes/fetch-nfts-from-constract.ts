import express from "express"
import { nftContractType } from '../data/ContractType';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { contractNetwork } from "../data/ContractNetwork";
import { config } from 'dotenv';
import { getAllFromContract, getNftFromContractById } from "../services/Contract-services";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"


/*
Api to fetch all NFTs on contract

*/
config();

const router = express.Router();

// Create Thirdweb SDK on Mumbai (Polygon Testnet) Network
const sdk = new ThirdwebSDK(contractNetwork);

const nftCollection = sdk.getContract(
    process.env.NFT_THIRWEB_COLLECTION_ADDRESS!,  // Address of Thirweb NFT Collection/Edition Contract
    nftContractType  // Type of Thirdweb contract propablly edition or nft-collection
);

// Get all nfts on contract
router.get("/", checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /* 
    #swagger.tags = ['SuperAdmin']
    #swagger.description = 'Fetching all nfts directly from contract - may take a while'
    #swagger.responses[200] = {
            description: 'Expected response body at code 200. If nft belongs to a label, the wallet address is not null. 
            Default value for isSellable and isRentable is false, when nft is put up for sale, these values ​​will be changed to true',
            schema: {
                "nfts": [
                            {
                        "owner": "0x0000000000000000000000000000000000000000",
                        "metadata": {
                            "name": "piesel",
                            "description": "piesel",
                            "image": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/0",
                            "animation_url": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/1",
                            "attributes": [
                                {
                                    "creator": "0x257b9EAC215954863263bED86c65c4e642D00905",
                                    "genre": "1"
                                }
                            ],
                            "id": "2",
                            "uri": "ipfs://QmSEAd8eFkG52RhrYMwR6D2f1g8dr9WovBt4nJo6FqcsKs/0"
                        },
                        "type": "ERC1155",
                        "supply": "1"
                    }
                 ]
              }
        }
     */
    try {
        const nfts = await getAllFromContract(process.env.NFT_THIRWEB_COLLECTION_ADDRESS!);
        res.status(200).send({ nfts })
    } catch (err) {
        console.error(err);
        res.status(500).send("Error - failed to fetch all nfts from contract")
    }
})

// Get nft on contract by id
router.get("/:id", checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /*
    #swagger.parameters['RequestBody'] = {
                in: 'body',
                required: true,
                type: 'object',
                description: 'Required request body to get nft by id',
                schema: {
                    contractId: 'number',
                    
                }
            }
       
    #swagger.tags = ['SuperAdmin']
    #swagger.description = 'Fetching one nft directly from contract by contract id - may take a while'
    #swagger.responses[200] = {
            description: 'Expected response body at code 200. If nft belongs to a label, the wallet address is not null. 
            Default value for isSellable and isRentable is false, when nft is put up for sale, these values ​​will be changed to true',
            schema: {
                "nfts": 
                        {
                        "owner": "0x0000000000000000000000000000000000000000",
                        "metadata": {
                            "name": "piesel",
                            "description": "piesel",
                            "image": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/0",
                            "animation_url": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/1",
                            "attributes": [
                                {
                                    "creator": "0x257b9EAC215954863263bED86c65c4e642D00905",
                                    "genre": "1"
                                }
                            ],
                            "id": "2",
                            "uri": "ipfs://QmSEAd8eFkG52RhrYMwR6D2f1g8dr9WovBt4nJo6FqcsKs/0"
                        },
                        "type": "ERC1155",
                        "supply": "1"
                    }
                 
              }
        }
     */

    try {
        const id = req.params.id;

        const listing = await getNftFromContractById(process.env.NFT_THIRWEB_COLLECTION_ADDRESS!, id);  // fetching listings by id

        res.status(200).send({ listing })

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to fetch nft from contract by contract id");
    }
})


// Get all nfts on contract owned by wallet address
router.get("/address/:address", checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /*
    #swagger.parameters['RequestBody'] = {
                in: 'body',
                required: true,
                type: 'object',
                description: 'Required request body to get nft by id',
                schema: {
                    address: 'string',
                    
                }
            }
       #swagger.tags = ['SuperAdmin']
    #swagger.description = 'Fetching all nfts owned by some wallet address directly from contract - may take a while'
    #swagger.responses[200] = {
            description: 'Expected response body at code 200. If nft belongs to a label, the wallet address is not null. 
            Default value for isSellable and isRentable is false, when nft is put up for sale, these values ​​will be changed to true',
            schema: {
                "nfts": [
                            {
                            "owner": "0x0000000000000000000000000000000000000000",
                            "metadata": {
                                "name": "piesel",
                                "description": "piesel",
                                "image": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/0",
                                "animation_url": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/1",
                                "attributes": [
                                    {
                                        "creator": "0x257b9EAC215954863263bED86c65c4e642D00905",
                                        "genre": "1"
                                    }
                                ],
                                "id": "2",
                                "uri": "ipfs://QmSEAd8eFkG52RhrYMwR6D2f1g8dr9WovBt4nJo6FqcsKs/0"
                            },
                            "type": "ERC1155",
                            "supply": "1"
                        }
                 ]
              }
        }
    */
    try {
        const address = req.params.address;

        const listing = await (await nftCollection)?.erc1155.getOwned(address);  // fetching listings by id
        
        res.status(200).send({ listing })

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to fetch all nfts from contract belonging to this wallet address");
    }
})

export { router }
