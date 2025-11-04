import express from "express";
import client from "../mongodb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = client.db("ds-archive");

router.post("/create/outfit", async (req, res) => {
  try {
    const col = db.collection("outfits");
    const data = req.body;

    const memoryObjectId =
      data.memoryId && data.memoryId !== ""
        ? ObjectId.createFromHexString(data.memoryId)
        : null;

    const characterObjectId =
      data.characterId && data.characterId !== ""
        ? ObjectId.createFromHexString(data.characterId)
        : null;

    const collectionData = {
      name: data.name,
      memoryId: memoryObjectId,
      characterId: characterObjectId,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      stats: data.stats || null,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
      dateAdded: new Date(),
    };

    const result = await col.insertOne(collectionData);
    console.log("Outfit inserted", collectionData);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
      message: "Outfit inserted successfully!",
      data: collectionData,
    });
  } catch (err) {
    console.error("Error inserting outfit:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export { router };
