export type CharacterId = string; // MongoDB ObjectId as string

export type StellactrumType =
  | "Emerald"
  | "Amber"
  | "Ruby"
  | "Sapphire"
  | "Violet"
  | "Pearl";

export type TimeType = 0 | 1;

export type StatBlock = {
  baseDefault: number;
  maxDefault?: number;
  maxRank1?: number;
  maxRank2?: number;
  maxRank3?: number;
};

export type Memory = {
  _id: string;
  name: string;
  characterId: CharacterId;
  rarity: number;
  stellactrum: StellactrumType;
  time: TimeType;
  pairMemoryId?: string | null;
  pairBonusId?: string | null;
  flavorText?: string;
  obtain: string[];
  talent: string;
  stats: {
    hp: StatBlock;
    attack: StatBlock;
    defense: StatBlock;
    critDmg: StatBlock;
  };
  releaseDate?: string;
  dateAdded?: string;
  imageUrl?: string;
  characterName: string;
};
