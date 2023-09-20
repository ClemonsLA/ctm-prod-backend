import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware";
import { changeCoinPrice,getAmountOfAllCoins,getCoinPrice} from "../db/db-coin";
import { checkSignedAddresses, checkSignedValue, checkTransactionAddresses, checkTransactionValue, checkUserWalletBalance, initTransaction, sendSignedTran, transferCoinsAfterVerifyingTransaction } from "../services/buy-coin-services";
import { SignTransactionResult } from "web3-eth-accounts/lib/commonjs/types"
import { status } from "../models/check";
import { getWalletAddressByIssuer,getCoinsByWalletAddress } from "../db/db";
import { PrismaClient } from '@prisma/client'


config();

const router = express.Router();

const prisma = new PrismaClient({ log: ["query"] });

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

router.put('/change-price/:newPrice', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /*
      #swagger.tags = ['SuperAdmin']
    #swagger.description = 'Changing price of the coin'
        #swagger.responses[200] = {
                    description: 'Expected response body at code 200',
                    schema: {
                        newPrice: 1.45,                    
                        name: 'Moonlite',                      
                    }
            }        
    */
    try {
        const newPrice = Number(req.params.newPrice);
        const name = process.env.COIN_NAME!;

        if (Number.isNaN(newPrice) || Number(newPrice) <= 0) {
            return res.status(400).send("Price must be a positive integer.");
        }
        const coin = await changeCoinPrice(Number(newPrice), name);
        return res.status(200).send({ coin });


    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to change coin price");
    }
})

router.post('/initTransaction', checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {


    /*
    #swagger.tags = ['User', 'Label']
#swagger.description = 'Endpoint initialize coin buying transaction - will return data(init) to be signed by user'
#swagger.parameters['RequestBody'] = {
            in: 'body',
            required: true,
            type: 'string',
            description: 'Required request body to init transaction',
            schema: {
                coinsAmount: 'number',
            }
}
#swagger.responses[200] = {
            description: 'Expected response body at code 200',
            schema: {
                "init": {
                    "from": "did:ethr:0xD763016000cF8CA9594aEA52c351b30235A016F9",
                    "to": "0xA568Da33444F6591dc533b9049f5a44e77E2D07b",
                    "value": "1000000000000000000",
                    "gasPrice": "0x62590090",
                    "gasLimit": "0x5208"

                }
            }
}        
*/
    try {
        const { coinsAmount } = req.body as {
            coinsAmount: number,
        };
        if (Number(coinsAmount) <= 0 || !Number.isInteger(coinsAmount)) {
            return res.status(400).send("Coins amount must be positive integer.");
        }
        //@ts-ignore
        const issuer = req?.user?.issuer
        const buyerAddress = String(await getWalletAddressByIssuer(issuer));
        const init = await initTransaction(coinsAmount, process.env.COIN_NAME!, buyerAddress)
        res.status(200).send({ init });


    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to initialize transaction");
    }

})

