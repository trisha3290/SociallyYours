const dotenv = require('dotenv')
dotenv.config()

const mongoose = require('mongoose'); 


const dbURI = 'mongodb+srv://sahil:tree2309shamin@cluster0.ge0pr.mongodb.net/our-app?retryWrites=true&w=majority'; 

// const MongoClient = require('mongodb').MongoClient
const app = require('./app')
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => app.listen(3000))
  .catch(err => console.log(err));

// MongoClient.connect(dbURI, { useUnifiedTopology: true })
//   .then(client => {
//     console.log('Connected to Database')
//   })
//   .catch(error => console.error(error))