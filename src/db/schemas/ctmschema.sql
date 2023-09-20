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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: listing; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.listing (
    id integer NOT NULL,
    publicid integer,
    owner character varying(30),
    isrented boolean,
    price real,
    rankingpoints integer,
    genre integer
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
-- Name: users; Type: TABLE; Schema: public; Owner: ctmadmin
--

CREATE TABLE public.users (
    id integer NOT NULL,
    name character varying(25),
    wallet character varying(50),
    coins real,
    role integer,
    email character varying(30)
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
-- Name: listing id; Type: DEFAULT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.listing ALTER COLUMN id SET DEFAULT nextval('public.listing_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: listing listing_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.listing
    ADD CONSTRAINT listing_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: ctmadmin
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

