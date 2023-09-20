import { Magic } from "@magic-sdk/admin";
import { PassportStatic, use } from "passport"
import { DoneFunc, Strategy as MagicStrategy, MagicUser } from 'passport-magic';
import { PrismaClient, users } from '@prisma/client'
import { log } from "console";




const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's  

export default function initializePassport(passport: PassportStatic) {
    try {

        // ==========LogIn Logic==========
        const login = async (user: MagicUser, done: DoneFunc) => {

            // Replay attack protection 
            const dbUser = await prisma.users.findUnique({ // take user from database
                where: {
                    issuer: user.issuer
                }
            }) as users;

            // Update user last login time in database
            await prisma.users.update({
                where: {
                    issuer: user.issuer
                },
                data: {
                    lastLoginAt: user.claim.iat
                }
            });

            return done(null, user);

        };

        // ==========Strategy Logic==========
        const strategy = new MagicStrategy(async function (user, done) {
            try {
                // check if user has already signed up
            const existingUser = await prisma.users.findUnique({ // take user from data base
                where: {
                    issuer: user.issuer
                }
            });

            if (!existingUser) {
                /* user doesn't exist */
                return done(null, false, { message: 'user not found' })
            } else {
                /* Login user */
                return login(user, done);
            }
            } catch (err) {
                console.log("error Strategy Logic\n", err);
                done(err, null);
            }
            

        });

        // initialize strategy
        passport.use(strategy);

        //saves the user's login data in the session
        passport.serializeUser((user, done) => {
            try {
                console.log("in serialize. user: ", user);
            //@ts-ignore
            console.log("user.issuer in serialization ", user.issuer)
            //@ts-ignore
            done(null, user.issuer);
            } catch (err) {
                console.log("error serialized. ", err);
                done(err, null);
            }
            

        });

        //get the user's login information from the session
        passport.deserializeUser(async (id, done) => {
            try {
                const user = await prisma.users.findUnique({
                    where: {
                        issuer: String(id)
                    }
                }) as users;
                console.log("in deserialize. user: ", id);
                return done(null, user);

            } catch (err) {
                console.log("error deserialize. user: ", id, err);
                done(err, null);
            }
        });


    } catch (error) {
        return error
    }

}