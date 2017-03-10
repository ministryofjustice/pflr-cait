#!/bin/sh

if [ "$SKIP_FUNCTIONAL" != "true" ]
then
  DOCKERTAG=$(echo $JOB_NAME-$BUILD_NUMBER | tr '[:upper:]' '[:lower:]')

  APP=$DOCKERTAG-app
  docker build -t $APP .

  #### If no environment url passed, spin the app up
  if [ "$BASE_URL" == "" ]
  then
    docker run --name $APP -d $APP
    APP_IP=$(docker inspect --format '{{.NetworkSettings.IPAddress}}' $APP)
  fi

  SELENIUM=$DOCKERTAG-selenium
  docker run --name $SELENIUM -d selenium/standalone-firefox:2.48.2
  # SELENIUM_IP=$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $SELENIUM)
  # more modern correct way above; but Jenkins version insists on following
  SELENIUM_IP=$(docker inspect --format '{{.NetworkSettings.IPAddress}}' $SELENIUM)

  echo APP_IP = $APP_IP
  # Now run the tests
  docker run -e "baseUrl=$BASE_URL" -e "baseIp=$APP_IP" -e "seleniumIp=$SELENIUM_IP" $APP node_modules/.bin/codeceptjs run --steps

  ### Clean up
  docker rm -fv $APP 2>/dev/null
  # docker rmi -f $APP 2>/dev/null
  docker rm -fv $SELENIUM 2>/dev/null
fi