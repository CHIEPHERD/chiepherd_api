# -*- mode: ruby -*-
# vi: set ft=ruby :
# config.ssh.private_key_path = "C:/Users/'Yohan FAIRFORT'/.vagrant.d/insecure_private_key"


Vagrant.configure(2) do |config|
  config.vm.box = 'ubuntu/trusty64'

  config.vm.network :forwarded_port, guest: 5432, host: 5432 # PostgreSQL
  config.vm.network :forwarded_port, guest: 5000, host: 5000 # Flask

  config.vbguest.auto_update = false if defined?(VagrantVbguest::Middleware)
  config.ssh.forward_agent = true

  if ENV['OS'] == "Windows_NT"
    config.ssh.private_key_path = ["C:/Users/'#{ENV['username']}'/.vagrant.d/insecure_private_key"]
    end
  config.vm.network 'private_network', ip: '192.168.56.103'

  config.vm.provider :virtualbox do |vb|
    vb.customize ['modifyvm', :id, '--cpus', '1', '--memory', '1024']
    vb.customize ['guestproperty', 'set', :id, '--timesync-threshold', 5000]
  end

  config.vm.provision 'shell', privileged: true, path: './setup.sh'
end
