import client from "./mongodb.js";

async function createMemoryNameIndex() {
  try {
    await client.connect();
    const db = client.db("ds-archive");
    const collection = db.collection("memories");

    console.log("🚀 Creating unique, case-insensitive index on 'name'...");

    await collection.createIndex(
      { name: 1 },
      {
        unique: true,
        collation: { locale: "en", strength: 2 }, // strength:2 makes it case-insensitive
        name: "unique_name_index",
        background: true, // build index without locking writes
      }
    );

    console.log("✅ Unique index created successfully on 'name'!");
  } catch (err) {
    if (err.code === 11000) {
      console.error(
        "❌ Duplicate names found — resolve them before creating the index."
      );
    } else {
      console.error("❌ Failed to create index:", err);
    }
  } finally {
    await client.close();
  }
}

createMemoryNameIndex();
