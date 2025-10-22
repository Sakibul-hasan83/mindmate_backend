const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// ===== Middleware =====
app.use(cors());
app.use(express.json());

// ===== MongoDB Connection URI =====
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.f4ofb.mongodb.net/mindmateDB?retryWrites=true&w=majority&appName=Cluster0`;

// ===== MongoClient Configuration =====
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();

    const usersCollection = client.db("mindmateDB").collection("usersCollections");

    //  Add a new user
    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log(" Received new user:", newUser);

      if (!newUser?.email || !newUser?.uid) {
        return res.status(400).send({ message: "Invalid user data" });
      }

      const existingUser = await usersCollection.findOne({ email: newUser.email });
      if (existingUser) {
        return res.send({ message: "User already exists" });
      }

      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    //  Get all users
    app.get('/users', async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    //  Delete user by ID
    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const result = await usersCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });

    //  Confirm connection
    await client.db("admin").command({ ping: 1 });
    console.log(" Successfully connected to MongoDB!");
  } catch (error) {
    console.error(" MongoDB connection error:", error);
  }
}
run().catch(console.dir);

// ===== Default Route =====
app.get('/', (req, res) => {
  res.send(' MindMate Server is Running Successfully!');
});

// ===== Start Server =====
app.listen(port, () => {
  console.log(` Server is running on port ${port}`);
});
