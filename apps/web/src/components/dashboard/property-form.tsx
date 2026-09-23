"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveProperty, type FormState } from "@/app/dashboard/actions";
import { Field, TextArea, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { LocationPicker, type SchoolPin } from "./location-picker";
import { easePremium } from "@/lib/motion";
import { FACILITIES } from "@/lib/facilities";
import type { Facility } from "@/lib/facilities";
import type { Database } from "@/lib/database.types";

type Property = Database["public"]["Tables"]["properties"]["Row"] & {
  property_schools?: { school_id: string }[];
  property_facilities?: { facility: Facility }[];
};

export function PropertyForm({
  schools, property, selectedSchoolIds, selectedFacilities,
}: {
  schools: SchoolPin[];
  property: Property | null;
  selectedSchoolIds: string[];
  selectedFacilities: Facility[];
}) {
  const [state, formAction] = useActionState(saveProperty, {} as FormState);

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="space-y-6"
    >
      <Field label="Property name" name="name" defaultValue={property?.name} placeholder="Legacy Palazzo" required />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Which schools do you serve?</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {schools.map((s) => (
            <label
              key={s.id}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-surface p-4 transition has-[:checked]:border-brand-deep has-[:checked]:bg-brand/30"
            >
              <input
                type="checkbox"
                name="school_ids"
                value={s.id}
                defaultChecked={selectedSchoolIds.includes(s.id)}
                className="h-5 w-5 accent-[color:var(--color-brand-ink)]"
              />
              <span className="text-[15px] font-medium text-ink">{s.name}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Area"
        name="location"
        defaultValue={property?.location}
        placeholder="Jabi"
        hint="The neighbourhood students would recognise."
        required
      />

      <Field
        label="Street address (optional)"
        name="address"
        defaultValue={property?.address ?? ""}
        placeholder="12 Aminu Kano Crescent, behind the filling station"
      />

      <LocationPicker
        schools={schools}
        initial={property?.lat != null && property?.lng != null ? { lat: property.lat, lng: property.lng } : null}
        initialAccuracy={property?.location_accuracy_m ?? null}
      />

      <Field
        label="Landmark note (optional)"
        name="distance_note"
        defaultValue={property?.distance_note ?? ""}
        placeholder="10 minutes from the Nile back gate"
        hint="In your own words — students trust this more than a number."
      />

      <Select label="Gender Preference?" name="gender_pref" defaultValue={property?.gender_pref} required>
        <option value="">Select</option>
        <option value="male">Male only</option>
        <option value="female">Female only</option>
        <option value="mixed">Mixed</option>
      </Select>

      <TextArea
        label="About this property (optional)"
        name="description"
        defaultValue={property?.description ?? ""}
        placeholder="24/7 power, borehole water, secure gate…"
      />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">What does this place have?</legend>
        <p className="mb-3 text-xs text-muted">Students filter by these. Only tick what you actually offer.</p>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {FACILITIES.map(({ value, label, icon: Icon }) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 py-3 transition has-[:checked]:border-brand-deep has-[:checked]:bg-brand/30"
            >
              <input
                type="checkbox"
                name="facilities"
                value={value}
                defaultChecked={selectedFacilities.includes(value)}
                className="sr-only"
              />
              <Icon size={17} className="shrink-0 text-brand-ink" />
              <span className="text-sm font-medium text-ink">{label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="WhatsApp number"
          name="contact_whatsapp"
          type="tel"
          defaultValue={property?.contact_whatsapp ?? ""}
          placeholder="0803 123 4567"
          hint="Students message you here."
          required
        />
        <Field
          label="Call-only number (optional)"
          name="contact_phone"
          type="tel"
          defaultValue={property?.contact_phone ?? ""}
          placeholder="If different from WhatsApp"
        />
      </div>

      <AnimatePresence>
        {state.error && (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {state.error}
          </motion.p>
        )}
      </AnimatePresence>

      <SubmitButton pendingLabel="Saving…">
        {property ? "Save changes" : "Create property"}
      </SubmitButton>
    </motion.form>
  );
}