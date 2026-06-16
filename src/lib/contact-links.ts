import { SITE_CONTACT } from "@/lib/site";

export interface ContactChannel {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

function digitsOnly(tel: string): string {
  return tel.replace(/\D/g, "");
}

export function whatsAppUrl(phoneTel: string, prefill?: string): string {
  const base = `https://wa.me/${digitsOnly(phoneTel)}`;
  if (!prefill?.trim()) return base;
  return `${base}?text=${encodeURIComponent(prefill.trim())}`;
}

export function viberUrl(phoneTel: string): string {
  const encoded = encodeURIComponent(phoneTel.startsWith("+") ? phoneTel : `+${digitsOnly(phoneTel)}`);
  return `viber://chat?number=${encoded}`;
}

export function mailtoUrl(email: string, subject?: string): string {
  if (!subject?.trim()) return `mailto:${email}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject.trim())}`;
}

export function buildHumanContactChannels(prefill?: string, emailSubject?: string): ContactChannel[] {
  const channels: ContactChannel[] = [
    {
      id: "whatsapp-gr",
      label: SITE_CONTACT.phone,
      href: whatsAppUrl(SITE_CONTACT.phoneTel, prefill),
      external: true,
    },
    {
      id: "whatsapp-ro",
      label: SITE_CONTACT.phone2,
      href: whatsAppUrl(SITE_CONTACT.phone2Tel, prefill),
      external: true,
    },
    {
      id: "viber-gr",
      label: SITE_CONTACT.phone,
      href: viberUrl(SITE_CONTACT.phoneTel),
      external: true,
    },
    {
      id: "viber-ro",
      label: SITE_CONTACT.phone2,
      href: viberUrl(SITE_CONTACT.phone2Tel),
      external: true,
    },
    {
      id: "email",
      label: SITE_CONTACT.email,
      href: mailtoUrl(SITE_CONTACT.email, emailSubject),
      external: false,
    },
  ];

  return channels;
}
