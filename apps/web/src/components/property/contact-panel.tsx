"use client";

import { MessageCircle, Phone, Navigation, Camera, Music2, CameraOff } from "lucide-react";
import { instagramUrl, tiktokUrl } from "@/lib/socials";

type Props = {
  name: string;
  whatsapp: string;
  phone: string | null;
  instagram: string | null;
  tiktok: string | null;
  directionsHref: string | null;
};

const BTN = "flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition";
const BTN_WA = BTN + " bg-[#25D366] text-white hover:brightness-105";
const BTN_OUTLINE = BTN + " border border-line text-ink hover:bg-surface";
const SOCIAL = "flex h-12 flex-1 items-center justify-center gap-2 rounded-xl border border-line text-sm font-semibold text-ink transition hover:border-brand-deep hover:bg-brand/10";

function toWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

function ExternalLink(props: { href: string; className: string; children: React.ReactNode }) {
  return <a href={props.href} target="_blank" rel="noopener noreferrer" className={props.className}>{props.children}</a>;
}

export function ContactPanel({ name, whatsapp, phone, instagram, tiktok, directionsHref }: Props) {
  const message = encodeURIComponent("Hi, I saw " + name + " on OffKamp and I would like to ask about a room.");
  const waHref = "https://wa.me/" + toWaNumber(whatsapp) + "?text=" + message;
  const telHref = "tel:" + (phone ?? whatsapp);
  const hasSocials = instagram !== null || tiktok !== null;

  return (
    <div className="rounded-card border border-line p-5">
      <p className="font-bold text-ink">Contact the lister</p>
      <p className="mt-1 text-sm text-muted">
        OffKamp does not handle payments. Always inspect a place before paying anything.
      </p>

      <div className="mt-4 space-y-2.5">
        <ExternalLink href={waHref} className={BTN_WA}>
          <MessageCircle size={18} />
          Message on WhatsApp
        </ExternalLink>

        <a href={telHref} className={BTN_OUTLINE}>
          <Phone size={18} />
          {phone ?? whatsapp}
        </a>

        {directionsHref ? (
          <ExternalLink href={directionsHref} className={BTN_OUTLINE}>
            <Navigation size={18} />
            Get directions
          </ExternalLink>
        ) : null}
      </div>

      {hasSocials ? (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2.5 text-xs font-semibold text-muted">See more of this place</p>
          <div className="flex gap-2.5">
            {instagram ? (
              <ExternalLink href={instagramUrl(instagram)} className={SOCIAL}>
                <Camera size={16} />
                Instagram
              </ExternalLink>
            ) : null}
            {tiktok ? (
              <ExternalLink href={tiktokUrl(tiktok)} className={SOCIAL}>
                <Music2 size={16} />
                TikTok
              </ExternalLink>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}