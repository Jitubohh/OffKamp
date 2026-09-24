"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export function Gallery({ photos, publicBase, name }: { photos: string[]; publicBase: string; name: string }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-card bg-surface text-muted sm:aspect-[21/9]">
        <ImageOff size={32} />
        <span className="text-sm font-medium">No photos yet</span>
      </div>
    );
  }

  function scrollTo(next: number) {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
  }

  return (
    <div className="group relative">
      <div
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget;
          const i = Math.round(el.scrollLeft / el.clientWidth);
          if (i !== index) setIndex(i);
        }}
        className="no-scrollbar flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto overscroll-x-contain rounded-card sm:aspect-[21/9]"
      >
        {photos.map((path, i) => (
          <div key={path} className="relative h-full w-full shrink-0 basis-full snap-center">
            <Image
              src={`${publicBase}/${path}`}
              alt={`${name} — photo ${i + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => scrollTo(index - 1)}
            aria-label="Previous photo"
            disabled={index === 0}
            className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-md backdrop-blur transition hover:bg-white disabled:opacity-0 sm:block"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => scrollTo(index + 1)}
            aria-label="Next photo"
            disabled={index === photos.length - 1}
            className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/90 p-2 text-ink shadow-md backdrop-blur transition hover:bg-white disabled:opacity-0 sm:block"
          >
            <ChevronRight size={20} />
          </button>

          <div className="absolute bottom-4 right-4 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}