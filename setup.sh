#!/bin/bash
function InstallEnv {
  sudo locale-gen C.UTF-8
}

function InstallNodeAndNpm {
  curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
  apt-get install nodejs -y
  apt-get install npm -y
  npm install /vagrant
  npm install -g node-dev
  npm install -g express-generator
  ln -s /usr/bin/nodejs /usr/local/bin/node
}

echo 'Prepare the environement'; InstallEnv
echo 'Installing Node...'; InstallNodeAndNpm

exit 0
