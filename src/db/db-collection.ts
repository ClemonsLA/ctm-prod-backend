import { PrismaClient, users } from '@prisma/client'
import { getCreatorNameOfByWalletAddress } from './db';

const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's 





// GET with param
export async function getAllCollections() {
    try {
        const collections = await prisma.collection.findMany();
        for(const collection of collections){
            //@ts-ignore
            collection.creatorName = (await getCreatorNameOfByWalletAddress(collection.creatorAddress)).name
        }
        return collections;
    } catch (err) {
        return err;
    }
}
export async function getCollectionById(collectionId: number) {
    try {
        const collection = await prisma.collection.findUnique({
            where: {
                id: collectionId
            },
            select: {
                id: true,
                name: true,
                creatorAddress: true,
                //@ts-ignore
                creatorName: true,
                createdDate: true,
                rating: true,
                avatarImage: true,
                bannerImage: true,
                description: true,
            }

        });
        return collection;
    } catch (error) {
        return error;
    }
}
export async function getNftsFromCollectionById(collectionId: number) {
    try {
        const collection = await prisma.collection.findUnique({
            where: {
                id: collectionId
            },
            select: {
                nfts: true,
            }
        });
        if (collection) {

            return collection.nfts;
        } else {

            return null;
        }
    } catch (error) {
        return error;
    }
}







// ===========POST===========
// creating collection
export async function createCollection(
    creatorAddress: string,
    creatorName: string,
    name: string,
    description: string,
    avatarImage: string,
    bannerImage: string,
    nfts: number[]
) {
    try {
        const newCollection = await prisma.collection.create({
            data: {
                name: name,
                nfts: nfts,
                creatorAddress: creatorAddress,
                creatorName: creatorName,
                avatarImage: avatarImage,
                bannerImage: bannerImage,
                description: description,
                listings: {
                    connect: nfts.map(nft => ({ contractId: nft }))
                }
            }
        })
        const status = {
            status: true,
            data: newCollection
        }
        return status;
    } catch (error) {
        console.log(error)
        return error;
    }
}

// ===========PUT===========
// adding nft to collection
export async function addNftToCollection(collectionId: number, nftId: number) {
    try {
        const collection = await prisma.collection.update({
            where: {
                id: collectionId
            },
            data: {
                nfts: {
                    push: nftId
                },
                listings: {
                    connect: {
                        contractId: nftId
                    }
                }

            }
        })

        const status = {
            status: true,
            data: collection.nfts
        }
        return status;

    } catch (error) {
        console.log(error)
        return error;
    }
}

export async function addArrayOfNftsToCollection(collectionId: number, nftIds: number[]) {
    try {
        const collection = await prisma.collection.update({
            where: {
                id: collectionId
            },
            data: {
                nfts: nftIds,
                listings: {
                    connect: nftIds.map(nft => ({ contractId: nft }))
                }
            }
        });

        const status = {
            status: true,
            data: collection.nfts
        };
        return status;
    } catch (error: any) {
        console.error("Error updating the collection with NFTs:", error);
        return {
            status: false,
            error: error.message
        };
    }
}


// editing basic information of collection
export async function editCollection(
    collectionId: number,
    newName: string,
    newDescription: string,
    newAvatarImage: string,
    newBannerImage: string
) {
    try {
        const collection = await prisma.collection.update({
            where: {
                id: collectionId
            },
            data: {
                name: newName,
                avatarImage: newAvatarImage,
                bannerImage: newBannerImage,
                description: newDescription
            }
        })

        const status = {
            status: true,
            data: collection
        }
        return status;

    } catch (error) {
        console.log(error)
        return error;
    }
}

// ===========GET===========
// check if user with userAddress is creator of nft (true/false) 
export async function checkIfUserIsOwner(userAddress: string, nftId: number) {

    try {
        const user = (await prisma.listing.findUnique({
            where: {
                contractId: nftId
            }
        }))?.creatorWalletAddress

        if (userAddress == user) return true;
        else return false;

    } catch (error) {
        return error;
    }
}

