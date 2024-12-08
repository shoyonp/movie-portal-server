const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o3uzo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const movieCollection = client.db("movieDB").collection("movie");

    const userFavMovieCollection = client
      .db("movieDB")
      .collection("userMovies");

    app.get("/movies", async (req, res) => {
      const { search } = req.query;
      let option = {};
      if (search) {
        option = { name: { $regex: search, $options: "i" } };
      }

      const cursor = movieCollection.find(option);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.findOne(query);
      res.send(result);
    });

    app.post("/movies", async (req, res) => {
      const newMovie = req.body;
      const result = await movieCollection.insertOne(newMovie);
      res.send(result);
    });

    app.put("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedMovie = req.body;
      const movie = {
        $set: {
          name: updatedMovie.name,
          photo: updatedMovie.photo,
          genre: updatedMovie.genre,
          duration: updatedMovie.duration,
          releaseYear: updatedMovie.releaseYear,
          summary: updatedMovie.summary,
        },
      };
      const result = await movieCollection.updateOne(filter, movie, options);
      res.send(result);
    });

    app.delete("/movies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await movieCollection.deleteOne(query);
      res.send(result);
    });

    // users favorite movie related api

    app.get("/favMovies/:email", async (req, res) => {
      const { email } = req.params;
      const cursor = { email };
      const result = await userFavMovieCollection.find(cursor).toArray();
      res.send(result);
    });

    app.post("/favMovies", async (req, res) => {
      const newUserMovie = req.body;
      const result = await userFavMovieCollection.insertOne(newUserMovie);
      res.send(result);
    });

    app.delete("/favMovies/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userFavMovieCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch();

app.get("/", (req, res) => {
  res.send("movie portal server is running");
});

app.listen(port);
