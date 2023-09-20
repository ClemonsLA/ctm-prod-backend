import { PrismaClient, users } from '@prisma/client'
import express, { Request, Response, NextFunction } from "express"
import { Magic } from "@magic-sdk/admin";
import passport, { use } from "passport"
import initializePassport from "../services/passport-config";
import { StrategyOptionsWithReq } from "passport-magic";
import { checkAuthenticated, checkRole } from "../middleware/auth-middleware"
import bodyParser from "body-parser";

import { changeUserRole, createUser, deleteUserByName, getUserByName, getUserRevenue, updateUserProfil, getBannedUsers } from "../db/db";
import { checkEmailUniqueness, checkIssuerUniqueness, checkNameUniqueness, checkWalletUniqueness, deleteUserRecords, disconnectListingRelationFromUser, isUserInDb, userByWalletAddress } from "../services/user-services";

import { stringify } from 'querystring';
import { UserRole } from '../models/users';
import { status } from '../models/check';

const magic = new Magic(process.env.MAGIC_SECRET_KEY);

const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's  

initializePassport(passport);

const router = express.Router();

// =========Routs=========

router.get('/by-wallet-address/:walletAddress', async function (req, res, next) {
    /*  
   #swagger.tags = ['Open']
   #swagger.description = 'Endpoint to fetch user basic information\'s, User don\'t have to be logged in'
  */ //TODO: write responses 
    /*
      #swagger.responses[200] = {
                 description: 'Expected response body at code 200',
         }          
     */
    try {
        const walletAddress = req.params.walletAddress;
        const user: users | null = await userByWalletAddress(walletAddress)
        if (user !== null) {
            res.status(200).send(user)

        } else {
            return res.status(403).send("User does not exist");
        }
    } catch (e) {
        return res.status(500).send("Error - failed to fetch user");
    }
})

router.get("/revenue", checkAuthenticated, checkRole(["User", "Label"]), async (req, res, next) => {
    /*
     #swagger.tags = ['User', 'Label']
     #swagger.description = 'Endpoint to fetch user revenue information, User have to be logged in'
     #swagger.responses[200] = {
                  description: 'Expected response body at code 200',
                    schema: {
                        "revenue": [
                            {
                                "id": 1,
                                "issuer": "did:ethr:0xD763016000cF8CA9594aEA52c351b30235A016F9",
                                "month": 5,
                                "year": 2023,
                                "rentRevenue": 0,
                                "sellRevenue": 0,
                                "totalRevenue": 0,
                                "amountRented": 0,
                                "amountSold": 4
                            },
                            {
                                "id": 5,
                                "issuer": "did:ethr:0xD763016000cF8CA9594aEA52c351b30235A016F9",
                                "month": 6,
                                "year": 2023,
                                "rentRevenue": 0,
                                "sellRevenue": 0,
                                "totalRevenue": 0,
                                "amountRented": 1,
                                "amountSold": 0
                            },
                            {
                                "id": 6,
                                "issuer": "did:ethr:0xD763016000cF8CA9594aEA52c351b30235A016F9",
                                "month": 7,
                                "year": 2023,
                                "rentRevenue": 0,
                                "sellRevenue": 0,
                                "totalRevenue": 0,
                                "amountRented": 3,
                                "amountSold": 0
                            }
                        ]
                    }
          }          
      */
    try {

        //@ts-ignore
        const issuer = req?.user?.issuer
        const revenue = (await getUserRevenue(issuer)) as status;
        // checking if collection was successfully created
        if (!revenue?.status) throw new Error("Unable to fetch user revenue: \n" + revenue);

        return res.status(200).send(revenue?.data)


    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - Failed to fetch user revenue");
    }
})

//POST
router.post('/login', function (req, res, next) {
    /*
#swagger.tags = ['User', 'Moderator', 'SuperAdmin', 'Label']
#swagger.description = 'to login provide DID token in bearer'

 #swagger.security = [{
               "bearerAuth": []
}] 

 #swagger.responses[200] = {
                    description: 'Expected response body at code 200',
                    schema: {
                        message: 'success',                    
                        success: 'true'                     
                    }
            }        
           
  */
    try {
        //@ts-ignore
        passport.authenticate('magic', function (err, user, info) {
            if (err) return res.status(500).send(info?.message);
            if (!user) return res.status(400).json({
                message: "Unauthorized - " + info?.message,
                success: false
            });
            req.logIn(user, function (err) {
                if (err) return res.status(500).send(err)
                return req.session.save(() => {
                    console.log('session saved')
                    res.status(200).json({
                        message: "success",
                        success: true
                    })
                });
            });
        })(req, res, next);
    } catch (err) {
        console.error(err);
        res.status(500).send({ err });

    };

})

router.post('/logout', checkAuthenticated, async (req, res, next) => {
    /*
     #swagger.tags = ['User', 'Moderator', 'SuperAdmin', 'Label']
     #swagger.description = 'Endpoint to fetch user basic information\'s, User don\'t have to be logged in'
     #swagger.responses[200] = {
                   description: 'Expected response body at code 200',
           }          
       */
    try {
        //@ts-ignore
        await magic.users.logoutByIssuer(req?.user?.issuer);
        req.logout(function (err) {
            if (err) { return next(err); }

        });
        return res.status(200).end();

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("failed to log out");
    }
});



