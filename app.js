const express = require('express')
const mongoose = require('mongoose'); 
const bodyParser= require('body-parser')
const dotenv = require('dotenv');
const app = express()
const Logged = require('./models/User');
const router = require('./router')
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');


// Make sure you place body-parser before your CRUD handlers!
app.use(bodyParser.urlencoded({ extended: true }))
app.use(flash());
dotenv.config();

// const dbURI = 'mongodb+srv://tree:tree2309shamin@cluster0.ge0pr.mongodb.net/our-app?retryWrites=true&w=majority'; 

// const MongoClient = require('mongodb').MongoClient

mongoose.connect(process.env.MONG_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err));

// MongoClient.connect(dbURI, { useUnifiedTopology: true })
//   .then(client => {
//     console.log('Connected to Database')
//   })
//   .catch(error => console.error(error))

let store = new MongoStore({
  mongoUrl: process.env.MONG_URL,
  collection: "sessions"
});


let oneDay = 1000 * 60 * 60 * 24;
app.use(session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    store: store,
    saveUninitialized:false,
    cookie: { maxAge: oneDay, httpOnly: true },
    resave: false 
}));


app.use(function(req, res, next){


  res.locals.filterUserHTML = function(content){
    return sanitizeHTML(markdown(content), {allowedTags: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'bold', 'i', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'], allowedAttributes: {}})
  }

  //make all errors and success flash messages available from all templates
  res.locals.errors = req.flash("errors")
  res.locals.success = req.flash("success")

  //make current user id available on the req object
  if(req.session.user){
      req.visitorId = req.session.user._id
  }else{req.visitorId = 0}

  // make user session data available from within view templates
  res.locals.user = req.session.user
  next()
})



app.set('views', 'views')
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
  });

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


app.use('/',router);