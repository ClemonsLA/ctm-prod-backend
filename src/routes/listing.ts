import express from "express";
import { config } from "dotenv";
import bodyParser from "body-parser";
import {
  newListing,
  deleteDirectListingById,
  getAllListings,
  getListingByDatabaseId,
  getListingByContractId,
  getListingByCreatorWalletAddress,
  getQuantityByContractId,
  addUserWhoLiked,
  checkIfLiked,
  giveModeratorPoints,
  flagNft,
  unFlagNft,
  getCreatorByContractId,
  getByGenreAndSortingByRankingPoints,
  getAllListingsAndSortingByRankingPoints,
  getAllGenres,
  getActualQuantityByContractId,
  getTokenListedByContractId,
  getAvailableQuantityByContractId,
  giveDislike,
  addUserWhoDisliked,
  checkIfDisliked,
  getFlaggedNfts,
  checkIfLikedOrDisliked,
  checkIfTouched,
  getDatabaseIdByContractId,

} from "../db/db-listing";
import { getUserNftsRentedOrBought, getWalletAddressByIssuer } from "../db/db";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"
import { giveLike } from "../db/db-listing";
import chalk from "chalk";

const router = express.Router();


config();


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: false }));

// ==========PUT==========


//create listing by "contractId"
router.put("/create-and-save", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  /*
   
   #swagger.tags = ['User', 'Label']
   #swagger.description = 'Listing - allowing other users to buy/rent nft, User must be logged in to list nft, every number must be int number'
   
 #swagger.requestBody = {
      required: true,
       "@content": {
               "application/json": {
                   schema: {
                       type: "object",
                       properties: {
                           idFromContract: {
                               type: "number"
                           },
                           newPrice: {
                               type: "number",
                               format: "int"
                           },
                           newRentPrice: {
                               type: "number",
                               format: "int"
                           },
                           amount: {
                               type: "number",
                               format: "int"
                           },
                           
                       },
                       required: ["idFromContract", "newPrice", "newRentPrice", "amount"]
                   }
               }
           }
 }

  #swagger.parameters['RequestBody'] = {
           in: 'body',
           required: true,
           type: 'object',
           description: 'Required request body to buy nft',
           schema: {
               idFromContract: 'number',
               newPrice: 'number',
               newRentPrice: 'number',
               amount: 'number'
           }
       }
   #swagger.responses[200] = {
               description: 'Expected response body at code 200',
               schema: {
                 "id": 1,
                 "name": "nftName",
                 "price": 1,
                 "quantity": 1,
                 "tokensInStock": 1,
                 "tokensListed": 1,
                 "description": "nftDesctiption",
                 "imageURL": "https://ipfs-2.imageURL/0",
                 "musicURL": "https://ipfs-2.musicURL/1",
                 "nftMintTime": "1970-01-01:00:00.00",
                 "nftListTime": null,
                 "contractId": 1,
                 "contractAddress": "0x0000000000000000000000000000000000000001",
                 "creatorWalletAddress": "0x0000000000000000000000000000000000000002",
                 "tokenStandard": "ERC1155",
                 "labelWallet": "",
                 "isSellable": true,
                 "isRentable": true,
                 "rentPrice": 1,
                 "numberOfRents": 0,
                 "numberOfCurrentRents": 0,
                 "userLikes": 0,
                 "usersWhoLiked": [],
                 "userDislikes": 0,
                 "moderatorPoints": 0,
                 "rankingPoints": 0,
                 "highestRank": 0,
                 "views": 0,
                 "downloads": 0,
                 "genre": 1,
                 "isFlagged": false,
                 "flagDescription": null,
                 "collections": [] 
               }
       }          
 */
  try {
    const { idFromContract, newPrice, newRentPrice, amount } = req.body as {
      idFromContract: number;
      newPrice: number;
      newRentPrice: number;
      amount: number;
    };
    //@ts-ignore
    const issuer = req?.user?.issuer
    const quantity = await getQuantityByContractId(idFromContract)
    const creator = await getCreatorByContractId(idFromContract)
    const issuerWalletAddress = String(await getWalletAddressByIssuer(issuer))

    const actualQuantity = await getActualQuantityByContractId(idFromContract)
    const tokensListed = await getTokenListedByContractId(idFromContract)
    const availableQuantity = await getAvailableQuantityByContractId(idFromContract)


    if (creator !== issuerWalletAddress) {
      return res.status(400).send("You must be creator");
    }
    if (amount > Number(availableQuantity)) {
      return res.status(400).send("Amount must be less than actual quantity of nft's - listed nft's. Available quantity = " + availableQuantity);
    }
    if (newPrice <= 0 || !Number.isInteger(newPrice)) {
      return res.status(400).send("Price must be a positive integer.");
    }
    if (newRentPrice <= 0 || !Number.isInteger(newRentPrice)) {
      return res.status(400).send("Rent price must be a positive integer.");
    }
    if (amount > Number(quantity)) {
      return res.status(400).send("You don't have enough amount of nfts");
    }
    else {

      const newDirectListingToDataBase = await newListing(
        idFromContract,
        newPrice,
        newRentPrice,
        amount,
      );
      return res.status(200).send({ newDirectListingToDataBase });
    }

    //@ts-ignore
  } catch ({ error, message }) {
    console.log("ERROR: ", error)
    return res.status(500).send({ error, message });
  }
});

