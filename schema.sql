--
-- PostgreSQL database dump
--

-- Dumped from database version 15.2
-- Dumped by pg_dump version 15.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: ctmadmin
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO ctmadmin;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: ctmadmin
--

COMMENT ON SCHEMA public IS '';


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: ctmadmin
--

CREATE TYPE public."UserRole" AS ENUM (
    'User',
    'Label',
    'SuperAdmin',
    'Moderator',
    'Blacklist'
);


ALTER TYPE public."UserRole" OWNER TO ctmadmin;

--
-- Name: UserTags; Type: TYPE; Schema: public; Owner: ctmadmin
--

CREATE TYPE public."UserTags" AS ENUM (
    'MusicProducer',
    'ContentCreator',
    'Rapper',
    'Singer',
    'Fan'
);


ALTER TYPE public."UserTags" OWNER TO ctmadmin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _collectionTolisting; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public."_collectionTolisting" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_collectionTolisting" OWNER TO ctmadmin;

--
-- Name: _listingTousers; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public."_listingTousers" (
    "A" integer NOT NULL,
    "B" integer NOT NULL
);


ALTER TABLE public."_listingTousers" OWNER TO ctmadmin;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO ctmadmin;

--
-- Name: coin; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.coin (
    name text NOT NULL,
    symbol text NOT NULL,
    icon text NOT NULL,
    "totalNumber" integer NOT NULL,
    price real NOT NULL
);


ALTER TABLE public.coin OWNER TO ctmadmin;

--
-- Name: collection; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.collection (
    id integer NOT NULL,
    name character varying(150) NOT NULL,
    nfts integer[],
    "creatorAddress" character varying(42) NOT NULL,
    "createdDate" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    rating integer DEFAULT 0 NOT NULL,
    "avatarImage" text NOT NULL,
    "bannerImage" text NOT NULL,
    description text NOT NULL,
    "creatorName" text NOT NULL
);


ALTER TABLE public.collection OWNER TO ctmadmin;

--
-- Name: collection_id_seq; Type: SEQUENCE; Schema: public; Owner: ctmadmin
--

CREATE SEQUENCE public.collection_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collection_id_seq OWNER TO ctmadmin;

--
-- Name: collection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ctmadmin
--

ALTER SEQUENCE public.collection_id_seq OWNED BY public.collection.id;


--
-- Name: genre; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.genre (
    id integer NOT NULL,
    genre text NOT NULL
);


ALTER TABLE public.genre OWNER TO ctmadmin;

--
-- Name: listing; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.listing (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    price real NOT NULL,
    quantity integer NOT NULL,
    "tokensInStock" integer NOT NULL,
    "imageURL" character varying(500) NOT NULL,
    "musicURL" character varying(500) NOT NULL,
    "contractId" integer NOT NULL,
    "contractAddress" character varying(42) NOT NULL,
    "creatorWalletAddress" character varying(42) NOT NULL,
    "tokenStandard" character varying(10) NOT NULL,
    "labelWallet" character varying(42) NOT NULL,
    "userLikes" integer NOT NULL,
    "userDislikes" integer NOT NULL,
    "moderatorPoints" integer NOT NULL,
    "highestRank" integer NOT NULL,
    views integer NOT NULL,
    genre integer NOT NULL,
    description character varying(500) NOT NULL,
    downloads integer NOT NULL,
    "isRentable" boolean NOT NULL,
    "isSellable" boolean NOT NULL,
    "nftListTime" timestamp(3) without time zone,
    "nftMintTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "numberOfCurrentRents" integer NOT NULL,
    "numberOfRents" integer NOT NULL,
    "rankingPoints" integer NOT NULL,
    "rentPrice" real NOT NULL,
    "tokensListed" integer NOT NULL,
    "usersWhoLiked" text[] DEFAULT ARRAY[]::text[],
    "flagDescription" text,
    "isFlagged" boolean DEFAULT false NOT NULL,
    "actualQuantity" integer NOT NULL,
    "availableQuantity" integer NOT NULL,
    "totalRentTime" integer DEFAULT 0 NOT NULL,
    "usersWhoDisliked" text[] DEFAULT ARRAY[]::text[]
);


