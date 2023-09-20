
import { NetworkRpcUrl, contractNetwork, NetworkId, ChainId, HardFork } from "../data/ContractNetwork";
import { PrismaClient } from '@prisma/client'
import Web3 from 'web3';
import Common from 'ethereumjs-common';
import { Transaction } from "ethereumjs-tx";
import { SignTransactionResult } from "web3-eth-accounts/lib/commonjs/types"
import { getCoinPrice, getAmountOfAllCoins } from "../db/db-coin";
import { TransactionReceipt } from "web3";
import { getCoinsByWalletAddress } from "../db/db";
import { raw } from "@prisma/client/runtime";
import chalk from "chalk";

//const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's 
import prisma from "../client";


//* ============Decoding rawTransaction============
// Decodes rawTransaction into data used to check data in signed transaction 
export function decodeTx(hex: string) {
    try {
        if (!hex) throw new Error("Hex is empty");

        const customCommon = Common.forCustomChain(
            'mainnet',
            {
                name: contractNetwork,
                networkId: NetworkId,
                chainId: ChainId,
            },
            HardFork
        );

        const tx = new Transaction(hex, { common: customCommon });

        var rawTx = {
            nonce: parseInt(tx.nonce.toString('hex') || '0', 16),
            gasPrice: parseInt(tx.gasPrice.toString('hex'), 16),
            gasLimit: parseInt(tx.gasLimit.toString('hex'), 16),
            to: '0x' + tx.to.toString('hex'),
            value: parseInt(tx.value.toString('hex') || '0', 16),
            data: tx.data.toString('hex'),
        };

        if (tx.r.length) {
            rawTx = {
                ...rawTx,
                //@ts-ignore
                from: '0x' + tx.from.toString('hex'),
                r: tx.r.toString('hex'),
                v: tx.v.toString('hex'),
                s: tx.s.toString('hex'),
            }
        }

        return rawTx
    } catch (error) {
        console.error(chalk.bgHex('#c0a1c4').black.bold("\nERROR: \n", error));
        throw new Error("Error - failed to decode rawTransaction");
    }
}

//* ============For testing============
// conditional export so decodeTX can be tested
export let exportsForTesting: any;
if (process.env.NODE_ENV === 'test') {
    exportsForTesting = { decodeTx };
}

//* ============Coin buying initialization============
// Function which return data to be signed by user - signed transaction is then used to send transaction on blockchain
export async function initTransaction(
    coinsAmount: number, // Amount of coin user want to buy
    coinName: string, // Name of coin - should be taken from env 
    walletAddress: string // wallet address of user who want to buy coins
) {
    try {
        const toAddress = process.env.ADMIN_WALLET_ADDRESS;
        const web3 = new Web3(NetworkRpcUrl);
        const coinPrice = await getCoinPrice(process.env.COIN_NAME!)
        const coinsAmountAndPriceBeforeConvert = coinsAmount * Number(coinPrice)
        const coinsAmountAndPriceAfterConvert = coinsAmountAndPriceBeforeConvert.toString().slice(0, 18);
        if (!coinPrice) throw new Error("Error - wrong coin price");

        const amountWei = web3.utils.toWei(Number(coinsAmountAndPriceAfterConvert), 'ether');
        console.log("AFTER CONVERT", coinsAmountAndPriceAfterConvert)



        const rawTx = { // data to be signed 
            from: walletAddress,
            to: toAddress,
            value: amountWei,
            gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
            gasLimit: web3.utils.toHex(21000),
        };

        //Const's only to console.log's
        const priceWithoutGas = Number(web3.utils.fromWei(Number(rawTx.value), 'ether'))
        const gasPrice = web3.utils.toHex(await web3.eth.getGasPrice())
        const gasLimit = rawTx.gasLimit
        const gasPriceWithGasLimit = Number(gasPrice) * Number(gasLimit)
        const gasPriceToConvert = web3.utils.hexToNumberString(gasPrice)
        const gasPriceAfterConvert = Number(web3.utils.fromWei(gasPriceToConvert, 'ether'))

        console.log("Raw Tx : ", rawTx)
        console.log("AMOUNT WEI ", amountWei)
        console.log("gasPriceWithGasLimit : ", Number(web3.utils.fromWei(Number(gasPriceWithGasLimit), 'ether')))
        console.log("Amount : ", Number(web3.utils.fromWei(Number(rawTx.value), 'ether')))
        console.log("Coin name : ", coinName)
        console.log("Coin price : ", Number(coinPrice))
        console.log("Gas price : ", gasPriceAfterConvert)
        console.log("Price without gas : ", priceWithoutGas)
        console.log("Price with gas (coin price * amout) + gas : ", priceWithoutGas + Number(web3.utils.fromWei(Number(gasPriceWithGasLimit), 'ether')))

        return rawTx;
    } catch (error) {
        console.error("ERROR: \n", error);
        throw new Error("Error - failed to generate rawTx");
    }
}