router.put("/like/:idFromContract", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  /*
     #swagger.tags = ['User', 'Label']
     #swagger.description = 'Give like to nft, User must be logged in to like nft, User can like each nft only once'
     */
  try {
    const id = req.params.idFromContract;
    //@ts-ignore
    const issuer = req?.user?.issuer;

    const checkUserLiked = await checkIfLiked(Number(id), issuer);
    if (checkUserLiked) {
      return res.status(403).send("user already liked it")
    } else {
      await giveLike(Number(id), issuer);
      await addUserWhoLiked(Number(id), issuer);
    }

    return res.status(200).send("Successfully liked nft number" + id)

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - unable to give like");
  }
})
router.put("/dislike/:idFromContract", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  /*
     #swagger.tags = ['User', 'Label']
     #swagger.description = 'Give like to nft, User must be logged in to like nft, User can like each nft only once'
     */
  try {
    const id = req.params.idFromContract;
    //@ts-ignore
    const issuer = req?.user?.issuer;

    const checkUserDisliked = await checkIfDisliked(Number(id), issuer);
    if (checkUserDisliked) {
      return res.status(403).send("user already dislike it")
    } else {
      await giveDislike(Number(id), issuer);
      await addUserWhoDisliked(Number(id), issuer);
    }

    return res.status(200).send("Successfully disliked nft number" + id)

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - unable to give dislike");
  }
})

router.put("/moderator-points", checkAuthenticated, checkRole(["Moderator"]), async (req, res, next) => {
  /*
   #swagger.tags = ['Moderator']
   #swagger.description = 'Moderator can add or decrease number of rank points of the nft'
   */
  try {
    const { contractId, numberOfPoints } = req.body as {
      contractId: number,
      numberOfPoints: number,
    }

    giveModeratorPoints(contractId, numberOfPoints);
    if (Number(numberOfPoints) <= 0 || !Number.isInteger(numberOfPoints)) {
      return res.status(400).send("Number of points must be positive integer.");
    }

    return res.status(200).send("Successfully added " + numberOfPoints + " to nft number" + contractId);

  } catch (error) {
    console.log("ERROR: ", error);
    return res.status(500).send("Error - unable to give moderator points");
  }
})

