const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const { MongoClient } = require('mongodb');
const { initializeApp } = require('firebase-admin/app');
const admin = require("firebase-admin");
require('dotenv').config()

const port = 4700


const app = express()
app.use(bodyParser.json())
app.use(cors())


var serviceAccount = require("./configs/bruj-al-arab-67b3b-firebase-adminsdk-v3iey-73a502d8b5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.du7xt.mongodb.net/burjAlArab?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const bookingCollection = client.db("burjAlArab").collection("bookings");
  

  app.post('/addBooking',(req, res) => {
     const newBooking = req.body;
     bookingCollection.insertOne(newBooking)
     .then(result =>{
      res.send(result.insertedCount > 0);
     })
     console.log(newBooking);
  })

  app.get('/bookings',(req,res)=>{
    //   console.log(req.headers.authorization);
    const bearer = req.headers.authorization;
    if(bearer && bearer.startsWith('Bearer ')){
     const idToken = bearer.split(' ')[1]
     console.log({idToken});
    // idToken comes from the client app
    admin.auth().verifyIdToken(idToken)
   .then((decodedToken) => {
    const tokenEmail = decodedToken.email;
    const queryEmail = req.query.email;
    if(tokenEmail == queryEmail){
        bookingCollection.find({email:queryEmail})
        .toArray((err,document)=>{
            res.status(200).send(document)
        })
    }
    else{
        res.status(401).send('unauthorised author')
    }
    })

  .catch((error) => {
    res.status(401).send('unauthorised author')
   });
    }
    else{
        res.status(401).send('unauthorised author')
    }
  })
 
});


app.get('/', (req, res) => {
  res.send('Hello, I am Working!')
})

app.listen(port)