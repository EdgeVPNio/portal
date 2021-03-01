#!/bin/bash
#===============================================================================
#
#          FILE:  mongo.sh
#
#         USAGE:  ./mongo.sh [start|stop|restart]
#
#   DESCRIPTION:  Start, stop or restart unix mongodb-server
#===============================================================================

VERSION=1.1.2
SCRIPTNAME=$(basename "$0")
MONGOHOME=
MONGOBIN=$MONGOHOME/bin
MONGOD=$MONGOBIN/mongod
MONGODBPATH=
MONGODBCONFIG=


if [ $# != 1 ]
then
echo "Usage: $SCRIPTNAME [start|stop|restart]"
exit
fi

pid() {
    ps -ef | awk '/[m]ongodb/ {print $2}'
}

stopServer() {
    PID=$(pid)
    if [ ! -z "$PID" ];
    then
        echo "... stopping mongodb-server with pid: $PID"
sudo kill $PID
    else
        echo "... mongodb-server is not running!"
    fi
}

startServer() {
    PID=$(pid)
    if [ ! -z "$PID" ];
    then
        echo "... mongodb-server already running with pid: $PID"
    else
        echo "... starting mongodb-server"
        sudo "$MONGOD" --replSet "Eviors0"
        mongo Evio --eval "rs.initiate()"
    fi
}

restartServer() {
    stopServer
    sleep 1s
    startServer    
}

case "$1" in

start) startServer
      ;;

stop) stopServer
     ;;

restart) restartServer
;;

*) echo "unknown command"
  exit
  ;;
esac