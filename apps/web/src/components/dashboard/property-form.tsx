"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, Music2 } from "lucide-react";
import { saveProperty, type FormState } from "@/app/dashboard/actions";
import { Field, TextArea, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multi-select";
import { LocationPicker, type SchoolPin } from "./location-picker";
import { FACILITIES, type Facility } from "@/lib/facilities";
import { easePremium } from "@/lib/motion";
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
      <Field
        label="Property name"
        name="name"
        defaultValue={property?.name}
        placeholder="Legacy Palazzo"
        required
      />

      <MultiSelect
        name="school_ids"
        label="Which schools do you serve?"
        hint="Pick every campus your students come from."
        options={schools.map((s) => ({ value: s.id, label: s.name }))}
        initial={selectedSchoolIds}
        placeholder="Select schools"
      />

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
        initial={
          property?.lat != null && property?.lng != null
            ? { lat: property.lat, lng: property.lng }
            : null
        }
        initialAccuracy={property?.location_accuracy_m ?? null}
      />

      <Field
        label="Landmark note (optional)"
        name="distance_note"
        defaultValue={property?.distance_note ?? ""}
        placeholder="10 minutes from the Nile back gate"
        hint="In your own words - students trust this more than a number."
      />

      <Select
        label="Who can stay here?"
        name="gender_pref"
        defaultValue={property?.gender_pref}
        required
      >
        <option value="">Select</option>
        <option value="male">Male only</option>
        <option value="female">Female only</option>
        <option value="mixed">Mixed</option>
      </Select>

      <TextArea
        label="About this property (optional)"
        name="description"
        defaultValue={property?.description ?? ""}
        placeholder="24/7 power, borehole water, secure gate..."
      />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">What does this place have?</legend>
        <p className="mb-3 text-xs text-muted">
          Students filter by these. Only tick what you actually offer.
        </p>
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

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-ink">Socials (optional)</legend>
        <p className="mb-3 text-xs text-muted">
          Photos and videos of your place build trust faster than anything else.
        </p>
        <div className="grid gap-5 sm:grid-cols-2">
          <SocialField
            name="instagram"
            label="Instagram"
            icon={<Camera size={16} />}
            defaultValue={property?.instagram ?? ""}
          />
          <SocialField
            name="tiktok"
            label="TikTok"
            icon={<Music2 size={16} />}
            defaultValue={property?.tiktok ?? ""}
          />
        </div>
      </fieldset>

      <AnimatePresence>
        {state.error ? (
          <motion.p
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
          >
            {state.error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <SubmitButton pendingLabel="Saving...">
        {property ? "Save changes" : "Create property"}
      </SubmitButton>
    </motion.form>
  );
}

function SocialField({
  name, label, icon, defaultValue,
}: {
  name: string;
  label: string;
  icon: React.ReactNode;
  defaultValue: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-ink">
        {icon}
        {label}
      </span>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-muted">
          @
        </span>
        <input
          type="text"
          name={name}
          defaultValue={defaultValue}
          placeholder="yourhandle"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          className="h-14 w-full rounded-2xl border border-line bg-surface pl-9 pr-4 text-[16px] text-ink outline-none transition placeholder:text-muted/60 focus:border-brand-deep focus:bg-white focus:ring-4 focus:ring-brand/50"
        />
      </div>
    </label>
  );
}