router.put("/flag", checkAuthenticated, checkRole(["Moderator"]), async (req, res, next) => {
  /*
    #swagger.tags = ['Moderator']
    #swagger.description = 'Moderator can flag nft (as for example spam), the reason of flag should be in description'
    */
  try {
    const { contractId, description } = req.body as {
      contractId: number,
      description: string,
    }

    flagNft(contractId, description);

    return res.status(200).send("Successfully flagged nft number" + contractId);

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - unable to flag this nft");
  }
})

router.put("/un-flag", checkAuthenticated, checkRole(["Moderator"]), async (req, res, next) => {
  /*
    #swagger.tags = ['Moderator']
    #swagger.description = 'Moderator can unflag nft'
    */
  try {
    const { contractId } = req.body as {
      contractId: number,
    }

    unFlagNft(contractId);

    return res.status(200).send("Successfully unflagged nft number" + contractId);

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - unable to unflag this nft");
  }
})


router.put("/like/check/:idFromContract", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  /*
     #swagger.tags = ['User', 'Label']
     #swagger.description = 'Endpoint to check if user already gave like to this nft, User must be logged in'
     #swagger.responses[200] = {
                description: '1 - user liked it, 0 - user dint clicked, -1 - user disliked it',
                schema: {
                    "checkUserLiked": 1
                }              
                }
        }    
     */
  try {
    const id = req.params.idFromContract;
    //@ts-ignore
    const issuer = req?.user?.issuer;

    const checkUserLiked = await checkIfLikedOrDisliked(Number(id), issuer);
    res.status(200).send({ checkUserLiked })

    //@ts-ignore
  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - Unable to check if user liked this nft");
  }
})

// ==========GET==========

router.get("/", async (req, res, next) => {
  /*
       #swagger.tags = ['Open']
         #swagger.description = 'Endpoint to fetch all listings, User dont have to be logged in'
       #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                  schema: {
                      "listing": [
                          {
                              "id": 983,
                              "name": "piesel",
                              "price": 0,
                              "quantity": 1,
                              "actualQuantity": 0,
                              "tokensInStock": 0,
                              "tokensListed": 0,
                              "availableQuantity": 0,
                              "description": "piesel",
                              "imageURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/0",
                              "musicURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/1",
                              "nftMintTime": "2023-06-30T09:39:53.476Z",
                              "nftListTime": null,
                              "contractId": 2,
                              "contractAddress": "0x659EC433eb6cf86ADb0245085F3861dF8B60EFd9",
                              "creatorWalletAddress": "0x257b9EAC215954863263bED86c65c4e642D00905",
                              "tokenStandard": "ERC1155",
                              "labelWallet": "",
                              "isSellable": false,
                              "isRentable": false,
                              "rentPrice": 0,
                              "numberOfRents": 0,
                              "numberOfCurrentRents": 0,
                              "userLikes": 0,
                              "usersWhoLiked": [],
                              "userDislikes": 0,
                              "moderatorPoints": 0,
                              "rankingPoints": 0,
                              "highestRank": 0,
                              "views": 0,
                              "downloads": 0,
                              "genre": 1,
                              "isFlagged": false,
                              "flagDescription": null,
                              "collections": [],
                              "creator": {
                                  "name": "c"
                              }
                          }
                      ]              
                  }   
          }  
       */
  try {
    const listing = await getAllListings();
    res.status(200).send({ listing });

  } catch (error) {
    console.log("ERROR: ", error);
    return res.status(500).send("Error - unable to fetch all listings");
  }
});

