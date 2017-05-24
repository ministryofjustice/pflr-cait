#!/usr/bin/env bash

if [ -n "$1" ]
then
  TARGET=$1
else
  IP_ADDRESS=$(ifconfig | sed -En 's/127.0.0.1//;s/.*inet (addr:)?(([0-9]*\.){3}[0-9]*).*/\2/p')
  IP_ADDRESS=$(echo $IP_ADDRESS | sed 's/ .*//')
  TARGET=http://$IP_ADDRESS:3000
fi

echo Checking $TARGET is reachable

curl -s $TARGET > /dev/null
if [ "$?" != "0" ]
then
  echo $TARGET is not reachable
  exit 1
fi

echo Running a11y checks against $TARGET

A11YNAME=a11y-test-$(date +%s)

docker run --name $A11YNAME -t -v $PWD/reports:/usr/app/reports 18fgsa/pa11y-crawl-docker:latest pa11y-crawl -o /usr/app/reports/a11y.json $TARGET

docker rm -fv $A11YNAME

ERRORS=$(node -e "const results = require('./reports/a11y.json'); console.log(Object.keys(results.data).filter(page => results.data[page].count.error).length)")

if [ "$ERRORS" != "0" ]
then
  echo "There were $ERRORS accessibility errors - check reports/a11y.json for details"
  exit 1
fi