//* ============Checking user wallet ballance============
// function to check if user have enough crypto in there wallet
export async function checkUserWalletBalance(
    walletAddress: string, // Wallet address of which the wallet blance(amount of crypto) you want check
    expectedAmount: number, // Amount of coins user want buy
    gasFee: bigint // current gas fee - gasPrice * gasLimit
): Promise<Boolean> {
    try {
        // Initializing web3 from Currency RPC URL
        const web3 = new Web3(NetworkRpcUrl);
        const coinPrice = Number(await getCoinPrice(process.env.COIN_NAME!))
        // Taking user wallet balance => converting it from bigInt => converting it to number
        const balance = Number(web3.utils.fromWei(await web3.eth.getBalance(walletAddress), "ether"))
        const gasFeeAfterConvert = Number(web3.utils.fromWei(gasFee, 'ether'))

        // Checking if balance on user wallet grater or equal to expected payments
        console.log("BALANCE ", balance)
        console.log("COINPRICE ", coinPrice)
        console.log("EXPECTED AMOUNT ", expectedAmount)
        console.log("GAS FEEEEEEEEEEEE", gasFeeAfterConvert)
        if (balance >= ((coinPrice * expectedAmount) + gasFeeAfterConvert)) return true;
        else return false;
    } catch (error) {
        console.error("ERROR: \n", error);
        throw new Error("Error - failed to check user balance")
    }
}

//checkUserWalletBalance("0xA568Da33444F6591dc533b9049f5a44e77E2D07b", 4, 1).then((isbigger) => { console.log(isbigger) })

//* ============Check Signed Value============
// function to check if value(amount to be transferred) in signed transaction is as expected
export async function checkSignedValue(
    signedTx: SignTransactionResult, // Signed transaction from initTransaction
    expectedNumberOfCoins: number // How many coins user want to buy 
) {
    try {
        // Initializing web3 from Currency RPC URL
        const web3 = new Web3(NetworkRpcUrl);

        const rawTransaction = signedTx.rawTransaction;

        const rawTx = exports.decodeTx(rawTransaction);

        if (!('value' in rawTx)) throw new Error(String(rawTx));

        // Taking price of coin
        const coinPrice = (await getCoinPrice(process.env.COIN_NAME!)) as number

        // Value needed to buy given number of coins
        const neededValue = expectedNumberOfCoins * coinPrice;

        // Value signed by user 
        //@ts-ignore
        const signedValue = Number(web3.utils.fromWei(rawTx.value, "ether"))

        //console.log("neededValue: ", neededValue);
        //console.log("signedValue: ", signedValue);

        // Check if value signed is equal to needed value 
        const acceptedError = 1e-14;

        console.log("SIGNED VALIEE : ", signedValue, neededValue + acceptedError)
        console.log("SIGNED :", signedValue, neededValue - acceptedError)

        if ((signedValue <= neededValue + acceptedError) && (signedValue >= neededValue - acceptedError)) {
            const status = {
                status: true,
                data: {
                    value: rawTx.value,
                    //@ts-ignore
                    gasFee: rawTx.gasLimit * rawTx.gasPrice
                }
            }
            return status;
        }
        else {
            const status = {
                status: false,
                data: {
                    signedValue: signedValue,
                    expectedValue: neededValue
                }
            }
            return status
        }
    } catch (error) {
        console.error("ERROR: \n", error);
        throw new Error("Error - failed to check signed value")
    }
}