router.get("/by-database-id/:dbId", async (req, res, next) => {
  /*
    #swagger.tags = ['Open']
    #swagger.description = 'Endpoint to fetch listing by nft id on database, User dont have to be logged in'
    #swagger.responses[200] = {
               description: 'Expected response body at code 200',
               schema: {
                  "listing": {
                        "id": 1310,
                        "name": "Thaddeus",
                        "price": 0,
                        "quantity": 50000,
                        "actualQuantity": 50000,
                        "tokensInStock": 0,
                        "tokensListed": 0,
                        "availableQuantity": 50000,
                        "description": "occaecati voluptas ullam",
                        "imageURL": "https://bafybeihlkf32k574syahhc74p3fibuvecgtkjqk665gw6tppwa4ihsqgnu.ipfs.thirdwebstorage.com/0",
                        "musicURL": "https://bafybeihlkf32k574syahhc74p3fibuvecgtkjqk665gw6tppwa4ihsqgnu.ipfs.thirdwebstorage.com/1",
                        "nftMintTime": "2023-07-11T15:36:36.997Z",
                        "nftListTime": null,
                        "contractId": 0,
                        "contractAddress": "0x79D9647AD415a532EaCc9607114477Ba7D5589e9",
                        "creatorWalletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                        "tokenStandard": "ERC1155",
                        "labelWallet": "",
                        "isSellable": false,
                        "isRentable": false,
                        "rentPrice": 0,
                        "numberOfRents": 0,
                        "numberOfCurrentRents": 0,
                        "totalRentTime": 0,
                        "userLikes": 0,
                        "usersWhoLiked": [],
                        "usersWhoDisliked": [],
                        "userDislikes": 0,
                        "moderatorPoints": 0,
                        "rankingPoints": 0,
                        "highestRank": 0,
                        "views": 0,
                        "downloads": 0,
                        "genre": 1,
                        "isFlagged": false,
                        "flagDescription": null,
                        "creator": [{
                               "name": "c"
                           }],
                        "downloadable": 1
                    }        
               }   
       }    
    */
  try {
    const { dbId } = req.params as { dbId: string };

    // Check if every needed data is provided in request
    if (Number(dbId) < 0 || !Number.isInteger(Number(dbId)) || Number.isNaN(dbId)) {
      return res.status(400).send("Wrong input data");
    }

    const listing = await getListingByDatabaseId(Number(dbId));
    if (!listing) return res.status(400).send(`there is no listing with database id ${dbId}`);

    //@ts-ignore
    listing.downloadable = false;

    // checking if user is logged ind
    if (req.isAuthenticated()) {
      //@ts-ignore
      const issuer = req?.user?.issuer as string;
      // User nfts bought and rented
      const userNfts = await getUserNftsRentedOrBought(issuer);

      const contractId = await getDatabaseIdByContractId(Number(dbId));

      if (userNfts?.nftOwned.includes(Number(contractId)) || userNfts?.nftRented.includes(Number(contractId))) {
        //@ts-ignore
        listing.downloadable = true;
      }
    }


    res.status(200).send({ listing });

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error = unable to fetch listing");
  }
});

router.get("/by-contract-id/:contractId", async (req, res, next) => {
  /*
    #swagger.tags = ['Open']
    #swagger.description = 'Endpoint to fetch listing by nft id on contract(it is recommended to use contract Id as main id), User dont have to be logged in'
    #swagger.responses[200] = {
               description: 'Expected response body at code 200',
               schema: {
                   "listing": {
                           "id": 983,
                           "name": "piesel",
                           "price": 0,
                           "quantity": 1,
                           "actualQuantity": 0,
                           "tokensInStock": 0,
                           "tokensListed": 0,
                           "availableQuantity": 0,
                           "description": "piesel",
                           "imageURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/0",
                           "musicURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/1",
                           "nftMintTime": "2023-06-30T09:39:53.476Z",
                           "nftListTime": null,
                           "contractId": 2,
                           "contractAddress": "0x659EC433eb6cf86ADb0245085F3861dF8B60EFd9",
                           "creatorWalletAddress": "0x257b9EAC215954863263bED86c65c4e642D00905",
                           "tokenStandard": "ERC1155",
                           "labelWallet": "",
                           "isSellable": false,
                           "isRentable": false,
                           "rentPrice": 0,
                           "numberOfRents": 0,
                           "numberOfCurrentRents": 0,
                           "userLikes": 0,
                           "usersWhoLiked": [],
                           "userDislikes": 0,
                           "moderatorPoints": 0,
                           "rankingPoints": 0,
                           "highestRank": 0,
                           "views": 0,
                           "downloads": 0,
                           "genre": 1,
                           "isFlagged": false,
                           "flagDescription": null,
                           "collections": [],
                           "creator": {
                               "name": "c"
                           }
                   }             
               }   
       }    
    */
  try {
    const { contractId } = req.params as { contractId: string };

    // Check if every needed data is provided in request
    if (Number(contractId) < 0 || !Number.isInteger(Number(contractId)) || Number.isNaN(contractId)) {
      return res.status(400).send("Wrong input data");
    }

    const listing = await getListingByContractId(Number(contractId));

    //@ts-ignore
    listing.downloadable = false;

    // checking if user is logged ind
    if (req.isAuthenticated()) {
      //@ts-ignore
      const issuer = req?.user?.issuer;
      // User nfts bought and rented
      const userNfts = await getUserNftsRentedOrBought(issuer);

      if (userNfts?.nftOwned.includes(Number(contractId)) || userNfts?.nftRented.includes(Number(contractId))) {
        //@ts-ignore
        listing.downloadable = true;
      }
    }

    res.status(200).send({ listing });

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error = unable to fetch listing");
  }
});