ALTER TABLE public.listing OWNER TO ctmadmin;

--
-- Name: listing_id_seq; Type: SEQUENCE; Schema: public; Owner: ctmadmin
--

CREATE SEQUENCE public.listing_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.listing_id_seq OWNER TO ctmadmin;

--
-- Name: listing_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ctmadmin
--

ALTER SEQUENCE public.listing_id_seq OWNED BY public.listing.id;


--
-- Name: userRevenue; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public."userRevenue" (
    id integer NOT NULL,
    month integer NOT NULL,
    year integer NOT NULL,
    "rentRevenue" integer DEFAULT 0 NOT NULL,
    "sellRevenue" integer DEFAULT 0 NOT NULL,
    "totalRevenue" integer DEFAULT 0 NOT NULL,
    "amountRented" integer DEFAULT 0 NOT NULL,
    "amountSold" integer DEFAULT 0 NOT NULL,
    issuer text NOT NULL
);


ALTER TABLE public."userRevenue" OWNER TO ctmadmin;

--
-- Name: userRevenue_id_seq; Type: SEQUENCE; Schema: public; Owner: ctmadmin
--

CREATE SEQUENCE public."userRevenue_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."userRevenue_id_seq" OWNER TO ctmadmin;

--
-- Name: userRevenue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ctmadmin
--

ALTER SEQUENCE public."userRevenue_id_seq" OWNED BY public."userRevenue".id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(25) NOT NULL,
    coins integer DEFAULT 0 NOT NULL,
    email character varying(30) NOT NULL,
    "walletAddress" character varying(42) NOT NULL,
    description text NOT NULL,
    issuer text NOT NULL,
    tag integer NOT NULL,
    "walletType" character varying(10) NOT NULL,
    "whenSignedUp" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "lastLoginAt" integer NOT NULL,
    "nftOwned" integer[],
    "nftRented" integer[],
    website text NOT NULL,
    role integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.users OWNER TO ctmadmin;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: ctmadmin
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO ctmadmin;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: ctmadmin
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: collection id; Type: DEFAULT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.collection ALTER COLUMN id SET DEFAULT nextval('public.collection_id_seq'::regclass);


--
-- Name: listing id; Type: DEFAULT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.listing ALTER COLUMN id SET DEFAULT nextval('public.listing_id_seq'::regclass);


