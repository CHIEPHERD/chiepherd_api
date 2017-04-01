#!/bin/bash
function InstallEnv {
  sudo locale-gen C.UTF-8
}

function InstallNode {
  apt-get install nodejs npm -y
  npm install express
  npm install -g express-generator
  sudo ln -s /usr/bin/nodejs /usr/local/bin/node
}

echo 'Prepare the environement'; InstallEnv
echo 'Installing Node...'; InstallNode

exit 0
