import MemoriesClient from "./memoriesClient";

export default async function MemoriesPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const res = await fetch(`${API_URL}/memory`, { cache: "no-store" });

  if (!res.ok) {
    throw new Error(`Failed to fetch memories: ${res.status}`);
  }

  const result = await res.json();
  const memories = result.data;

  return <MemoriesClient initialMemories={memories} />;
}
