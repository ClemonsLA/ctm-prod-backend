import { buyNft } from "../services/buy-services";
import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"
import { getCreatorByContractId, getPriceByContractId, addNftDownloads, } from "../db/db-listing";
import {getWalletAddressByIssuer } from "../db/db";
import { sellRevenue } from "../db/db-userRevenue";
import { status } from "../models/check";
import { checkFormIsSellable } from "../services/check_and_transfer-services";
import { addOwnedToUserDb,getOwnedNftByIssuer,getRentedNftByIssuer } from "../db/db";


const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));


config();


router.post("/", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  /*
  #swagger.tags = ['User', 'Label']
  #swagger.description = 'Endpoint for buying nfts'
  #swagger.requestBody = {
       required: true,
        "@content": {
                "application/json": {
                    schema: {
                        type: "object",
                        properties: {
                            "nftId": { 
                                "type": "number", 
                                "format": "int",
                                "example": 1 
                              },
                            amount: {
                                type: "number",
                                "format": "int",
                                "example": 2 
                            }
                        },
                        required: ["nftId", "amount"]
                    }
                }
            }
  }

    #swagger.responses[200] = {
                description: 'You have just bought yourself a beautiful nft',
        }      
  */
  try {
    let { nftId, amount = 1 } = req.body as {
      nftId: number,
      amount: number,
    }


    nftId = Number(nftId);
    amount = Number(amount);


    if (!amount || (!nftId && nftId !== 0)) {
      return res.status(400).send("Missing data in request or wrong type");
    }
    if (Number(amount) <= 0 || !Number.isInteger(Number(amount))) {
      console.log("Amount of tokens must be greater than 0")
      return res.status(400).send("Amount of tokens must be greater than 0")
    }


    //@ts-ignore
    const issuer = req?.user?.issuer;
    const creatorAddress = await getCreatorByContractId(nftId); // wallet address of nft creator
    const buyerAddress = await getWalletAddressByIssuer(issuer);  // Wallet address of person who want to buy the nft

    // =====Check if the buyer and creator address was fetched from database correctly=====
    if (String(creatorAddress).slice(0, 2) != "0x") {
      throw new Error("Error fetching creator from database")
    }
    if (String(buyerAddress).slice(0, 2) != "0x") {
      throw new Error("Error fetching buyer from database")
    }

    // =====Transfer nft to the bayer=====
    const transaction = await buyNft(String(creatorAddress), String(buyerAddress), nftId, amount, res) as status;
    if (transaction.status === true) { }
    else if (transaction.status === false) return 0;
    else throw new Error("Error during checking if user is collection creator of collection - " + String(transaction));



    // =====Adding info to user database with which nft was bought=====
    const userDb = (await addOwnedToUserDb(issuer, nftId));

    // checking if nft was successfully added to user database
    if (userDb != true) throw new Error("Unable to add nft to user database: \n" + userDb);

    const totalPrice = await transaction?.data?.totalPrice;
    console.log("TOTAL PRICE", totalPrice)
    // =====Updating user revenue=====
    const revenue = (await sellRevenue(issuer, amount, Number(totalPrice))) as status;

    // checking if revenue was updated successfully
    if (!revenue?.status) throw new Error("Unable to update revenue: \n" + revenue);

  
    return res.status(200).send("You have just bought yourself a beautiful nft");

  } catch (error) {
    return res.status(500).send("Error - failed to buy the nft");
  }
})

router.get("/download-nft/:contractId", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  try {
    const { contractId } = req.params as {
      contractId: string,
    };

    if (!contractId) {
      return res.status(400).send("Missing data in request");
    }
    if (isNaN(parseInt(contractId)) || Number(contractId) <= 0) {
      return res.status(400).send("Contract id must be a positive integer");
    }

    //@ts-ignore
    const issuer = req?.user?.issuer;

    const ownedNft = await getOwnedNftByIssuer(issuer, Number(contractId));
    const rentedNft = await getRentedNftByIssuer(issuer, Number(contractId));

    if (ownedNft !== null) {
      await addNftDownloads(Number(contractId));
      return res.status(200).send("Success download nft.");
    } else if (rentedNft !== null) {
      await addNftDownloads(Number(contractId));
      return res.status(200).send("Success download nft.");
    } else {
      return res.status(500).send("You can't download nft");
    }
  } catch (error) {
    return res.status(500).send("Error - failed to download nft");
  }
});

export { router };