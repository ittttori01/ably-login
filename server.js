const express = require('express');
const config = require('./config.json');
const app = express();
const port = config.port;
const bodyParser = require('body-parser');


const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('db.json');
const db = low(adapter);

//database member 생성
db.defaults({ member:[] }).write();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const router =require('./routes')(app);
console.log(port,"dddd")
app.listen(port);