"use client";
import Link from "next/link";
import { useState } from "react";

type MemoriesClientProps = {
  initialMemories: Memory[];
};

const characterIcon: Record<string, string> = {
  Xavier: "🪐",
  Rafayel: "🌊",
  Zayne: "❄️",
  Sylus: "🐦‍⬛",
  Caleb: "🍎",
};

export default function MemoriesClient({
  initialMemories,
}: MemoriesClientProps) {
  const [memories, setMemories] = useState(initialMemories);
  const [filters, setFilters] = useState({
    character: "",
    rarity: "",
    stellactrum: "",
    time: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFilterChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/memory?${params.toString()}`
      );
      const data = await response.json();
      setMemories(data.data);
    } catch (error) {
      console.error("Error fetching memories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="p-5 text-white">
        <h2 className="text-lg font-semibold mb-3">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            name="character"
            value={filters.character}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">All Characters</option>
            <option value="Xavier">Xavier</option>
            <option value="Rafayel">Rafayel</option>
            <option value="Zayne">Zayne</option>
            <option value="Sylus">Sylus</option>
            <option value="Caleb">Caleb</option>
          </select>

          <select
            name="rarity"
            value={filters.rarity}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">All Rarities</option>
            <option value="3">3 Star</option>
            <option value="4">4 Star</option>
            <option value="5">5 Star</option>
          </select>

          <select
            name="stellactrum"
            value={filters.stellactrum}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">All Stellactrum</option>
            <option value="Emerald">Emerald</option>
            <option value="Amber">Amber</option>
            <option value="Ruby">Ruby</option>
            <option value="Sapphire">Sapphire</option>
            <option value="Violet">Violet</option>
            <option value="Pearl">Pearl</option>
          </select>

          <select
            name="time"
            value={filters.time}
            onChange={handleFilterChange}
            className="p-2 border rounded"
          >
            <option value="">All Time</option>
            <option value="0">Solar</option>
            <option value="1">Lunar</option>
            {/* Add your time options */}
          </select>
        </div>
      </section>

      <section>
        {loading && <div className="text-center py-8">Loading...</div>}

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 h-full">
          {memories.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No cards found matching your criteria.
            </div>
          ) : (
            memories.map((memory: Memory) => (
              <Link
                href={`/memories/${memory._id}`}
                key={memory._id}
                className="backdrop-blur-[1px] rounded-xl bg-black/40 shadow-lg flex flex-col h-full"
              >
                {/* Card Image */}
                <div className="w-full aspect-square rounded-t-md mb-4 bg-gray-200 relative overflow-hidden">
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

                  {memory.time !== undefined && memory.time !== null && (
                    <div className="absolute top-2 left-2 text-xs font-semibold px-2 py-1">
                      {memory.time === 0 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#7e8162"
                            fill-rule="evenodd"
                            d="M12.884 1.03L12 .146l-.884.884l-2.72 2.72H3.75v4.646l-2.72 2.72L.146 12l.884.884l2.72 2.72v4.646h4.646l2.72 2.72l.884.884l.884-.884l2.72-2.72h4.646v-4.646l2.72-2.72l.884-.884l-.884-.884l-2.72-2.72V3.75h-4.646zM9.798 5.884L12 3.682l2.202 2.202l.366.366h3.182v3.182l.366.366L20.318 12l-2.202 2.202l-.366.366v3.182h-3.182l-.366.366L12 20.318l-2.202-2.202l-.366-.366H6.25v-3.182l-.366-.366L3.682 12l2.202-2.202l.366-.366V6.25h3.182zM12 16a4 4 0 1 0 0-8a4 4 0 0 0 0 8"
                            clip-rule="evenodd"
                          />
                        </svg>
                      ) : memory.time === 1 ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="#7e8162"
                            d="M9.272 2.406a1 1 0 0 0-1.23-1.355C6.59 1.535 5.432 2.488 4.37 3.55a11.4 11.4 0 0 0 0 16.182c4.518 4.519 11.51 4.261 15.976-.205c1.062-1.062 2.014-2.22 2.498-3.673A1 1 0 0 0 21.55 14.6c-3.59 1.322-7.675.734-10.433-2.025C8.35 9.808 7.788 5.744 9.272 2.406"
                          />
                        </svg>
                      ) : (
                        memory.time
                      )}
                    </div>
                  )}

                  {memory.stellactrum && (
                    <div className="absolute top-2 right-2 bg-white/80 text-xs font-semibold text-gray-800 px-2 py-1 rounded shadow">
                      {memory.stellactrum}
                    </div>
                  )}
                </div>

                {/* Card Details */}
                <div className="flex flex-col h-80">
                  <div className="px-5 text-white flex flex-col gap-3 grow">
                    <h3 className="text-lg font-bold capitalize">
                      {memory.name}
                    </h3>
                    <div className="flex">
                      {Array.from({ length: memory.rarity }, (_, i) => (
                        <span key={i} className="pr-1 rotate-20">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                          >
                            <path
                              fill="#7e8162"
                              fillRule="evenodd"
                              d="M7.935.655c-.318-.873-1.552-.873-1.87 0L4.622 4.622L.655 6.065c-.873.318-.873 1.552 0 1.87l3.967 1.443l1.443 3.967c.318.873 1.552.873 1.87 0l1.443-3.967l3.967-1.443c.873-.318.873-1.552 0-1.87L9.378 4.622z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        </span>
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="">
                        {characterIcon[memory.character] &&
                          `${characterIcon[memory.character]} `}
                        {memory.character}
                      </span>
                    </div>

                    {memory.talent && <p className="">{memory.talent}</p>}
                  </div>

                  {/* Stats */}
                  <div className="p-5 bg-black/50 rounded-b-xl text-white">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <strong>HP:</strong> {memory.stats.hp.baseDefault}
                      </div>
                      <div>
                        <strong>Attack:</strong>{" "}
                        {memory.stats.attack.baseDefault}
                      </div>
                      <div>
                        <strong>Defense:</strong>{" "}
                        {memory.stats.defense.baseDefault}
                      </div>
                      <div>
                        <strong>Crit Dmg:</strong>{" "}
                        {memory.stats.critDmg.baseDefault}%
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </>
  );
}
