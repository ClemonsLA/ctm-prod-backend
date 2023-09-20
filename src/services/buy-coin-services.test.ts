
process.env.NODE_ENV === 'test'
import {
    checkSignedValue,
    checkUserWalletBalance,
    exportsForTesting,
    decodeTx,
    checkTransactionValue,
    sendSignedTran,
    checkSignedAddresses,
    checkTransactionAddresses,
    transferCoinsAfterVerifyingTransaction
} from "./buy-coin-services";
import { initTransaction } from "./buy-coin-services";
import Web3 from "web3";
import { getCoinPrice, getAmountOfAllCoins } from "../db/db-coin";
import * as mocks from "./mocks"
import { prismaMock } from '../singleton'
import { getCoinsByWalletAddress } from "../db/db";

//* ============Decoding rawTransaction============
describe("decodeTx()", () => {


    test("Should return correct rawTx", () => {
        const rawTransaction = '0xf86e82029d84908a905182520894257b9eac215954863263bed86c65c4e642d00905867f544a44c0008083027125a06503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93aa05886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288';

        const decoded = {
            "nonce": 669,
            "gasPrice": mocks.gasPrice,
            "gasLimit": 21000,
            "to": "0x257b9eac215954863263bed86c65c4e642d00905",
            "value": 140000000000000,
            "data": "",
            "from": "0xa568da33444f6591dc533b9049f5a44e77e2d07b",
            "r": "6503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93a",
            "v": "027125",
            "s": "5886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288"
        };

        expect(exportsForTesting.decodeTx(rawTransaction)).toStrictEqual(decoded);
    })

    test("Should throw error when inputted with numbers", () => {
        expect(() => exportsForTesting.decodeTx(12345)).toThrow(Error);
        expect(() => exportsForTesting.decodeTx(12345)).toThrow("Error - failed to decode rawTransaction");
    })

    test("Should throw error when input is empty ", () => {
        expect(() => exportsForTesting.decodeTx()).toThrow(Error);
        expect(() => exportsForTesting.decodeTx()).toThrow("Error - failed to decode rawTransaction");
    })

})


//* ============Coin buying initialization============

//jest.genMockFromModule('web3')
jest.mock("web3")
//const web3 = new Web3(NetworkRpcUrl); // Initializing web 3 library
const mockweb3 = mocks.mockweb3;
//@ts-ignore
Web3.mockImplementation(() => mockweb3);

//@ts-ignore
getCoinPrice = jest.fn().mockImplementation(() => Promise.resolve(0.00014))

describe("initTransaction()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });


    test("Should return correct rawTx", async () => {
        const from = "0x257b9EAC215954863263bED86c65c4e642D00905";
        const rawTx = {
            from: from,
            to: "0xA568Da33444F6591dc533b9049f5a44e77E2D07b",
            value: "140000000000000",
            gasPrice: "0x908a9051",
            gasLimit: "0x5208",
        };

        const data = await initTransaction(1, process.env.COIN_NAME!, from);

        expect(data).toStrictEqual(rawTx)
    })

    test("should throw error when given no input values", async () => {
        //@ts-ignore
        await expect(async () => await initTransaction()).rejects.toThrow(Error);
    })

    test("should throw error when given wrong values", async () => {
        //@ts-ignore
        await expect(async () => await initTransaction("abc", 1, 1)).rejects.toThrow(Error);
    })

    /*  test("should throw error when given negative coin amount", async () => {
         await expect(async () => {
             await initTransaction(-1, process.env.COIN_NAME!, "0x257b9EAC215954863263bED86c65c4e642D00905");
         }).rejects.toThrow(Error);
     });
 
     test("should throw error when given not integer coin amount", async () => {
         await expect(async () => {
             await initTransaction(1.5, process.env.COIN_NAME!, "0x257b9EAC215954863263bED86c65c4e642D00905");
         }).rejects.toThrow(Error);
     });
 
     test("should throw error when given negative not integer coin amount", async () => {
         await expect(async () => {
             await initTransaction(-1.5, process.env.COIN_NAME!, "0x257b9EAC215954863263bED86c65c4e642D00905");
         }).rejects.toThrow(Error);
     });
  */
    test("should throw error when coin name don't exist", async () => {

        //@ts-ignore
        getCoinPrice = jest.fn().mockImplementation(() => Promise.resolve(undefined))

        await expect(async () => {
            await initTransaction(1, "aaaaaaaaaa", "0x257b9EAC215954863263bED86c65c4e642D00905");
        }).rejects.toThrow(Error);
    });


    /* test("should throw error when wallet address don't exist", async () => {
        //@ts-ignore
        getCoinPrice = jest.fn().mockImplementation(() => Promise.resolve(0.00014))
        await expect(async () => {
            await initTransaction(1, process.env.COIN_NAME!, "0x257b9EAC215954863263bED86c65c4e642D00905");
        }).rejects.toThrow(Error);
    }); */

})

