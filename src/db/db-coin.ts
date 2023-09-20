import prisma from "../client";

// =============GET=============
export async function getAllCoins() {
    try {
        const coins = await prisma.coin.findMany();

        return coins;
    } catch (error) {
        console.error('Error occurred while retrieving coins:', error);
        throw new Error('Failed to retrieve coins. Please try again later.'); // Throwing a custom error
    }
}

export async function getCoin(name: string) {
    try {
        const coin = await prisma.coin.findUnique({
            where: {
                name: name
            }
        });

        return coin;
    } catch (error) {
        return error;
    }
}

export async function getAmountOfAllCoins(name: string) {
    try {
        const coin = await prisma.coin.findUnique({
            where: {
                name: name
            }
        });

        return coin?.totalNumber;
    } catch (error) {
        return error;
    }
}

export async function getCoinPrice(name: string) {
    try {
        const coin = await prisma.coin.findUnique({
            where: {
                name: name
            }
        });

        return coin?.price;
    } catch (error) {
        return error;
    }
}



// =============POST=============
export async function createCoinOnDatabase(name: string, symbol: string, icon: string, price: number) {
    try {
        const newCoin = await prisma.coin.create({
            // Properties names are explained in schema.prisma file
            data: {
                name: name,
                symbol: symbol,
                icon: icon,
                price: price,
                totalNumber: 0

            }
        })
        return newCoin
    } catch (error) {
        // console.log(error)
        return error
    }
}



// =============PUT=============
export async function changeCoinPrice(newPrice: number, name: string) {
    try {
        const coin = await prisma.coin.update({
            where: {
                name: name
            },
            data: {
                price: newPrice
            }
        })
        return coin;

    } catch (error) {
        console.error(error)
        throw new Error("Unable to change coin price")
    }

}

// =============DELETE=============

async function deleteAllCoins() {
    try {
        const coins = await prisma.coin.deleteMany()
        console.log(coins);
    } catch (error) {
        console.error(error)
        throw new Error("Unable to delete coins.")
    }

}
async function deleteCoinByName(name: string) {
    try {
        const user = await prisma.coin.delete({
            where: {
                name: name
            }
        })
        console.log(user);
    } catch (error) {
        console.error(error)
        throw new Error("Unable to delete coin.")
    }

}

//deleteAllCoins()

//changeCoinPrice(0.00014, 'Moonlite')
//createCoinOnDatabase("Moonlite", "ML", "https://uploads-ssl.webflow.com/640eaf76bbaf324e5068a3ca/6417c684f5b343d63652343a_Logo2ChaseTheMoonlite-Transparent-smaller-p-500.png", 1)