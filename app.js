const express = require('express')
const mongoose = require('mongoose'); 
const bodyParser= require('body-parser')
const dotenv = require('dotenv');
const csrf = require('csurf');
const User  = require('./models/User');
const router = require('./router');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const markdown = require('marked');
const app = express();
const sanitizeHTML = require('sanitize-html')




// Make sure you place body-parser before your CRUD handlers!
// app.use(bodyParser.urlencoded({ extended: false }))
app.use(flash());
dotenv.config();
mongoose.connect(
  process.env.MONG_URL,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
      console.log("Connected to MongoDB");
      app.listen(process.env.PORT || 4000, () => {
          console.log("Listening on port 4000");
      })
  }
);

// const MongoClient = require('mongodb').MongoClient

// mongoose.connect(process.env.MONG_URL, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(result => app.listen(3000))
//   .catch(err => console.log(err));

// MongoClient.connect(dbURI, { useUnifiedTopology: true })
//   .then(client => {
//     console.log('Connected to Database')
//   })
//   .catch(error => console.error(error))

let store = new MongoStore({
  // client: require('./db'),
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

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.locals.path = req.path;
    next();
  });

// const PORT = process.env.PORT || 4000;

// const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.use(csrf());

app.use(function(req, res, next){
  res.locals.csrfToken = req.csrfToken()
  // console.log(req.csrfToken());
  next()
})

app.use('/',router);
app.use(function(err, req, res, next){
  if(err){
    // console.log(err);
      if(err.code == "EBADCSRFTOKEN"){
          req.flash('errors',"cross site request forgery detected.")
          req.session.save(()=> res.redirect('/'))
      }else{
          res.render('404')
      }
  }
})
const server = require('http').createServer(app)
const io = require("socket.io")(server);

io.on('connection', (socket) =>{
  console.log('New user connected')

  socket.username = req.session.username

  //listen on new message
  socket.on('new_message', (data) => {
    //broadcast the new message
    io.sockets.emit('new_message', {message : data.message, username : socket.username});
  })

  //listen on typing
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', {username : socket.username})
  })
})

module.exports = server