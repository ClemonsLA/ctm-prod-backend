import { PrismaClient, listing } from "@prisma/client";
import { config } from "dotenv";
import { delayFunction } from "../services/rent-services";


config();

const prisma = new PrismaClient({ log: ["query"] });


// Important : combining `take` and `skip` in prisma will result in pagination

// ===========GET=========== 
export async function getAllListings() {
  try {
    const listings = await prisma.listing.findMany({
      include: {
        creator: {
          select: {
            name: true
          }
        },
        collections: {
          select: {
            id: true
          }
        }
      },

    });
    console.log(listings)
    return listings
  } catch (error) {
    return error;
  }

}

export async function getListingByDatabaseId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        id: id
      },
      include: {
        creator: {
          select: {
            name: true
          }
        },
      },

    });

    return listing
  } catch (error) {
    throw new Error("Error failed to get listing by database id")
  }
}



export async function getListingByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      },
      include: {
        creator: {
          select: {
            name: true
          }
        },
      },
    });

    return listing;
  } catch (error) {
    return error;
  }
}

//getListingByContractId(6).then((abc) => console.log("AB",abc))


export async function getListingByContractIdToCollection(idFromContract: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: idFromContract
      },
      select: {
        contractId: true,
        id: true,
        name: true,
        price: true,
        genre: true,
        imageURL: true,
        musicURL: true,
        creator: {
          select: {
            name: true
          }
        },
      }
    });
    return listing;
  } catch (error) {
    return error;
  }
}
//console.log("Collection Listing : ",getListingByContractIdToCollection(6) )  



export async function getListingByCreatorWalletAddress(creatorWalletAddress: string) {
  try {
    const listings = await prisma.listing.findMany({
      where: {
        creatorWalletAddress: creatorWalletAddress
      },
      include: {
        creator: {
          select: {
            name: true
          }
        },
      },

    })
    console.log(creatorWalletAddress)
    console.log(listings)
    return listings;
  } catch (error) {
    return error;
  }
}
export async function getPriceByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      },

    });
    return listing?.price;
  } catch (error) {
    return error;
  }
}

export async function getRentPriceByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      },

    });
    return listing?.rentPrice;
  } catch (error) {
    return error;
  }
}

  export async function getByGenreAndSortingByRankingPoints(genre: number, amountOfListing: number) {
  try {

    const walletAddress = await prisma.listing.findMany({
      where: {
        genre: genre
      },
      select: {
        creatorWalletAddress : true
      }
    })

    const listings = await prisma.listing.findMany({
      where: {
        genre: genre
      },
      orderBy: {
        rankingPoints: 'desc'
      },
      take: amountOfListing,
      include: {
        creator: {
          select: {
            name: true
          }
        },
      },
    });

    return listings;
  } catch (error) {
    return error;
  }
}  



export async function getAllListingsAndSortingByRankingPoints() {
  try {
    const listings = await prisma.listing.findMany({
      orderBy: {
        rankingPoints: 'desc'
      },
      include: {
        creator: {
          select: {
            name: true
          }
        },
      },
    });

    return listings;
  } catch (error) {
    return error;
  }
}

export async function getAllGenres() {
  try {
    const genres = await prisma.listing.findMany({
      distinct: ["genre"],
      select: {
        genre: true,
      },
    });

    const genreList = genres.map((listing) => listing.genre);

    return genreList;
  } catch (error) {
    console.error("Error retrieving genres:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}





export async function getTokenListedByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      },

    });
    return listing?.tokensListed;
  } catch (error) {
    return error;
  }
}
export async function getTokenInStockByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      },

    });
    return listing?.tokensInStock;
  } catch (error) {
    return error;
  }
}
export async function getCreatorByContractId(id: number): Promise<string | undefined> {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }

    });
    return listing?.creatorWalletAddress;
  } catch (error) {
    throw new Error("Error - failed to get creator of nft")
  }
}



export async function getQuantityByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }

    });
    return listing?.quantity;
  } catch (error) {
    return error;
  }
}

export async function getActualQuantityByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }

    });
    return listing?.actualQuantity;
  } catch (error) {
    return error;
  }
}
export async function getAvailableQuantityByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }

    });
    return listing?.availableQuantity
  } catch (error) {
    return error;
  }
}



export async function getCreatorByNftId(contractId: number): Promise<string | undefined> {
  try {
    const creator = (await prisma.listing.findUnique({
      where: {
        contractId: contractId
      }
    }))?.creatorWalletAddress;
    return creator;
  } catch (error) {
    console.error(error);
    throw new Error("Unable to get creator by contract id");
  }
}

