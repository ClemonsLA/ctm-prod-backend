import { PrismaClient, users } from '@prisma/client'
import bodyParser from "body-parser";
import express from "express"
import { delayFunction } from '../services/rent-services';

const prisma = new PrismaClient({ log: ["query"] });

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))



// Important : combining `take` and `skip` in prisma will result in pagination

// GET all
export async function getAllUsers() {
    const users = await prisma.users.findMany();
    return users;
}

// POST 
export async function createUser(issuer: string, name: string, description: string, tag: number, walletAddress: string, walletType: string, email: string, website: string) {
    try {


        const newUser = await prisma.users.create({
            data: {
                issuer: issuer,
                name: name,
                description: description,
                tag: tag,
                walletAddress: walletAddress,
                walletType: walletType,
                email: email,
                website: website,
                lastLoginAt: Math.floor(Date.now() / 1000),

            }
        })
        return newUser;
    } catch (error) {
        console.error(error)
        return error
    }
}

// GET with param
export async function getUserByIssuer(issuer: string) {
    try {

        const user = await prisma.users.findUnique({
            where: {
                issuer: issuer
            }
        });
        return user;
    } catch (error) {
        return error;
    }
}

export async function getUserByWalletAddressToCollection(walletAddress: string) {
    try {
        const user = await prisma.users.findUnique({
            where: {
                walletAddress: walletAddress
            },
            select: {
                name: true,
                website: true
            }
        });
        return user;
    } catch (error) {
        return error;
    }
}

export async function getBannedUsers(role: number) {
    try {
        const users = await prisma.users.findMany({
            where: {
                role: role
            },
            select: {
                walletAddress: true,
                email: true,
                name: true,
                coins: true,
                walletType: true,
                website: true,
                whenSignedUp: true
            }

        })
        return users;
    } catch (error) {
        throw new Error("Error - failed to get banned users")
    }
}
// return creator of the collection by id 
export async function getCreatorNameAndWebsiteOfCollection(walletAddress: string) {
    try {
        const creator = await prisma.users.findUnique({
            where: {
                walletAddress: walletAddress
            }, select: {
                name: true,
                website: true
            }
        });
        return creator
    } catch (error) {
        console.log(error)
        return error;
    }
}
export async function getCreatorNameOfByWalletAddress(walletAddress: string) {
    try {
        const creator = await prisma.users.findUnique({
            where: {
                walletAddress: walletAddress
            }, select: {
                name: true,
                
            }
        });
        return creator
    } catch (error) {
        console.log(error)
        return error;
    }
}




 


//getUserByWalletAddressToCollection("0xA568Da33444F6591dc533b9049f5a44e77E2D07b").then((abc) => console.log("NAME AND WEBSITE USER",abc))

// GET with param
export async function getWalletAddressByIssuer(issuer: string): Promise<string | undefined> {
    try {

        const user = await prisma.users.findUnique({
            where: {
                issuer: issuer
            }
        });
        return user?.walletAddress;
    } catch (error) {
        throw new Error("Error - failed to get wallet address of issuer")
    }
}


export async function getOwnedNftByIssuer(issuer: string, nftId: number) {
    try {
        const user = await prisma.users.findFirst({
            where: {
                issuer,
                nftOwned: {
                    has: nftId,
                },
            },
        });

        if (user) {
            const ownedNft = user.nftOwned.find((id) => id === nftId);
            console.log("OWNED NFT", ownedNft);

            // Check if nftId is also present in nftRented
            const isRented = user.nftRented.includes(nftId);

            if (isRented) {
                // nftId is both owned and rented
                return null;
            }

            return ownedNft || null;
        }

        return null;
    } catch (error) {
        console.error('Error get owned NFT:', error);
        throw new Error('Failed get owned NFT');
    }
}
export async function getRentedNftByIssuer(issuer: string, nftId: number) {
    try {
        const user = await prisma.users.findFirst({
            where: {
                AND: [
                    {
                        issuer,
                    },
                    {
                        nftRented: {
                            has: nftId,
                        },
                    },
                ],
            },
        });

        if (user) {
            const rentedNft = user.nftRented.find((id) => id === nftId);
            console.log("OWNED NFT", rentedNft)
            return rentedNft || null;
        }

        return null;
    } catch (error) {
        console.error('Error get rented NFT:', error);
        throw new Error('Failed get rented NFT');
    }
}




