-- docker compose exec postgres bash
-- psql --dbname=auto --username=auto --file=/scripts/create-table-auto.sql

-- "user-private schema" (Default-Schema: public)
CREATE SCHEMA IF NOT EXISTS AUTHORIZATION auto;

ALTER ROLE auto SET search_path = 'auto';

-- https://www.postgresql.org/docs/current/sql-createtable.html
-- https://www.postgresql.org/docs/current/datatype.html
CREATE TABLE IF NOT EXISTS auto (
    id            char(36) PRIMARY KEY USING INDEX TABLESPACE autospace,
    version       integer NOT NULL DEFAULT 0,
    marke         varchar(40) NOT NULL UNIQUE USING INDEX TABLESPACE autospace,
    typ           varchar(12) NOT NULL CHECK (art ~ 'ELEKTRO|KRAFTSTOFF'),
    preis         decimal(8,2) NOT NULL,
    rabatt        decimal(4,3) NOT NULL,
    lieferbar     boolean NOT NULL DEFAULT FALSE,
    datum         date,
    erzeugt       timestamp NOT NULL DEFAULT NOW(),
    aktualisiert  timestamp NOT NULL DEFAULT NOW()
) TABLESPACE autospace;

CREATE TABLE IF NOT EXISTS fahrzeugklasse (
    id         char(36) PRIMARY KEY USING INDEX TABLESPACE autospace,
    auto_id    char(36) NOT NULL REFERENCES auto,
    fahrzeugklasse varchar(16) NOT NULL CHECK (fahrzeugklasse ~ 'CABRIO|SPORT')
) TABLESPACE autospace;

-- default: btree
CREATE INDEX IF NOT EXISTS fahrzeugklasse_auto_idx ON fahrzeugklasse(auto_id) TABLESPACE autospace;
