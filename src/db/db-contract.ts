import { PrismaClient } from '@prisma/client'
import { ThirwebContractNft, Minting } from "../models/listing";
import { fetchSourceFilesFromMetadata } from '@thirdweb-dev/sdk';
import { fileFrom } from 'node-fetch';
import { nftContractType } from '../data/ContractType';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { contractNetwork } from "../data/ContractNetwork";
import { getAllFromContract } from '../services/Contract-services';
import { listing } from '@prisma/client';
import { getBalanceOfNft } from '../services/Contract-services';



const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's  

/** 
 * TODO:
 * -DELETE all listings by contract address
 * -get all listings from contract and put them in database
 */


// GET all
export async function getAllListings() {
    try {
        const listings = await prisma.listing.findMany();

        return listings;
    } catch (error) {
        return error;
    }
}

// POST
export async function createNFTOnDatabase(listing: Minting) {
    try {
        const newNFT = await prisma.listing.create({
            // Properties names are explained in schema.prisma file
            data: {
                name: listing.name,
                price: 0,
                quantity: listing.quantity,
                actualQuantity: listing.quantity,
                availableQuantity: listing.quantity,
                tokensInStock: 0,
                tokensListed: 0,
                description: listing.description,
                imageURL: listing.imageURL,
                musicURL: listing.musicURL,
                contractId: listing.contractId,
                contractAddress: listing.contractAddress,
                creatorWalletAddress: listing.creatorWalletAddress,
                tokenStandard: listing.tokenStandard,
                labelWallet: "",
                isSellable: false,
                isRentable: false,
                rentPrice: 0,
                numberOfRents: 0,
                numberOfCurrentRents: 0,
                userLikes: 0,
                userDislikes: 0,
                moderatorPoints: 0,
                rankingPoints: 0,
                highestRank: 0,
                views: 0,
                downloads: 0,
                genre: listing.genre,
                creator: {
                    connect: {
                        walletAddress: listing.creatorWalletAddress
                    }
                }
            }
        })

        const status = {
            status: true,
            data: newNFT
        }

        return status;

        //@ts-ignore
    } catch (error) {
        //@ts-ignore
        console.error("error on database:\n", error/* , message */);
        //return "Error while putting nft on data base"
        throw new Error("Error while putting nft on database")
    }
}

// GET with Database ID
export async function getListingByDbId(id: number) {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                id: id
            }
        });

        return listing;
    } catch (error) {
        return error;
    }
}

// GET with Token Contract ID
export async function getListingByContractId(contractId: number) {
    try {
        const listing = await prisma.listing.findUnique({
            where: {
                contractId: contractId
            }
        })
        return listing;
    } catch (error) {
        return error;
    }
}

// GET all with wallet address
export async function getListingCreatedByWalletAddress(walletAddress: string) {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                creatorWalletAddress: walletAddress
            }
        })
        return listings;
    } catch (error) {
        return error;
    }
}

// GET all with Contract Address
export async function getListingByContractAddress(contractAddress: string) {
    try {
        const listings = await prisma.listing.findMany({
            where: {
                contractAddress: contractAddress
            }
        })
        return listings;
    } catch (error) {
        return error;
    }
}

// DELETE all listings on Database
export async function deleteAllListings() {
    try {
        const listing = await prisma.listing.deleteMany()

        return listing;
    } catch (error) {
        return error;
    }
}

// DELETE listing by Database ID
export async function deleteListingByDbId(id: number) {
    try {
        const listing = await prisma.listing.delete({
            where: {
                id: id
            }
        })

        return listing;
    } catch (error) {
        return error;
    }
}

// DELETE listing by Contract ID
export async function deleteListingByContractId(contractId: number) {
    try {
        const listing = await prisma.listing.delete({
            where: {
                contractId: contractId
            }
        })

        return listing;
    } catch (error) {
        return error;
    }
}

// DELETE listing by creator Wallet Address
export async function deleteListingByCreatorWalletAddress(walletAddress: string) {
    try {
        const listings = await prisma.listing.deleteMany({
            where: {
                creatorWalletAddress: walletAddress
            }
        })

        return listings;
    } catch (error) {
        return error;
    }
}

// Fill database with NFTs on contract
async function fillDatabaseWithNftsOnContract(contractAddress: string) {
    try {
        const nfts = await getAllFromContract(contractAddress) as ThirwebContractNft[]

        // TODO: .filter((nft) => nft.metadata.attributes[0].creator is on black list)

        for (const nft of nfts) {

            try {
                const balance = await getBalanceOfNft(Number(nft.metadata.id), process.env.NFT_THIRWEB_COLLECTION_ADDRESS!, nft.metadata.attributes[0].creator)

                const newNFT = await prisma.listing.create({
                    // Properties names are explained in schema.prisma file
                    //@ts-ignore
                    data: {
                        name: nft.metadata.name,
                        price: 0,
                        quantity: Number(nft.supply),
                        actualQuantity: balance,
                        availableQuantity: balance,
                        tokensInStock: 0,
                        tokensListed: 0,
                        description: nft.metadata.description,
                        imageURL: nft.metadata.image,
                        musicURL: nft.metadata.animation_url,
                        contractId: Number(nft.metadata.id),
                        contractAddress: process.env.NFT_THIRWEB_COLLECTION_ADDRESS!,
                        creatorWalletAddress: nft.metadata.attributes[0].creator,
                        tokenStandard: nft.type,
                        labelWallet: "",
                        isSellable: false,
                        isRentable: false,
                        rentPrice: 0,
                        numberOfRents: 0,
                        numberOfCurrentRents: 0,
                        userLikes: 0,
                        userDislikes: 0,
                        moderatorPoints: 0,
                        rankingPoints: 0,
                        highestRank: 0,
                        views: 0,
                        downloads: 0,
                        genre: Number(nft.metadata.attributes[0].genre),
                        creator: {
                            connect: {
                                walletAddress: nft.metadata.attributes[0].creator
                            }
                        }
                    }
                })
                //console.log(createdNft)
            } catch (error) {
                console.log(error)
            }
        }
    } catch (error) {
        console.log(error)
        return error;
    }
}




if (process.env.MODE === "TEST") {
    //deleteAllListings()

    fillDatabaseWithNftsOnContract(process.env.NFT_THIRWEB_COLLECTION_ADDRESS!)

    /* const NFT: Listing = {
   name: 'song title',
   quantity: 10,
   description: 'very nice song created by someone',
   imageURL: 'https://ipfs.thirdwebcdn.com/ipfs/QmSCmoTPZ8VX2UZQXZtAdh8X8x3rx27ts5riw7yCgdURNV/wallpaper-1599480.jpg',
   musicURL: 'https://ipfs.thirdwebcdn.com/ipfs/QmSCmoTPZ8VX2UZQXZtAdh8X8x3rx27ts5riw7yCgdURNV/Buka.opus',
   contractId: 6,
   contractAddress: process.env.NFT_THIRWEB_COLLECTION_ADDRESS!,
   creatorWalletAddress: "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
   tokenStandard: "ERC1155",
   genre: 1
} */

    //createNFTOnDatabase(NFT)
}







