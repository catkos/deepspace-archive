import { Memory } from "@/lib/types";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/memories/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    console.error("❌ Fetch failed:", res.status);
    return <div>Memory not found</div>;
  }

  const json = await res.json();
  if (!json.success) return <div>Memory not found</div>;

  const memory: Memory = json.data;

  return (
    <main className="p-5 text-white">
      <div className="flex flex-row w-full">
        <div className="basis-2/4 w-full md:w-[400px] h-[600px] aspect-square rounded-md mb-4 bg-gray-200 relative overflow-hidden">
          {memory.imageUrl ? (
            <img
              src={memory.imageUrl}
              alt={memory.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-sm flex items-center justify-center h-full w-full">
              No Image
            </span>
          )}
        </div>
        <div className="w-full">
          <div className="w-80 grid grid-cols-2 pl-10 gap-y-5">
            <p>Name</p>
            <p>{memory.name}</p>
            <p>Character</p>
            <p>{memory.characterName}</p>
            <p>Rarity</p>
            <p>{memory.rarity}</p>
            <p>Stellactrum</p>
            <p>{memory.stellactrum}</p>
            <p>Time</p>
            <p>{memory.time}</p>
            <p>Release Date</p>
            <p>{memory.releaseDate ? memory.releaseDate : "?"}</p>
          </div>
          {/* STATS */}
          <div className="w-full">
            <p>hihfij</p>
          </div>
        </div>
      </div>
    </main>
  );
}
