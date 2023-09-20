import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";


config();

const prisma = new PrismaClient({ log: ["query"] });


// ===========CHECK===========
/* export async function checkIfUserDateExist(issuer: string, month: number, year: number) {
    try {
        const revenue = prisma.userRevenue.findUnique({

            where: {
                issuer_month_year: {
                    issuer: issuer,
                    month: month,
                    year: year
                }
                

            }
        })

        if (!revenue) return false;
        else return true;

    } catch (error) {
        return error;
    }
} */

// ===========POST===========
export async function rentRevenue(issuer: string, rentedQuantity: number, totalPrice: number) {
    try {
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const revenue = await prisma.userRevenue.upsert({
            where: {
                issuer_month_year: {
                    issuer: issuer,
                    month: month,
                    year: year
                }
            },
            update: {
                rentRevenue: {
                    increment: totalPrice
                },
                totalRevenue: {
                    increment: totalPrice
                },
                amountRented: {
                    increment: rentedQuantity
                }
            },
            create: {
                issuer: issuer,
                month: month,
                year: year,
                rentRevenue: totalPrice,
                totalRevenue: totalPrice,
                amountRented: rentedQuantity
            },
        })

        const status = {
            status: true,
            data: revenue
        }
        return status;

    } catch (error) {
        return error;
    }
}


export async function sellRevenue(issuer: string, soldQuantity: number, totalPrice: number) {
    try {
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        const revenue = await prisma.userRevenue.upsert({
            where: {
                issuer_month_year: {
                    issuer: issuer,
                    month: month,
                    year: year
                }
            },
            update: {
                sellRevenue: {
                    increment: totalPrice
                },
                totalRevenue: {
                    increment: totalPrice
                },
                amountSold: {
                    increment: soldQuantity
                }
            },
            create: {
                issuer: issuer,
                month: month,
                year: year,
                sellRevenue: totalPrice,
                totalRevenue: totalPrice,
                amountSold: soldQuantity
            },
        })

        const status = {
            status: true,
            data: revenue
        }
        return status;
    } catch (error) {
        console.log(error)
        return error
    }
}