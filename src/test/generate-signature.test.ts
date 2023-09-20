import { describe, it, expect, test, beforeAll, afterAll } from '@jest/globals';
import { router } from '../routes/generate-signature-r';
import { config } from 'dotenv';
import request from 'supertest'
import express from "express"

config();
const app = express()
describe("POST /generate-signature", () => {

    it("should return 200 OK with signature", async () => {
        const data = {
            name: "Song Title",
            description: "NFT for a song",
            coverImage: "https://ipfs.thirdwebcdn.com/ipfs/QmPFQkNybhJkAK2DVteUcV1DkrKwgvdkySvpdwz1fBzVaU/kubu%C5%9B%20puchatek%20white.png",
            music: "https://ipfs.thirdwebcdn.com/ipfs/QmPFQkNybhJkAK2DVteUcV1DkrKwgvdkySvpdwz1fBzVaU/99%20Luftballons.opus",
            address: "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C"
        };

        const response = await request(app.use(router))
            .post("/")
            .send(data)
            .expect(200);
        expect(response.body).toHaveProperty("signature");
    });

    it("should return 500 Internal Server Error if something goes wrong", async () => {
        const data = {};

        const response = await request(app.use(router))
            .post("/")
            .send(data)
            .expect(500);
        expect(response.body).toHaveProperty("error");
    });
});
