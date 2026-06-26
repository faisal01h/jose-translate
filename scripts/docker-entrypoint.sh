#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Seeding sample language data..."
npx prisma db seed

echo "Starting application..."
exec "$@"
