const express = require('express');
const app = express();
const port = 8888;
const bodyParser = require('body-parser');

// const low = require('lowdb');
// const FileSync = require('lowdb/adapters/FileSync');
// const adapter = new FileSync('db.json');
// const db = low(adapter);

// db.get('member').
// push({
//     id : 1,
//     email : "",
//     nickname : "",
//     password : "",
//     salt : "",
//     uuid : "",
//     name : "",
//     phone_number : "010234455"
// }).write();

// db.get('member').remove({id:"NFTViQnyn"}).write();
// db.get('member').remove();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const router =require('./routes')(app);
console.log(port,"dddd")
app.listen(port);