router.post('/buy', checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {

    /*
      #swagger.tags = ['User', 'Label']
      #swagger.description = 'Endpoint for buying the coins'
      #swagger.parameters['RequestBody'] = {
                  in: 'body',
                  required: true,
                  type: 'string',
                  description: 'Required request body to init transaction- signedTx is data(obtained from /initTransaction) which was signed by user wallet',
                  schema: {
                        coinsAmount: 1,
                        signedTx: {
                            messageHash: '0xc454854490e717dded9ecd3f1cf78f12fbda542806c39be79120b69901415e92',
                            v: '0x27125',
                            r: '0x6503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93a',
                            s: '0x5886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288',
                            rawTransaction: '0xf86e82029d84908a905182520894257b9eac215954863263bed86c65c4e642d00905867f544a44c0008083027125a06503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93aa05886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288',
                            transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711'
                        }
                  }
              }
      #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                  schema: {
                      "message": "successfully bought 1  Moonlites",
                      "success": true
                  }
      }
  */

    try {
        let { coinsAmount, signedTx } = req.body as {
            coinsAmount: number,
            signedTx: SignTransactionResult
        };

        //@ts-ignore
        const issuer = req?.user?.issuer;
        // fetching creator wallet address from user database by issuer
        const buyerAddress = String(await getWalletAddressByIssuer(issuer));

        coinsAmount = Number(coinsAmount);

        if (!coinsAmount) {
            return res.status(400).send("Missing data in request");
        }
        if (Number(coinsAmount) <= 0 || !Number.isInteger(coinsAmount)) {
            return res.status(400).send("Coins amount must be positive integer.");
        }

        // Check if value in signed transaction is correct
        const checkSignedVal = (await checkSignedValue(signedTx, coinsAmount)) as status;
        if (checkSignedVal.status === true) { }
        else if (checkSignedVal.status === false) return res.status(403)
            .send("value signed is not as expected:\n expected: " + checkSignedVal?.data?.expectedValue +
                "\n signed: " + checkSignedVal?.data?.signedValue);
        else throw new Error("Error during checking if user signed correct value of crypto:\n" + String(checkSignedVal));
        console.log("SENT VALUE ",)
        // Check if user have enough crypto on there wallet
        const checkBalance = await checkUserWalletBalance(buyerAddress, coinsAmount, checkSignedVal.data.gasFee)
        if (checkBalance === true) { }
        else if (checkBalance === false) return res.status(402).send(`User(wallet address ${buyerAddress}) don't have enough found on there wallet`);
        else throw new Error("Error during checking user balance" + String(checkBalance));

        // Check if wallet address in signed transaction are correct (admin wallet address and from issuer)
        const checkSign = await checkSignedAddresses(signedTx, buyerAddress);
        if (checkSign === true) { }
        else if (checkSign === false) return res.status(402).send(`Wrong wallet addresses in signed transaction`);
        else throw new Error("Error during checking wallet addresses in signed transaction" + String(checkSign));


        // Sending signed transaction
        const receipt = await sendSignedTran(signedTx.rawTransaction);

        // Checking if transaction was sent correctly
        if (!receipt?.status) throw new Error("Unable to send transaction - blockchain");

        // Check if value in signed transaction is correct
        const checkSentVal = await checkTransactionValue(receipt, checkSignedVal?.data?.value);
        if (checkSentVal === true) { }
        else if (checkSentVal === false) return res.status(400)
            .send("Wrong value sent in trasaction");
        else throw new Error("Error during checking if user sent correct value of crypto:\n" + String(checkSentVal));

        // Check if wallet address in sent transaction are correct (admin wallet address and from issuer)
        const checkTransactionWalletAddress = await checkTransactionAddresses(receipt, buyerAddress);
        if (checkTransactionWalletAddress === true) { }
        else if (checkTransactionWalletAddress === false) return res.status(402).send(`Wrong wallet addresses in sent transaction`);
        else throw new Error("Error during checking wallet addresses in sent transaction" + String(checkSign));


        // Transfer coins💎 to buyer 
        const coinTransfer = await transferCoinsAfterVerifyingTransaction(buyerAddress, process.env.COIN_NAME!, coinsAmount) as status;

        // Checking if coins were transferred correctly
        if (!coinTransfer?.status) throw new Error("Unable to send transaction - database");

        return res.status(200).json({//@ts-ignore
            message: `successfully bought ${coinsAmount}  ${process.env.COIN_NAME!}s`,
            success: true
        })

    } catch (error) {
        return res.status(500).send("Error - failed to buy coins");
    }
})

router.get('/coin-price-by-name', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => { 
    try {
        const coinName = "Moonlite";
        if (!coinName) {
            return res.status(400).send("Missing data in request or wrong type");
          }
          if (typeof coinName !== 'string' || coinName.length === 0 || coinName.trim() === '') {
            return res.status(400).send('Invalid coin name');
          }
        const coinPrice = await getCoinPrice(coinName)
        return res.status(200).send({ coinPrice });
    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to get coin price");
    }
})

router.post('/refund',  checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
try {
    let {userAddress, coinsAmountToRefund} = req.body as {
        userAddress : string,
        coinsAmountToRefund: number,
    };

    //@ts-ignore
    const issuer = req?.user?.issuer;
    const superAdminAddress = await getWalletAddressByIssuer(issuer);
    const coinName = process.env.COIN_NAME!;
    let coinsInMarket = await getAmountOfAllCoins(coinName)
    let userCoins = await getCoinsByWalletAddress(userAddress)

    console.log("Coins in market before refund : ", Number(coinsInMarket))
    console.log("User coins before refund : ", Number(userCoins))

    if (!userAddress || !coinsAmountToRefund) {
        return res.status(400).send("Missing data in request or wrong type");
      }
    if (Number(coinsAmountToRefund) <= 0 || !Number.isInteger(coinsAmountToRefund)) {
        return res.status(400).send("Coins amount must be positive integer.");
    }
    if (String(superAdminAddress).slice(0, 2) != "0x") {
        throw new Error("Error fetching super admin from database")
      }
    if (String(userAddress).slice(0, 2) != "0x") {
        throw new Error("Error fetching user from database")
      }

    const userCoinsTransaction = Number(userCoins) + coinsAmountToRefund
    const marketCoinsTransaction = Number(coinsInMarket) + coinsAmountToRefund
    
    const result = await prisma.$transaction([
         prisma.users.update({
            where: {
                walletAddress: userAddress
            },
            data: {
                coins: Number(userCoinsTransaction)
            },
            select: {
                walletAddress : true,
                coins : true
            }
        }),
        
        prisma.coin.update({
            where: {
                name: coinName
            },
            data: {
                totalNumber: Number(marketCoinsTransaction)
            },
            select :{
                name : true,
                totalNumber : true
            }
        })

    ])

    console.log("Coins in market after refund : ", result[1]?.totalNumber);
    console.log("User coins after refund : ", result[0]?.coins);

    return res.status(200).json({message: "Coins refunded successfully",result: result,});

}catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - failed to refund coins to user");
}
}
)

export { router };