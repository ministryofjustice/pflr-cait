#!/bin/sh

NOSKIP=false
if [ "$SKIP_LINT" != "true" ]; then NOSKIP=true; fi
if [ "$SKIP_UNIT" != "true" ]; then NOSKIP=true; fi

if [ $NOSKIP = true ]
then
  DOCKERTAG=$(echo $JOB_NAME-$BUILD_NUMBER | tr '[:upper:]' '[:lower:]')
  docker build -t=$DOCKERTAG .
  if [ "$SKIP_LINT" != "true" ]
  then
    DOCKER_LINT=$DOCKERTAG-lint
    docker run --name $DOCKER_LINT $DOCKERTAG npm run lint
    docker rm -fv $DOCKER_LINT 2>/dev/null
  fi
  if [ "$SKIP_UNIT" != "true" ]
  then
    DOCKER_UNIT=$DOCKERTAG-unit
    docker run --name $DOCKER_UNIT $DOCKERTAG npm test
    docker rm -fv $DOCKER_UNIT 2>/dev/null
  fi
fi