//* ============Checking user wallet ballance============
describe("checkUserWalletBalance()", () => {

    test("should return true", async () => {

        //@ts-ignore
        getCoinPrice = jest.fn().mockImplementation(() => Promise.resolve(0.00014))
        const walletAddress = "0x257b9EAC215954863263bED86c65c4e642D00905";
        const expectedAmount = 1;
        const gasFee = 31500000336000n;

        await expect(
            await checkUserWalletBalance(walletAddress, expectedAmount, gasFee)
        ).toBe(true)
    })

    test("should return false", async () => {

        const walletAddress = "0x257b9EAC215954863263bED86c65c4e642D00905";
        const expectedAmount = 10000;
        const gasFee = 31500000336000n;

        await expect(
            await checkUserWalletBalance(walletAddress, expectedAmount, gasFee)
        ).toBe(false)
    })

    test("should throw error when given no input values", async () => {
        //@ts-ignore
        await expect(async () => await checkUserWalletBalance()).rejects.toThrow(Error);
    })

    test("should throw error when given wrong values", async () => {
        //@ts-ignore
        await expect(async () => await checkUserWalletBalance(1, "add", "sffsf")).rejects.toThrow(Error);
    })

})

/* const originalBuyCoinServices = jest.requireActual("./buy-coin-services");

jest.mock("./buy-coin-services", () => ({
    decodeTX: 1,
    checkSignedValue: jest.requireActual("./buy-coin-services")
})) */



//* ============Check Signed Value============
describe("checkSignedValue()", () => {

    test("should return status: true, with correct data", async () => {

        // MOCK
        const decodedTx = mocks.decodedTx;

        //@ts-ignore
        decodeTx = jest.fn().mockImplementation(() => decodedTx)
        //@ts-ignore
        getCoinPrice = jest.fn().mockImplementation(() => Promise.resolve(0.00014))

        // INPUT
        const signedTx = mocks.signedTx;
        const expectedNumberOfCoins = 1;

        // EXPECTED
        const data = {
            value: decodedTx.value,
            gasFee: mocks.gasPrice * mocks.gasLimit
        }

        const result = await checkSignedValue(signedTx, expectedNumberOfCoins);

        expect(result.status).toBe(true);
        expect(result.data).toStrictEqual(data);
    })

    test("should return status: false, with correct data", async () => {

        // MOCK
        const decodedTx = mocks.decodedTx;
        const coinPrice = 0.00015;

        //@ts-ignore
        decodeTx = jest.fn().mockImplementation(() => decodedTx)
        //@ts-ignore
        getCoinPrice = jest.fn().mockImplementation(() => Promise.resolve(coinPrice))

        // INPUT
        const signedTx = mocks.signedTx;
        const expectedNumberOfCoins = 2;

        // EXPECTS
        const data = {
            signedValue: Number((decodedTx.value * 1e-18).toFixed(17)),
            expectedValue: coinPrice * expectedNumberOfCoins
        }

        const result = await checkSignedValue(signedTx, expectedNumberOfCoins);

        expect(result.status).toBe(false);
        expect(result.data).toStrictEqual(data);
    })
})



