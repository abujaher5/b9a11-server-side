const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
const corsOptions = {
  origin: ["https://gadget-repair-20009.web.app"],
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
    app.put("/addTouristSpot/:id", async (req, res) => {
      console.log(req.params.id);

      const id = req.params.id;

      const query = { _id: new ObjectId(id) };

      console.log(query);
      const data = {
        $set: {
          spot_name: req.body.spot_name,
          country_name: req.body.country_name,
          location: req.body.location,
          short_description: req.body.short_description,
          average_cost: req.body.average_cost,
          seasonality: req.body.seasonality,
          travel_time: req.body.travel_time,
          totalVisitors: req.body.totalVisitors,
          user_email: req.body.user_email,
          user_name: req.body.user_name,
          image: req.body.image,
        },
      };
      console.log(data);
      const result = await spotCollection.updateOne(query, data);
      console.log(result);
      res.send(result);
    });

    app.put("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };

      const updateDoc = {
        $set: {
          serviceName: req.body.serviceName,
          price: req.body.price,
        },
      };
      const result = await servicesCollection.updateOne(
        query,
        updateDoc,
        options
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
      const result = await bookingsCollection.find().toArray();
      res.send(result);
    });

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
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