router.post("/by-creator-wallet/", async (req, res, next) => {
  /*
       #swagger.tags = ['Open']
       #swagger.description = 'Endpoint to fetch all listings created by user, User dont have to be logged in'
       #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                  schema: {
                      "listing": [
                          {
                              "id": 983,
                              "name": "piesel",
                              "price": 0,
                              "quantity": 1,
                              "actualQuantity": 0,
                              "tokensInStock": 0,
                              "tokensListed": 0,
                              "availableQuantity": 0,
                              "description": "piesel",
                              "imageURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/0",
                              "musicURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmUqHoyJ8SHQ4gjbq7SV2dxim1psnTUEXKCCqW5gCoG7jC/1",
                              "nftMintTime": "2023-06-30T09:39:53.476Z",
                              "nftListTime": null,
                              "contractId": 2,
                              "contractAddress": "0x659EC433eb6cf86ADb0245085F3861dF8B60EFd9",
                              "creatorWalletAddress": "0x257b9EAC215954863263bED86c65c4e642D00905",
                              "tokenStandard": "ERC1155",
                              "labelWallet": "",
                              "isSellable": false,
                              "isRentable": false,
                              "rentPrice": 0,
                              "numberOfRents": 0,
                              "numberOfCurrentRents": 0,
                              "userLikes": 0,
                              "usersWhoLiked": [],
                              "userDislikes": 0,
                              "moderatorPoints": 0,
                              "rankingPoints": 0,
                              "highestRank": 0,
                              "views": 0,
                              "downloads": 0,
                              "genre": 1,
                              "isFlagged": false,
                              "flagDescription": null,
                              "collections": [],
                              "creator": {
                                  "name": "c"
                              }
                          }
                      ]              
                  }   
          }    
       */
  try {
    const { creatorWalletAddress } = req.body as {
      creatorWalletAddress: string;
    };
    const listing = await getListingByCreatorWalletAddress(creatorWalletAddress);
    res.status(200).send({ listing });

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - unable to fetch listing of this user");
  }
});

