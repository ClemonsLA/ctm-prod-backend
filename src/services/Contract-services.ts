import { nftContractType } from '../data/ContractType';
import { Edition, NFTCollection, ThirdwebSDK } from "@thirdweb-dev/sdk";
import { contractNetwork } from "../data/ContractNetwork";
import { config } from 'dotenv';
import { getCreatorByNftId } from '../db/db-listing';

config();

export async function getContract(contractAddress: string): Promise<Edition> {
    try {
        // Create Thirdweb SDK on Mumbai (Polygon Testnet) Network
        const sdk = new ThirdwebSDK(contractNetwork);

        const nftCollection = await sdk.getContract(
            contractAddress,  // Address of Thirweb NFT Collection/Edition Contract
            nftContractType  // Type of Thirdweb contract propablly edition or nft-collection
        );

        return nftCollection;
    } catch (err) {
        console.error(err);
        throw new Error("Unable to get contract");
    }
}

export async function getContractFromPrivateKey(contractAddress: string): Promise<Edition> {
    try {
        // Create Thirdweb SDK with crypto wallet of minter permission wallet (specified in Thirdweb-> Contracts-> Permissions) on Mumbai (Polygon Testnet) Network
        const sdk = ThirdwebSDK.fromPrivateKey(process.env.ADMIN_WALLET_PRIVATE_KEY!, contractNetwork);

        const nftCollection = await sdk.getContract(  // get contract on which the nfts are minted 
            contractAddress,  // Address of Thirweb NFT Collection/Edition Contract
            nftContractType  // Type of Thirdweb contract propablly edition or nft-collection
        );
        return nftCollection;
    } catch (err) {
        console.error(err);
        throw new Error("Unable to get contract");
    }
}


export async function getAllFromContract(contractAddress: string) {
    try {
        const nftCollection = await getContract(contractAddress);

        if (nftCollection instanceof Error) { // checking whether function returned error 
            throw new Error('Problem with contract', nftCollection)
        }
        //@ts-ignore
        const list = await (await nftCollection)?.erc1155.getAll();  // fetching all valid listings
        //@ts-ignore
        const nfts = await Promise.all(list.map(async (listing) => {   // making sure that promise(for fetching listings) is resolved
            return { ...listing, };
        }));

        return nfts
    } catch (err) {
        return err;
    }
}

export async function getNftFromContractById(contractAddress: string, id: number | string) {
    try {
        const nftCollection = await getContract(contractAddress);

        if (nftCollection instanceof Error) { // checking whether function returned error 
            throw new Error('Problem with contract', nftCollection)
        }

        //@ts-ignore
        const nft = await (await nftCollection)?.erc1155.get(id);  // fetching listings by id

        return nft;

    } catch (err) {
        return err;
    }

}
export async function getBalanceOfNft(contractId: number, contractAddress: string, creatorAddress = ""): Promise<number> {
    try {
        const contract = await getContract(contractAddress);
        let creatorWalletAddress = creatorAddress 
        if(creatorAddress == ""){
            //@ts-ignore
            creatorWalletAddress = await getCreatorByNftId(contractId);
        }
        // get creator of nft by id on contract
        
        if (typeof creatorWalletAddress == "undefined") throw new Error(`There is no such nft with id ${contractId}`);
        //@ts-ignore
        const balance = Number(await contract.erc1155.balanceOf(creatorWalletAddress, contractId));

        return balance;

    } catch (error) {
        console.error(error);
        throw new Error("Error while checking balance of nfts still available")
    }
}




