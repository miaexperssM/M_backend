@REM  Prepare Deploying
CALL npm install
CALL npm run build
CALL copy .env.example .env


@REM # Push the generated image to the registry
CALL docker-compose -f docker-compose-test.yml build
CALL docker-compose -f docker-compose-test.yml up


@REM # To remove docker-compose service
@REM CALL docker-compose -f docker-compose-test.yml down -v
@REM CALL docker-compose -f docker-compose-test.yml rm 

@REM # Remove unused Data
@REM docker system prune -f