// function to check if value(amount to be transferred) in signed transaction is as expected
export async function checkTransactionValue(receipt: TransactionReceipt, expectedValue: number | string) {
    try {
        //FIXME: 67 is quite random number i dont know if it is correct
        //const maxValuePosition = 67;
        //const transactionData = String(receipt.logs[0].data).slice(0,maxValuePosition);

        // Initializing web3 from Currency RPC URL
        const web3 = new Web3(NetworkRpcUrl);

        const TransactionHash = receipt.transactionHash;

        const transaction = await web3.eth.getTransaction(TransactionHash);

        console.log("value: ", transaction.value);
        console.log("HexValue: ", expectedValue)

        // Check if value signed is equal to sent in transaction value 
        if (transaction.value == expectedValue) return true;
        else return false;
    } catch (error) {
        return error;
    }
}

// Function to send signed transaction
export async function sendSignedTran(rawTransaction: string): Promise<TransactionReceipt> {
    try {
        // Initializing web3 from Currency RPC URL
        const web3 = new Web3(NetworkRpcUrl);

        const receipt = await web3.eth.sendSignedTransaction(rawTransaction);
        return receipt

    } catch (error) {
        console.error("ERROR: ", error)
        throw new Error("ERROR - failed to send signed transaction")
    }
}

// Function to check if from address == issuer wallet address and to is admin wallet address in signed transaction
export async function checkSignedAddresses(
    signedTx: SignTransactionResult,
    expectedBuyerAddress: string
) {
    try {
        const rawTransaction = signedTx.rawTransaction;
        // converting rawTransaction in hex to object 
        const rawTx = exports.decodeTx(rawTransaction);


        // issuerAddress needed 
        const neededIssuerAddress = expectedBuyerAddress;
        // Address signed by issuer

        //@ts-ignore
        const signedIssuerAddress = rawTx?.from;

        // adminAddress needed 
        const neededAdminAddress = process.env.ADMIN_WALLET_ADDRESS;
        // adminAddress signed by user
        //@ts-ignore
        const signedAdminAddress = rawTx.to;

        console.log("neededIssuerAddressSIGNED", neededIssuerAddress)
        console.log("signedIssuerAddressSIGNED", signedIssuerAddress)
        console.log("neededAdminAddressSIGNED", neededAdminAddress)
        console.log("signedAdminAddressSIGNED", signedAdminAddress)

        if (neededIssuerAddress.toLowerCase() == signedIssuerAddress.toLowerCase() && neededAdminAddress?.toLowerCase() == signedAdminAddress.toLowerCase()) return true;
        else return false;
    } catch (error) {
        console.error("ERROR ", error);
        throw new Error("Error - failed to check signed addresses")
    }
}

// Function to check if from address == issuer wallet address and to is admin wallet address in sent transaction
export async function checkTransactionAddresses(
    receipt: TransactionReceipt,
    expectedBuyerAddress: string
) {
    try {
        // issuerAddress needed 
        const neededIssuerAddress = expectedBuyerAddress;
        // Address signed by issuer
        const inTransactionIssuerAddress = receipt.from;
        // adminAddress needed 
        const neededAdminAddress = process.env.ADMIN_WALLET_ADDRESS;
        // adminAddress signed by user
        const inTransactionAdminAddress = receipt.to;

        console.log("neededIssuerAddressTRANSACTION", neededIssuerAddress)
        console.log("inTransactionIssuerAddressTRANSACTION", inTransactionIssuerAddress)
        console.log("neededAdminAddressTRANSACTION", neededAdminAddress)
        console.log("inTransactionAdminAddressTRANSACTION", inTransactionAdminAddress)

        if (neededIssuerAddress.toLowerCase() == inTransactionIssuerAddress.toLowerCase() && neededAdminAddress?.toLowerCase() == inTransactionAdminAddress.toLowerCase()) return true;
        else return false;
    } catch (error) {
        return error;
    }
}


