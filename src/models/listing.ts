export interface Listing {
    id?: number;
    name: string; 
    price: number;
    quantity: number;
    tokensInStock: number;
    tokensListed: number;
    description: string;
    imageURL: string;
    musicURL: string;
    nftMintTime?: Date;
    nftListTime?: Date;
    contractId: number;
    contractAddress: string;
    creatorWalletAddress: string;
    tokenStandard: string;
    labelWallet: string;
    isSellable: boolean;
    isRentable: boolean;
    rentPrice: number;
    numberOfRents: number;
    numberOfCurrentRents: number;
    userLikes: number;
    userDislikes: number;
    moderatorPoints: number;
    rankingPoints: number;
    highestRank: number;
    views: number;
    downloads: number;
    genre: number;
}

export interface Minting {
    name: string;
    quantity: number;
    description: string;
    imageURL: string;
    musicURL: string;
    contractId: number;
    contractAddress: string;
    creatorWalletAddress: string;
    tokenStandard: string;
    genre: number;
}

export interface ThirwebContractNft {
    owner: string;
    metadata: {
        name: string;
        description: string;
        image: string;
        external_url?: string;
        animation_url: string;
        attributes: [{
            creator: string;
            genre: number;
        }],
        background_color: string;
        id: string | number;
        uri: string;
        supply: string | number;

    },
    type: string;
    supply: string | number;
}

export interface MetadataNft {
    metadata: {
        name: string;  // Name of NFT (probably song title)
        description: string;  // Description of NFT
        image: string | File;  // Address to or file containing cover image for song
        animation_url: string | File;  // Address or file containing music
        attributes: [{
            creator: string; // Additional information-who is the creator of the nft 
            genre: number;   // Genre of music given as enum 
        }],
    },
    quantity: number;  // Quantity of NFTs to be deployed 
    price: number;    // Price to be charged for minting NFT 
    to: string;  // Address of crypto wallet of creator of NFT
};