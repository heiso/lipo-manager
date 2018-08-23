[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

# Requirements and Install
## Docker
Install docker and docker-compose. If you are on MacOs, just install [Docker for Mac](https://docs.docker.com/docker-for-mac/install).

## Dependencies
```
npm i
```

# Start
Start services (mongo, postgres, redis, etc)
```
docker-compose pull
docker-compose up -d
```

Start project
```
npm start
```

# Testing
Run the stack
```
docker-compose pull
docker-compose up -d
```

Run the service
```
npm dev:test
```

Run tests
```
npm run test:local
```
