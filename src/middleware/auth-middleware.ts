import { NextFunction, Request, Response } from "express";
import { PrismaClient, users } from '@prisma/client'
import { UserRole } from "../models/users"



const prisma = new PrismaClient({ log: ["query"] }); // log: ["query"] log in console SQL query's

// =========Middleware=========


export function checkAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
        console.log(req.user)
        if (req.isAuthenticated()) {
            return next();
        }
        // #swagger.responses[401] = { description: 'Unauthorized - User is not logged in' }
        return res.status(401).end(`User is not logged in.`);
    } catch (error) {
        console.error(error);
        throw new Error("Error during authentication");
    }
}

export const checkRole = (roles: string[]) => async (req: Request, res: Response, next: NextFunction) => {
    try {
        const dbUserRole = (await prisma.users.findUnique({
            where: {
                //@ts-ignore
                issuer: req?.user?.issuer
            }
        }) as users).role;

        if (roles.includes(UserRole[dbUserRole])) {
            next();
        } else {
            //  #swagger.responses[403] = { description: 'Forbidden - wrong role' }
            return res.status(403).json({
                message: "Forbidden - wrong role",
                success: false
            })
        }
    } catch (error) {
        console.error(error);
        throw new Error("Error during checking user role");
    }
};