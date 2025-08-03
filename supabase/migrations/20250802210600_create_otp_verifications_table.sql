CREATE TABLE public.otp_verifications (
    id bigint NOT NULL,
    phone_number character varying NOT NULL,
    otp_hash character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.otp_verifications OWNER TO postgres;

CREATE SEQUENCE public.otp_verifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER TABLE public.otp_verifications_id_seq OWNER TO postgres;

ALTER SEQUENCE public.otp_verifications_id_seq OWNED BY public.otp_verifications.id;

ALTER TABLE ONLY public.otp_verifications ALTER COLUMN id SET DEFAULT nextval('public.otp_verifications_id_seq'::regclass);

ALTER TABLE ONLY public.otp_verifications
    ADD CONSTRAINT otp_verifications_pkey PRIMARY KEY (id);
