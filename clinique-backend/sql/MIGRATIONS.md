Migration notes
================

This folder contains SQL migration scripts to apply to the local PostgreSQL database.

001_add_uuid_to_patients.sql
- Adds `uuid UUID` column to `patients`, populates existing rows with `gen_random_uuid()`, makes it NOT NULL and creates a UNIQUE index.

How to run
-----------
From a shell with `psql` available and appropriate credentials:

```bash
# set password for one-off command (or use .pgpass)
export PGPASSWORD="your_db_password"
psql -h localhost -U postgres -d clinique_marouane -f sql/migrations/001_add_uuid_to_patients.sql
```

Notes
-----
- The migration requires the `pgcrypto` extension to be present (the script creates it if missing).
- Run migrations in staging/production with caution and backup the DB.
