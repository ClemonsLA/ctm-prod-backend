import { describe, it, expect, test, beforeAll, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import { router } from '../routes/buy-nft';
import { config } from 'dotenv';
import request from 'supertest'
import express from "express"
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { contractNetwork } from "../data/ContractNetwork";

config();
const app = express()
describe("POST /generate-signature", () => {


    it("should return 200 OK with signature", async () => {

        const data = {
            listingId: "10",
            quantity: 1,
            walletAddress: "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
        };





        const response = await request(app.use(router))
            .post("/")
            .send(data)
            .expect(200);
        expect(response.body).toHaveProperty("receipt");

    }, 60000);

    it("should return 500 Internal Server Error if something goes wrong", async () => {
        const data = {};

        const response = await request(app.use(router))
            .post("/")
            .send(data)
            .expect(500);
        expect(response.body).toHaveProperty("error");
    }, 6000);
});
