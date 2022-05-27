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




dotenv.config();
const http = require('http').createServer(app)
const io = require("socket.io")(http);
const server = http.listen(process.env.PORT, () => {
  console.log('server is running on port', server.address().port);
});
mongoose.connect(
  process.env.MONG_URL,
  { useNewUrlParser: true, useUnifiedTopology: true}, (err) =>{
    console.log("Connected to MongoDB", err);
  }
  // () => {
  //     console.log("Connected to MongoDB");
  //     // app.listen(process.env.PORT || 4000, () => {
  //     //     console.log("Listening on port 4000");
  //     // })
  // }
);


let store = new MongoStore({
  // client: require('./db'),
  mongoUrl: process.env.MONG_URL,
  collection: "sessions"
});


let oneDay = 1000 * 60 * 60 * 24;
let sessionOptions = (session({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    store: store,
    saveUninitialized:false,
    cookie: { maxAge: oneDay, httpOnly: true },
    resave: false 
}));
app.use(flash());
app.use(sessionOptions);
app.use('/stylesheets/fontawesome', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free/'));
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
  // console.log(io);
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
  // console.log(socket);
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


io.use(function(socket, next){
  sessionOptions(socket.request, socket.request.res, next)
})

io.on('connection', function(socket){
  console.log('user connected');
  if(socket.request.session.user){
      let user = socket.request.session.user

      socket.emit('welcome', {username: user.username, avatar: user.avatar})

      socket.on('chatMessageFromBrowser', function(data){
          socket.broadcast.emit('chatMessageFromServer', {message: data.message, username: user.username, avatar: user.avatar})
      })
  }
})

// io.on('connection', (socket) =>{
//   console.log('New user connected')

//   socket.username = req.session.username

//   //listen on new message
//   socket.on('new_message', (data) => {
//     //broadcast the new message
//     io.sockets.emit('new_message', {message : data.message, username : socket.username});
//   })

//   //listen on typing
//   socket.on('typing', (data) => {
//     socket.broadcast.emit('typing', {username : socket.username})
//   })
// })



// module.exports = server