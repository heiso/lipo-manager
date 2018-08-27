#!/bin/sh

docker build --tag "$TRAVIS_REPO_SLUG" .
docker login -u "$DOCKER_USERNAME" -p "$DOCKER_PASSWORD"

if [[ -z "${TRAVIS_TAG}" ]]; then
  docker tag "$TRAVIS_REPO_SLUG" "${TRAVIS_REPO_SLUG}:latest"  
  docker push "${TRAVIS_REPO_SLUG}:latest"
fi

docker tag "$TRAVIS_REPO_SLUG" "${TRAVIS_REPO_SLUG}:${TRAVIS_BRANCH}"
docker push "${TRAVIS_REPO_SLUG}:${TRAVIS_BRANCH}"

docker rmi "$TRAVIS_REPO_SLUG"
