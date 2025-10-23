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
  res.json({ message: "Memory route working" });
});

router.post("/create", async (req, res) => {
  try {
    const col = db.collection("memories");

    const data = req.body;

    const pairedId =
      data.pairedSolarId && data.pairedSolarId !== ""
        ? ObjectId.createFromHexString(data.pairedSolarId)
        : null;

    const collectionData = {
      name: data.name,
      character: data.character,
      rarity: data.rarity,
      stellactrum: data.stellactrum,
      time: data.time,
      pairedSolarId: pairedId,
      talent: data.talent,
      stats: data.stats,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      dateAdded: new Date(),
    };

    const result = await col.insertOne(collectionData);
    const newId = result.insertedId;

    // if the new memory was paired, update the existing one to point back
    if (data.pairedSolarId && data.time === 0) {
      await col.updateOne(
        { _id: pairedId },
        { $set: { pairedSolarId: newId } }
      );
    } else if (data.pairedSolarId && data.time === 1) {
      throw new Error("Lunar memories cannot have a pairedSolarId");
    }

    console.log("Memory inserted", collectionData);

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
    const col = db.collection("memories");

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
