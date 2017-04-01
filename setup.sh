#!/bin/bash
function InstallEnv {
  sudo locale-gen C.UTF-8
}

function InstallNode {
  curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
  apt-get install nodejs -y
  apt-get install npm -y
  npm install express
  npm install -g express-generator
  ln -s /usr/bin/nodejs /usr/local/bin/node
}

echo 'Prepare the environement'; InstallEnv
echo 'Installing Node...'; InstallNode

exit 0
