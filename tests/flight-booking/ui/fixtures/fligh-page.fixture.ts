
const cabinClassOptions = ["Economy", "Premium Economy", "Business", "First"] as const;
type CabinClass = (typeof cabinClassOptions)[number];

export type FlightBookingFixtures = {
  cabinClass: CabinClass;
};