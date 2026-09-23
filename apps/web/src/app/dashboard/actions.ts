"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { haversineKm } from "@/lib/geo";
import { FACILITY_VALUES, type Facility } from "@/lib/facilities";

export type FormState = { error?: string };

const GENDERS = ["male", "female", "mixed"] as const;
type Gender = (typeof GENDERS)[number];

/** "" -> null, otherwise a finite number, otherwise undefined (= invalid) */
function numOrNull(raw: FormDataEntryValue | null): number | null | undefined {
  const s = String(raw ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

export async function saveProperty(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const rawGender = String(formData.get("gender_pref") ?? "");
  const whatsapp = String(formData.get("contact_whatsapp") ?? "").trim();
  const phone = String(formData.get("contact_phone") ?? "").trim();

  // getAll: one value per checked school checkbox
  const schoolIds = formData.getAll("school_ids").map(String).filter(Boolean);
  const facilities = formData.getAll("facilities").map(String).filter(Boolean);

  const lat = numOrNull(formData.get("lat"));
  const lng = numOrNull(formData.get("lng"));
  const accuracy = numOrNull(formData.get("location_accuracy_m"));

  if (!name || !location) return { error: "Fill in every required field." };
  if (schoolIds.length === 0) return { error: "Pick at least one school." };
  if (!GENDERS.includes(rawGender as Gender)) return { error: "Pick a gender preference." };
  const PHONE_RE = /^\+?[0-9\s-]{7,20}$/;
  if (!PHONE_RE.test(whatsapp)) return { error: "Enter a valid WhatsApp number." };
  if (phone && !PHONE_RE.test(phone)) return { error: "That call-only number doesn't look right." };
  if (lat === undefined || lng === undefined) return { error: "That location didn't look right. Drop the pin again." };
  if ((lat === null) !== (lng === null)) return { error: "Location is incomplete. Drop the pin again." };

  const hasPin = lat !== null && lng !== null;

  // ---- 1. upsert the property, get its id back --------------------
  const { data: property, error: propError } = await supabase
    .from("properties")
    .upsert(
      {
        owner_id: user.id,
        name,
        description: String(formData.get("description") ?? "").trim() || null,
        location,
        address: String(formData.get("address") ?? "").trim() || null,
        distance_note: String(formData.get("distance_note") ?? "").trim() || null,
        gender_pref: rawGender as Gender,
        contact_whatsapp: whatsapp,
        contact_phone: phone || null,
        lat,
        lng,
        location_accuracy_m: accuracy ?? null,
        location_set_at: hasPin ? new Date().toISOString() : null,
      },
      { onConflict: "owner_id" }
    )
    .select("id")
    .single();

  if (propError || !property) return { error: propError?.message ?? "Couldn't save your property." };

  // ---- 2. distances to each selected school -----------------------
  const { data: schools } = await supabase
    .from("schools")
    .select("id, lat, lng")
    .in("id", schoolIds);

  const rows = (schools ?? []).map((s) => ({
    property_id: property.id,
    school_id: s.id,
    distance_km:
      hasPin && s.lat !== null && s.lng !== null
        ? Number(haversineKm({ lat, lng }, { lat: s.lat, lng: s.lng }).toFixed(2))
        : null,
  }));

  // ---- 3. replace the join rows -----------------------------------
  const { error: delError } = await supabase
    .from("property_schools")
    .delete()
    .eq("property_id", property.id)
    .not("school_id", "in", `(${schoolIds.join(",")})`);
  if (delError) return { error: delError.message };

  const { error: linkError } = await supabase
    .from("property_schools")
    .upsert(rows, { onConflict: "property_id,school_id" });
  if (linkError) return { error: linkError.message };

  // ---- 4. replace facility rows -----------------------------------
  const validFacilities = facilities.filter((f) =>
    (FACILITY_VALUES as string[]).includes(f)
  ) as Facility[];

  let facDelete = supabase.from("property_facilities").delete().eq("property_id", property.id);
  if (validFacilities.length > 0) {
    facDelete = facDelete.not("facility", "in", `(${validFacilities.join(",")})`);
  }
  const { error: facDelError } = await facDelete;
  if (facDelError) return { error: facDelError.message };

  if (validFacilities.length > 0) {
    const { error: facError } = await supabase
      .from("property_facilities")
      .upsert(
        validFacilities.map((f) => ({ property_id: property.id, facility: f })),
        { onConflict: "property_id,facility" }
      );
    if (facError) return { error: facError.message };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}