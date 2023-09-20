import { getTotalRentTimeByContractId } from "../db/db-listing";
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({ log: ["query"] });

/**
 * Function to check if date provided is not in the past 
 * and if period from now to date is greater than minimalPeriodInSeconds 
 */
 export function checkDate(date: number, minimalPeriodInSeconds: number) {
    try {
        const currentDate = Math.floor(Date.now() / 1000);

        if(date >= minimalPeriodInSeconds) return true;
        return false;

    } catch (error) {
        console.error("ERROR in check time:\n", error)
        return false;
    }
}

export function delayFunction(func: Function, expiry: number) {
    const rentPeriodInMiliSeconds = expiry * 1000 - Date.now();

    if (rentPeriodInMiliSeconds > 0x7FFFFFFF) //setTimeout limit is MAX_INT32=(2^31-1)
        setTimeout(function () { delayFunction(func, expiry); }, 0x7FFFFFFF);
    else
        setTimeout(func, rentPeriodInMiliSeconds);
}

export async function incrementTotalRentTime(time : number,nftId: number, ){
    try {
        let totalRentTime = await getTotalRentTimeByContractId(nftId)
        totalRentTime = Number(totalRentTime) + time
        const totalRentTimeAfterTransaction = await prisma.listing.update({
            where : {
                contractId : nftId 
            },
            data: {
                totalRentTime : Number(totalRentTime)
            }
        })
        
    }catch (error) {
        console.error(error)
        throw new Error("ERROR increment total rent time:\n")
    }
}