import express from "express";
import "dotenv/config";
import cors from "cors";
import { MongoClient, ObjectId } from "mongodb";

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.DATABASE_URL);
export async function connectToMongoDB() {
  try {
    await client.connect();
    console.log("You successfully connected to MongoDB!");
    return client;
  } catch (err) {
    console.dir(err);
  }
}

const dbClient = await connectToMongoDB();
const db = dbClient.db("StudioSpace");
const StudioCollections = db.collection("studios");
const bookingStudioCollections = db.collection("booking_studios");

app.get("/studios", async (req, res) => {
  const data = await StudioCollections.find({}).toArray();

  res.send({ data });
});
app.get("/studios/:category", async (req, res) => {
  const { category } = req.params;

  const data = await StudioCollections.find({ category }).toArray();

  res.send({ data });
});

app.post("/studios", async (req, res) => {
  const data = await StudioCollections.insertOne(req.body);
  res.send({ data });
});
app.patch("/studios", async (req, res) => {
  const { _id, ...data } = req.body;
  await StudioCollections.updateOne(
    { _id: new ObjectId(_id) },
    {
      $set: data,
    },
  );
  res.send({ data });
});

app.get("/category", async (req, res) => {
  const data = await StudioCollections.aggregate([
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
      },
    },
  ]).toArray();
  res.send({ data });
});
app.get("/studioDetails/:id", async (req, res) => {
  const id = new ObjectId(req.params.id);
  const data = await StudioCollections.findOne({ _id: id });

  res.send({ data });
});
app.get("/mylistings/:email", async (req, res) => {
  const data = await StudioCollections.find({
    user_email: req.params.email,
  }).toArray();

  res.send({ data });
});
app.delete("/mylistings/:id", async (req, res) => {
  const data = await StudioCollections.deleteOne({
    _id: new ObjectId(req.params.id),
  });

  res.send({ data });
});

app.post("/bookingStudio", async (req, res) => {
  const data = await bookingStudioCollections.insertOne(req.body);
  res.send({ data });
});
app.get("/checkBookingStudio", async (req, res) => {
  const { user_email, studio_id } = req.query;
  const data = await bookingStudioCollections.findOne({
    user_email,
    studio_id,
  });
  res.send({ data });
});
app.get("/bookingStudio/:email", async (req, res) => {
  const data = await bookingStudioCollections
    .find({
      user_email: req.params.email,
    })
    .toArray();
  res.send({ data });
});
app.patch("/bookingStudio/:id", async (req, res) => {
  const data = await bookingStudioCollections.updateOne(
    {
      _id: new ObjectId(req.params.id),
    },
    {
      $set: { status: "Cancelled" },
    },
  );
  res.send({ data });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
