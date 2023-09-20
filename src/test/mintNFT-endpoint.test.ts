import { describe, it, expect, test, beforeAll, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import { router } from '../routes/mint-nft';
import { config } from 'dotenv';
import request from 'supertest'
import express from "express"
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { contractNetwork } from "../data/ContractNetwork";

config();
const app = express()
describe("POST /generate-signature", () => {

    let sdk: ThirdwebSDK;
    let nftCollection: any; // declare nftCollection variable

    beforeEach(() => {
        sdk = ThirdwebSDK.fromPrivateKey(process.env.ADMIN_WALLET_PRIVATE_KEY!, contractNetwork);
        nftCollection = {
            signature: {
                generate: jest.fn(),
                mint: jest.fn()
            }
        };
        // mock sdk.getContract to return nftCollection
        jest.spyOn(sdk, 'getContract').mockResolvedValueOnce(nftCollection);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 OK with signature", async () => {

        const data = {
            name: "Song Title",
            description: "NFT for a song",
            coverImage: "https://ipfs.thirdwebcdn.com/ipfs/QmPFQkNybhJkAK2DVteUcV1DkrKwgvdkySvpdwz1fBzVaU/kubu%C5%9B%20puchatek%20white.png",
            music: "https://ipfs.thirdwebcdn.com/ipfs/QmPFQkNybhJkAK2DVteUcV1DkrKwgvdkySvpdwz1fBzVaU/99%20Luftballons.opus",
            address: "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
            quantity: 1,
        };

        // create a mock response for signature generation
        const transaction = { transaction: 'mocked-transaction' };
        const signature = { signature: "mocked-signature" };
        jest.spyOn(nftCollection?.signature, 'generate').mockResolvedValueOnce(signature);
        jest.spyOn((await nftCollection)?.signature, 'mint').mockResolvedValueOnce(transaction);


        const response = await request(app.use(router))
            .post("/")
            .send(data)
            .expect(200);
        expect(response.body).toHaveProperty("signature");
        expect(response.body).toHaveProperty("transaction");

    }, 60000);

    it("should return 500 Internal Server Error if something goes wrong", async () => {
        const data = {};

        const response = await request(app.use(router))
            .post("/")
            .send(data)
            .expect(500);
        expect(response.body).toHaveProperty("error");
    }, 60000);
});
