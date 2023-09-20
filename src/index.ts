import express from "express"
import * as dotenv from "dotenv"
import cors from "cors"
// ==========Swagger==========
import * as swaggerUi from "swagger-ui-express"
//import { swaggerDocs } from "./swagger"
import swaggerFile from "./swagger-output.json"
import "./swagger"
// ==========Database imports==========
import "./db/db";
import "./db/db-contract"
import "./db/db-listing";
import "./db/db-coin";
import "./db/db-collection"
import "./services/buy-coin-services";
import "./db/db-genre"
// ==========Routes imports==========
import { router as userRoutes } from "./routes/user"
import { router as listingRoutes } from "./routes/listing"
import { router as contractNfts } from "./routes/fetch-nfts-from-constract"
import { router as mintRoutes } from "./routes/mint-nft"
import { router as buyNft } from "./routes/buy-nft"
import { router as rentRoutes } from "./routes/renting-rout"
import { router as collectionRoutes } from "./routes/collection-rout"
import { router as coinRoutes } from "./routes/coin-rout"
// ==========Session and authentication==========
import session from "express-session"
import passport from "passport"
import path from "path"
import logger from "morgan"
import cookieParser from "cookie-parser"
import bodyParser from "body-parser"

const app = express()

app.use(cors({
  //allowedHeaders: '*',
  origin: ['http://localhost:3000', 'https://ctm-nft.marotino.ventures'],
  credentials: true,
  //origin: '*'
}));
dotenv.config()


// ==========Session and authentication==========

app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.use(logger('dev'));
app.use(express.json());
//app.use(express.urlencoded({ extended: false }));
app.use(cookieParser('anything'));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: 'anything',
    //secret: "not my cat's name",
    resave: false,
    saveUninitialized: false,
    /*cookie: {
      maxAge: 60 * 60 * 1000, // 1 hour
      secure: false, // Uncomment this line to enforce HTTPS protocol.
      // sameSite: true
    }*/
  })
);
app.use(bodyParser.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());


// ==========Serve Swagger as endpoint==========
//app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs))
app.use('/doc', swaggerUi.serve, swaggerUi.setup(swaggerFile))

/** =Note=
 * to use most of end points user must setApproveForAll to ADMIN_WALLET_ADDRESS
 * probably the best would be to ask user to sign this after registration  
 * */

// ==========Declare routes==========
app.use("/user", userRoutes)
app.use("/listing", listingRoutes)
app.use("/buyNft", buyNft)
app.use("/contract-nfts", contractNfts)
app.use("/mint", mintRoutes) // endpoint to mint NFT it will only work if there are founds on wallet with address ADMIN_WALLET_PRIVATE_KEY 
app.use("/rent", rentRoutes)
app.use("/buyCoins", coinRoutes)
app.use("/collection", collectionRoutes)

app.get("/", (req, res, next) => {
  res.send("<h1>Test entry</h1>")
})
app.listen(process.env.PORT, () => {
  console.log(`Running on port ${process.env.PORT}`)
})