//* ============Check Transaction Value============
describe("checkTransactionValue()", () => {

    test("should return true", async () => {
        //@ts-ignore
        const check = await checkTransactionValue(mocks.receipt, mocks.decodedTx.value);
        expect(check).toBe(true);
    })

    test("should return false", async () => {
        //@ts-ignore
        const check = await checkTransactionValue(mocks.receipt, mocks.decodedTx.value * 2);
        expect(check).toBe(false);
    })
})


//* ============Send Signed Transaction============
describe("sendSignedTran()", () => {

    test("should return receipt", async () => {

        const mockRecipt = { ...mocks.receipt };

        const receipt = await sendSignedTran(mocks.signedTx.rawTransaction);

        expect(receipt).toStrictEqual(mockRecipt);

    })
})



//* ============Check Signed Addresses============
describe("checkSignedAddresses()", () => {

    test("should return false", async () => {

        // MOCK
        const decodedTx = mocks.decodedTx;

        //@ts-ignore
        decodeTx = jest.fn().mockImplementation(() => decodedTx)

        // INPUT
        const signedTx = mocks.signedTx;
        const buyerAddress = "0x257b9eac215954863263bed86c65c4e642d00905";

        const check = await checkSignedAddresses(signedTx, buyerAddress);

        expect(check).toEqual(false);
    })

    test("should return true", async () => {

        //@ts-ignore
        decodeTx = jest.fn().mockImplementation(() => mocks.decodedTxCorrect)

        // INPUT
        const signedTx = mocks.signedTx;
        const buyerAddress = "0x257b9eac215954863263bed86c65c4e642d00905";

        const check = await checkSignedAddresses(signedTx, buyerAddress);

        expect(check).toEqual(true);
    })
})



//* ============Check Transaction Addresses============
describe("checkTransactionAddresses()", () => {

    test("should return false when wrong buyer wallet address", async () => {

        // MOCK
        const decodedTx = mocks.decodedTx;

        // INPUT
        const receipt = mocks.receipt;
        const buyerAddress = "0xa568da33444f6591dc533b9049f5a44e77e2d07b";
        //@ts-ignore
        const check = await checkTransactionAddresses(receipt, buyerAddress);

        expect(check).toEqual(false);
    })

    test("should return true with correct wallet address", async () => {

        // INPUT
        const receipt = mocks.receipt;
        const buyerAddress = "0x257b9eac215954863263bed86c65c4e642d00905";
        //@ts-ignore
        const check = await checkTransactionAddresses(receipt, buyerAddress);

        expect(check).toEqual(true);
    })
})


//* ============Transfer Coins After Verifying Transaction============
describe("transferCoinsAfterVerifyingTransaction()", () => {

    test("should return status true and correct data", async () => {

        // INPUTS
        const buyerAddress = "0x257b9eac215954863263bed86c65c4e642d00905";
        const coinName = "Moonlite";
        const amount = 5;

        // MOCKS
        const userCoins = 1;
        const totalAmountOfCoins = 5;
        //@ts-ignore
        getCoinsByWalletAddress = jest.fn().mockImplementation(() => Promise.resolve(userCoins));
        //@ts-ignore
        getAmountOfAllCoins = jest.fn().mockImplementation(() => Promise.resolve(totalAmountOfCoins));


        const buyerCoinsAfterTransaction = {
            coins: userCoins + amount
        };
        const amountOfAllCoinsInMarket = {
            totalNumber: totalAmountOfCoins + amount
        };

        // EXPECTED
        const status = {
            status: true,
            data: {
                buyerCoinsAfterTransaction: userCoins + amount,
                amountOfAllCoinsInMarket: totalAmountOfCoins + amount
            }
        }

        //@ts-ignore
        prismaMock.users.update.mockResolvedValue(buyerCoinsAfterTransaction);
        //@ts-ignore
        prismaMock.coin.update.mockResolvedValue(amountOfAllCoinsInMarket);

        const result = await transferCoinsAfterVerifyingTransaction(buyerAddress, coinName, amount);

        expect(result).toStrictEqual(status);

    })
})