export async function getCoinsByWalletAddress(walletAddress: string) {
    try {
        const user = await prisma.users.findUnique({
            where: {
                walletAddress: walletAddress
            }

        });
        return user?.coins;
    } catch (error) {
        return error;
    }
}
export async function getWalletAddressByName(name: string) {
    try {
        const user = await prisma.users.findUnique({
            where: {
                name: name

            }

        });
        return user?.walletAddress;
    } catch (error) {
        return error;
    }
}

export async function getUserByName(name: string): Promise<users | null> {
    try {
        const user = await prisma.users.findUnique({
            where: {
                name: name
            }
        });

        return user;
    } catch (error) {
        throw new Error("Error - failed to get user")
    }
}

export async function getUserRevenue(issuer: string) {
    try {

        const revenue = await prisma.users.findUnique({
            where: {
                issuer: issuer
            },
            select: {
                revenue: true
            }
        })
        const status = {
            status: true,
            data: revenue
        }

        return status
    } catch (error) {
        return error;
    }
}

// Get Nfts bought and nfts rented by the user
export async function getUserNftsRentedOrBought(issuer: string) {
    const userNfts = await prisma.users.findUnique({
        where: {
            issuer: issuer
        },
        select: {
            nftOwned: true,
            nftRented: true
        }
    })

    return userNfts;
}


//getUserRevenue("did:ethr:0x2F39D5bAB8520d1D55Fca5a8E2681640172DD1B1").then((abc) => console.log("REVENUE: ", abc))

export async function updateUserProfil(
    issuer: string,
    newName: string,
    newDescription: string,
    newTag: number,
    newWebsite: string

) {
    try {

        const user = await prisma.users.update({
            where: {
                issuer: issuer
            },
            data: {
                name: newName,
                description: newDescription,
                tag: newTag,
                website: newWebsite
            }
        })
        return user
    } catch (error) {
        return error;
    }
}

export async function changeUserRole(name: string, newRole: number) {
    try {
        const user = await prisma.users.update({
            where: {
                name: name
            },
            data: {
                role: newRole
            }
        })
        return user
    } catch (error) {
        return error;
    }
}

export async function addRentedToUserDb(issuer: string, contractId: number, expiry: number) {
    try {
        // Adding id of nft (id on contract) to array of nfts owned by this user
        await prisma.users.update({
            where: {
                issuer: issuer
            },
            data: {
                nftRented: {
                    push: contractId
                }
            }
        })

        delayFunction(async () => {

            const nfts = (await prisma.users.findUnique({
                where: {
                    issuer: issuer
                }
            }))?.nftRented;

            const index = nfts?.indexOf(contractId);

            if (index != -1) nfts?.splice(Number(index), 1);


            await prisma.users.update({
                where: {
                    issuer: issuer
                },
                data: {
                    nftRented: nfts
                }
            })
        }, expiry)


        return true;
    } catch (error) {
        return error
    }
}
export async function addOwnedToUserDb(issuer: string, contractId: number) {
    try {
        // Adding id of nft (id on contract) to array of nfts owned by this user
        await prisma.users.update({
            where: {
                issuer: issuer
            },
            data: {
                nftOwned: {
                    push: contractId
                }
            }
        })
        return true;
    } catch (error) {
        return error
    }
}


// DELETE
async function deleteUserById(id: number) {
    try {
        const user = await prisma.users.delete({
            where: {
                id: id
            }
        })
        console.log(user);
    } catch (error) {
        console.error(error)
        throw new Error("Unable to delete user.")
    }

}

export async function deleteUserByName(name: string) {
    try {
        const user = await prisma.users.delete({
            where: {
                name: name
            }
        })
        return user;
    } catch (error) {
        console.error(error)
        throw new Error("Unable to delete user.")
    }

}

