const dotenv = require('dotenv')
dotenv.config()

// const mongoose = require('mongoose'); 
// const mongodb = require('mongodb')
const mongodb = require("mongodb").MongoClient;


// const dbURI = 'mongodb+srv://sahil:tree2309shamin@cluster0.ge0pr.mongodb.net/our-app?retryWrites=true&w=majority'; 
const PORT = process.env.PORT || 4000;
mongodb.connect(process.env.MONG_URL, {useNewUrlParser: true, useUnifiedTopology:true}, function(err, client){
  module.exports= client
  const app = require('./app')
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

// const MongoClient = require('mongodb').MongoClient
// const app = require('./app')
// mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(result => app.listen(3000))
//   .catch(err => console.log(err));

// MongoClient.connect(dbURI, { useUnifiedTopology: true })
//   .then(client => {
//     console.log('Connected to Database')
//   })
//   .catch(error => console.error(error))