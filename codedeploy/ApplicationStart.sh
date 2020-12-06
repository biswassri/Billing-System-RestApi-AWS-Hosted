#!/bin/bash
set x

cd /home/ubuntu/webapp/webapp

pwd
#runuser -l ubuntu -c 'pm2 start restapi.js'
sudo mv /home/ubuntu/webapp/cloudwatch-config.json /opt/cloudwatch-config.json 
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl -a fetch-config -m ec2 -c file:/opt/cloudwatch-config.json -s
pm2 start restapi.js -l --log /home/ubuntu/webapp/apps.log
#runuser -l ubuntu -c 'pm2 list'
pm2 list