export async function getFlaggedNfts(skip: number, take: number) {
  try {
    const listings = await prisma.listing.findMany({
      skip: skip,
      take: take,
      where: {
        isFlagged: true
      },
      select: {
        contractId: true,
        name: true,
        description: true,
        genre: true,
        imageURL: true,
        musicURL: true,
        labelWallet: true,
        flagDescription: true,
        creatorWalletAddress: true,
        creator: {
          select: {
            name: true
          }
        },
      }

    })
    return listings
  } catch (error) {
    console.error("ERROR: \n", error);
    throw new Error("Unable to get flagged NFTs");
  }
}

export async function getDatabaseIdByContractId(databaseId: number) {
  const contractId = await prisma.listing.findUnique({
    where: {
      id: databaseId
    },
    select: {
      contractId: true
    }
  });

  return contractId?.contractId;
}

// ===========CHECK===========
export async function checkIfTouched(contractId: number): Promise<boolean> {
  const listing = await prisma.listing.findUnique({
    where: {
      contractId: contractId
    },
    select: {
      actualQuantity: true,
      quantity: true,
      numberOfCurrentRents: true,
      collections: true
    }
  })

  if (!listing) return false;

  // checking if nft was already sold
  if (listing?.actualQuantity !== listing?.quantity) {
    return false;
  }
  // checking if nft is currently rented
  if (listing?.numberOfCurrentRents > 0) {
    return false;
  }
  // checking if nft in collection
  if (listing.collections.length > 0) {
    return false;
  }
  // if ok then nft is possible to be deleted 
  return true;
}


export async function checkIfLiked(contractId: number, issuer: string) {
  try {

    const users = (await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      }
    })
    )?.usersWhoLiked as string[];

    if (users.includes(issuer)) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    console.error(error);
    throw new Error("Unable to check user");
  }
}

export async function checkIfLikedOrDisliked(contractId: number, issuer: string): Promise<number> {
  try {
    const users = await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      },
      select: {
        usersWhoDisliked: true,
        usersWhoLiked: true
      }
    });

    if (users === null) return 0;

    switch (true) {//@ts-ignore
      case users.usersWhoLiked.includes(issuer):
        return 1;//@ts-ignore
      case users.usersWhoDisliked.includes(issuer):
        return -1;
      default:
        return 0
    }

  } catch (error) {
    console.error(error);
    throw new Error("Unable to check user");
  }
}

export async function checkIfDisliked(contractId: number, issuer: string) {
  try {

    const users = (await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      }
    })
    )?.usersWhoDisliked as string[];

    if (users.includes(issuer)) {
      return true;
    } else {
      return false;
    }

  } catch (error) {
    console.error(error);
    throw new Error("Unable to check if dislike");
  }
}

export async function getRentableByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }
    });

    return listing?.isRentable;
  } catch (error) {
    return error;
  }
}
export async function getSellableByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }
    });

    return listing?.isSellable;
  } catch (error) {
    return error;
  }
}
export async function getTotalRentTimeByContractId(id: number) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: id
      }
    });

    return listing?.totalRentTime;
  } catch (error) {
    return error;
  }
}


export async function checkIfNftExist(contractId: number) {
  try {
    const nft = await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      }
    })

    if (!nft) return false;
    else return true;

  } catch (error) {
    return error;
  }
}
export async function checkIfNftsExistInArray(nftIds: number[]) {
  try {
    const nfts = await prisma.listing.findMany({
      where: {
        contractId: {
          in: nftIds
        }
      }
    });

    const existingNftIds = nfts.map((nft) => nft.contractId);
    const missingNftIds = nftIds.filter((nftId) => !existingNftIds.includes(nftId));

    if (missingNftIds.length === 0) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
    return error;
  }
}


// ===========PUT===========
export async function newListing(
  idFromContract: number,
  newPrice: number,
  newRentPrice: number,
  amount: number,

) {
  try {
    const newListing = await prisma.listing.update({
      where: {
        contractId: idFromContract,
      },
      data: {
        price: newPrice,
        rentPrice: newRentPrice,
        tokensListed: { increment: amount },
        tokensInStock: { increment: amount },
        isSellable: true,
        isRentable: true,
        availableQuantity: { decrement: amount }
      },
    });
    return newListing;
  } catch (error) {
    console.log(error);
    throw new Error("Unable to create new listing")
  }
}

