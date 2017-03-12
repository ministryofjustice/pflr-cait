#!/bin/sh

NOSKIP=false
if [ "$SKIP_LINT" != "true" ]; then NOSKIP=true; fi
if [ "$SKIP_UNIT" != "true" ]; then NOSKIP=true; fi

if [ $NOSKIP = true ]
then
  DOCKERTAG=$(echo $JOB_NAME-$BUILD_NUMBER | tr '[:upper:]' '[:lower:]')
  TEST_IMAGE=$DOCKERTAG-test
  docker build -t=$TEST_IMAGE .
  if [ "$SKIP_LINT" != "true" ]
  then
    docker run --name $DOCKERTAG-lint $TEST_IMAGE yarn lint
  fi
  if [ "$SKIP_UNIT" != "true" ]
  then
    docker run --name $DOCKERTAG-unit $TEST_IMAGE yarn test
  fi
fi