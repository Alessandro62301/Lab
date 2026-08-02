/* eslint-disable @next/next/no-img-element */
import {
  ArrowUpRight,
  MoreVertical,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { resolveFontFamily, resolveIconOption } from "../appearance";
import type { SerializedPresencePage } from "../server";
import type { PresenceBlock } from "../schema";
import { PresenceViewTracker } from "./presence-view-tracker";

function settingsImages(block: PresenceBlock) {
  const images = block.settings.images;
  return Array.isArray(images)
    ? images.filter((image): image is string => typeof image === "string").slice(0, 3)
    : block.mediaUrl ? [block.mediaUrl] : [];
}

function CompactBlock({ block, radius, fontSize, iconSize }: { block: PresenceBlock; radius: number; fontSize: number; iconSize: number }) {
  const iconName = typeof block.settings.icon === "string" ? block.settings.icon : "";
  const Icon = resolveIconOption(iconName || (block.type === "FORM" ? "file-text" : "link")).Icon;
  return (
    <a
      href={`/r/${block.id}`}
      className="group flex min-h-14 items-center gap-3 bg-white px-3 py-2.5 text-[#4b3440] shadow-sm transition-transform hover:-translate-y-0.5"
      style={{ borderRadius: radius }}
    >
      {block.mediaUrl ? (
        <img src={block.mediaUrl} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
      ) : (
        <span className="grid size-10 shrink-0 place-items-center text-[#b83872]">
          <Icon style={{ width: iconSize, height: iconSize }} />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-medium leading-tight" style={{ fontSize }}>{block.title}</span>
        {block.description && <span className="mt-0.5 block truncate opacity-60" style={{ fontSize: Math.max(9, fontSize - 3) }}>{block.description}</span>}
      </span>
      <MoreVertical className="size-4 opacity-40 transition-opacity group-hover:opacity-80" />
    </a>
  );
}

function FeatureBlock({ block, radius, fontSize }: { block: PresenceBlock; radius: number; fontSize: number }) {
  return (
    <a
      href={`/r/${block.id}`}
      className="group block overflow-hidden bg-white p-2 text-[#4b3440] shadow-sm"
      style={{ borderRadius: radius }}
    >
      {block.mediaUrl && (
        <img
          src={block.mediaUrl}
          alt=""
          className="aspect-[16/9] w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          style={{ borderRadius: Math.max(6, radius - 6) }}
        />
      )}
      <div className="flex items-end gap-3 px-3 py-3">
        <span className="flex-1 text-center leading-relaxed" style={{ fontSize: Math.max(10, fontSize - 1) }}>
          {block.description || block.title}
        </span>
        <ArrowUpRight className="size-4 shrink-0 opacity-50" />
      </div>
    </a>
  );
}

function GalleryBlock({ block, radius, fontSize }: { block: PresenceBlock; radius: number; fontSize: number }) {
  const images = settingsImages(block);
  return (
    <section className="overflow-hidden bg-white p-5 text-[#4b3440] shadow-sm" style={{ borderRadius: radius }}>
      <div className="relative mx-auto h-48 max-w-sm">
        {images.map((image, index) => (
          <img
            key={image}
            src={image}
            alt=""
            className="absolute left-1/2 top-1/2 aspect-square w-36 rounded-md object-cover shadow-lg"
            style={{
              transform: `translate(-50%, -50%) translateX(${(index - 1) * 64}px) rotate(${(index - 1) * 11}deg)`,
            }}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between opacity-55" style={{ fontSize: Math.max(9, fontSize - 4) }}>
        <span>{block.title}</span>
        <span>{images.length} fotos</span>
      </div>
    </section>
  );
}

export function PublicPresencePage({ page }: { page: SerializedPresencePage }) {
  const themeStyle = {
    backgroundColor: page.theme.backgroundColor,
    color: page.theme.textColor,
    fontFamily: resolveFontFamily(page.theme.fontFamily),
  };

  return (
    <main className="min-h-screen px-4 py-7 sm:py-10" style={themeStyle}>
      <PresenceViewTracker slug={page.slug} />
      <div
        className="mx-auto flex w-full max-w-md flex-col gap-3 px-4 py-6 shadow-2xl sm:px-5 sm:py-8"
        style={{ backgroundColor: page.theme.surfaceColor, borderRadius: page.theme.borderRadius + 8 }}
      >
        <header className="flex flex-col items-center px-3 pb-3 pt-8 text-center">
          <Avatar className="size-20 border-2 border-white/60">
            <AvatarImage src={page.avatarUrl} alt={page.name} />
            <AvatarFallback>{page.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="mt-5 font-semibold tracking-tight" style={{ fontSize: page.theme.fontSize + 6 }}>{page.name}</h1>
          <p className="mt-1 max-w-sm font-medium leading-relaxed opacity-90" style={{ fontSize: Math.max(10, page.theme.fontSize - 2) }}>{page.bio}</p>
        </header>

        {page.blocks.map((block) => {
          if (block.type === "TEXT") {
            return (
              <section key={block.id} className="px-4 py-3 text-center">
                <h2 className="font-semibold" style={{ fontSize: page.theme.fontSize }}>{block.title}</h2>
                {block.description && <p className="mt-1 opacity-75" style={{ fontSize: Math.max(9, page.theme.fontSize - 2) }}>{block.description}</p>}
              </section>
            );
          }
          if (block.type === "FEATURE" || block.type === "IMAGE") {
            return <FeatureBlock key={block.id} block={block} radius={page.theme.borderRadius} fontSize={page.theme.fontSize} />;
          }
          if (block.type === "GALLERY") {
            return <GalleryBlock key={block.id} block={block} radius={page.theme.borderRadius} fontSize={page.theme.fontSize} />;
          }
          return <CompactBlock key={block.id} block={block} radius={page.theme.borderRadius} fontSize={page.theme.fontSize} iconSize={page.theme.iconSize} />;
        })}

        <footer className="pt-5 text-center text-[10px] opacity-55">Criado no Lab · Presença</footer>
      </div>
    </main>
  );
}
