"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Users, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { formatNaira } from "@/lib/pricing";
import { FACILITIES } from "@/lib/facilities";
import type { Listing } from "@/lib/listings";

const GENDER_LABEL = { male: "Male only", female: "Female only", mixed: "Mixed" } as const;

export function ListingCard({
  listing, publicBase, schoolName,
}: {
  listing: Listing;
  publicBase: string;
  schoolName: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const href = `/property/${listing.id}`;
  const photos = listing.photos;
  const topFacilities = FACILITIES.filter((f) => listing.facilities.includes(f.value)).slice(0, 3);

  function scrollTo(next: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  function handleScroll() {
    const el = scroller.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  }

  return (
    <article className="group relative">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card bg-surface">
        {photos.length === 0 ? (
          <Link href={href} className="flex h-full flex-col items-center justify-center gap-2 text-muted">
            <ImageOff size={28} />
            <span className="text-xs font-medium">No photos yet</span>
          </Link>
        ) : (
          <div
            ref={scroller}
            onScroll={handleScroll}
            className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
          >
            {photos.map((path, i) => (
              <Link
                key={path}
                href={href}
                aria-label={`${listing.name}, photo ${i + 1} of ${photos.length}`}
                className="relative h-full w-full shrink-0 basis-full snap-center"
              >
                <Image
                  src={`${publicBase}/${path}`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  priority={i === 0}
                  className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                />
              </Link>
            ))}
          </div>
        )}

        <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-ink backdrop-blur">
          {GENDER_LABEL[listing.gender]}
        </span>

        {photos.length > 1 && (
          <>
            <Arrow
              side="left"
              hidden={index === 0}
              onClick={() => scrollTo(index - 1)}
            />
            <Arrow
              side="right"
              hidden={index === photos.length - 1}
              onClick={() => scrollTo(index + 1)}
            />

            <div className="pointer-events-none absolute inset-x-0 bottom-3 z-10 flex justify-center gap-1.5">
              {photos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full bg-white transition-all duration-300 ${
                    i === index ? "w-4 opacity-100" : "w-1.5 opacity-60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <Link href={href} className="mt-3 block">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-ink">{listing.name}</h3>
          {listing.distanceKm !== null && (
            <span className="shrink-0 text-sm font-semibold text-brand-ink">
              {listing.distanceKm} km
            </span>
          )}
        </div>

        <p className="mt-0.5 flex items-center gap-1 text-sm text-muted">
          <MapPin size={13} className="shrink-0" />
          {listing.location}
          {listing.distanceKm !== null && (
            <span className="text-muted/70"> · from {schoolName.split(" ")[0]}</span>
          )}
        </p>

        {listing.distanceKm === null && listing.distanceNote && (
          <p className="mt-0.5 text-sm italic text-muted">{listing.distanceNote}</p>
        )}

        <p className="mt-1.5 flex items-center gap-1 text-sm text-muted">
          <Users size={13} className="shrink-0" />
          {listing.roomCount} room {listing.roomCount === 1 ? "type" : "types"}
        </p>

        {topFacilities.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {topFacilities.map(({ value, label, icon: Icon }) => (
              <li
                key={value}
                className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-medium text-muted"
              >
                <Icon size={11} /> {label}
              </li>
            ))}
          </ul>
        )}

        <p className="mt-2 text-ink">
          <span className="text-[17px] font-extrabold">{formatNaira(listing.fromPrice!)}</span>
          <span className="text-sm text-muted"> / bed space</span>
        </p>
      </Link>
    </article>
  );
}

function Arrow({
  side, hidden, onClick,
}: { side: "left" | "right"; hidden: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={`absolute top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/90 p-1.5 text-ink shadow-md backdrop-blur transition
        hover:bg-white active:scale-95
        sm:block sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100
        ${side === "left" ? "left-3" : "right-3"}
        ${hidden ? "sm:!opacity-0 sm:pointer-events-none" : ""}`}
    >
      {side === "left" ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );
}