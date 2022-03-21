#!/bin/sh

# Prepare Deploying
npm install
npm run build
# cp .env.example .env

# Push the generated image to the registry
docker-compose -f docker-compose-test.yml build
docker-compose -f docker-compose-test.yml up

# To remove docker-compose service
# docker stack rm express_ts
# docker-compose -f docker-compose-test.yml down -v
# docker-compose -f docker-compose-test.yml rm 

# Remove unused Data
# docker system prune -f
