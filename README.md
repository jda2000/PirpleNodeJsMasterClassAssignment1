# PirpleNodeJsMasterClassAssignment1
This is the way homework assignment 1 of the pirple Node.js Master Class is turned in.

This is basically the code resulting from following along with the previous lessons
with an added /hello and /debug route handlers.

The /debug route handler basically (de)activates the console.log calls on the fly.

curl http://localhost:5000/debug?debugLevel=1

The /hello handler hopefully satisfies the specifications/requirements of the assignment.

The included start_server.sh (linux style) bash file starts the server on port 5000

The included run_tests.sh bash file uses curl to demonstrate the features of the /hello API

The basic idea is that a payload of {"name" : "Sam"} will result in a personalized greeting.

The .pem files were not checked in but generate_certificate.sh should create them or you can
use your own.
