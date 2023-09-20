import { getContractFromPrivateKey } from "./Contract-services"
import { buyNft } from "./buy-services"
import { checkFormToTransfer } from "./check_and_transfer-services"
import { transferCoinsAndListedToken } from "./check_and_transfer-services"
import { Response } from "express"

//* ============buy Nft============
describe("buyNft()", () => {
    test("should return status true with correct data", async () => {
        // MOCKS
        const transaction = {
            abc: 1
        }
        const edition = {
            call: jest.fn().mockResolvedValue({ ...transaction })
        }
        const checkFormToTransferResolved = true;
        const totalPrice = 5;

        //@ts-ignore
        getContractFromPrivateKey = jest.fn().mockImplementation(() => Promise.resolve(edition));
        //@ts-ignore
        checkFormToTransfer = jest.fn().mockImplementation(() => Promise.resolve(checkFormToTransferResolved));
        //@ts-ignore
        transferCoinsAndListedToken = jest.fn().mockImplementation(() => Promise.resolve(totalPrice));

        // INPUTS
        const creatorAddress = "0x257b9EAC215954863263bED86c65c4e642D00905";
        const buyerAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        const nftId = 1;
        const amount = 1;
        const res = {} as Response;

        // EXPECT
        const status = {
            status: true,
            data: {
                transaction: { ...transaction },
                totalPrice: totalPrice
            }
        }

        const result = await buyNft(creatorAddress, buyerAddress, nftId, amount, res);

        expect(result).toStrictEqual(status);

    })

    test("should return status false with correct data", async () => {
        // MOCKS
        const transaction = {
            abc: 1
        }
        const edition = {
            call: jest.fn().mockResolvedValue({ ...transaction })
        }
        const checkFormToTransferResolved = false;
        const totalPrice = 5;

        //@ts-ignore
        getContractFromPrivateKey = jest.fn().mockImplementation(() => Promise.resolve(edition));
        //@ts-ignore
        checkFormToTransfer = jest.fn().mockImplementation(() => Promise.resolve(checkFormToTransferResolved));
        //@ts-ignore
        transferCoinsAndListedToken = jest.fn().mockImplementation(() => Promise.resolve(totalPrice));

        // INPUTS
        const creatorAddress = "0x257b9EAC215954863263bED86c65c4e642D00905";
        const buyerAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        const nftId = 1;
        const amount = 1;
        const res = {} as Response;

        // EXPECT
        const status = {
            status: false,
            data: checkFormToTransferResolved
        }

        const result = await buyNft(creatorAddress, buyerAddress, nftId, amount, res);

        expect(result).toStrictEqual(status);

    })
})