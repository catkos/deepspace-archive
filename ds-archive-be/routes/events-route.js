import express from "express";
import client from "../mongodb.js";
import { ObjectId } from "mongodb";

const router = express.Router();

const db = client.db("ds-archive");

// Test route
router.get("/data", (req, res) => {
  res.json({ message: "Events route working" });
});

// Create event
router.post("/create", async (req, res) => {
  try {
    const col = db.collection("events");
    const data = req.body;

    const collectionData = {
      name: data.name,
      description: data.description || null,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      type: data.type || null, // e.g., "seasonal", "limited", "anniversary", "rerun"
      imageUrl: data.imageUrl || null,
      dateAdded: new Date(),
    };

    const result = await col.insertOne(collectionData);
    console.log("Event inserted", collectionData);

    res.status(201).json({
      success: true,
      insertedId: result.insertedId,
      message: "Event inserted successfully!",
      data: collectionData,
    });
  } catch (err) {
    console.error("Error inserting event:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all events (with memory count)
router.get("/", async (req, res) => {
  try {
    const col = db.collection("events");

    const events = await col
      .aggregate([
        {
          $lookup: {
            from: "memories",
            localField: "_id",
            foreignField: "eventId",
            as: "memories",
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            type: 1,
            imageUrl: 1,
            dateAdded: 1,
            memoryCount: { $size: "$memories" },
          },
        },
        { $sort: { startDate: -1 } }, // Newest first
      ])
      .toArray();

    console.log("Events read:", events.length);

    res.status(200).json({
      success: true,
      message: "Events read successfully!",
      data: events,
    });
  } catch (e) {
    console.error("Error getting events", e);
    res.status(500).json({ error: e.message });
  }
});

// Get single event with all its memories
router.get("/:id", async (req, res) => {
  try {
    const col = db.collection("events");
    const eventId = ObjectId.createFromHexString(req.params.id);

    const event = await col
      .aggregate([
        { $match: { _id: eventId } },
        {
          $lookup: {
            from: "memories",
            localField: "_id",
            foreignField: "eventId",
            as: "memories",
          },
        },
        {
          $unwind: {
            path: "$memories",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "characters",
            localField: "memories.characterId",
            foreignField: "_id",
            as: "characterInfo",
          },
        },
        {
          $unwind: {
            path: "$characterInfo",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$_id",
            name: { $first: "$name" },
            description: { $first: "$description" },
            startDate: { $first: "$startDate" },
            endDate: { $first: "$endDate" },
            type: { $first: "$type" },
            imageUrl: { $first: "$imageUrl" },
            dateAdded: { $first: "$dateAdded" },
            memories: {
              $push: {
                _id: "$memories._id",
                name: "$memories.name",
                rarity: "$memories.rarity",
                imageUrl: "$memories.imageUrl",
                characterId: "$memories.characterId",
                characterName: "$characterInfo.name",
              },
            },
          },
        },
        {
          $project: {
            name: 1,
            description: 1,
            startDate: 1,
            endDate: 1,
            type: 1,
            imageUrl: 1,
            dateAdded: 1,
            memories: {
              $cond: {
                if: { $eq: [{ $size: "$memories" }, 1] },
                then: {
                  $cond: {
                    if: { $eq: [{ $arrayElemAt: ["$memories._id", 0] }, null] },
                    then: [],
                    else: "$memories",
                  },
                },
                else: "$memories",
              },
            },
          },
        },
      ])
      .toArray();

    if (event.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Event read successfully!",
      data: event[0],
    });
  } catch (e) {
    console.error("Error getting event", e);
    res.status(500).json({ error: e.message });
  }
});

export { router };
