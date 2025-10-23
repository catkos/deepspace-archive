type CharacterName = "Xavier" | "Rafayel" | "Zayne" | "Sylus" | "Caleb";

type StellactrumType =
  | "Emerald"
  | "Amber"
  | "Ruby"
  | "Sapphire"
  | "Violet"
  | "Pearl";

type TimeType = 0 | 1;

type StatBlock = {
  baseDefault: number;
  maxDefault?: number;
  maxRank1?: number;
  maxRank2?: number;
  maxRank3?: number;
};

type Memory = {
  _id: string;
  name: string;
  character: CharacterName;
  rarity: number;
  stellactrum: StellactrumType;
  time?: TimeType;
  pairedSolarId?: string | null;
  talent: string;
  stats: {
    hp: StatBlock;
    attack: StatBlock;
    defense: StatBlock;
    critDmg: StatBlock;
  };
  releaseDate?: string;
  createdAt?: string;
  imageUrl?: string;
};
