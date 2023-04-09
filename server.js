const express = require('express');
const http = require('http');
const path = require('path');
const routes = require('./routes/app');
var bodyParser = require('body-parser');

global.ResponseController = require('./controllers/responseController');

const app = express();
const server = http.createServer(app);
let database = require('./config/database');
global.db = database.connectDb(); 


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.use('/', routes);

app.listen(3333,()=>{
    console.log("server is listening on 3333")
})




