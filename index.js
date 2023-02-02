const express = require('express'); 
const mongoose = require('mongoose'); 
const app = express();
const bodyParser = require('body-parser'); 
const session = require('express-session');
const router = require('./routes/router'); 
const path = require('path'); 
const MongoStore = require('connect-mongo');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.use(express.json())
app.use(express.static('public')); 


app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI, collection: 'sessions' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
}))

app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');


app.use(router); 

mongoose.set('strictQuery', false);




app.listen(process.env.PORT, function () {
    console.log('server up and running.... ')
    mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            console.log('db connected..')
        })
})