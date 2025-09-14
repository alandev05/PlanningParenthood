export type Program = {
    id: string;
    title: string;
    priceMonthly?: number | null; // null means free
    distanceMiles: number;
    ageRange: [number, number];
    why: string;
    address?: string;
    phone?: string;
    latitude?: number;
    longitude?: number;
  };
  
  export type TraitWeights = {
    creative: number;
    analytical: number;
    team: number;
    solo: number;
    // extendable
  };
  
  export type Plan = {
    id: string;
    title: string;
    programs: Program[];
    estimatedMonthly: number;
    rationale: string;
  };