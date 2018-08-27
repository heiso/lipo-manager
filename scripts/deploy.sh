#!/bin/sh

docker build --tag "$TRAVIS_REPO_SLUG" .
echo "$DOCKER_PASSWORD" | docker login --username "$DOCKER_USERNAME" --password-stdin

if [[ -v "${TRAVIS_TAG}" ]]; then
  docker tag "$TRAVIS_REPO_SLUG" "${TRAVIS_REPO_SLUG}:latest"  
  docker push "${TRAVIS_REPO_SLUG}:latest"
fi

docker tag "$TRAVIS_REPO_SLUG" "${TRAVIS_REPO_SLUG}:${TRAVIS_BRANCH}"
docker push "${TRAVIS_REPO_SLUG}:${TRAVIS_BRANCH}"

docker rmi "$TRAVIS_REPO_SLUG"
