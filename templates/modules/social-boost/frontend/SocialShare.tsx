"use client";

import React from "react";
import { Share2 } from "lucide-react";

export interface SocialShareProps {
  url: string;
  title: string;
  image?: string;
}

export function SocialShare({ url, title }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: "hover:text-emerald-500"
    },
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: "hover:text-blue-600"
    },
    {
      name: "X (Twitter)",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:text-neutral-900 dark:hover:text-white"
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-blue-700"
    }
  ];

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1 font-medium">
        <Share2 className="h-3.5 w-3.5" /> Share:
      </span>
      <div className="flex gap-2">
        {shareLinks.map((s) => (
          <a
            key={s.name}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-semibold transition ${s.color}`}
          >
            {s.name}
          </a>
        ))}
      </div>
    </div>
  );
}

