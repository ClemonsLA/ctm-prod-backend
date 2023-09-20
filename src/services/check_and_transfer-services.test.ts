import { getCoinsByWalletAddress } from "../db/db";
import {
    getPriceByContractId,
    getTokenListedByContractId,
    getTokenInStockByContractId,
    getQuantityByContractId,
    getAvailableQuantityByContractId,
    getRentableByContractId,
    getSellableByContractId,
    getRentPriceByContractId
} from "../db/db-listing";
import { checkFormIsRentable, checkFormIsSellable, checkFormToTransfer, checkFormToTransferRent, transferCoinsAndListedToken, transferCoinsAndListedTokenRent } from "./check_and_transfer-services";
import { Response } from "express"
import { prismaMock } from "../singleton";
import { getBalanceOfNft } from "./Contract-services";
import { listing, users } from "@prisma/client";



let creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
    buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b",
    nftId = 1,
    amount = 1,
    res = {
        status: jest.fn().mockImplementation(() => ({ send: jest.fn() }))
    }, //as Response;
    nftPrice = 1,
    nftRentPrice = 1,
    tokensInStoke = 1,
    tokensListed = 1,
    quantity = 1,
    availableQuantity = 1,
    balance = 1,
    buyerCoins = 10,
    creatorCoins = 5,
    days = 1


//@ts-ignore
getCoinsByWalletAddress = jest.fn().mockImplementation((address) => {
    switch (address) {
        case creatorAddress:
            return creatorCoins;
        case buyerAddress:
            return buyerCoins;
    }
});

//@ts-ignore
getPriceByContractId = jest.fn().mockImplementation(() => Promise.resolve(nftPrice));
//@ts-ignore
getTokenInStockByContractId = jest.fn().mockImplementation(() => Promise.resolve(tokensInStoke));
//@ts-ignore
getTokenListedByContractId = jest.fn().mockImplementation(() => Promise.resolve(tokensListed));
//@ts-ignore
getQuantityByContractId = jest.fn().mockImplementation(() => Promise.resolve(quantity));
//@ts-ignore
getAvailableQuantityByContractId = jest.fn().mockImplementation(() => Promise.resolve(availableQuantity));
//@ts-ignore
getBalanceOfNft = jest.fn().mockImplementation(() => Promise.resolve(balance));
//@ts-ignore
getRentPriceByContractId = jest.fn().mockImplementation(() => Promise.resolve(nftRentPrice));

describe("checkFormToTransfer()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should return true when enough tokens in stock", async () => {
        tokensInStoke = 50000;

        nftPrice = 1;
        amount = 10;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";
        //@ts-ignore
        const checkForm = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res);

        expect(checkForm).toEqual(true)
    })

    test("should return true when amount = tokens in stock", async () => {
        tokensInStoke = 5;
        amount = 5;

        nftPrice = 1;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";
        //@ts-ignore
        const checkForm = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res);

        expect(checkForm).toEqual(true)
    })

    test("should return false when tokens in stock less than amount", async () => {
        amount = 6;
        tokensInStoke = 5;

        nftPrice = 1;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";
        //@ts-ignore
        const checkForm = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res);

        expect(checkForm).toEqual(false)
    })


    test("should return false when buyer don't have enough coins", async () => {
        nftPrice = 1;
        amount = 10;
        tokensInStoke = 11;
        buyerCoins = 1;

        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        //@ts-ignore
        const checkForm = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res);

        expect(checkForm).toEqual(false)
    })

    test("should return false when buyer is creator", async () => {
        nftPrice = 1;
        amount = 10;
        tokensInStoke = 11;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";

        //@ts-ignore
        const checkForm = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res);

        expect(checkForm).toEqual(false)
    })

    test("should return true when buyer coins = total price", async () => {
        nftPrice = 1;
        amount = 10;
        tokensInStoke = 11;
        buyerCoins = 10;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";
        //@ts-ignore
        const checkForm = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res);

        expect(checkForm).toEqual(true)
    })

    test("should throw error", async () => {
        nftPrice = 1;
        amount = 10;
        tokensInStoke = 11;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        //@ts-ignore
        getTokenInStockByContractId = jest.fn().mockImplementationOnce(() => { throw new Error("AAAA Error") });

        //@ts-ignore
        expect(async () => await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res)).rejects.toThrow(Error);

    })

    test("should throw error when nft price is undefined", async () => {
        //@ts-ignore
        nftPrice = undefined;
        amount = 10;
        tokensInStoke = 11;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        //@ts-ignore
        expect(async () => await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res)).rejects.toThrow(Error);

    })

})


