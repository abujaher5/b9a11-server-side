const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
const corsOptions = {
  origin: ["https://gadget-repair-20009.web.app", "http://localhost:5173"],
  credentials: "true",
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.7rs8zhc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //   await client.connect();

    const servicesCollection = client
      .db("fix-gadget-DB")
      .collection("services");

    const bookingsCollection = client
      .db("fix-gadget-DB")
      .collection("bookings");

    const usersCollection = client.db("fix-gadget-DB").collection("users");

    // users / roles related

    // create-on-register, update name on later logins (role only set on insert)
    app.post("/users", async (req, res) => {
      const { name, email, role } = req.body;
      if (!email) {
        return res.status(400).send({ message: "Email is required" });
      }
      const updateDoc = {
        $set: { name: name || "", email },
        $setOnInsert: {
          role: role || "consumer",
          createdAt: new Date(),
        },
      };
      const result = await usersCollection.updateOne({ email }, updateDoc, {
        upsert: true,
      });
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const result = await usersCollection.findOne({ email });
      res.send(result);
    });

    app.patch("/users/:email/role", async (req, res) => {
      const email = req.params.email;
      const updateDoc = { $set: { role: req.body.role } };
      const result = await usersCollection.updateOne({ email }, updateDoc);
      res.send(result);
    });

    //get all data form db

    app.get("/services", async (req, res) => {
      result = await servicesCollection.find().toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.findOne(query);
      res.send(result);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      console.log("Added New Service", service);

      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          serviceName: req.body.serviceName,
          category: req.body.category,
          brand: req.body.brand,
          price: req.body.price,
          estimatedTime: req.body.estimatedTime,
          warranty: req.body.warranty,
          area: req.body.area,
          description: req.body.description,
          serviceImage: req.body.serviceImage,
        },
      };
      const result = await servicesCollection.updateOne(
        query,
        updateDoc,
        options,
      );
      res.send(result);
    });

    app.delete("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await servicesCollection.deleteOne(query);
      res.send(result);
    });

    // book service related

    app.get("/bookings", async (req, res) => {
      const { email, providerEmail } = req.query;
      const query = {};
      if (email) query.userEmail = email;
      if (providerEmail) query.providerEmail = providerEmail;
      const result = await bookingsCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // update booking status (service provider)
    app.put("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          serviceStatus: req.body.serviceStatus,
        },
      };
      const result = await bookingsCollection.updateOne(query, updateDoc);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Fix-gadget server is running ");
});

app.listen(port, () => console.log(`server running on the port ${port}`));