router.post(`/signup`, async (req, res, next) => {
    /*
     #swagger.tags = ['Open']
     #swagger.description = 'Endpoint to sign up the user. Important to ask the user to allowForAll after successful sign up to allow us to manage there nfts'
     #swagger.responses[200] = {
                    description: 'Expected response body at code 200',
                    schema: {
                            "id": 3,
                            "issuer": "did:ethr:0xfE19C0cfC1a48DE132f29ae34464595c66Ae4736",
                            "name": "c2",
                            "description": "c2",
                            "tag": 1,
                            "walletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                            "walletType": "c",
                            "coins": 0,
                            "role": 0,
                            "email": "c2",
                            "whenSignedUp": "2023-06-28T13:17:29.667Z",
                            "lastLoginAt": 1688140034,
                            "nftOwned": [],
                            "nftRented": [],
                            "website": "adfs"
                    }
            }        
    */
    try {
        const { issuer, name, description, tag, walletAddress, walletType, email, website } = req.body as {
            issuer: string,
            name: string,
            description: string,
            tag: number,
            walletAddress: string,
            walletType: string,
            email: string,
            website: string,

        };

        if (!issuer || !name || !description || !tag || !walletAddress || !walletType || !email || !website) {
            return res.status(403).send("Missing data in request");
        }
        if (req.isAuthenticated()) {
            return res.status(403).send("User already logged in")
        }
        let errorMessage = "";
        const thisUser: users | null = await isUserInDb(walletAddress, issuer, email);

        if (!(await checkEmailUniqueness(email))) {
            errorMessage += "User with this email is already exist, ";
        }
        if (!(await checkNameUniqueness(name))) {
            errorMessage += "User with this name is already exist, ";
        }
        if (!(await checkWalletUniqueness(walletAddress))) {
            errorMessage += "User with this wallet address is already exist, ";
        }
        if (!(await checkIssuerUniqueness(issuer))) {
            errorMessage += "User with this issuer is already exist ";
        }
        if (walletAddress.length != 42) {
            return res.status(400).send("Wallet address length must be 42")
        }
        console.log('thisUser', thisUser)
        if (thisUser !== null) {
            return res.status(200).send(thisUser)
        } else {
            if (errorMessage !== "") return res.status(403).send(errorMessage);
            else {
                const newUser = await createUser(issuer, name, description, tag, walletAddress, walletType, email, "")
                return res.status(200).send(newUser)
            }
        }

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to sign up");
    }
});

//PUT
router.put('/blacklist/:name', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /* 
     #swagger.tags = ['SuperAdmin']
      #swagger.description = 'Endpoint to add user to Blacklist'
      #swagger.responses[200] = {
                     description: 'Expected response body at code 200',
                     schema: {
                             "id": 3,
                             "issuer": "did:ethr:0xfE19C0cfC1a48DE132f29ae34464595c66Ae4736",
                             "name": "c2",
                             "description": "c2",
                             "tag": 1,
                             "walletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                             "walletType": "c",
                             "coins": 0,
                             "role": 0,
                             "email": "c2",
                             "whenSignedUp": "2023-06-28T13:17:29.667Z",
                             "lastLoginAt": 1688140034,
                             "nftOwned": [],
                             "nftRented": [],
                             "website": "adfs"
                     }
             }     
     */
    try {
        const name = req.params.name;
        const checkUser = await getUserByName(name);
        console.log(checkUser)
        if (!checkUser) {
            return res.status(403).send("there is no user with such name")
        } else {
            const user = await changeUserRole(name, UserRole.Blacklist);
            return res.status(200).send(user);
        }

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to blacklist the user");
    }
})

router.delete('/blacklist/:name', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /* 
     #swagger.tags = ['SuperAdmin']
      #swagger.description = 'Endpoint to delete user from Blacklist'
      #swagger.responses[200] = {
                     description: 'Expected response body at code 200',
                     schema: {
                             "id": 3,
                             "issuer": "did:ethr:0xfE19C0cfC1a48DE132f29ae34464595c66Ae4736",
                             "name": "c2",
                             "description": "c2",
                             "tag": 1,
                             "walletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                             "walletType": "c",
                             "coins": 0,
                             "role": 0,
                             "email": "c2",
                             "whenSignedUp": "2023-06-28T13:17:29.667Z",
                             "lastLoginAt": 1688140034,
                             "nftOwned": [],
                             "nftRented": [],
                             "website": "adfs"
                     }
             }     
     */
    try {
        const name = req.params.name;
        const checkUser = await getUserByName(name);
        console.log(checkUser)
        if (!checkUser) {
            return res.status(403).send("there is no user with such name")
        } else {
            const user = await changeUserRole(name, UserRole.User);
            return res.status(200).send(user);
        }

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to delete user from the blacklist");
    }
})

