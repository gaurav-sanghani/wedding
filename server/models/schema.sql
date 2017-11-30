CREATE EXTENSION pgcrypto;

CREATE TABLE rsvp (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL UNIQUE,
  guest_id int,
  name text NOT NULL,
  num_adults int NOT NULL DEFAULT 0,
  num_children int NOT NULL DEFAULT 0,
  email text,
  is_attending boolean NOT NULL,
  is_veg boolean NOT NULL,
  mehndi boolean NOT NULL,
  sangeet boolean NOT NULL,
  wedding boolean NOT NULL,
  reception boolean NOT NULL,
  message text,
  is_valid boolean NOT NULL,
  insert_ts timestamp without time zone NOT NULL DEFAULT NOW(),
  delete_ts timestamp without time zone
);

CREATE TABLE guest (
  id SERIAL PRIMARY KEY,
  hash text NOT NULL UNIQUE,
  display_name text NOT NULL UNIQUE,
  max_num_adults int NOT NULL,
  max_num_children int NOT NULL,
  invited_to_mehndi boolean NOT NULL,
  invited_to_sangeet boolean NOT NULL,
  invited_to_wedding boolean NOT NULL,
  invited_to_reception boolean NOT NULL,
  insert_ts timestamp without time zone NOT NULL DEFAULT NOW(),
  delete_ts timestamp without time zone
);

CREATE TABLE name (
  id SERIAL PRIMARY KEY,
  guest_id int NOT NULL,
  first_name text NOT NULL,
  last_name text
);
