const http = require('http');
const app = require('./app');
require('dotenv').config()

app.set('port', process.env.SERV_P);
const server = http.createServer(app);

server.listen(process.env.SERV_P);