router.put('/change-role', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /* 
     #swagger.tags = ['SuperAdmin']
      #swagger.description = 'Endpoint to add user to Blacklist'
      #swagger.responses[200] = {
                     description: 'Successfully changed role of XXX to XXX' }     
     */
    try {
        const { name, role } = req.query as {
            name: string,
            role: string
        };

        // Check if every needed data is provided in request
        if (Number(role) < 0 || !Number.isInteger(Number(role)) || Number.isNaN(role) || Number.isNaN(name)) {
            return res.status(400).send("Wrong input data");
        }
        const checkUser = await getUserByName(name);
        console.log(checkUser)
        if (!checkUser) {
            return res.status(403).send("there is no user with such name")
        } else {
            // Check if user is blacklisted
            if (checkUser.role === UserRole.Blacklist) return res.status(400).send("User is blacklisted");

            // Check if role exist
            if (!UserRole[Number(role)]) return res.status(400).send("Role don't exist");

            switch (Number(role)) {
                case UserRole.SuperAdmin:
                    return res.status(400).send("You can't change role to Super Admin");
                case UserRole.Blacklist:
                    return res.status(400).send("Wrong endpoint for this");
            }

            const user = await changeUserRole(name, Number(role));
            return res.status(200).send(`Successfully changed role of ${name} to ${UserRole[Number(role)]}`);
        }

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to blacklist the user");
    }
})


router.get('/banned-users', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    try {
        const role = 4
        const bannedUsers = await getBannedUsers(role)

        if (bannedUsers.length === 0) {
            return res.status(200).send([]);
        } else {
            return res.status(200).json(bannedUsers);
        }

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to get banned users");
    }
})



router.put('/update', checkAuthenticated, checkRole(["User", "Moderator", "SuperAdmin", "Label"]), async (req, res, next) => {
    /*
    #swagger.tags = ['User', 'Moderator', 'SuperAdmin', 'Label']
    #swagger.description = 'Endpoint to update user profile'
   #swagger.responses[200] = {
                     description: 'Expected response body at code 200',
                     schema: {
                             "id": 3,
                             "issuer": "did:ethr:0xfE19C0cfC1a48DE132f29ae34464595c66Ae4736",
                             "name": "c2",
                             "description": "c2",
                             "tag": 1,
                             "walletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                             "walletType": "c",
                             "coins": 0,
                             "role": 0,
                             "email": "c2",
                             "whenSignedUp": "2023-06-28T13:17:29.667Z",
                             "lastLoginAt": 1688140034,
                             "nftOwned": [],
                             "nftRented": [],
                             "website": "adfs"
                     }
             } 
    */
    try {
        //@ts-ignore
        const issuer = req?.user?.issuer

        const { newName, newDescription, newTag, newWebsite } = req.body as {

            newName: string,
            newDescription: string,
            newTag: number,
            newWebsite: string
        };

        const user = await updateUserProfil(issuer, newName, newDescription, newTag, newWebsite)
        return res.status(200).send("Success")
        //@ts-ignore
    } catch ({ error, message }) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to update user profile");
    }

})


//DELETE
router.delete('/:name', checkAuthenticated, checkRole(["SuperAdmin"]), async (req, res, next) => {
    /*
    #swagger.tags = [ 'SuperAdmin']
    #swagger.description = 'Endpoint to delete user'
   #swagger.responses[200] = {
                     description: 'Expected response body at code 200',
                     schema: {
                             "id": 3,
                             "issuer": "did:ethr:0xfE19C0cfC1a48DE132f29ae34464595c66Ae4736",
                             "name": "c2",
                             "description": "c2",
                             "tag": 1,
                             "walletAddress": "0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C",
                             "walletType": "c",
                             "coins": 0,
                             "role": 0,
                             "email": "c2",
                             "whenSignedUp": "2023-06-28T13:17:29.667Z",
                             "lastLoginAt": 1688140034,
                             "nftOwned": [],
                             "nftRented": [],
                             "website": "adfs"
                     }
             } 
    */
    try {
        const name = req.params.name;
        const checkUser = getUserByName(name);
        if (!checkUser) {
            return res.status(403).send("there is no user with such name")
        } else {
            // Deleting listing references
            await disconnectListingRelationFromUser(name);

            // Deleting users revenues
            await deleteUserRecords(name);

            const user = deleteUserByName(name);
            return res.status(200).send(user)
        }

    } catch (error) {
        console.log("ERROR: ", error)
        return res.status(500).send("Error - failed to delete user");
    }

})

export { router }



/**
 * @swagger
 * /user:
 *   get:
 *     tags:
 *      - users
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The user ID.
 *                         example: 0
 *                       name:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 *                       tokens:
 *                         type: integer
 *                         description: User-owner coins
 *                         example: 25
 * /user/{userId}:
 *   get:
 *     tags:
 *      - users
 *     parameters:
 *      - in: path
 *        name: userId
 *        schema: 
 *         type: integer
 *        required: true
 *        description: Numeric ID of the user to get.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The user ID.
 *                         example: 0
 *                       name:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 *                       tokens:
 *                         type: integer
 *                         description: User-owner coins
 *                         example: 25
 */