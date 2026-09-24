"use client";

import { useActionState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { saveRoom, type FormState } from "@/app/dashboard/rooms/actions";
import { Field, Select } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/button";
import { AmenityRow, type AmenityValue } from "./amenity-row";
import { AMENITIES, PERIODS, type Amenity } from "@/lib/pricing";
import { easePremium } from "@/lib/motion";
import type { Database } from "@/lib/database.types";
import { PriceInputs } from "@/components/ui/price-inputs";

type Room = Database["public"]["Tables"]["room_types"]["Row"];

export function RoomForm({
  room, amenities, showTri,
}: {
  room: Room | null;
  amenities: Record<Amenity, AmenityValue> | Record<string, never>;
  showTri: boolean;
}) {
  const [state, formAction] = useActionState(saveRoom, {} as FormState);
  const periods = showTri ? PERIODS : PERIODS.filter((p) => p.key !== "tri_semester");

  return (
    <motion.form
      action={formAction}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: easePremium }}
      className="space-y-6"
    >
      {room && <input type="hidden" name="room_id" value={room.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="How many people share this room?" name="capacity" defaultValue={room?.capacity ?? ""} required>
          <option value="">Select</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n === 1 ? "Single (1 person)" : `${n} people`}</option>
          ))}
        </Select>

        <Select label="Availability" name="availability" defaultValue={room?.availability ?? "available"}>
          <option value="available">Available</option>
          <option value="full">Full</option>
        </Select>
      </div>

      <Field
        label="Room name (optional)"
        name="label"
        defaultValue={room?.label ?? ""}
        placeholder="Ensuite, Block B"
        hint="Only if you want to distinguish it from a similar room."
      />

      <fieldset>
       <legend className="mb-1 text-sm font-semibold text-ink">Price per bed space</legend>
       <p className="mb-3 text-xs text-muted">
       What one student pays. Session autofills to double the semester price - change it if you discount.
       </p>
       <PriceInputs
        prefix="price"
        periods={periods.map((p) => ({ key: p.key, label: p.label }))}
        initial={{
        semester: room?.price_semester ?? null,
        session: room?.price_session ?? null,
        tri_semester: room?.price_tri_semester ?? null,
        }}
        />
      </fieldset>

      <fieldset>
        <legend className="mb-1 text-sm font-semibold text-ink">Services</legend>
        <p className="mb-3 text-xs text-muted">
          Included means it's in the price. Extra cost lets students add it and see the new total.
        </p>
        <div className="space-y-3">
          {AMENITIES.map((a) => (
            <AmenityRow
              key={a.value}
              amenity={a.value}
              label={a.label}
              hint={a.hint}
              initial={amenities[a.value] ?? null}
              showTri={showTri}
            />
          ))}
        </div>
      </fieldset>

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

      <SubmitButton pendingLabel="Saving…">{room ? "Save room" : "Add room"}</SubmitButton>
    </motion.form>
  );
}