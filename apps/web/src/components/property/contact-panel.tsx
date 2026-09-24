"use client";

import { MessageCircle, Phone, Navigation } from "lucide-react";

type Props = {
  name: string;
  whatsapp: string;
  phone: string | null;
  directionsHref: string | null;
};

const BTN = "flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition";
const BTN_WA = BTN + " bg-[#25D366] text-white hover:brightness-105";
const BTN_OUTLINE = BTN + " border border-line text-ink hover:bg-surface";

function toWaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  return digits;
}

function ExternalLink(props: { href: string; className: string; children: React.ReactNode }) {
  return <a href={props.href} target="_blank" rel="noopener noreferrer" className={props.className}>{props.children}</a>;
}

export function ContactPanel({ name, whatsapp, phone, directionsHref }: Props) {
  const message = encodeURIComponent("Hi, I saw " + name + " on OffKamp and I would like to ask about a room.");
  const waHref = "https://wa.me/" + toWaNumber(whatsapp) + "?text=" + message;
  const telHref = "tel:" + (phone ?? whatsapp);

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
    </div>
  );
}