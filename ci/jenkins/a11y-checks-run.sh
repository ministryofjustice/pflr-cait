#!/bin/sh

if [[ $1 == "-h" || $1 == "--help" ]]
then
  read -d '' USAGE <<- EndOfMessage
		a11y-checks-run.sh
		===========================

		Runs accessibility checks in a docker container

		Used by Jenkins jobs:
		  https://ci.service.dsd.io/view/family%20justice/job/BUILD-cait

		The following environment variables must be set:

		  JOB_NAME

		  BUILD_NUMBER

		The following environment variables can also be set:

		  BASE_URL
		  base url to run the tests against
		  - must include protocol, port and credentials (if necessary)

		  SKIP_A11Y
		  whether to run a11y checks or not
EndOfMessage

  echo "$USAGE"
  exit 0
fi

if [ "$JOB_NAME" == "" ]
then
  echo Environment variable JOB_NAME must be set
  exit 1
fi
if [ "$BUILD_NUMBER" == "" ]
then
  echo Environment variable BUILD_NUMBER must be set
  exit 1
fi

if [ "$SKIP_A11Y" != "true" ]
then
  DOCKERTAG=$(echo $JOB_NAME-$BUILD_NUMBER | tr '[:upper:]' '[:lower:]')

  APP=$DOCKERTAG-accessibility
  docker build -t $APP .

  #### If no environment url passed, spin the app up
  if [ "$BASE_URL" == "" ]
  then
    docker run --name $APP -e "ENV=a11y" -d $APP
    APP_IP=$(docker inspect --format '{{.NetworkSettings.IPAddress}}' $APP)
    BASE_URL=http://$APP_IP:3000
  fi

  # Now run the tests
  spec/a11y/pa11y-crawl.sh $BASE_URL

fi