router.post("/ranking", async (req, res, next) => {
  /*
       #swagger.tags = ['Open']
       #swagger.description = 'Endpoint to fetch listing(of some genre) sorted by ranking points, User dont have to be logged in'
       #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                  schema:{
                    "listings": [
                        {
                            "id": 5374,
                            "name": "very new song",
                            "price": 0,
                            "quantity": 50000,
                            "actualQuantity": 49963,
                            "tokensInStock": 0,
                            "tokensListed": 0,
                            "availableQuantity": 49963,
                            "description": "very nice song created by someone",
                            "imageURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmeQYeVNQpbHRV5d5ZFjNg2khATymAWRtWDqywNAV5AET2/0",
                            "musicURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmeQYeVNQpbHRV5d5ZFjNg2khATymAWRtWDqywNAV5AET2/1",
                            "nftMintTime": "2023-06-30T10:21:08.628Z",
                            "nftListTime": null,
                            "contractId": 1,
                            "contractAddress": "0x659EC433eb6cf86ADb0245085F3861dF8B60EFd9",
                            "creatorWalletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                            "tokenStandard": "ERC1155",
                            "labelWallet": "",
                            "isSellable": false,
                            "isRentable": false,
                            "rentPrice": 0,
                            "numberOfRents": 0,
                            "numberOfCurrentRents": 0,
                            "userLikes": 0,
                            "usersWhoLiked": [],
                            "userDislikes": 0,
                            "moderatorPoints": 0,
                            "rankingPoints": 0,
                            "highestRank": 0,
                            "views": 0,
                            "downloads": 0,
                            "genre": 1,
                            "isFlagged": false,
                            "flagDescription": null,
                            "collections": [],
                            "creator": {
                                "name": "buyer"
                            }
                        }
                    ]
                }
        }
       */
  try {
    const { genreType, amountOfListing } = req.body as {
      genreType: number;
      amountOfListing: number;
    }

    const genreTypeConvert = Number(genreType)
    const amountOfListingConvert = Number(amountOfListing)
    const allGenres = await getAllGenres()

    if (genreTypeConvert !== 0 && !allGenres.includes(genreTypeConvert)) {
      //return res.status(400).send("Invalid genreType. Genre not found.");
      return res.status(200).send([]); // Plaster
    }
    else {
      const listings = await getByGenreAndSortingByRankingPoints(
        genreTypeConvert,
        amountOfListingConvert
      );
      return res.status(200).send({ listings });
    }

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - failed to fetch ranking");
  }
});

router.get("/allRanking/:genreType", async (req, res, next) => {
  /*
       #swagger.tags = ['Open']
       #swagger.description = 'Endpoint to fetch listing sorted by ranking points, User dont have to be logged in'
       #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                  schema:{
                    "listings": [
                        {
                            "id": 5374,
                            "name": "very new song",
                            "price": 0,
                            "quantity": 50000,
                            "actualQuantity": 49963,
                            "tokensInStock": 0,
                            "tokensListed": 0,
                            "availableQuantity": 49963,
                            "description": "very nice song created by someone",
                            "imageURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmeQYeVNQpbHRV5d5ZFjNg2khATymAWRtWDqywNAV5AET2/0",
                            "musicURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmeQYeVNQpbHRV5d5ZFjNg2khATymAWRtWDqywNAV5AET2/1",
                            "nftMintTime": "2023-06-30T10:21:08.628Z",
                            "nftListTime": null,
                            "contractId": 1,
                            "contractAddress": "0x659EC433eb6cf86ADb0245085F3861dF8B60EFd9",
                            "creatorWalletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                            "tokenStandard": "ERC1155",
                            "labelWallet": "",
                            "isSellable": false,
                            "isRentable": false,
                            "rentPrice": 0,
                            "numberOfRents": 0,
                            "numberOfCurrentRents": 0,
                            "userLikes": 0,
                            "usersWhoLiked": [],
                            "userDislikes": 0,
                            "moderatorPoints": 0,
                            "rankingPoints": 0,
                            "highestRank": 0,
                            "views": 0,
                            "downloads": 0,
                            "genre": 1,
                            "isFlagged": false,
                            "flagDescription": null,
                            "collections": [],
                            "creator": {
                                "name": "buyer"
                            }
                        }
                    ]
                }
        }
       */
  try {
    const { genreType } = req.params as {
      genreType: string;

    }
    const genreTypeConvert = Number(genreType)
    const allGenres = await getAllGenres()

    if (genreTypeConvert !== 0 && !allGenres.includes(genreTypeConvert)) {
      return res.status(400).send("Invalid genreType. Genre not found.");
    }
    if (genreTypeConvert === 0) {
      const allListings = await getAllListingsAndSortingByRankingPoints();
      return res.status(200).send({ allListings });
    }
    //@ts-ignore
  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - failed to fetch ranking");
  }
});

