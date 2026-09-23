"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { ImagePlus, Trash2, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { attachPhoto, deletePhoto, movePhoto } from "@/app/dashboard/rooms/photos/actions";
import { easePremium } from "@/lib/motion";

export type Photo = { id: string; storage_path: string; position: number };

const MAX_PHOTOS = 3;

export function PhotoManager({
  roomId, userId, photos, publicBase,
}: {
  roomId: string;
  userId: string;
  photos: Photo[];
  publicBase: string;
}) {
  const [busy, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const full = photos.length >= MAX_PHOTOS;

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const room = MAX_PHOTOS - photos.length;
    const chosen = Array.from(files).slice(0, room);
    if (chosen.length < files.length) {
      setError(`Only ${room} slot${room === 1 ? "" : "s"} left — extra photos were skipped.`);
    }

    setUploading(true);
    const supabase = createClient();

    for (const file of chosen) {
      try {
        if (!file.type.startsWith("image/")) {
          setError("Only image files, please.");
          continue;
        }

        const compressed = await imageCompression(file, {
          maxWidthOrHeight: 1600,
          maxSizeMB: 0.4,
          useWebWorker: true,
          fileType: "image/webp",
        });

        const path = `${userId}/${roomId}/${crypto.randomUUID()}.webp`;

        const { error: upError } = await supabase
          .storage.from("room-photos")
          .upload(path, compressed, { contentType: "image/webp", upsert: false });

        if (upError) { setError(upError.message); continue; }

        const res = await attachPhoto(roomId, path);
        if (res.error) {
          await supabase.storage.from("room-photos").remove([path]);
          setError(res.error);
        }
      } catch {
        setError("That photo couldn't be processed. Try another.");
      }
    }

    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">Photos</span>
        <span className="text-xs text-muted">{photos.length} of {MAX_PHOTOS}</span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <AnimatePresence initial={false}>
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: easePremium }}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-surface"
            >
              <Image
                src={`${publicBase}/${photo.storage_path}`}
                alt=""
                fill
                sizes="(max-width: 640px) 33vw, 200px"
                className="object-cover"
              />

              {i === 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink">
                  Cover
                </span>
              )}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <div className="flex gap-1">
                  <IconBtn
                    disabled={i === 0 || busy}
                    label="Move left"
                    onClick={() => startTransition(() => { movePhoto(photo.id, roomId, -1); })}
                  >
                    <ChevronLeft size={14} />
                  </IconBtn>
                  <IconBtn
                    disabled={i === photos.length - 1 || busy}
                    label="Move right"
                    onClick={() => startTransition(() => { movePhoto(photo.id, roomId, 1); })}
                  >
                    <ChevronRight size={14} />
                  </IconBtn>
                </div>
                <IconBtn
                  disabled={busy}
                  label="Delete photo"
                  onClick={() => startTransition(() => { deletePhoto(photo.id, roomId); })}
                >
                  <Trash2 size={14} />
                </IconBtn>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!full && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-line bg-surface transition hover:border-brand-deep hover:bg-brand/20">
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              disabled={uploading}
              onChange={(e) => handleFiles(e.target.files)}
            />
            {uploading ? (
              <Loader2 size={22} className="animate-spin text-brand-ink" />
            ) : (
              <>
                <ImagePlus size={22} className="text-brand-ink" />
                <span className="text-xs font-semibold text-muted">Add photo</span>
              </>
            )}
          </label>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <p className="text-xs text-muted">
        First photo is the cover students see. Landscape shots of the actual room work best.
      </p>
    </div>
  );
}

function IconBtn({
  children, label, onClick, disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-lg bg-white/90 p-1.5 text-ink transition hover:bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}