#!/bin/bash
curl --data-raw '{"name" : "James"}' -H 'content-type: application/json' 'http://localhost:5000/hello'
echo ''
curl --cacert ./https/cert.pem --data-raw '{"name" : "James"}' -H 'content-type: application/json' 'https://localhost:5001/hello'
echo ''
curl 'http://localhost:5000/debug?debugLevel=1'
echo ''
curl 'http://localhost:5000/hello'
echo ''
curl --data-raw '{"name" : "James"}' -H 'content-type: application/json' 'http://localhost:5000/hello'
echo ''
curl --data-raw '{"name" : "James"}' 'http://localhost:5000/hello'
echo ''
curl --data-raw '' 'http://localhost:5000/hello'
echo ''
curl --data-raw '{name: "whatever"}' -H 'content-type: application/text' 'http://localhost:5000/hello'
echo ''
curl --data-raw '{}' -H 'content-type: application/text' 'http://localhost:5000/hello'
echo ''