const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9fxhf2q.mongodb.net/?retryWrites=true&w=majority`;
// const uri = "mongodb+srv://<username>:<password>@cluster0.9fxhf2q.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// json web token middleware
const verifyJWT = (req, res, next) => {
  console.log('hitting verify JWT');
  // console.log(req.headers.authorization);
  const authorization = req.headers.authorization;
  if(!authorization){
    return res.status(401).send(({error: true, message: 'unauthorized access'}))
  }
  const token = authorization.split(' ')[1];
  // console.log('token from verifyJWT', token);
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
    if(error) {
      return res.status(403).send({error: true, message: 'unauthorized access'})
    }
    req.decoded = decoded;
    next()
  })
} 

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

      const serviceCollection = client.db("carDoctor").collection("services");
      const bookingCollection = client.db("carDoctor").collection("bookings");

      // jwt 
      app.post('/jwt', (req, res) => {
        const user = req.body;
        // console.log(user);
        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h' });
        // console.log(token);
        res.send({token});
      })

      // services routes
      // 1.read <--> get all data
      app.get('/services', async(req, res) => {
        const cursor = serviceCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      })

      // 1.2 read <---> get a specific data
      app.get('/services/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const options = {
          // Include only the `title` and `imdb` fields in the returned document
          projection: {  title: 1, price: 1, img:1, service_id:1, },
        };
        const result = await serviceCollection.findOne(query,options);
        res.send(result)
      })

      // booking routes
      // 2. Read <--> get data according to logged user
      app.get('/bookings', verifyJWT, async(req, res) => {
        const decoded = req.decoded;
        // console.log('came back after verify', decoded)

        if(decoded.email !== req.query.email){
          return res.status(403).send({error:1, message: 'forbidden access'})
        }

        let query = {};
        if(req.query?.email) {
          query = { email: req.query.email }
        }
        const result = await bookingCollection.find(query).toArray();
        res.send(result)
      })
      // 1. create <--->post data
      app.post('/bookings', async(req, res) => {
        const booking = req.body;
        // console.log(booking)
        const result = await bookingCollection.insertOne(booking);
        res.send(result)
      })

      // 3. Update <---> put/patch
      app.patch('/bookings/:id', async(req, res) => {
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updatedBooking = req.body;
        // console.log(updatedBooking);
        const updateStatus = {
          $set: {
            status: updatedBooking.status
          }
        }
        const result = await bookingCollection.updateOne(filter, updateStatus);
        res.send(result);
      })
      // 3. delete
      app.delete('/bookings/:id', async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id)};
        const result = await bookingCollection.deleteOne(query);
        res.send(result);
      })
 
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);


app.get('/', (req, res) => {
    res.send('Doctor is coming!')
})



app.listen(port, () => {
    console.log(`Car-Doctor server is running on port ${port}`)
})