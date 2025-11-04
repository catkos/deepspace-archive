import express from "express";
import { z } from "zod";
import client from "../mongodb.js";
import {
  filterConfig,
  formatMemoryData,
  handlePairedMemory,
} from "../utils/memories.js";

const router = express.Router();
const db = client.db("ds-archive");

const statSchema = z.object({
  baseDefault: z.number().nonnegative().default(0),
  maxDefault: z.number().nonnegative().default(0),
  maxRank1: z.number().nonnegative().default(0),
  maxRank2: z.number().nonnegative().default(0),
  maxRank3: z.number().nonnegative().default(0),
});

const memorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Memory name is required")
    .max(100)
    .regex(/^[a-zA-Z0-9\s\-']+$/, {
      message:
        "Name can only contain letters, numbers, spaces, hyphens, and apostrophes.",
    }),
  characterId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid characterId (must be ObjectId)"),
  rarity: z.number().int().min(3).max(5),
  time: z
    .string()
    .trim()
    .toLowerCase()
    .transform((val) =>
      val === "solar" || val === "lunar"
        ? val.charAt(0).toUpperCase() + val.slice(1)
        : val
    )
    .refine((val) => ["Solar", "Lunar"].includes(val), {
      message: "Invalid time value. Must be Solar or Lunar.",
    }),
  pairedSolarId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    .nullable()
    .optional(),
  pairMemoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    .nullable()
    .optional(),
  pairBonusId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    .nullable()
    .optional(),
  flavorText: z.string().nullable().optional(),
  outfitId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    .nullable()
    .optional(),
  eventId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid ObjectId")
    .nullable()
    .optional(),
  obtain: z.array(z.string()).default([]),
  talent: z.record(z.any()).nullable().optional(),
  stats: z.object({
    hp: statSchema,
    attack: statSchema,
    defense: statSchema,
    critDmg: statSchema,
  }),
  releaseDate: z.string().datetime().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

router.post("/create", async (req, res) => {
  try {
    const parsed = await memorySchema.safeParseAsync(req.body);

    if (!parsed.success) {
      const errors = (parsed.error?.issues || []).map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const col = db.collection("memories");
    const memoryData = formatMemoryData(parsed.data);
    const result = await col.insertOne(memoryData);
    const newId = result.insertedId;

    await handlePairedMemory(col, memoryData, newId);

    res.status(201).json({
      success: true,
      message: "Memory inserted successfully!",
      data: { ...memoryData, _id: newId },
    });
  } catch (err) {
    console.error("Error inserting memory:", err);
    if (err.code === 11000 && err.message.includes("unique_name_index")) {
      return res.status(400).json({
        success: false,
        error: "A memory with this name already exists.",
      });
    }
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const col = db.collection("memories");

    const MAX_LIMIT = 100;
    const DEFAULT_LIMIT = 10;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const requestedLimit = parseInt(req.query.limit) || DEFAULT_LIMIT;
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {};
    const postLookupFilter = {};

    Object.entries(filterConfig).forEach(([field, type]) => {
      if (req.query[field]) {
        if (field === "character") {
          postLookupFilter["characterInfo.name"] = req.query[field];
        } else {
          filter[field] = type(req.query[field]);
        }
      }
    });

    const pipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "characters",
          localField: "characterId",
          foreignField: "_id",
          as: "characterInfo",
        },
      },
      {
        $lookup: {
          from: "outfits",
          localField: "outfitId",
          foreignField: "_id",
          as: "outfitInfo",
        },
      },
      {
        $lookup: {
          from: "events",
          localField: "eventId",
          foreignField: "_id",
          as: "eventInfo",
        },
      },
      { $unwind: { path: "$characterInfo", preserveNullAndEmptyArrays: true } },
    ];

    if (Object.keys(postLookupFilter).length > 0) {
      pipeline.push({ $match: postLookupFilter });
    }

    pipeline.push({
      $project: {
        name: 1,
        rarity: 1,
        stellactrum: 1,
        time: 1,
        pairMemoryId: 1,
        pairBonusId: 1,
        flavorText: 1,
        obtain: 1,
        talent: 1,
        stats: 1,
        releaseDate: 1,
        dateAdded: 1,
        imageUrl: 1,
        characterId: 1,
        characterName: "$characterInfo.name",
      },
    });

    const countPipeline = [...pipeline, { $count: "total" }];
    const countResult = await col.aggregate(countPipeline).toArray();
    const totalCount = countResult.length > 0 ? countResult[0].total : 0;

    pipeline.push({ $skip: skip }, { $limit: limit });
    const collectionData = await col.aggregate(pipeline).toArray();

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      success: true,
      message: "Memories read successfully!",
      data: collectionData,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (err) {
    console.error("Error getting documents:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const col = db.collection("memories");
    const slug = req.params.slug;
    const name = slug.replace(/-/g, " ");

    const pipeline = [
      {
        $match: {
          name: {
            $regex: new RegExp(
              `^${name.replace(/[-_]+/g, "[\\s-_]*").trim()}$`,
              "i"
            ),
          },
        },
      },
      {
        $lookup: {
          from: "characters",
          localField: "characterId",
          foreignField: "_id",
          as: "characterInfo",
        },
      },
      { $unwind: { path: "$characterInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          rarity: 1,
          stellactrum: 1,
          time: 1,
          talent: 1,
          stats: 1,
          imageUrl: 1,
          flavorText: 1,
          characterName: "$characterInfo.name",
        },
      },
    ];

    const result = await col.aggregate(pipeline).toArray();

    if (result.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Memory not found" });
    }

    res.json({ success: true, data: result[0] });
  } catch (err) {
    console.error("Error fetching memory by slug:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export { router };
