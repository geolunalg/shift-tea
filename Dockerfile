FROM node:22-slim

WORKDIR /app

ADD . .

RUN npm ci
RUN npm run build

# Create the entrypoint script during build
RUN echo '#!/bin/sh\n\
set -e\n\
npm run migrate\n\
exec node dist/server.js' > /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]