--
-- Name: userRevenue id; Type: DEFAULT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."userRevenue" ALTER COLUMN id SET DEFAULT nextval('public."userRevenue_id_seq"'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: _collectionTolisting; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public."_collectionTolisting" ("A", "B") FROM stdin;
4	1331
\.


--
-- Data for Name: _listingTousers; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public."_listingTousers" ("A", "B") FROM stdin;
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
24f403e0-73da-4001-a0fd-24f8c84ad839	ee87da1c3a2208d2308358900c5da4964d67eb0c402a555d4c9fc334d9476051	2023-06-28 15:10:28.813075+02	20230426103804_init	\N	\N	2023-06-28 15:10:28.798175+02	1
e79146ad-c161-4129-90aa-4ad195f72224	2f91e6e1c8ae1a3d5212c78ae3b2879c1277a44fbbbac22d6f15289047064f8c	2023-06-28 15:10:28.912427+02	20230613133531_mig15	\N	\N	2023-06-28 15:10:28.904264+02	1
56c69dab-6b5a-4173-9a16-80089821c4a2	11b3bcbc02e67fd931af54bb133ccb4b1ab5bb5e2758b2542350cc36721fdf58	2023-06-28 15:10:28.819427+02	20230426152521_mig2	\N	\N	2023-06-28 15:10:28.813769+02	1
e6faa0e0-4851-4311-8fbe-fa78edcc701d	b0e405fe078e0f774dc6fe7274f43f208e91f5080719a34fbd995ef45c14da1c	2023-06-28 15:10:28.822764+02	20230504105059_mig3	\N	\N	2023-06-28 15:10:28.8203+02	1
5b67eed0-af97-419d-af58-0b310dd7476e	bbe2e2ef8fe50d35e552230475bf32a047923a51fc6bb7c9fc9f2ac350b9e8b2	2023-06-28 15:10:28.978324+02	20230624114828_mig23	\N	\N	2023-06-28 15:10:28.975939+02	1
8e3ae0c8-6d61-432f-a0f6-2532de4c39f3	36fa4312fc3de0edfe41932f4a0babebbeeeaf297c83e922b8d0943cfab4fa5e	2023-06-28 15:10:28.839755+02	20230504132536_mig5	\N	\N	2023-06-28 15:10:28.824195+02	1
869d8bc2-2b24-4af8-9c44-dd325a71b7d6	ccb8af718b66f2fe9170980cff0357c50e0ff760e605e3b1aa3ecb133b6f8f2d	2023-06-28 15:10:28.925758+02	20230613134327_mig16	\N	\N	2023-06-28 15:10:28.913428+02	1
07dc0a70-d23d-45a5-9905-489794a28f90	c429592416e5c69d4e292d59695e7cc846c1c72b0f5dcf64d3f9711e38c3e41c	2023-06-28 15:10:28.843054+02	20230508142921_mig6	\N	\N	2023-06-28 15:10:28.840651+02	1
3835af16-7aef-48b5-9b2f-4175d628f14a	708f616407ac11a5e75fabfd84cc938b42a65c56579444c6eb6abb4e8a69e455	2023-06-28 15:10:28.846232+02	20230510095852_mig7	\N	\N	2023-06-28 15:10:28.843716+02	1
fe6cdd24-be1e-4c8d-b1fe-092cde164872	737cdaf03f4df420193a36cb5ab4cf6819d365aaa11ffac5b0783d8e34fa7d9d	2023-06-28 15:10:28.852163+02	20230606142057_mig8	\N	\N	2023-06-28 15:10:28.8469+02	1
3537db73-c490-4def-a033-2a64d982f3bd	a773a4e030af466d13c76f39fca277a5fab2d3470c8e8026e4504e4dbed87f13	2023-06-28 15:10:28.929048+02	20230613143014_mig16	\N	\N	2023-06-28 15:10:28.92651+02	1
82f51213-12d3-4374-8814-abaaf39c98be	2fffc60530aa4573719525f5b0c73239d0573ee5cb394636bdfc55272ae73038	2023-06-28 15:10:28.857403+02	20230606142845_mig9	\N	\N	2023-06-28 15:10:28.853227+02	1
ba5dd033-dd62-41ba-8516-68d678e9e842	6eaf57c87c3dd2cf89637ab1818f4777558d9ca77d494eca0c9f92735a57ba26	2023-06-28 15:10:28.864947+02	20230607110843_mig10	\N	\N	2023-06-28 15:10:28.858286+02	1
857c2812-5603-4798-b3ed-800090405ee7	0550a124d30c18f1ce436f3956c9b57ca7da9e3216c9256c29180d01833b9851	2023-06-28 15:10:29.027299+02	20230626133024_mig26	\N	\N	2023-06-28 15:10:29.024229+02	1
58d18d50-a481-434b-8965-08ce9d0f7acc	98aec1c1f0ed83f2d7d4c1868b31f6e3a4602d50be0bf90f0641ab33e025745a	2023-06-28 15:10:28.874041+02	20230609073302_mig11	\N	\N	2023-06-28 15:10:28.865757+02	1
98bf24ff-e313-4c0c-b5f2-d92bcacadcb4	993b832f59f3cf14d7706b3da8aaf1dd2a743098bd24cd1c284f3804a683c523	2023-06-28 15:10:28.947792+02	20230615061815_mig17	\N	\N	2023-06-28 15:10:28.929851+02	1
5b35a606-078a-4537-ab5d-cf27afde200c	865c83586b119dfcaee2e98bd728361d729cd6474d3a9c1e3184a5212254e521	2023-06-28 15:10:28.878092+02	20230609080444_mig12	\N	\N	2023-06-28 15:10:28.874977+02	1
820e40b6-1834-4c22-9fd2-ce7bc35b04ae	70c2d7f0149144dc87a48e7a34344a72e9a21f650ee543c2de131ebd6416848f	2023-06-28 15:10:28.882053+02	20230609132725_mig13	\N	\N	2023-06-28 15:10:28.879+02	1
33ed9ab1-1ca7-483e-bc7f-07becb459b57	c0d1be42be6de15fd3fac4758ecb2dbbf5772f884ec9a6fd2472826178b74b68	2023-06-28 15:10:28.982505+02	20230626071035_mig23	\N	\N	2023-06-28 15:10:28.979145+02	1
09e735b6-8a11-4a39-afd9-7bf256419d4a	90861f0d53bcb57928cb5fac173e01f91d63dd6d733e702f5a35ffa8d28df339	2023-06-28 15:10:28.88826+02	20230613063454_mig14	\N	\N	2023-06-28 15:10:28.882792+02	1
e13e7bdd-de63-402b-a4b4-33a8bf2f3ce9	275ad66fd98a20eefac5cf6f3f30d486ebafde9948dda21e25ddcd4e8baf963c	2023-06-28 15:10:28.951824+02	20230619152105_mig	\N	\N	2023-06-28 15:10:28.948758+02	1
a996a048-0a66-45a1-8d48-c6eef5815bf5	2cb5d77c31cde258fb753c442ea6ee3f40856bc94504f7011308e23511f0e4e5	2023-06-28 15:10:28.903147+02	20230613063619_mig15	\N	\N	2023-06-28 15:10:28.889102+02	1
8d1747ec-ec47-4ce3-ae0e-48aaaa8c14ec	0fbd5497b46deff32791c01dbb39e14e3134753c24830aeae34ca114fec76274	2023-06-28 15:10:28.959901+02	20230620120119_mig19	\N	\N	2023-06-28 15:10:28.952613+02	1
3af19afd-8e03-43a2-8ed0-5985979b113f	0e2d995766df909efa9f5b724776c3f9eaa7902216091645ce5e51800deb5ddb	2023-06-28 15:10:28.963776+02	20230620122343_mig20	\N	\N	2023-06-28 15:10:28.960563+02	1
d3571d7b-c17c-4d58-ba6c-60849407e802	e071821edab3d30248c467552d24d10bb33c160095eeb313691f3f5c4d75654f	2023-06-28 15:10:28.991339+02	20230626072612_mig24	\N	\N	2023-06-28 15:10:28.983144+02	1
7fe9b6fb-c9a7-4171-a27d-b19d3e6fc99b	9f51ee0fdecd8ea4f9dc713c415ebb3b0c8866f998a1238c33ca7975f32d1bf1	2023-06-28 15:10:28.970373+02	20230620131406_mig21	\N	\N	2023-06-28 15:10:28.965299+02	1
0bcfb127-c55e-4f8f-839d-9fd0511acd2a	4c4a8c0ff304f5a5c979816fbe6bd26e896afe44c45c5f7981f37d2bc9d0c1ed	2023-06-28 15:10:28.975197+02	20230623131618_mig22	\N	\N	2023-06-28 15:10:28.971188+02	1
09150366-0d4e-4ea2-a2ac-2575750ca037	e8e7ee06f9a19271a2946a11fa18ee49d7b8e6182a51f8b3c45cab2f745a3e58	2023-06-29 12:50:17.319947+02	20230629105017_back_from_test	\N	\N	2023-06-29 12:50:17.313896+02	1
5ffa1d5b-dac0-449c-8166-41bc9ed6df34	22b5db5d01c23037a2230580c749c503cd0ec22cc69ad6e4683aaaac792c7712	2023-06-28 15:10:29.004408+02	20230626111840_mig25	\N	\N	2023-06-28 15:10:28.992055+02	1
da9f312e-03d0-42e2-a606-f5c881bc5c97	4b4c42c326bed02a86a6be481b64dd9f036690fa7cf3bb4572ae373c340f5c49	2023-06-28 15:10:29.050333+02	20230628101205_mig28	\N	\N	2023-06-28 15:10:29.028317+02	1
6ae81148-a911-4976-9faa-5b83da31ba32	0550a124d30c18f1ce436f3956c9b57ca7da9e3216c9256c29180d01833b9851	2023-06-28 15:10:29.007308+02	20230626112029_mig25	\N	\N	2023-06-28 15:10:29.005081+02	1
2818d3f0-68ed-4a5d-a7d5-86143a0bc9e4	14e69a301ece5c6dc37257610da082b2807f9d3e0df7de2583174a75d826d0ec	2023-06-28 15:10:29.023574+02	20230626132816_mig26	\N	\N	2023-06-28 15:10:29.008264+02	1
ff0c952f-4181-464d-a581-ee62679b0960	7974a3255d18a23a8e074f0523f714f111acafbda207852d75a2fd015c4f82bf	2023-06-28 15:14:57.251056+02	20230628131457_mig32	\N	\N	2023-06-28 15:14:57.242644+02	1
370d5468-7c50-437f-be79-6b88d17c33db	0550a124d30c18f1ce436f3956c9b57ca7da9e3216c9256c29180d01833b9851	2023-06-28 15:10:29.05362+02	20230628101732_mig29	\N	\N	2023-06-28 15:10:29.051174+02	1
769fad37-3aa1-46ba-9c50-d078e13e85e5	a6f23cac791ccd0da025a3de5175a92ce5fb1201afcb197d0d893f96739413ee	2023-06-28 15:10:30.361912+02	20230628131030_mig30	\N	\N	2023-06-28 15:10:30.337199+02	1
9849dd49-3f67-4f40-8d5e-fd1d48cdba5e	0925641f654cffe4ebe3afbdb4d8571c178a8ff4764d66f85dbff764d88af5c8	2023-06-29 12:47:17.811168+02	20230629104717_test	\N	\N	2023-06-29 12:47:17.802387+02	1
8d1c1582-7eb4-4740-ab7f-9b72edd65a50	81a6386cc90427c64ac406bfd8eb6d7b33bf1361b935058963d93a92e54a315c	2023-07-04 15:05:55.487385+02	20230704130555_mig34	\N	\N	2023-07-04 15:05:55.478276+02	1
62fe65f6-af35-4928-a00a-27b3f4a69e8e	99416d5e175dfc0f6506d85be362ea3c13c076ed9da4aab7c2e69ca79e33c43f	2023-06-30 11:38:14.84366+02	20230630093814_mig33	\N	\N	2023-06-30 11:38:14.82068+02	1
5526a885-6d80-4099-88d4-1ca8cf759ceb	0c949dad1a72ebd375e50ba87e67813bd41856bed7f16bc4a9f8c01d19d12b55	2023-07-07 17:03:12.417626+02	20230707150312_mig35	\N	\N	2023-07-07 17:03:12.392901+02	1
db8ef3f3-7e7a-4c7d-9c2a-781fb73d3258	bdfeed7d617045bb91b5555e91b0ddf1014b17d54e5f2002e94edd5d1bcc6fe8	2023-07-11 17:53:01.476838+02	20230711155301_mig36	\N	\N	2023-07-11 17:53:01.454046+02	1
0aadb142-805e-497f-b3c3-f682e377e833	03450d5a7bc3841c2d22ae28d733b86c4464ba18cf0f1be9ef1bc157f79fd0ee	2023-07-12 15:01:30.499089+02	20230712130130_mig38	\N	\N	2023-07-12 15:01:30.481497+02	1
cdd9ed30-dfed-478a-b936-4e38e4b34485	490f195d6d8f183598309f57c59fcae5259ab8d981b5e2171275315ee0627041	2023-07-12 15:04:13.856924+02	20230712130413_mig39	\N	\N	2023-07-12 15:04:13.846854+02	1
5e362c72-cc3f-49df-87c7-196be0aec902	16557348cb5707bb1199a0914e88cda4a5b6a69d5f3545290b266f941e3252a6	2023-07-12 15:27:27.961133+02	20230712132727_mig40	\N	\N	2023-07-12 15:27:27.938348+02	1
\.


--
-- Data for Name: coin; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public.coin (name, symbol, icon, "totalNumber", price) FROM stdin;
Moonlite	MLC	https://ctm-nft.marotino.ventures/_next/image?url=%2Flogo.png&w=128&q=75	0	0.00014
\.


--
-- Data for Name: collection; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public.collection (id, name, nfts, "creatorAddress", "createdDate", rating, "avatarImage", "bannerImage", description, "creatorName") FROM stdin;
2	string	{6}	0x257b9EAC215954863263bED86c65c4e642D00905	2023-07-10 14:52:07.091	0			string	string
4	string2	{27}	0x257b9EAC215954863263bED86c65c4e642D00905	2023-07-11 16:11:46.554	0			strin2g	string2
\.


--
-- Data for Name: genre; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public.genre (id, genre) FROM stdin;
1	EDM
0	Rap
2	Tech House
3	House
4	Techno
5	Melodic Techno
6	Drum and Bass
7	Future Bass
8	Dubstep
9	Trance
10	Trap
11	Garage
12	Nu Disco
13	Rock
14	Alternative
15	Heavy Metal
16	Grunge
17	Blues
18	Punk
19	Progressive
20	Hip-Hop
21	Trap-music
22	Hip-Hop beat producer
23	R&B
24	Pop
25	Dance-Pop
26	K-Pop
27	J-Pop
28	Vocals
29	Singers
30	Rappers
\.


--
-- Data for Name: listing; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public.listing (id, name, price, quantity, "tokensInStock", "imageURL", "musicURL", "contractId", "contractAddress", "creatorWalletAddress", "tokenStandard", "labelWallet", "userLikes", "userDislikes", "moderatorPoints", "highestRank", views, genre, description, downloads, "isRentable", "isSellable", "nftListTime", "nftMintTime", "numberOfCurrentRents", "numberOfRents", "rankingPoints", "rentPrice", "tokensListed", "usersWhoLiked", "flagDescription", "isFlagged", "actualQuantity", "availableQuantity", "totalRentTime", "usersWhoDisliked") FROM stdin;
1331	Abe	0	50000	0	https://bafybeidjtpr3mjdao5dqukpg4gte7io7j3sgbtukvzlpm5x6i5dx5cerxy.ipfs.thirdwebstorage.com/0	https://bafybeidjtpr3mjdao5dqukpg4gte7io7j3sgbtukvzlpm5x6i5dx5cerxy.ipfs.thirdwebstorage.com/1	27	0x79D9647AD415a532EaCc9607114477Ba7D5589e9	0x257b9EAC215954863263bED86c65c4e642D00905	ERC1155		0	0	0	0	0	1	atque sint perferendis	0	f	f	\N	2023-07-12 09:21:07.52	0	0	0	0	0	{}	\N	f	50000	50000	0	{}
1310	Thaddeus	0	50000	0	https://bafybeihlkf32k574syahhc74p3fibuvecgtkjqk665gw6tppwa4ihsqgnu.ipfs.thirdwebstorage.com/0	https://bafybeihlkf32k574syahhc74p3fibuvecgtkjqk665gw6tppwa4ihsqgnu.ipfs.thirdwebstorage.com/1	0	0x79D9647AD415a532EaCc9607114477Ba7D5589e9	0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C	ERC1155		0	0	0	0	0	1	occaecati voluptas ullam	0	f	f	\N	2023-07-11 15:36:36.997	0	0	0	0	0	{}	\N	f	50000	50000	0	{}
1317	NFTpiesel	0	1000	0	https://bafybeiba6v47agb7fovdhcyyq3znpvdwtviujgkao2ctjfxqj4eetwoq5a.ipfs.thirdwebstorage.com/0	https://bafybeiba6v47agb7fovdhcyyq3znpvdwtviujgkao2ctjfxqj4eetwoq5a.ipfs.thirdwebstorage.com/1	7	0x79D9647AD415a532EaCc9607114477Ba7D5589e9	0x257b9EAC215954863263bED86c65c4e642D00905	ERC1155		0	0	0	0	0	1	NFTpiesel	0	f	f	\N	2023-07-11 15:36:39.751	0	0	0	0	0	{}	\N	f	1000	1000	0	{}
\.


--
-- Data for Name: userRevenue; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public."userRevenue" (id, month, year, "rentRevenue", "sellRevenue", "totalRevenue", "amountRented", "amountSold", issuer) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: ctmadmin
--

COPY public.users (id, name, coins, email, "walletAddress", description, issuer, tag, "walletType", "whenSignedUp", "lastLoginAt", "nftOwned", "nftRented", website, role) FROM stdin;
4	c2	0	c2	0x033AB180b98A9525A1496BD65ef5B5b264DC1F7C	c2	did:ethr:0x7a426366CA041e6055f900A9c78d14f7d5212d83	1	c	2023-07-13 10:40:24.603	1689247068	\N	\N	adfs	2
5	c3	0	c3	asdda	c3	asasdas	1	c	2023-07-13 10:40:24.603	1689246118	\N	\N	adds	1
\.


--
-- Name: collection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ctmadmin
--

SELECT pg_catalog.setval('public.collection_id_seq', 4, true);


--
-- Name: listing_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ctmadmin
--

SELECT pg_catalog.setval('public.listing_id_seq', 1331, true);


--
-- Name: userRevenue_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ctmadmin
--

SELECT pg_catalog.setval('public."userRevenue_id_seq"', 16, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: ctmadmin
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: coin coin_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.coin
    ADD CONSTRAINT coin_pkey PRIMARY KEY (symbol);


--
-- Name: collection collection_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id);


--
-- Name: genre genre_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.genre
    ADD CONSTRAINT genre_pkey PRIMARY KEY (id);


--
-- Name: listing listing_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_pkey PRIMARY KEY (id);


--
-- Name: userRevenue userRevenue_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."userRevenue"
    ADD CONSTRAINT "userRevenue_pkey" PRIMARY KEY (issuer, month, year);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: _collectionTolisting_AB_unique; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX "_collectionTolisting_AB_unique" ON public."_collectionTolisting" USING btree ("A", "B");


--
-- Name: _collectionTolisting_B_index; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE INDEX "_collectionTolisting_B_index" ON public."_collectionTolisting" USING btree ("B");


--
-- Name: _listingTousers_AB_unique; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX "_listingTousers_AB_unique" ON public."_listingTousers" USING btree ("A", "B");


--
-- Name: _listingTousers_B_index; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE INDEX "_listingTousers_B_index" ON public."_listingTousers" USING btree ("B");


--
-- Name: coin_name_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX coin_name_key ON public.coin USING btree (name);


--
-- Name: collection_name_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX collection_name_key ON public.collection USING btree (name);


--
-- Name: listing_contractId_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX "listing_contractId_key" ON public.listing USING btree ("contractId");


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_issuer_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX users_issuer_key ON public.users USING btree (issuer);


--
-- Name: users_name_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX users_name_key ON public.users USING btree (name);


--
-- Name: users_walletAddress_key; Type: INDEX; Schema: public; Owner: ctmadmin
--

CREATE UNIQUE INDEX "users_walletAddress_key" ON public.users USING btree ("walletAddress");


--
-- Name: _collectionTolisting _collectionTolisting_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."_collectionTolisting"
    ADD CONSTRAINT "_collectionTolisting_A_fkey" FOREIGN KEY ("A") REFERENCES public.collection(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _collectionTolisting _collectionTolisting_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."_collectionTolisting"
    ADD CONSTRAINT "_collectionTolisting_B_fkey" FOREIGN KEY ("B") REFERENCES public.listing(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _listingTousers _listingTousers_A_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."_listingTousers"
    ADD CONSTRAINT "_listingTousers_A_fkey" FOREIGN KEY ("A") REFERENCES public.listing(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: _listingTousers _listingTousers_B_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."_listingTousers"
    ADD CONSTRAINT "_listingTousers_B_fkey" FOREIGN KEY ("B") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: listing listing_genre_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_genre_fkey FOREIGN KEY (genre) REFERENCES public.genre(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: userRevenue userRevenue_issuer_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public."userRevenue"
    ADD CONSTRAINT "userRevenue_issuer_fkey" FOREIGN KEY (issuer) REFERENCES public.users(issuer) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: ctmadmin
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

