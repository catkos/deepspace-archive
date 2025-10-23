const API_URL = process.env.NEXT_PUBLIC_API_URL;

const memoriesApi = {
  async getAll() {
    const res = await fetch(`${API_URL}/memories`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch memories");
    return res.json();
  },

  async getById(id: string) {
    const res = await fetch(`${API_URL}/memories/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch memory");
    return res.json();
  },
};

export default memoriesApi;