export async function giveLike(contractId: number, issuer: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      },
    });
    if ((await checkIfDisliked(contractId, issuer)) === true) {
      console.log("IF DISLIKE === TRUE", (await checkIfDisliked(contractId, issuer)))
      await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          userDislikes: {
            decrement: 1,
          },
          rankingPoints: {
            increment: 2
          },
          userLikes: {
            increment: 1,
          },
        },
      });
    }
    if ((await checkIfDisliked(contractId, issuer)) === false) {
      console.log("IF DISLIKE === FALSE", (await checkIfDisliked(contractId, issuer)))
      await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          userLikes: {
            increment: 1,
          },
          rankingPoints: {
            increment: 1,
          },
        }
      })
    }



  } catch (error) {
    return error;
  }
}
export async function giveDislike(contractId: number, issuer: string): Promise<void> {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      },
    });

    if ((await checkIfLiked(contractId, issuer)) === true) {

      await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          userLikes: {
            decrement: 1,
          },
          rankingPoints: {
            decrement: 2
          },
          userDislikes: {
            increment: 1,
          },
        },
      });
    }
    if ((await checkIfLiked(contractId, issuer)) === false) {

      const listing = await getListingByContractId(contractId)

      const giveDislikeee = await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          userDislikes: {
            increment: 1,
          },
          rankingPoints: {
            decrement: 1,
          },
        },
      });
      console.log("Give dislike consoleLOG", giveDislikeee)
    }
    console.log("Listing afgert dislike", listing)
  } catch (error) {
    throw error;
  }
}

export async function giveModeratorPoints(contractId: number, numberOfPoints: number) {
  try {

    await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        moderatorPoints: {
          increment: numberOfPoints,
        },
        rankingPoints: {
          increment: numberOfPoints,
        }
      }
    })


  } catch (error) {
    return error;
  }
}

export async function addNftDownloads(contractId: number) {
  try {
    await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        downloads: {
          increment: 1
        }
      }
    })
  } catch (error) {
    return error;
  }
}
export async function getNftIdFromDbByCollectionId(collectionId: number) {
  try {
      const nft = await prisma.listing.findUnique({
          where: {
              id: collectionId
          }
      })
      return nft?.id


  } catch (error) {
      console.log(error)
      return error;
  }
}


export async function flagNft(contractId: number, description: string) {
  try {
    await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        isFlagged: true,
        description: description,
      }
    });

  } catch (error) {
    return error
  }
}

export async function unFlagNft(contractId: number) {
  try {
    await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        isFlagged: false,
        description: "",
      }
    });

  } catch (error) {
    return error
  }
}

export async function addUserWhoLiked(contractId: number, issuer: string) {
  try {
    const listing = await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      },
    });

    if (listing?.usersWhoDisliked.includes(issuer)) {
      const updatedListing = await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          usersWhoDisliked: {
            set: listing.usersWhoLiked.filter(user => user !== issuer)
          },
          usersWhoLiked: {
            push: issuer
          }
        }

      })
      return updatedListing;
    }
    const updatedListing = await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        usersWhoLiked: {
          push: issuer
        }
      }
    })
    return updatedListing;
  } catch (error) {
    return error;
  }
}
export async function addUserWhoDisliked(contractId: number, issuer: string) {
  try {

    const listing = await prisma.listing.findUnique({
      where: {
        contractId: contractId,
      },
    });

    if (listing?.usersWhoLiked.includes(issuer)) {
      const updatedListing = await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          usersWhoLiked: {
            set: listing.usersWhoLiked.filter(user => user !== issuer),
          },
          usersWhoDisliked: {
            push: issuer
          },
        }
      })
      return updatedListing;
    }
    const updatedListing = await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        usersWhoDisliked: {
          push: issuer
        }
      }
    })
    return updatedListing;

  } catch (error) {
    return error;
  }

}

export async function addRent(contractId: number, expiry: number, quantityRented: number) {
  try {

    const rent = await prisma.listing.update({
      where: {
        contractId: contractId,
      },
      data: {
        numberOfRents: {
          increment: quantityRented,
        },
        numberOfCurrentRents: {
          increment: quantityRented
        }
      }
    });

    delayFunction(async () => {
      console.log("delete rent")
      await prisma.listing.update({
        where: {
          contractId: contractId,
        },
        data: {
          numberOfCurrentRents: {
            decrement: quantityRented
          }
        }
      });

    }, expiry);

    return rent
  } catch (error) {
    return error;
  }

}

// ===========DELETE===========
export async function deleteDirectListingById(id: number) {
  try {
    const directListing = await prisma.listing.delete({
      where: {
        contractId: id,
      },
    });
    console.log(directListing);
  } catch (error) {
    console.error(error)
    throw new Error("Unable to delete coin.")
  }

}





