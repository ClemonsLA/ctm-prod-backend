import { describe, it, expect, test, beforeAll, afterAll } from '@jest/globals';
import { router } from '../routes/fetch-nfts-from-marketplace';
import { config } from 'dotenv';
import request from 'supertest'
import express from "express"

config();
const app = express()
describe("GET /marketplace-listings", () => {

    it("should return 200 OK with all listings", async () => {

        const response = await request(app.use(router))
            .get("/")
            .expect(200);
        expect(response.body).toHaveProperty("resolvedList");
    });

});


describe("GET /marketplace-listings/:id", () => {

    it("should return 200 OK single listing", async () => {

        const response = await request(app.use(router))
            .get("/1")
            .expect(200);
        expect(response.body).toHaveProperty("listing");
    });

});

