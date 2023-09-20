export const gasPrice = 2425000017;
export const gasLimit = 21000;
export const decodedTx = {
    "nonce": 669,
    "gasPrice": gasPrice,
    "gasLimit": gasLimit,
    "to": "0x257b9eac215954863263bed86c65c4e642d00905",
    "value": 140000000000000,
    "data": "",
    "from": "0xa568da33444f6591dc533b9049f5a44e77e2d07b",
    "r": "6503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93a",
    "v": "027125",
    "s": "5886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288"
}

export const decodedTxCorrect = {
    "nonce": 669,
    "gasPrice": gasPrice,
    "gasLimit": gasLimit,
    "to": "0xa568da33444f6591dc533b9049f5a44e77e2d07b",
    "value": 140000000000000,
    "data": "",
    "from": "0x257b9eac215954863263bed86c65c4e642d00905",
    "r": "6503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93a",
    "v": "027125",
    "s": "5886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288"
}

export const signedTx = {
    messageHash: '0xc454854490e717dded9ecd3f1cf78f12fbda542806c39be79120b69901415e92',
    v: '0x27125',
    r: '0x6503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93a',
    s: '0x5886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288',
    rawTransaction: '0xf86e82029d84908a905182520894257b9eac215954863263bed86c65c4e642d00905867f544a44c0008083027125a06503007bee9fce796d04f143bc5ce174e52094e12838ac3c78287ec518b1a93aa05886e4ce7bcce1c6e4e242f73f6f7c81d9ecddec8254b4abda9922a9f020a288',
    transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711'
};

export const receipt = {
    blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
    blockNumber: 37176913n,
    cumulativeGasUsed: 5344182n,
    effectiveGasPrice: 2425000017n,
    from: '0x257b9eac215954863263bed86c65c4e642d00905',
    gasUsed: 21000n,
    logs: [
        {
            address: '0x0000000000000000000000000000000000001010',
            topics: [Array],
            data: '0x00000000000000000000000000000000000000000000000000007f544a44c000000000000000000000000000000000000000000000000000300c1e099f5ab0050000000000000000000000000000000000000000000000000165c21dd0e3ac30000000000000000000000000000000000000000000000000300b9eb55515f005000000000000000000000000000000000000000000000000016641721b286c30',
            blockNumber: 37176913n,
            transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
            transactionIndex: 26n,
            blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
            logIndex: 111n,
            removed: false
        },
        {
            address: '0x0000000000000000000000000000000000001010',
            topics: [Array],
            data: '0x00000000000000000000000000000000000000000000000000002e50e6890200000000000000000000000000000000000000000000000000300c4c5a85e9248d0000000000000000000000000000000000000000000011b33d05a348612ad39a000000000000000000000000000000000000000000000000300c1e099f60228d0000000000000000000000000000000000000000000011b33d05d19947b3d59a',
            blockNumber: 37176913n,
            transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
            transactionIndex: 26n,
            blockHash: '0x50a02175bd057f14a79a227d2ddb0d42dbe9bd6b1f460457e8843d39bf9adcee',
            logIndex: 112n,
            removed: false
        }
    ],
    logsBloom: '0x00000400000800000000000000000000000000000000000000000000000000000000000400000000000000100000000000008000002000000000000000000000000000000000000000000000000000800000000000000000040100000000000000000000000000000000000000000000000000000000000080000000000000000001010000000000000000000000000000000000000000000000000000000000200000000000000000000000000000008000000000000000000040000000004000000000000000000001000000000000000000000000800000108000000000000000000000000000000000000000000000000000000000000000000000100000',
    status: 1n,
    to: '0xa568da33444f6591dc533b9049f5a44e77e2d07b',
    transactionHash: '0x80a9b816d00572208d8c48f2d9f4a1a4e40181c0bcb0404628dfe9a042e01711',
    transactionIndex: 26n,
    type: 0n
}

    export const users = {
        "id": 1,
        "issuer": "did:ethr:0xfE19C0cfC1a48DE132f29ae34464595c66Ae4736",
        "name": "testUser",
        "description": "testUser",
        "tag": 1,
        "walletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
        "walletType": "testUser",
        "coins": 0,
        "role": 0,
        "email": "mail@mail.com",
        "whenSignedUp": "2023-06-28T13:17:29.667Z",
        "lastLoginAt": 1688140034,
        "nftOwned": [],
        "nftRented": [],
        "website": "testUser"
    }

const originalWeb3 = jest.requireActual('web3');

export const mockweb3 = {
    ...originalWeb3,
    eth: {
        getGasPrice: jest.fn().mockResolvedValue(gasPrice),
        getBalance: jest.fn().mockResolvedValue(97297012669676860n),
        getTransaction: jest.fn().mockResolvedValue({
            value: decodedTx.value
        }),
        sendSignedTransaction: jest.fn().mockResolvedValue(receipt)
    }
}