import { ObjectId } from "mongodb";

export const filterConfig = {
  character: String,
  rarity: Number,
  stellactrum: String,
  time: String,
  eventId: (val) => ObjectId.createFromHexString(val),
};

export const formatMemoryData = (data) => {
  console.log("Incoming memory data:", JSON.stringify(data, null, 2));

  const toObjectId = (val) =>
    val && val !== "" ? ObjectId.createFromHexString(val) : null;

  const toTitleCase = (val) =>
    typeof val === "string" && val.trim() !== ""
      ? val
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase())
      : null;

  const toCapitalized = (val) =>
    typeof val === "string" && val.trim() !== ""
      ? val.trim().charAt(0).toUpperCase() + val.trim().slice(1).toLowerCase()
      : null;

  const formatStats = (stats = {}) => {
    const fields = ["hp", "attack", "defense", "critDmg"];
    return fields.reduce((acc, field) => {
      acc[field] = {
        baseDefault: stats[field]?.baseDefault ?? 0,
        maxDefault: stats[field]?.maxDefault ?? 0,
        maxRank1: stats[field]?.maxRank1 ?? 0,
        maxRank2: stats[field]?.maxRank2 ?? 0,
        maxRank3: stats[field]?.maxRank3 ?? 0,
      };
      return acc;
    }, {});
  };

  const formattedObtain = Array.isArray(data.obtain)
    ? data.obtain.filter(Boolean).map(toCapitalized)
    : [];

  return {
    name: toTitleCase(data.name),
    characterId: toObjectId(data.characterId),
    rarity: parseInt(data.rarity) || 5,
    stellactrum: toCapitalized(data.stellactrum),
    time: toCapitalized(data.time),
    pairedSolarId: toObjectId(data.pairedSolarId),
    pairMemoryId: toObjectId(data.pairMemoryId),
    pairBonusId: toObjectId(data.pairBonusId),
    flavorText: data.flavorText || null,
    outfitId: toObjectId(data.outfitId),
    eventId: toObjectId(data.eventId),
    obtain: formattedObtain,
    talent: data.talent || {},
    stats: formatStats(data.stats),
    releaseDate: data.releaseDate ? new Date(data.releaseDate) : null,
    dateAdded: new Date(),
    imageUrl: data.imageUrl || null,
  };
};

export const handlePairedMemory = async (col, memoryData, newId) => {
  const pairedId = memoryData.pairedSolarId;
  if (!pairedId) return;

  if (memoryData.time === "Solar") {
    const result = await col.updateOne(
      { _id: pairedId },
      { $set: { pairedSolarId: newId } }
    );

    if (result.matchedCount === 0) {
      console.warn(
        `[handlePairedMemory] Warning: No memory found with _id=${pairedId} to link.`
      );
    } else {
      console.log(
        `[handlePairedMemory] Linked Solar ${newId} ↔ Solar ${pairedId}`
      );
    }
  } else if (memoryData.time === "Lunar") {
    throw new Error("Lunar memories cannot have a pairedSolarId");
  }
};
