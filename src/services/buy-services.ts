import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { checkFormToTransfer, transferCoinsAndListedToken } from "./check_and_transfer-services";
import { contractNetwork } from "../data/ContractNetwork";
import { nftContractType } from "../data/ContractType";
import { Response } from "express"
import { getContractFromPrivateKey } from "./Contract-services";



export async function buyNft(
    creatorAddress: string,
    buyerAddress: string,
    nftId: number,
    amount: number,
    res: Response
) {

    try {

        const contractAddress = process.env.NFT_THIRWEB_COLLECTION_ADDRESS!;
        const nftCollection = await getContractFromPrivateKey(contractAddress);

        const check = await checkFormToTransfer(creatorAddress, buyerAddress, nftId, amount, res)

        if (check) {

            //@ts-ignore
            const transaction = await (await nftCollection).call("buyNFT", [creatorAddress, buyerAddress, nftId, amount])

            const totalPrice = await transferCoinsAndListedToken(creatorAddress, buyerAddress, nftId, amount)

            const status = {
                status: true,
                data: {
                    transaction: transaction,
                    totalPrice: totalPrice
                }
            }
            return status;
        } else {
            console.log(check);
            const status = {
                status: false,
                data: check
            }
            return status
        }
    } catch (error) {
        console.log("ERROR in buyNft:\n", error)
        return "Unexpected error while performing buy transaction";
    }
}