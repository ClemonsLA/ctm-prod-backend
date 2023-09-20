import { getCoinsByWalletAddress } from "../db/db";
import {
    getPriceByContractId,
    getTokenListedByContractId,
    getTokenInStockByContractId,
    getQuantityByContractId,
    getAvailableQuantityByContractId,
    getRentableByContractId,
    getSellableByContractId,
    getRentPriceByContractId
} from "../db/db-listing";
import { getBalanceOfNft } from "./Contract-services";
import { Response } from "express"
import prisma from "../client";


//checking data for buy and rent nft - correct amount of coins and amount of nft that the user wants to buy
export async function checkFormToTransfer(
    creatorAddress: string,
    buyerAddress: string,
    nftId: number,
    amount: number,
    res: Response
): Promise<boolean> {
    try {
        //getting data from database  
        let creatorCoins = await getCoinsByWalletAddress(creatorAddress)
        let buyerCoins = await getCoinsByWalletAddress(buyerAddress)
        const price = await getPriceByContractId(nftId)

        if (!price) throw new Error("Error - failed to get price")

        let tokensInStockTransaction = await getTokenInStockByContractId(nftId)
        console.log("AMOUUUUUUUUUUUUNT ", amount)
        console.log("TIKEEEEEEEEEEEEEEEEEN IN STOCK ", tokensInStockTransaction)

        //checking data from database
        if (Number(buyerCoins) < Number(price) * Number(amount)) {
            console.log("You don't have enough coins.")
            res.status(402).send("You don't have enough coins.")
            return false
        }
        if (Number(amount) > Number(tokensInStockTransaction)) {
            const message = "Amount of tokens to buy must be less or equal than amount of tokens for sale. Amount of tokens for sale : \n" + tokensInStockTransaction
            console.log(message)
            res.status(400).send(message)
            return false
        }
        if (buyerAddress === creatorAddress) {
            const message = "You can't buy nft if you are creator"
            console.log(message)
            res.status(400).send(message)
            return false
        }
        return true
    } catch (error) {
        console.error(error);
        throw new Error("Error - failed to check form to transfer")
    }

}
//checking data for buy and rent nft - correct amount of coins and amount of nft that the user wants to buy
export async function checkFormToTransferRent(
    creatorAddress: string,
    buyerAddress: string,
    nftId: number,
    amount: number,
    days: number,
): Promise<boolean> {
    try {
        //getting data from database  
        let creatorCoins = await getCoinsByWalletAddress(creatorAddress)
        let buyerCoins = await getCoinsByWalletAddress(buyerAddress)
        const price = await getRentPriceByContractId(nftId)
        if (!price) throw new Error("Error - failed to get price")
        let tokensInStockTransaction = await getTokenInStockByContractId(nftId)
        console.log("BUYER COINS : ", buyerCoins)
        console.log("PRICE: ", price)
        console.log("amount: ", amount)
        console.log("days: ", days)

        //checking data from database
        if (Number(buyerCoins) < (Number(price) * Number(amount) * Number(days))) {
            console.log("You don't have enough coins.")
            return false
        }
        if (buyerAddress === creatorAddress) {
            console.log("You can't buy nft if you are creator")
            return false
        }

        return true;

    } catch (error) {
        console.error(error);
        throw new Error("Error - failed to check form to transfer after rent")
    }

}


