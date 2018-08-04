#!/bin/bash
mkdir -p https
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout ./https/key.pem -out ./https/cert.pem
