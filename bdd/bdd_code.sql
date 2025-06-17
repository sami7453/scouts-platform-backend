--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

-- Started on 2025-06-17 14:59:55 CEST

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
-- TOC entry 223 (class 1259 OID 82328)
-- Name: analysis_grids; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.analysis_grids (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    criteria jsonb
);


ALTER TABLE public.analysis_grids OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 82327)
-- Name: analysis_grids_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.analysis_grids_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.analysis_grids_id_seq OWNER TO postgres;

--
-- TOC entry 3691 (class 0 OID 0)
-- Dependencies: 222
-- Name: analysis_grids_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.analysis_grids_id_seq OWNED BY public.analysis_grids.id;


--
-- TOC entry 218 (class 1259 OID 82291)
-- Name: clubs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clubs (
    user_id integer NOT NULL,
    name character varying(255),
    info text,
    photo_url text,
    bio text
);


ALTER TABLE public.clubs OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 82416)
-- Name: config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.config (
    key character varying(100) NOT NULL,
    value text NOT NULL
);


ALTER TABLE public.config OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 82304)
-- Name: languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.languages (
    id integer NOT NULL,
    code character varying(10) NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.languages OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 82303)
-- Name: languages_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.languages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.languages_id_seq OWNER TO postgres;

--
-- TOC entry 3692 (class 0 OID 0)
-- Dependencies: 219
-- Name: languages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.languages_id_seq OWNED BY public.languages.id;


--
-- TOC entry 229 (class 1259 OID 82377)
-- Name: payouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payouts (
    id integer NOT NULL,
    sale_id integer,
    scout_id integer,
    amount_cents integer NOT NULL,
    stripe_payout_id character varying(255),
    paid_at timestamp with time zone
);


ALTER TABLE public.payouts OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 82376)
-- Name: payouts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payouts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.payouts_id_seq OWNER TO postgres;

--
-- TOC entry 3693 (class 0 OID 0)
-- Dependencies: 228
-- Name: payouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payouts_id_seq OWNED BY public.payouts.id;


--
-- TOC entry 225 (class 1259 OID 82337)
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reports (
    id integer NOT NULL,
    scout_id integer,
    player_firstname character varying(100) NOT NULL,
    player_lastname character varying(100) NOT NULL,
    "position" character varying(50),
    nationality character varying(100),
    age integer,
    current_club character varying(100),
    current_league character varying(100),
    content_text text,
    pdf_url text,
    price_cents integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT reports_age_check CHECK (((age >= 10) AND (age <= 60))),
    CONSTRAINT reports_price_cents_check CHECK ((price_cents >= 0))
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 82336)
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reports_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.reports_id_seq OWNER TO postgres;

--
-- TOC entry 3694 (class 0 OID 0)
-- Dependencies: 224
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reports_id_seq OWNED BY public.reports.id;


--
-- TOC entry 227 (class 1259 OID 82355)
-- Name: sales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales (
    id integer NOT NULL,
    report_id integer,
    club_id integer,
    amount_cents integer NOT NULL,
    commission_cents integer NOT NULL,
    stripe_payment_intent character varying(255),
    purchased_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.sales OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 82354)
-- Name: sales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_id_seq OWNER TO postgres;

--
-- TOC entry 3695 (class 0 OID 0)
-- Dependencies: 226
-- Name: sales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_id_seq OWNED BY public.sales.id;


--
-- TOC entry 221 (class 1259 OID 82312)
-- Name: scout_languages; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scout_languages (
    scout_id integer NOT NULL,
    language_id integer NOT NULL
);


ALTER TABLE public.scout_languages OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 82396)
-- Name: scout_ratings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scout_ratings (
    id integer NOT NULL,
    scout_id integer,
    club_id integer,
    rating smallint,
    comment text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT scout_ratings_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.scout_ratings OWNER TO postgres;

--
-- TOC entry 230 (class 1259 OID 82395)
-- Name: scout_ratings_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.scout_ratings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.scout_ratings_id_seq OWNER TO postgres;

--
-- TOC entry 3696 (class 0 OID 0)
-- Dependencies: 230
-- Name: scout_ratings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.scout_ratings_id_seq OWNED BY public.scout_ratings.id;


--
-- TOC entry 217 (class 1259 OID 82278)
-- Name: scouts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.scouts (
    user_id integer NOT NULL,
    photo_url text,
    bio text,
    vision_qa jsonb,
    test_report_url text,
    stripe_account_id text
);


ALTER TABLE public.scouts OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 82266)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role public.user_role NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 82265)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 3697 (class 0 OID 0)
-- Dependencies: 215
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 3484 (class 2604 OID 82331)
-- Name: analysis_grids id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_grids ALTER COLUMN id SET DEFAULT nextval('public.analysis_grids_id_seq'::regclass);


--
-- TOC entry 3483 (class 2604 OID 82307)
-- Name: languages id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages ALTER COLUMN id SET DEFAULT nextval('public.languages_id_seq'::regclass);


--
-- TOC entry 3489 (class 2604 OID 82380)
-- Name: payouts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts ALTER COLUMN id SET DEFAULT nextval('public.payouts_id_seq'::regclass);


--
-- TOC entry 3485 (class 2604 OID 82340)
-- Name: reports id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports ALTER COLUMN id SET DEFAULT nextval('public.reports_id_seq'::regclass);


--
-- TOC entry 3487 (class 2604 OID 82358)
-- Name: sales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales ALTER COLUMN id SET DEFAULT nextval('public.sales_id_seq'::regclass);


--
-- TOC entry 3490 (class 2604 OID 82399)
-- Name: scout_ratings id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_ratings ALTER COLUMN id SET DEFAULT nextval('public.scout_ratings_id_seq'::regclass);