export async function checkIfUserIsOwnerInArray(userAddress: string, nftIds: number[]) {
    try {
        const nfts = await prisma.listing.findMany({
            where: {
                contractId: {
                    in: nftIds
                }
            },
            select: {
                contractId: true,
                creatorWalletAddress: true
            }
        });

        const nftOwnerships = nfts.reduce((ownerships: Record<number, string>, nft) => {
            ownerships[nft.contractId] = nft.creatorWalletAddress;
            return ownerships;
        }, {});

        for (const nftId of nftIds) {
            if (nftOwnerships[nftId] !== userAddress) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.log(error);
        return error;
    }
}



// check if nft is in collection (true/false) 
export async function checkIfIsInCollection(collectionId: number, nftId: number) {
    try {

        const nfts = (await prisma.collection.findUnique({
            where: {
                id: collectionId,
            }
        })
        )?.nfts as number[];

        if (nfts.includes(nftId)) {
            return true;
        } else {
            return false;
        }

    } catch (error) {
        return error;
    }
}
//
export async function checkIfAnyNftIsInCollection(collectionId: number, nftIds: number[]) {
    try {
        const collection = await prisma.collection.findUnique({
            where: {
                id: collectionId
            }
        });

        if (!collection) {
            throw new Error(`Collection ${collectionId} does not exist`);
        }

        const collectionNftIds = collection.nfts as number[];

        const duplicates = nftIds.filter((nftId) => collectionNftIds.includes(nftId));

        if (duplicates.length > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log(error);
        return error;
    }
}

// check if userAddress is creator of collection with id collectionId
export async function checkIfUserIsCollectionCreator(userAddress: string, collectionId: number) {
    try {
        const user = (await prisma.collection.findUnique({
            where: {
                id: collectionId
            }
        }))?.creatorAddress;

        if (userAddress == user) return true;
        else return false;

    } catch (error) {
        return error;
    }
}

// return creator of the collection by id 
export async function getCreatorOfCollection(collectionId: number) {
    try {
        const creator = (await prisma.collection.findUnique({
            where: {
                id: collectionId
            }
        }))?.creatorAddress

        const status = {
            status: true,
            data: creator,
        }
        return status;

    } catch (error) {
        console.log(error)
        return error;
    }
}

// return creator of the collection by id 
export async function getCreatorWalletAddressOfCollection(collectionId: number) {
    try {
        const creator = await prisma.collection.findUnique({
            where: {
                id: collectionId
            }
        })
        return creator?.creatorAddress


    } catch (error) {
        console.log(error)
        return error;
    }
}




// check if collection exist (true/false)
export async function checkICollectionExist(collectionId: number) {
    try {
        const collection = await prisma.collection.findUnique({
            where: {
                id: collectionId,
            }
        })

        if (!collection) return false;
        else return true;

    } catch (error) {
        return error;
    }
}

export async function checkIfWalletAddressExist(address: string) {
    try {
        const collection = await prisma.collection.findFirst({
            where: {
                creatorAddress: address,
            }
        })

        if (!collection) return false;
        else return true;

    } catch (error) {
        return error;
    }
}

// ===========DELETE===========
// deleting one nft from collection
export async function deleteNftFromCollection(collectionId: number, nftId: number) {
    try {
        const nfts = (await prisma.collection.findUnique({
            where: {
                id: collectionId
            }
        }))?.nfts;

        const index = nfts?.indexOf(nftId);

        if (index != -1) nfts?.splice(Number(index), 1);


        await prisma.collection.update({
            where: {
                id: collectionId
            },
            data: {
                nfts: nfts,
                listings: {
                    disconnect: {
                        contractId: nftId
                    }
                }
            }
        })

        const status = {
            status: true,
            data: nfts
        }
        return status;

    } catch (error) {
        console.log(error)
        return error;
    }
}

// delete all nfts relations from collection
export async function deleteRelationsFromCollection(collectionId: number) {
    await prisma.collection.update({
        where: {
            id: collectionId
        },
        data: {
            listings: {
                set: []
            }
        }
    })
}


// deleting one collection by id 
export async function deleteCollection(collectionId: number) {
    try {
        const collection = await prisma.collection.delete({
            where: {
                id: collectionId
            }
        })

        const status = {
            status: true,
            data: collection
        }
        return status

    } catch (error) {
        return error;
    }
}



/* createCollection(
    "sada",
    "string",
    "string",
    "string",
    "string",
    [1, 2]
) */

//addNftToCollection(1, 3);
//editCollection(1, "abcd", "afefaaf", "url", "url");
//checkIfUserIsOwner("aas", 1).then(result => console.log("should be false: ", result))
//checkIfUserIsOwner("0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C", 1).then(result => console.log("should be true: ", result))
//@ts-ignore
//getCreatorOfCollection(1).then(result => console.log("should be something: ", result?.data))
//@ts-ignore
//getCreatorOfCollection(9999).then(result => console.log("should be []: ", result?.data))
//deleteNftFromCollection(1, 3);
//addNftToCollection(1, 3);
//editCollection(1, "abcd", "afefaaf", "url", "url");
//checkIfUserIsOwner("aas", 1).then(result => console.log("should be false: ", result))
//checkIfUserIsOwner("0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C", 1).then(result => console.log("should be true: ", result))
//@ts-ignore
//getCreatorOfCollection(1).then(result => console.log("should be something: ", result?.data))
//@ts-ignore
//getCreatorOfCollection(9999).then(result => console.log("should be []: ", result?.data))
//deleteNftFromCollection(1, 3);