//transferring coins from buyer account to nft creator account and change the amount of nft's for sale
//if function "checkFormToTransfer" = true, the coins are transferred
export async function transferCoinsAndListedToken(
    creatorAddress: string,
    buyerAddress: string,
    nftId: number,
    amount: number,
) {
    try {
        //getting coins and amount of listed nft's from database 
        let creatorCoins = await getCoinsByWalletAddress(creatorAddress)
        let buyerCoins = await getCoinsByWalletAddress(buyerAddress)
        const price = await getPriceByContractId(nftId)
        let tokensListedTransaction = await getTokenListedByContractId(nftId)
        let tokensInStockTransaction = await getTokenInStockByContractId(nftId)
        let mintQuantity = await getQuantityByContractId(nftId)
        let availableQuantity = await getAvailableQuantityByContractId(nftId)
        let actualQuantity = await getBalanceOfNft(nftId, process.env.NFT_THIRWEB_COLLECTION_ADDRESS!)

        const totalPrice = Math.ceil(Number(price) * Number(amount))
        console.log("\nCREATOR FROM CHECK FUNCTION ", creatorAddress)
        console.log("\nBUYER FROM CHECK FUNCTION", buyerAddress)


        //data befor transaction
        console.log("price : ", price)
        console.log("creatorCoins before transaction : ", creatorCoins)
        console.log("buyerCoins before transaction : ", buyerCoins)
        console.log("tokens listed : ", tokensListedTransaction)
        console.log("tokens in stock before transaction : ", tokensInStockTransaction)
        console.log("mint quantity :", mintQuantity)
        console.log("actual quantity before transaction  :", actualQuantity)
        console.log("Total price : ", totalPrice)
        console.log("available quantity before transaction  :", availableQuantity)

        buyerCoins = Number(buyerCoins) - (Number(price) * Number(amount))
        creatorCoins = Number(creatorCoins) + (Number(price) * Number(amount))
        tokensInStockTransaction = Number(tokensInStockTransaction) - Number(amount)

        const buyerCoinsAfterTransaction = await prisma.users.update({
            where: {
                walletAddress: buyerAddress
            },
            data: {
                coins: Number(buyerCoins)
            }
        })

        const creatorCoinsAfterTransaction = await prisma.users.update({
            where: {
                walletAddress: creatorAddress
            },
            data: {
                coins: Number(creatorCoins)
            }
        })

        const tokensListedAndInStockAfterTransaction = await prisma.listing.update({
            where: {
                contractId: nftId
            },
            data: {
                tokensInStock: Number(tokensInStockTransaction)
            }
        })

        const actualQuantityAfterTransaction = await prisma.listing.update({
            where: {
                contractId: nftId
            },
            data: {
                actualQuantity: Number(actualQuantity)
            }
        })

        //data after transaction
        console.log("creatorCoins after transaction : ", creatorCoins)
        console.log("buyerCoins after transaction : ", buyerCoins)
        console.log("tokens listed after transaction : ", tokensListedTransaction)
        console.log("tokens in stock after transaction : ", tokensInStockTransaction)
        console.log("mint quantity after transaction:", mintQuantity)
        console.log("actual quantity after transaction:", actualQuantity)
        console.log("available quantity after transaction  :", availableQuantity)

        return totalPrice;
    } catch (error) {
        console.error("Error - failed to transfer coins after buying NFT")
        throw new Error("Error - failed to transfer coins after buying NFT")
    }
}

export async function transferCoinsAndListedTokenRent(
    creatorAddress: string,
    buyerAddress: string,
    nftId: number,
    amount: number,
    days: number
) {
    try {
        //getting coins and amount of listed nft's from database 
        let creatorCoins = await getCoinsByWalletAddress(creatorAddress)
        let buyerCoins = await getCoinsByWalletAddress(buyerAddress)
        const price = await getRentPriceByContractId(nftId)
        let tokensListedTransaction = await getTokenListedByContractId(nftId)
        const rentTime = days
        const actualDate = Math.floor(Date.now() / 1000)
        const priceForRent = Math.ceil(days * (Number(price) * Number(amount)))

        //data before transaction
        console.log("price per day : ", price)
        console.log("creatorCoins before transaction : ", creatorCoins)
        console.log("buyerCoins before transaction : ", buyerCoins)
        console.log("tokens listed : ", tokensListedTransaction)
        console.log("actual date : ", new Date(actualDate * 1000))
        console.log("rent time : ", rentTime)
        console.log("days : ", days)
        console.log("price for rent : ", priceForRent)


        buyerCoins = Number(buyerCoins) - Number(priceForRent)
        creatorCoins = Number(creatorCoins) + Number(priceForRent)

        //transferring coins and change the amount of nft for sale
        const buyerCoinsAfterTransaction = await prisma.users.update({
            where: {
                walletAddress: buyerAddress
            },
            data: {
                coins: Number(buyerCoins)
            }
        })
        const creatorCoinsAfterTransaction = await prisma.users.update({
            where: {
                walletAddress: creatorAddress
            },
            data: {
                coins: Number(creatorCoins)
            }
        })

        console.log("creatorCoins after transaction : ", creatorCoins)
        console.log("buyerCoins after transaction : ", buyerCoins)
        console.log("tokens listed after transaction : ", tokensListedTransaction)
        console.log("tokens listed after transaction : ", tokensListedTransaction)
        const status = {
            status: true,
            data: {
                totalPrice: priceForRent
            }
        }
        return status;
    } catch (error) {
        console.error("Error - failed to transfer coins after renting NFT")
        throw new Error("Error - failed to transfer coins after renting NFT")
    }
}


export async function checkFormIsRentable(nftId: number) {
    try {
        const isRentable = await getRentableByContractId(nftId);
        if (!isRentable) return false
        return isRentable
    } catch (error) {
        console.error(error);
        return false
    }
}

export async function checkFormIsSellable(nftId: number) {
    try {
        const isSellable = await getSellableByContractId(nftId);
        if (!isSellable) return false
        return isSellable
    } catch (error) {
        console.error(error);
        return false
    }
}






/* 
// Check if data was successfully placed on database
export function checkIfDataAddedToDatabase(data: any) {
    try {
        if (data instanceof Prisma.PrismaClientKnownRequestError) {
            console.error("Error while adding data to database:\n",
                "Prisma code: ", data?.code,
                "\nerror: ", data);

                const status = {
                    status: false,
                    data: newCollection
                }
        
                return status;
            return 
        }
        //@ts-ignore
    } catch ({ error, message }) {
        console.error("Error during checking if data was successfully added to database:\n", error, message);
        return "Error during checking if data was successfully added to database";
    }
}
 */

