import { getAllCollections, getCollectionById } from "../db/db-collection";
import { getListingByContractIdToCollection,getNftIdFromDbByCollectionId } from "../db/db-listing";
import { getNftsFromCollectionById, getCreatorWalletAddressOfCollection } from "../db/db-collection";
import { getCreatorNameAndWebsiteOfCollection } from "../db/db";

export async function returnAllCollections() {
  const collections = await getAllCollections();
  return collections;
}

export async function getCollection(
  collectionId: number,
) {
  try {
    const walletAddress = await getCreatorWalletAddressOfCollection(collectionId)
  const collection = await getCollectionById(collectionId);
  const user = await getCreatorNameAndWebsiteOfCollection(String(walletAddress))
  const nfts = await getNftsFromCollectionById(collectionId) as number[]
  console.log("NFTS", nfts)
  const result = {
    collection: collection,
    creator: user,
    nfts: []
  }

  console.log("Result", result);
  for (const element of nfts) {
    console.log("Element of array:", element);
    const listing = await getListingByContractIdToCollection(element);
    //@ts-ignore
    result.nfts.push(listing)
  }
  return result;
  }catch (error) {
    console.error(error);
    return false
  }
  
}
//getCollection( 1, /* 6, */ "0xA568Da33444F6591dc533b9049f5a44e77E2D07b").then((collection) => console.log("Collection", collection))
