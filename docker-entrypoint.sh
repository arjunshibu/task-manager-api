#!/bin/sh

echo 'Waiting for MongoDB to start...'
./wait-for db:27017

echo 'Starting the server...'
[ "$MODE" = 'prod' ] && npm start || npm run dev