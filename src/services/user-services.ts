import prisma from "../client";

// Check if user with given Email already exist in database 
export async function checkEmailUniqueness(email: string): Promise<boolean> {
    try {
        const dbUser = await prisma.users.findMany({
            where: {
                email: {
                    equals: email,
                    mode: 'insensitive'
                }
            }
        })

        if (!dbUser?.length) return true;


        return false;

    } catch (error) {
        console.error(error)
        throw new Error("Unable to check email")
    }
}

// Check if user with given Name already exist in database 
export async function checkNameUniqueness(name: string): Promise<boolean> {
    try {
        const dbUser = await prisma.users.findMany({
            where: {
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            }
        })

        if (!dbUser?.length) return true;

        return false;

    } catch (error) {
        console.error(error)
        throw new Error("Unable to check name")
    }
}

// Check if user with given wallet address already exist in database 
export async function checkWalletUniqueness(walletAddress: string): Promise<boolean> {
    try {
        const dbUser = await prisma.users.findMany({
            where: {
                walletAddress: {
                    equals: walletAddress,
                    mode: 'insensitive'
                }
            }
        })

        if (!dbUser?.length) return true;

        return false;

    } catch (error) {
        console.error(error)
        throw new Error("Unable to check wallet address")
    }
}
// Check if user with given issuer already exist in database 
export async function checkIssuerUniqueness(issuer: string): Promise<boolean> {
    try {
        const dbUser = await prisma.users.findMany({
            where: {
                issuer: {
                    equals: issuer,
                    mode: 'insensitive'
                }
            }
        })

        if (!dbUser?.length) return true;
        return false;
    } catch (error) {
        console.error(error)
        throw new Error("Unable to check issuer")
    }
}


export async function userByWalletAddress(walletAddress: string) {
    try {
        const dbUser = await prisma.users.findUnique({
            where: {
                walletAddress: walletAddress
            }, 
            include: {
                revenue : true,
                listings : true
            }
        })
        if (!dbUser) return null;
        else return dbUser;
    } catch (error) {
        return null;
    }
}

export async function isUserInDb(walletAddress: string, issuer: string, email: string) {
    try {
        const dbUser = await prisma.users.findFirst({
            where: {
                walletAddress: walletAddress,
                issuer: issuer,
                email: email
            }
        })
        if (dbUser === undefined) return null;
        else return dbUser;
    } catch (error) {
        return null;
    }
}

export async function disconnectListingRelationFromUser(userName: string) {
    await prisma.users.update({
        where: {
            name: userName
        },
        data: {
            listings: {
                set: []
            }
        },
    });
}

export async function deleteUserRecords(userName: string) {
    await prisma.users.update({
        where: {
            name: userName
        },
        data: {
            revenue: {
                deleteMany: {}
            }
        }
    })
}
