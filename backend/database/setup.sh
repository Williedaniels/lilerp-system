#!/bin/bash
sudo service postgresql start
cat /home/ubuntu/lilerp-system/backend/database/setup.sql | sudo -u postgres psql
