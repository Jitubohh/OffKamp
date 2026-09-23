import {
  Wifi, Zap, Fuel, Droplets, ShieldCheck,
  Car, Dumbbell, BookOpen, CookingPot, Sofa,
  type LucideIcon,
} from "lucide-react";
import type { Database } from "@/lib/database.types";

export type Facility = Database["public"]["Enums"]["facility_kind"];

export const FACILITIES: { value: Facility; label: string; icon: LucideIcon }[] = [
  { value: "wifi",           label: "Wi-Fi",          icon: Wifi },
  { value: "power_24_7",     label: "24/7 power",     icon: Zap },
  { value: "generator",      label: "Generator",      icon: Fuel },
  { value: "borehole_water", label: "Borehole water", icon: Droplets },
  { value: "security",       label: "Security",       icon: ShieldCheck },
  { value: "parking",        label: "Parking",        icon: Car },
  { value: "gym",            label: "Gym",            icon: Dumbbell },
  { value: "study_room",     label: "Study room",     icon: BookOpen },
  { value: "kitchen",        label: "Kitchen",        icon: CookingPot },
  { value: "common_room",    label: "Common room",    icon: Sofa },
];

export const FACILITY_VALUES = FACILITIES.map((f) => f.value);