# Assignment-1

## Start Staging Servers
`
NODE_ENV=staging node index.js
`

## Start Production Servers
`
NODE_ENV=production node index.js
`

## SSL command
`
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
`
