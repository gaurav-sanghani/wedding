CREATE TABLE rsvp (
  id SERIAL PRIMARY KEY,
  name text NOT NULL,
  num_guests int NOT NULL DEFAULT 0,
  email text,
  is_attending boolean NOT NULL,
  mehndi boolean NOT NULL,
  sangeet boolean NOT NULL,
  wedding boolean NOT NULL,
  reception boolean NOT NULL,
  message text,
  is_valid boolean NOT NULL,
  insert_ts timestamp without time zone NOT NULL DEFAULT NOW(),
  delete_ts timestamp without time zone
);
