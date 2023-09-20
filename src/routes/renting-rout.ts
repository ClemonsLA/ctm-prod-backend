import express from "express"
import bodyParser from "body-parser";
import { getContractFromPrivateKey } from "../services/Contract-services";
import { Edition } from "@thirdweb-dev/sdk";
import { PrismaClient } from '@prisma/client'
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"
import { addRent, getCreatorByNftId } from "../db/db-listing";
import { checkFormToTransferRent, transferCoinsAndListedTokenRent, checkFormIsRentable } from "../services/check_and_transfer-services";
import { getWalletAddressByIssuer, addRentedToUserDb,getRentedNftByIssuer } from "../db/db";
import { getCreatorByContractId,addNftDownloads } from "../db/db-listing";
import { checkDate, incrementTotalRentTime } from "../services/rent-services";
import { rentRevenue } from "../db/db-userRevenue";
import { status } from "../models/check";



const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's  

const router = express.Router()

router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: false }))

router.post("/", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
    /*
    #swagger.tags = ['User', 'Label']
    #swagger.description = 'User must be logged in to rent nft, minimum rent period - 1day, user will be charged for full days '
    #swagger.responses[200] = { description: 'Successfully rented NFT'}
    */
    try {
        //@ts-ignore
        const issuer = req?.user?.issuer
        const renter = String(await getWalletAddressByIssuer(issuer)) // Wallet address of person who want to rent the nft

        let { nftId, days, quantity = 1 } = req.body as {
            nftId: number, // Id of nft on contract
            days: number, // Unix timestamp of date and time when the renting period ends
            quantity: number, // quantity of rented nft set as 1 by default 
        }

        nftId = Number(nftId);
        days = Number(days);
        quantity = Number(quantity);

        if ((!nftId && nftId !== 0) || !days || !quantity) {
            return res.status(400).send("Missing data in request or wrong data type");
        }

        // =====Check if expiry time is correct=====
        const currentDate = Math.floor(Date.now() / 1000);
        const time = ((days * 86400) + currentDate - currentDate)

        const minimalPeriodInSeconds = 24 * 60 * 60; //minimal period of rent is set to 24h
        if (time >= minimalPeriodInSeconds) {
            console.log("Days is equal or greater than minimal period in seconds", time)
        }
        if (!checkDate(time, minimalPeriodInSeconds)) {
            return res.status(400).json({
                message: "Wrong expiry date - minimal period from now " + minimalPeriodInSeconds + "s",
                success: false
            });
        }

        const isRentable = Boolean(await checkFormIsRentable(nftId));
        if (isRentable == false) {
            return res.status(404).send("NFT with id : " + nftId + " is not for rent.")
        }
        if (Number(quantity) <= 0 || !Number.isInteger(Number(quantity))) {
            console.log("Amount of tokens must be positive integer")
            return res.status(400).send("Amount of tokens must be positive integer")
        }
        if (Number(days) <= 0 || !Number.isInteger(Number(days))) {
            console.log("Days must be positive integer")
            return res.status(400).send("Days must be positive integer")
        }


        const contractAddress = process.env.NFT_THIRWEB_COLLECTION_ADDRESS!; // contract address - where nfts are created
        const creator = String(await getCreatorByContractId(nftId)) // wallet address of nft creator

        let nftCollection = (await getContractFromPrivateKey(contractAddress)) as Edition;

        // =====Check if there is nft with such id=====
        if (!creator) {
            return res.status(404).send("There is no NFT with id " + nftId)
        }

        // =====Check if renter has enough coins=====
        const check = await checkFormToTransferRent(String(creator), String(renter), nftId, quantity, days)
        if (check) {
            /** //TODO:
             * check if nft is rentable
             */

            // =====Renting the nft to renter=====
            //FIXME:
            // @ts-ignore - createUserRecord is new function added to contract not defined on Edition contract
            const rentedNft = await (await nftCollection)?.call("createUserRecord", [creator, renter, nftId, quantity, time + currentDate])

            // =====Transferring coins from renter to creator=====
            const transfer = await transferCoinsAndListedTokenRent(String(creator), String(renter), nftId, quantity, days) as status;

            // checking if collection was successfully created
            if (!transfer?.status) throw new Error("Unable to add nft to collection: \n" + transfer);

            // =====Changing number of rents in database of nft=====
            await addRent(nftId, time + currentDate, quantity);

            // =====Adding rended nft to users database=====
            await addRentedToUserDb(issuer, nftId, (days * 85400) + currentDate);

            await incrementTotalRentTime(days, nftId);

            const totalPrice = Number(transfer?.data?.totalPrice);

            // =====Updating user revenue=====
            const revenue = (await rentRevenue(issuer, quantity, totalPrice)) as status;

            // checking if revenue was updated successfully
            if (!revenue?.status) throw new Error("Unable to update revenue: \n" + revenue);
            

            return res.status(200).send(`Successfully rented NFT`);

        } 
        else if(renter === creator){
            console.log("Unable to rent nft - You can't rent nft if you are creator");
            return res.status(402).json({
                message: "You can't rent nft if you are creator",
                success: false
            });
        }
        else  {
            console.log("Unable to rent nft - Not enough coins");
            return res.status(402).json({
                message: "Not enough coins",
                success: false
            });
        }
        //@ts-ignore
    } catch ({ error, message }) {
        console.log(error, message)
        return res.status(500).send({ error, message });
    }

})

export { router }


/**
@swagger
 * /rent:
 *   post:
 *     tags:
 *      - renting NFT
 *     responses:
 *       200:
 *         description: Rent NFT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       nftId:
 *                         type: integer
 *                         description: NFT ID.
 *                         example: 0
 *                       expiry:
 *                         type: integer
 *                         description: Expiry of rent time.
 *                         example: 1
 *                       quantity:
 *                         type: integer
 *                         description: Renting quantity.
 *                         example: 12
 */