--
-- TOC entry 3480 (class 2604 OID 82269)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 3510 (class 2606 OID 82335)
-- Name: analysis_grids analysis_grids_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.analysis_grids
    ADD CONSTRAINT analysis_grids_pkey PRIMARY KEY (id);


--
-- TOC entry 3502 (class 2606 OID 82297)
-- Name: clubs clubs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3531 (class 2606 OID 82422)
-- Name: config config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.config
    ADD CONSTRAINT config_pkey PRIMARY KEY (key);


--
-- TOC entry 3504 (class 2606 OID 82311)
-- Name: languages languages_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_code_key UNIQUE (code);


--
-- TOC entry 3506 (class 2606 OID 82309)
-- Name: languages languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.languages
    ADD CONSTRAINT languages_pkey PRIMARY KEY (id);


--
-- TOC entry 3525 (class 2606 OID 82382)
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- TOC entry 3527 (class 2606 OID 82384)
-- Name: payouts payouts_stripe_payout_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_stripe_payout_id_key UNIQUE (stripe_payout_id);


--
-- TOC entry 3517 (class 2606 OID 82347)
-- Name: reports reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- TOC entry 3519 (class 2606 OID 82361)
-- Name: sales sales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_pkey PRIMARY KEY (id);


--
-- TOC entry 3521 (class 2606 OID 82365)
-- Name: sales sales_report_id_club_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_report_id_club_id_key UNIQUE (report_id, club_id);


--
-- TOC entry 3523 (class 2606 OID 82363)
-- Name: sales sales_stripe_payment_intent_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_stripe_payment_intent_key UNIQUE (stripe_payment_intent);


--
-- TOC entry 3508 (class 2606 OID 82316)
-- Name: scout_languages scout_languages_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_languages
    ADD CONSTRAINT scout_languages_pkey PRIMARY KEY (scout_id, language_id);


--
-- TOC entry 3529 (class 2606 OID 82405)
-- Name: scout_ratings scout_ratings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_ratings
    ADD CONSTRAINT scout_ratings_pkey PRIMARY KEY (id);


--
-- TOC entry 3500 (class 2606 OID 82285)
-- Name: scouts scouts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scouts
    ADD CONSTRAINT scouts_pkey PRIMARY KEY (user_id);


--
-- TOC entry 3496 (class 2606 OID 82277)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 3498 (class 2606 OID 82275)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3511 (class 1259 OID 82426)
-- Name: idx_reports_age; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_age ON public.reports USING btree (age);


--
-- TOC entry 3512 (class 1259 OID 82424)
-- Name: idx_reports_club_league; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_club_league ON public.reports USING btree (current_club, current_league);


--
-- TOC entry 3513 (class 1259 OID 82425)
-- Name: idx_reports_nationality; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_nationality ON public.reports USING btree (nationality);


--
-- TOC entry 3514 (class 1259 OID 82423)
-- Name: idx_reports_player_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_player_name ON public.reports USING btree (player_lastname, player_firstname);


--
-- TOC entry 3515 (class 1259 OID 82353)
-- Name: idx_reports_search; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reports_search ON public.reports USING btree ("position", nationality, current_league, age);


--
-- TOC entry 3533 (class 2606 OID 82298)
-- Name: clubs clubs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clubs
    ADD CONSTRAINT clubs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3539 (class 2606 OID 82385)
-- Name: payouts payouts_sale_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES public.sales(id) ON DELETE CASCADE;


--
-- TOC entry 3540 (class 2606 OID 82390)
-- Name: payouts payouts_scout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_scout_id_fkey FOREIGN KEY (scout_id) REFERENCES public.scouts(user_id) ON DELETE CASCADE;


--
-- TOC entry 3536 (class 2606 OID 82348)
-- Name: reports reports_scout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reports
    ADD CONSTRAINT reports_scout_id_fkey FOREIGN KEY (scout_id) REFERENCES public.scouts(user_id) ON DELETE CASCADE;


--
-- TOC entry 3537 (class 2606 OID 82371)
-- Name: sales sales_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(user_id) ON DELETE RESTRICT;


--
-- TOC entry 3538 (class 2606 OID 82366)
-- Name: sales sales_report_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales
    ADD CONSTRAINT sales_report_id_fkey FOREIGN KEY (report_id) REFERENCES public.reports(id) ON DELETE RESTRICT;


--
-- TOC entry 3534 (class 2606 OID 82322)
-- Name: scout_languages scout_languages_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_languages
    ADD CONSTRAINT scout_languages_language_id_fkey FOREIGN KEY (language_id) REFERENCES public.languages(id) ON DELETE RESTRICT;


--
-- TOC entry 3535 (class 2606 OID 82317)
-- Name: scout_languages scout_languages_scout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_languages
    ADD CONSTRAINT scout_languages_scout_id_fkey FOREIGN KEY (scout_id) REFERENCES public.scouts(user_id) ON DELETE CASCADE;


--
-- TOC entry 3541 (class 2606 OID 82411)
-- Name: scout_ratings scout_ratings_club_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_ratings
    ADD CONSTRAINT scout_ratings_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(user_id) ON DELETE SET NULL;


--
-- TOC entry 3542 (class 2606 OID 82406)
-- Name: scout_ratings scout_ratings_scout_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scout_ratings
    ADD CONSTRAINT scout_ratings_scout_id_fkey FOREIGN KEY (scout_id) REFERENCES public.scouts(user_id) ON DELETE CASCADE;


--
-- TOC entry 3532 (class 2606 OID 82286)
-- Name: scouts scouts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.scouts
    ADD CONSTRAINT scouts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


-- Completed on 2025-06-17 14:59:56 CEST

--
-- PostgreSQL database dump complete
--

