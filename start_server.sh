#!/bin/bash

REQUIRED_NODE_VERSION='v8.11.3'
if [[ "$(node --version)" != "${REQUIRED_NODE_VERSION}" ]]
then
  echo "This requires node.js version ${REQUIRED_NODE_VERSION}"
  exit 0
fi

if [[ ! -e './https/cert.pem' ]]
then
  echo "You need to run generate_certificate.sh first or provide your own cert.pem and key.pem files."
  exit 0
fi

NODE_ENV=production node .