export async function transferCoinsAfterVerifyingTransaction(
    buyerAddress: string,
    coinName: string,
    amount: number,
) {
    try {
        let buyerCoinsBeforeTransaction = await getCoinsByWalletAddress(buyerAddress)
        let coinsBeforeTransaction = await getAmountOfAllCoins(coinName)

        //TODO DODAC TRYCATCH I STATUS TRUE LUB FALSE
        //data befor transaction
        console.log("buyerCoins before transaction : ", buyerCoinsBeforeTransaction)
        console.log("amount of all coins in market before transaction : ", coinsBeforeTransaction)

        const buyerCoins = Number(buyerCoinsBeforeTransaction) + Number(amount)
        const coinsAfterTransaction = Number(coinsBeforeTransaction) + Number(amount)
        //transferring coins and change the amount of all coins
        const buyerCoinsAfterTransaction = (await prisma.users.update({
            where: {
                walletAddress: buyerAddress
            },
            data: {
                coins: Number(buyerCoins)
            },
            select: {
                coins: true
            }
        })).coins

        const amountOfAllCoinsInMarket = (await prisma.coin.update({
            where: {
                name: coinName
            },
            data: {
                totalNumber: Number(coinsAfterTransaction)
            },
            select: {
                totalNumber: true
            }
        })).totalNumber;

        console.log("buyer coins after transaction : ", buyerCoins)
        console.log("amount of all coins in market after transaction", coinsAfterTransaction)

        const status = {
            status: true,
            data: { buyerCoinsAfterTransaction, amountOfAllCoinsInMarket }
        }
        return status

    } catch (error) {
        console.error("Error ", error);
        throw new Error("Error - failed to transfer coin to user")
    }
}

async function generateSign() {
    const web3 = new Web3(NetworkRpcUrl);
    const amountWei = web3.utils.toWei( 0.00042 /* 0.000209999999999999 */, 'ether');

    const rawTx = {
        //nonce: 1000,
        from: "0x257b9EAC215954863263bED86c65c4e642D00905",
        to: "0xA568Da33444F6591dc533b9049f5a44e77E2D07b",
        value: amountWei,
        //  gasPrice: web3.utils.toHex(6),
        gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
        gasLimit: web3.utils.toHex(21000),
    };
    console.log("value ", rawTx.value)
    //console.log("gasPrice ", rawTx.gasPrice)
    //console.log("gasLimit ", rawTx.gasLimit)
    var privateKey = "467e3e7a7765f8d3c7c51d7b03c50cf881815beb9029435d8c134fd28f5aa121";

    const signedTx = await web3.eth.accounts.signTransaction(rawTx, privateKey);
    console.log("signedTx  : ", signedTx);
}

