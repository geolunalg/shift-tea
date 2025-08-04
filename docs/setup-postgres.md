<div style="position: fixed; top: 10px; right: 10px;">
  <a href="../README.md">Home</a>
</div>

# Setup PostgreSQL
The following instructions will walk you through a PostgreSQL installation for Ubuntu Linux. If you need instructions for Mac or Windows, please follow the two links provided, respectively.

- [PostgresSQL for Mac](https://www.postgresql.org/download/macosx/)
- [PostgresSQL for Windows](https://www.postgresql.org/download/windows/)

## Installing PostgresSQL

Update packages:
```
sudo apt update
```

Install Postgres:
```
sudo apt install postgresql postgresql-contrib -y
```

Set Postgres password:
```
sudo passwd Postgres
```
> Follow the prompts to set the password. To keep things simple, I advise you to use `postgres` as the password.

Start Postgres:
```
sudo service postgresql start
```

## Creating the Project's Database

Connect to Postgres:
```
sudo -u postgres psql
```

Create the project's database
```
CREATE DATABASE scheduler;
```

Set the database password:
```
ALTER USER postgres WITH PASSWORD 'postgres';
```
> in the example above the password is set to `postgres` you can change it as needed.

Switch to the project's database:
```
\c scheduler
```

Quit Postgres:
```
\q
```

## Connect to Project Database
There are three ways to access the project database; we have already covered the first in the previous section.

The second way to access the database is through the database URL. The project will also use this method, so it's crucial to verify that it works.
```
psql postgres://postgres:postgres@localhost:5432/scheduler
```
> The URL is constructed as follows: `postgres://<password>:<username>@localhost:5432/scheduler`

The final way to access the database is by running the command below. It will prompt you to enter the database password.
```
psql -U postgres -h localhost -d scheduler
```
