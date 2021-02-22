#!/bin/bash

curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install --legacy-peer-deps
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
#commenting out required UI(React)dependencies but already added to package.json in older versions
#npm install --save react
#npm install --save react-dom
#npm install bootstrap
#npm install react-router-dom
#npm install axios
#npm install react-bootstrap
#npm install react-bootstrap-typeahead
#npm install react-cytoscapejs
#npm install react-tippy