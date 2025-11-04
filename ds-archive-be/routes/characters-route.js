import express from "express";
import client from "../mongodb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = client.db("ds-archive");

const filterConfig = {
  character: String,
  rarity: Number,
  stellactrum: String,
  time: Number,
};

// test
router.get("/data", (req, res) => {
  res.json({ message: "Character route working" });
});

router.post("/create", async (req, res) => {
  try {
    const col = db.collection("characters");

    const data = req.body;

    const collectionData = {
      name: data.name,
      age: data.age || null,
      height: data.height || null,
      birthday: data.birthday ? new Date(data.birthday) : null,
      sign: data.sign || "",
      job: data.job || "",
      evol: data.evol || "",
      description: data.description || "",
      imageUrl: data.imageUrl || null,
      dateAdded: new Date(), // Automatically set when inserted
    };

    const result = await col.insertOne(collectionData);

    console.log("Character inserted", collectionData);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
      message: "Memory inserted successfully!",
      data: collectionData,
    });
  } catch (err) {
    console.error("Error inserting memory:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const col = db.collection("characters");

    const filter = {};
    Object.entries(filterConfig).forEach(([field, type]) => {
      if (req.query[field]) {
        filter[field] = type(req.query[field]);
      }
    });

    const cursor = col.find(filter);
    const collectionData = await cursor.toArray();

    console.log(
      "Memories read with filters:",
      filter,
      "Results:",
      collectionData.length
    );

    res.status(200).json({
      success: true,
      message: "Memories read successfully!",
      data: collectionData,
    });
  } catch (e) {
    console.log("Error getting documents", e);
    res.status(500).json({ error: e.message });
  }
});

export { router };