if (process.env.MODE === "TEST" || process.env.MODE === "TEST-coin") {

    generateSign();

    //transferCoinsAfterVerifyingTransaction("0x257b9EAC215954863263bED86c65c4e642D00905","Moonlite", 1)
    //initTransaction(0.00014, "Moonlite","0x257b9EAC215954863263bED86c65c4e642D00905")/nft
    //initTransaction(0.00014, "1", "1");
    //const abc = '0xf86a82027b0682520894257b9eac215954863263bed86c65c4e642d00905867f544a44c0008083027125a04884040b9954afebf92ef2e98c1c0d280864590552bbc819f6ec63440eda5a9da06b0eac466db2ff7f598cdd78d4c331b6a6caa345a06e4b7fa7c766e38f32d65b';

    //initTransaction(6, "j", "jj");

    /* const receipt = {
        blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
        blockNumber: 37176913n,
        cumulativeGasUsed: 5344182n,
        effectiveGasPrice: 2425000017n,
        from: '0xa568da33444f6591dc533b9049f5a44e77e2d07b',
        gasUsed: 21000n,
        logs: [
            {
                address: '0x0000000000000000000000000000000000001010',
                topics: [Array],
                data: '0x00000000000000000000000000000000000000000000000000007f544a44c000000000000000000000000000000000000000000000000000300c1e099f5ab0050000000000000000000000000000000000000000000000000165c21dd0e3ac30000000000000000000000000000000000000000000000000300b9eb55515f005000000000000000000000000000000000000000000000000016641721b286c30',
                blockNumber: 37176913n,
                transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
                transactionIndex: 26n,
                blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
                logIndex: 111n,
                removed: false
            },
            {
                address: '0x0000000000000000000000000000000000001010',
                topics: [Array],
                data: '0x00000000000000000000000000000000000000000000000000002e50e6890200000000000000000000000000000000000000000000000000300c4c5a85e9248d0000000000000000000000000000000000000000000011b33d05a348612ad39a000000000000000000000000000000000000000000000000300c1e099f60228d0000000000000000000000000000000000000000000011b33d05d19947b3d59a',
                blockNumber: 37176913n,
                transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
                transactionIndex: 26n,
                blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
                logIndex: 112n,
                removed: false
            }
        ],
        logsBloom: '0x00000400000800000000000000000000000000000000000000000000000000000000000400000000000000100000000000008000002000000000000000000000000000000000000000000000000000800000000000000000040100000000000000000000000000000000000000000000000000000000000080000000000000000001010000000000000000000000000000000000000000000000000000000000200000000000000000000000000000008000000000000000000040000000004000000000000000000001000000000000000000000000800000108000000000000000000000000000000000000000000000000000000000000000000000100000',
        status: 1n,
        to: '0x257b9eac215954863263bed86c65c4e642d00905',
        transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
        transactionIndex: 26n,
        type: 0n
    }
    //@ts-ignore
    checkTransactionValue(receipt, 140000000000000).then((isCorrect => console.log(isCorrect))); */

    //initTransaction(0.00014, "Moonlite","0x257b9EAC215954863263bED86c65c4e642D00905")
    //initTransaction(0.00014, "1", "1");

    const abc = {
        messageHash: '0xc454854490e717dded9ecd3f1cf78f12fbda542806c39be79120b69901415e92',
        v: '0x27125',
        r: '0x6503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93a',
        s: '0x5886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288',
        rawTransaction: '0xf86e82029d84908a905182520894a568da33444f6591dc533b9049f5a44e77e2d07b867f544a44c0008083027125a06503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93aa05886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288',
        transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711'
    }
    /* checkSignedValue(abc, 1).then((isCorrect => console.log(isCorrect)));
    const receipt = {
        blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
        blockNumber: 37176913n,
        cumulativeGasUsed: 5344182n,
        effectiveGasPrice: 2425000017n,
        from: '0x257b9eac215954863263bed86c65c4e642d00905',
        gasUsed: 21000n,
        logs: [
            {
                address: '0x0000000000000000000000000000000000001010',
                topics: [Array],
                data: '0x00000000000000000000000000000000000000000000000000007f544a44c000000000000000000000000000000000000000000000000000300c1e099f5ab0050000000000000000000000000000000000000000000000000165c21dd0e3ac30000000000000000000000000000000000000000000000000300b9eb55515f005000000000000000000000000000000000000000000000000016641721b286c30',
                blockNumber: 37176913n,
                transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
                transactionIndex: 26n,
                blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
                logIndex: 111n,
                removed: false
            },
            {
                address: '0x0000000000000000000000000000000000001010',
                topics: [Array],
                data: '0x00000000000000000000000000000000000000000000000000002e50e6890200000000000000000000000000000000000000000000000000300c4c5a85e9248d0000000000000000000000000000000000000000000011b33d05a348612ad39a000000000000000000000000000000000000000000000000300c1e099f60228d0000000000000000000000000000000000000000000011b33d05d19947b3d59a',
                blockNumber: 37176913n,
                transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
                transactionIndex: 26n,
                blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
                logIndex: 112n,
                removed: false
            }
        ],
        logsBloom: '0x00000400000800000000000000000000000000000000000000000000000000000000000400000000000000100000000000008000002000000000000000000000000000000000000000000000000000800000000000000000040100000000000000000000000000000000000000000000000000000000000080000000000000000001010000000000000000000000000000000000000000000000000000000000200000000000000000000000000000008000000000000000000040000000004000000000000000000001000000000000000000000000800000108000000000000000000000000000000000000000000000000000000000000000000000100000',
        status: 1n,
        to:'0xa568da33444f6591dc533b9049f5a44e77e2d07b',
     
     
        transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
        transactionIndex: 26n,
        type: 0n
    } 
     */
    /* checkSignedAddresses(abc,"0x257b9eac215954863263bed86c65c4e642d00905", "0xa568da33444f6591dc533b9049f5a44e77e2d07b").then(async (abc) => {
        console.log("checkSignedAddresses : ", abc)
    })
    checkTransactionAddresses(receipt,"0x257b9eac215954863263bed86c65c4e642d00905", "0xa568da33444f6591dc533b9049f5a44e77e2d07b" ).then(async (abc) => {
        console.log("checkTransactionAddresses : ", abc)
    }) */
}