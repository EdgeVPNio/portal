#!/bin/bash
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
apt-get install -y nodejs
npm install --legacy-peer-deps
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
apt-get update
apt-get install -y mongodb-org
sudo mkdir -p /data/db
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
./db/mongo.sh start 
systemctl enable mongod
cd views && npm run build