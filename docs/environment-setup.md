<div style="position: fixed; top: 10px; right: 10px;">
  <a href="../README.md">Home</a>
</div>

# Configure Environment Variables
Create a `.env` file in the root of the project and add the following variables:

- `PORT`: The port the server will be running on.
- `JWT_SECRET`: Encryption token. On your terminal run `openssl rand -base64 64` to genenerate one.
- `DB_URL`: The connection URL for Postgres with `?sslmode=disable` appended. See [Connect to Project Database](setup-postgres.md#connect-to-project-database).
- `PLATFORM`: Set to `dev` for development.

## Example: 
```
# .env
PORT="8080"
JWT_SECRET="64_bytes_of_random_data_encoded_using_Base64"
DB_URL="postgres://<password>:<username>@localhost:5432/<database_name>?sslmode=disable"
PLATFORM="dev"
```
