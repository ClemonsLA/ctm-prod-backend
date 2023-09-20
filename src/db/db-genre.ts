import { PrismaClient} from '@prisma/client'


const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's  

export async function addAllGenreToDb() {
  
    const genreList = ["Rap", "EDM", "Tech House", "House", "Techno", "Melodic Techno", "Drum and Bass", "Future Bass",
      "Dubstep", "Trance", "Trap", "Garage", "Nu Disco", "Rock", "Alternative", "Heavy Metal", "Grunge", "Blues", "Punk",
      "Progressive", "Hip-Hop", "Trap-music", "Hip-Hop beat producer", "R&B", "Pop", "Dance-Pop", "K-Pop", "J-Pop", "Vocals",
      "Singers", "Rappers"];

    for (const genre of genreList) {
      try{

      
      console.log("GENREE", genreList.indexOf(genre) )
      const newGenre = await prisma.genre.create({
        data: {
          id : genreList.indexOf(genre),
          genre: genre
        },
      });
    }catch(error){{
      console.log(error)
      }
    }

  } 
}
export async function checkIfGenreExist(genreId: number) {
  try {
    const genre = await prisma.genre.findUnique({
      where: {
        id: genreId
      }
    })

    if (!!genre) return true;
    return false;

  } catch (error) {
    console.error(error);
    throw new Error("Error - failed to check if  genre exist");
  }
}

if (process.env.MODE === "TEST") {
  addAllGenreToDb()
}

