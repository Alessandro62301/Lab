import {
  BadgePercent,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  CircleDollarSign,
  FileText,
  Globe2,
  Heart,
  ImageIcon,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  ShoppingBag,
  Smartphone,
  Star,
  type LucideIcon,
} from "lucide-react";

export type PresenceFontOption = {
  value: string;
  label: string;
  description: string;
  css: string;
};

export type PresenceIconOption = {
  value: string;
  label: string;
  Icon: LucideIcon;
};

export const FONT_OPTIONS: PresenceFontOption[] = [
  {
    value: "Geist Sans",
    label: "Geist Sans",
    description: "Limpa e moderna",
    css: "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
  },
  {
    value: "Geist Mono",
    label: "Geist Mono",
    description: "Tecnológica e autoral",
    css: "var(--font-geist-mono), ui-monospace, monospace",
  },
  {
    value: "Editorial Serif",
    label: "Editorial",
    description: "Elegante e sofisticada",
    css: "Georgia, 'Times New Roman', serif",
  },
  {
    value: "Rounded",
    label: "Arredondada",
    description: "Leve e amigável",
    css: "'Trebuchet MS', 'Arial Rounded MT Bold', ui-sans-serif, sans-serif",
  },
  {
    value: "Typewriter",
    label: "Máquina de escrever",
    description: "Retrô e informal",
    css: "'Courier New', Courier, monospace",
  },
];

export const ICON_OPTIONS: PresenceIconOption[] = [
  { value: "link", label: "Link", Icon: Link2 },
  { value: "instagram", label: "Instagram", Icon: Camera },
  { value: "message-circle", label: "WhatsApp / conversa", Icon: MessageCircle },
  { value: "phone", label: "Telefone", Icon: Phone },
  { value: "mail", label: "E-mail", Icon: Mail },
  { value: "globe", label: "Site", Icon: Globe2 },
  { value: "shopping-bag", label: "Produtos", Icon: ShoppingBag },
  { value: "smartphone", label: "Celular", Icon: Smartphone },
  { value: "badge-percent", label: "Oferta", Icon: BadgePercent },
  { value: "circle-dollar", label: "Preço", Icon: CircleDollarSign },
  { value: "file-text", label: "Formulário", Icon: FileText },
  { value: "calendar", label: "Agenda", Icon: CalendarDays },
  { value: "map-pin", label: "Localização", Icon: MapPin },
  { value: "briefcase", label: "Empresas", Icon: BriefcaseBusiness },
  { value: "image", label: "Imagem", Icon: ImageIcon },
  { value: "play", label: "Vídeo", Icon: Play },
  { value: "heart", label: "Coração", Icon: Heart },
  { value: "star", label: "Destaque", Icon: Star },
];

export function resolveFontFamily(value: string) {
  return FONT_OPTIONS.find((option) => option.value === value)?.css ?? FONT_OPTIONS[0].css;
}

export function resolveIconOption(value: unknown) {
  return ICON_OPTIONS.find((option) => option.value === value) ?? ICON_OPTIONS[0];
}
