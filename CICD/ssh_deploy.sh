#!/bin/bash

set -e
set -x

component=$1
env=$2
sshUser=arcuser
host=10.110.1.7

if [ $env = "prod" ] 
then
  host=jnjdmdemou1
fi


echo Deploy [$component] to [$host] with user [$sshUser], env=[$env]. 
tar cf - perseus.sh perseus.h repo_pwd | ssh "$sshUser"@"$host" "tar xf -; bash -x -e perseus.sh deploy $component $env"
echo "component=[$component]"
echo "environment=[$env]"
echo "git branch=[$currentBranch]"
echo "repo image=[$currentImage]"
echo "deploy target=[$host]"
echo "ssh user=[$sshUser]"
echo [$component] was succefully deployed to [$host] with user [$sshUser], env=[$env].
