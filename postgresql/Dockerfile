FROM postgres:14.3

COPY createDB.sql ./docker-entrypoint-initdb.d
COPY createTables.sql ./docker-entrypoint-initdb.d
COPY createUsers.sql ./docker-entrypoint-initdb.d