//* Endpoint to let admin see all flagged listings
router.get("/flag", checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res) => {
  /*  
 #swagger.tags = ['SuperAdmin']
 #swagger.description = 'Endpoint to get all linting which were flagged by moderators, pages are counted from 0'
 #swagger.responses[200] = {  description: 'Successfully fetched flagged nfts',
                              schema:{
                                  "listings": [
                                      {
                                        "contractId": 1,
                                        "name": "very new song",
                                        "creatorWalletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                                        "creator": {
                                            "name": "buyer"
                                        },
                                        "description": "very nice song created by someone",
                                        "genre": 1,
                                        "imageURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmeQYeVNQpbHRV5d5ZFjNg2khATymAWRtWDqywNAV5AET2/0",
                                        "musicURL": "https://ipfs-2.thirdwebcdn.com/ipfs/QmeQYeVNQpbHRV5d5ZFjNg2khATymAWRtWDqywNAV5AET2/1",
                                        "labelWallet": "",
                                        "flagDescription": "spam"
                                        },
                                    ]
                              }   
  }
   */
  try {
    const { pageNumber, pageSize } = req.query as {
      pageNumber: string,
      pageSize: string
    }

    // Check if every needed data is provided in request
    if (Number(pageNumber) < 0 || Number(pageSize) < 0 || !Number.isInteger(Number(pageNumber)) || !Number.isInteger(Number(pageSize))) {
      return res.status(400).send("Wrong input data");
    }

    console.log("Page number ", pageNumber);
    console.log("Page size", pageSize);

    const skip = Number(pageNumber) * Number(pageSize);
    const take = Number(pageSize)

    console.log("Skip: ", skip);
    console.log("take: ", take)

    const listings = await getFlaggedNfts(skip, take);

    if (listings.length <= 0) return res.status(204).send();

    return res.status(200).send({ listings });

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - failed to fetch all flagged NFTs");
  }
})

// ==========DELETE==========
router.delete("/cancelDirectListing/:contractId", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
  /*  
  #swagger.tags = ['User', 'Label']
  #swagger.description = 'Endpoint to delete listing - nft is not sellable and rentable any more'
  #swagger.responses[200] = { description: 'Successfully deleted listing number xx'}
    */
  try {
    const { contractId } = req.params as {
      contractId: string;
    };
    if (Number.isNaN(contractId) || !Number.isInteger(Number(contractId)) || Number(contractId) < 0) {
      return res.status(400).send("Id must be a positive integer.");
    }

    // Check if listing was touched 
    const checkTouched = await checkIfTouched(Number(contractId));
    if (!checkTouched) return res.status(400).send("Unable to delete listing - NFT already occupied");

    //@ts-ignore
    const issuer = req?.user?.issuer

    const creator = await getCreatorByContractId(Number(contractId));
    if (!creator) return res.status(400).send("There is no listing with id" + contractId);

    const issuerWalletAddress = await getWalletAddressByIssuer(issuer);

    if (creator !== issuerWalletAddress) {
      return res.status(400).send("You must be creator");
    } else {
      const listing = await deleteDirectListingById((Number(contractId)));
      return res.status(200).send("Successfully deleted listing number " + contractId);
    }

  } catch (error) {
    console.log("ERROR: ", error)
    return res.status(500).send("Error - failed to delete listing");
  }
});


export { router };

/**
 * @swagger
 * /listing:
 *   get:
 *     tags:
 *      - listing
 *     responses:
 *       200:
 *         description: Create user session
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
