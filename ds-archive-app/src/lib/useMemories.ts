import axios from "axios";
import { useCallback } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const useMemories = () => {
  const getMemories = useCallback(async () => {
    const res = await fetch(`${API_URL}/memory`, { cache: "no-store" });

    if (!res.ok) {
      throw new Error(`Failed to fetch memories: ${res.status}`);
    }

    const result = await res.json();

    return result.data;
  }, []);

  return {
    getMemories,
  };
};

export default useMemories;