describe("checkFormToTransferRent()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test("should return true when everything is ok", async () => {
        nftRentPrice = 1;
        amount = 10;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";
        days = 1;

        const checkForm = await checkFormToTransferRent(creatorAddress, buyerAddress, nftId, amount, days);

        expect(checkForm).toEqual(true)
    })

    test("should return false when buyer don't have enough coins", async () => {
        buyerCoins = 1;
        nftRentPrice = 1;
        amount = 10;
        days = 1;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";

        const checkForm = await checkFormToTransferRent(creatorAddress, buyerAddress, nftId, amount, days);

        expect(checkForm).toEqual(false)
    })

    test("should return false when buyer is creator", async () => {
        nftRentPrice = 1;
        amount = 10;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";

        const checkForm = await checkFormToTransferRent(creatorAddress, buyerAddress, nftId, amount, days);

        expect(checkForm).toEqual(false)
    })

    test("should throw error", async () => {
        nftRentPrice = 1;
        amount = 10;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        //@ts-ignore
        getTokenInStockByContractId = jest.fn().mockImplementationOnce(() => { throw new Error("AAAA Error") });

        expect(async () => await checkFormToTransferRent(creatorAddress, buyerAddress, nftId, amount, days)).rejects.toThrow(Error);

    })

    test("should throw error when nft price is undefined", async () => {
        //@ts-ignore
        nftRentPrice = undefined;
        amount = 10;
        tokensInStoke = 11;
        buyerCoins = 100;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";


        expect(async () => await checkFormToTransferRent(creatorAddress, buyerAddress, nftId, amount, days)).rejects.toThrow(Error);

    })

})

prismaMock.users.update.mockResolvedValue({} as users);
prismaMock.listing.update.mockResolvedValue({} as listing);

describe("***transferCoinsAndListedToken()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should return correct totalPrice", async () => {

        nftPrice = 2;
        amount = 10;

        tokensInStoke = 11;
        buyerCoins = 1;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        const transfer = await transferCoinsAndListedToken(creatorAddress, buyerAddress, nftId, amount);
        expect(transfer).toBe(nftPrice * amount);

    })

    test("should throw error", async () => {
        nftPrice = 1;
        amount = 10;

        tokensInStoke = 11;
        buyerCoins = 1;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        prismaMock.listing.update.mockImplementationOnce(() => { throw new Error("AAAA Error in database") });

        expect(async () => await transferCoinsAndListedToken(creatorAddress, buyerAddress, nftId, amount)).rejects.toThrow(Error);
    })
})


describe("***transferCoinsAndListedTokenRent()", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });
    test("should return correct totalPrice", async () => {

        nftRentPrice = 2;
        amount = 10;
        days = 3

        tokensInStoke = 11;
        buyerCoins = 1;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        const status = {
            status: true,
            data: {
                totalPrice: nftRentPrice * amount * days
            }
        }

        const transfer = await transferCoinsAndListedTokenRent(creatorAddress, buyerAddress, nftId, amount, days);
        expect(transfer).toStrictEqual(status);

    })

    test("should throw error", async () => {
        nftRentPrice = 2;
        amount = 10;

        tokensInStoke = 11;
        buyerCoins = 1;
        creatorAddress = "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C";
        buyerAddress = "0x823e41a1e4962bb2f659577d414fd17b37b3409b";

        prismaMock.users.update.mockImplementationOnce(() => { throw new Error("AAAA Error in database") });

        expect(async () => await transferCoinsAndListedTokenRent(creatorAddress, buyerAddress, nftId, amount, days)).rejects.toThrow(Error);
    })
})



describe("checkFormIsRentable()", () => {
    test("should return true if nft is rentable", async () => {
        //@ts-ignore
        getRentableByContractId = jest.fn().mockImplementationOnce(() => Promise.resolve(true));

        expect(await checkFormIsRentable(nftId)).toEqual(true)
    })

    test("should return false if nft is not rentable", async () => {
        //@ts-ignore
        getRentableByContractId = jest.fn().mockImplementationOnce(() => Promise.resolve(false));

        expect(await checkFormIsRentable(nftId)).toBe(false)
    })

    test("should return false if when catch is used", async () => {
        //@ts-ignore
        getRentableByContractId = jest.fn().mockImplementationOnce(() => { throw new Error("AAAAAA Error in get is Rentable") });

        expect(await checkFormIsRentable(nftId)).toBe(false)
    })

    test("should return false if when getRentableByContractId returns undefined", async () => {
        //@ts-ignore
        getRentableByContractId = jest.fn().mockImplementationOnce(() => Promise.resolve(undefined));

        expect(await checkFormIsRentable(nftId)).toBe(false)
    })
})


describe("checkFormIsSellable()", () => {
    test("should return true if nft is rentable", async () => {
        //@ts-ignore
        getSellableByContractId = jest.fn().mockImplementationOnce(() => Promise.resolve(true));

        expect(await checkFormIsSellable(nftId)).toEqual(true)
    })

    test("should return false if nft is not rentable", async () => {
        //@ts-ignore
        getSellableByContractId = jest.fn().mockImplementationOnce(() => Promise.resolve(false));

        expect(await checkFormIsSellable(nftId)).toBe(false)
    })

    test("should return false if when catch is used", async () => {
        //@ts-ignore
        getSellableByContractId = jest.fn().mockImplementationOnce(() => { throw new Error("AAAAAA Error in get is Rentable") });

        expect(await checkFormIsSellable(nftId)).toBe(false)
    })

    test("should return false if when getRentableByContractId returns undefined", async () => {
        //@ts-ignore
        getSellableByContractId = jest.fn().mockImplementationOnce(() => Promise.resolve(undefined));

        expect(await checkFormIsSellable(nftId)).toBe(false)
    })
})