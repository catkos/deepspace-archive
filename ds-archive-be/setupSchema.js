import client from "./mongodb.js";

async function setupMemorySchema() {
  try {
    await client.connect();
    const db = client.db("ds-archive");

    console.log("🧩 Applying fresh validator to 'memories'...");

    // 🧠 Overwrite schema validator completely
    const result = await db.command({
      collMod: "memories",
      validator: {
        $jsonSchema: {
          bsonType: "object",
          required: ["name", "characterId", "rarity", "time", "stats"],
          properties: {
            name: {
              bsonType: "string",
              // ✅ Updated regex — now allows multiple words, digits, and mixed case
              pattern: "^[A-Z][a-zA-Z0-9]*(?:[\\s\\-'][A-Z0-9][a-zA-Z0-9]*)*$",
              description:
                "Memory name must be in title case, allows digits (e.g., 'Test 2', 'Sun-Bound Promise').",
            },
            characterId: { bsonType: "objectId" },
            rarity: { bsonType: "int", minimum: 1, maximum: 5 },
            time: { bsonType: "string", enum: ["Solar", "Lunar"] },
            pairedSolarId: { bsonType: ["objectId", "null"] },
            pairMemoryId: { bsonType: ["objectId", "null"] },
            pairBonusId: { bsonType: ["objectId", "null"] },
            flavorText: { bsonType: ["string", "null"] },
            outfitId: { bsonType: ["objectId", "null"] },
            eventId: { bsonType: ["objectId", "null"] },
            obtain: {
              bsonType: ["array", "null"],
              items: { bsonType: "string" },
            },
            talent: { bsonType: ["object", "null"] },
            stats: {
              bsonType: "object",
              required: ["hp", "attack", "defense", "critDmg"],
              properties: {
                hp: { bsonType: "object" },
                attack: { bsonType: "object" },
                defense: { bsonType: "object" },
                critDmg: { bsonType: "object" },
              },
            },
            releaseDate: { bsonType: ["date", "null"] },
            dateAdded: { bsonType: "date" },
            imageUrl: { bsonType: ["string", "null"] },
          },
        },
      },
      validationLevel: "moderate",
    });

    console.log("✅ Schema successfully applied:", result);

    // 🧾 Check and print the current validator
    const collInfo = await db.listCollections({ name: "memories" }).toArray();
    if (collInfo.length > 0 && collInfo[0].options?.validator) {
      console.log("\n🔍 Current validator on 'memories':");
      console.dir(collInfo[0].options.validator, { depth: null });
    } else {
      console.warn("⚠️ No validator found in collection metadata!");
    }
  } catch (err) {
    if (err.codeName === "NamespaceNotFound") {
      console.log(
        "⚠️ Collection not found, creating 'memories' with validator..."
      );
      const db = client.db("ds-archive");
      await db.createCollection("memories", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "characterId", "rarity", "time", "stats"],
            properties: {
              name: {
                bsonType: "string",
                pattern:
                  "^[A-Z][a-zA-Z0-9]*(?:[\\s\\-'][A-Z0-9][a-zA-Z0-9]*)*$",
              },
              characterId: { bsonType: "objectId" },
              rarity: { bsonType: ["int", "double"], minimum: 1, maximum: 5 },
              time: { bsonType: "string", enum: ["Solar", "Lunar"] },
              stats: { bsonType: "object" },
            },
          },
        },
        validationLevel: "moderate",
      });
      console.log("✅ Collection 'memories' created with validator!");
    } else {
      console.error("❌ Failed to apply schema:", err);
    }
  } finally {
    await client.close();
  }
}

setupMemorySchema();
