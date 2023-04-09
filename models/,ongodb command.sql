create user root with encrypted password 'tristate123';
ALTER user root SUPERUSER;
grant all privileges to root;
GRANT pg_read_all_data TO root;

ALTER user root WITH PASSWORD 'tristate123';

GRANT ALL PRIVILEGES ON DATABASE "postgres" to root;