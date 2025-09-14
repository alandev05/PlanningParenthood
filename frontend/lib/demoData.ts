import { Program } from '../types';

export const DEMO_ZIP = '02139';

export const demoPrograms: Program[] = [
  {
    id: 'p1',
    title: 'Cambridge Kids STEM Lab',
    priceMonthly: 60,
    distanceMiles: 1.2,
    ageRange: [6, 12],
    why: 'Hands-on STEM projects that boost curiosity and problem-solving.',
    address: '123 Science Rd, Cambridge, MA',
    phone: '(617) 555-0101',
    latitude: 42.3736,
    longitude: -71.1097,
  },
  {
    id: 'p2',
    title: 'Neighborhood Soccer Club (Scholarships)',
    priceMonthly: 0,
    distanceMiles: 0.8,
    ageRange: [5, 14],
    why: 'Team sport to build social skills and healthy habits.',
    address: 'Park Field, Cambridge, MA',
    phone: '(617) 555-0202',
    latitude: 42.3751,
    longitude: -71.1056,
  },
  {
    id: 'p3',
    title: 'City Library Creative Writing',
    priceMonthly: 10,
    distanceMiles: 0.5,
    ageRange: [8, 16],
    why: 'Boosts language, imagination, and expressive skills.',
    address: 'Central Library, Cambridge, MA',
    phone: '(617) 555-0303',
    latitude: 42.3770,
    longitude: -71.1167,
  },
  {
    id: 'p4',
    title: 'Art Explorers Studio',
    priceMonthly: 120,
    distanceMiles: 2.5,
    ageRange: [4, 10],
    why: 'Creative play focusing on materials and divergent thinking.',
    address: 'Art Ave, Cambridge, MA',
    phone: '(617) 555-0404',
    latitude: 42.3601,
    longitude: -71.0942,
  },
  {
    id: 'p5',
    title: 'Weekend Nature Walks (Free)',
    priceMonthly: 0,
    distanceMiles: 3.1,
    ageRange: [3, 12],
    why: 'Outdoor activity emphasizing curiosity, health, and low cost.',
    address: 'River Trail, Cambridge, MA',
    phone: '(617) 555-0505',
    latitude: 42.3584,
    longitude: -71.0598,
  },
];

export function fetchDemoPrograms({ zip, age, maxDistance = 10, maxBudget = 1000 }:{zip?: string; age?: number; maxDistance?: number; maxBudget?: number}) {
  // Basic offline filtering that ensures at least one free/low-cost option is included
  let list = demoPrograms.filter((p) => {
    const fitsAge = age == null || (age >= p.ageRange[0] && age <= p.ageRange[1]);
    const fitsDistance = p.distanceMiles <= maxDistance;
    const fitsBudget = p.priceMonthly == null || p.priceMonthly <= maxBudget;
    return fitsAge && fitsDistance && fitsBudget;
  });

  // Ensure at least one free/low-cost option
  const freeOrLow = list.filter((p) => (p.priceMonthly ?? 0) <= 20);
  if (freeOrLow.length === 0) {
    const fallback = demoPrograms.filter((p) => (p.priceMonthly ?? 0) <= 20);
    list = [...fallback, ...list].slice(0, 6);
  }

  return list;
}