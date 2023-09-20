import { getAllCoins } from "./db-coin";
import { prismaMock } from "../singleton";
import { coin } from "@prisma/client";


describe("getAllCoins()", () => {
    test("should return all coins", () => {

        const mockCoins = [{
            name: "Moonlite",
            symbol: "MLC",
            icon: "https://ctm-nft.marotino.ventures/_next/image?url=%2Flogo.png&w=128&q=75",
            totalNumber: 0,
            price: 0.00014
        }]
        prismaMock.coin.findMany.mockResolvedValueOnce({ ...mockCoins });

        expect(getAllCoins()).toStrictEqual(mockCoins)
    })
})