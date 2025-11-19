#!/bin/sh
# Script to import data after migrations

echo "Waiting for migrations to complete..."
sleep 10

echo "Importing data from ecom-fixed.sql..."
if [ -f /app/ecom-fixed.sql ]; then
    mysql -h${DB_HOST} -u${DB_USER} -p${DB_PASSWORD} ${DB_NAME} < /app/ecom-fixed.sql
    echo "Data imported successfully!"
else
    echo "ecom-fixed.sql not found, skipping data import"
fi

echo "Starting application..."
npm start
