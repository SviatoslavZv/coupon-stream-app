"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Check, Copy, X } from "lucide-react";
import { getSharePlatformUrl, type SharePlatform } from "@/lib/share";
import {
    TelegramIcon,
    WhatsAppIcon,
    ViberIcon,
    FacebookIcon,
    XIcon,
    PinterestIcon,
} from "@/components/ui/icons/SocialIcons";

interface SharePopoverProps {
    url: string;
    title: string;
    onClose: () => void;
    anchorRect: DOMRect;
}

const platforms: {
    key: SharePlatform;
    icon: typeof TelegramIcon;
    label: string;
    color: string;
}[] = [
        { key: "telegram", icon: TelegramIcon, label: "Telegram", color: "bg-sky-500 hover:bg-sky-600" },
        { key: "whatsapp", icon: WhatsAppIcon, label: "WhatsApp", color: "bg-green-500 hover:bg-green-600" },
        { key: "viber", icon: ViberIcon, label: "Viber", color: "bg-purple-500 hover:bg-purple-600" },
        { key: "facebook", icon: FacebookIcon, label: "Facebook", color: "bg-blue-600 hover:bg-blue-700" },
        { key: "twitter", icon: XIcon, label: "X (Twitter)", color: "bg-ink hover:bg-ink/90" },
        { key: "pinterest", icon: PinterestIcon, label: "Pinterest", color: "bg-coupon hover:bg-coupon/90" },
    ];

export default function SharePopover({
    url,
    title,
    onClose,
    anchorRect,
}: SharePopoverProps) {
    const [copied, setCopied] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
                onClose();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard write failed — silently ignore.
        }
    };

    const popoverWidth = 288;
    const popoverHeight = 280;

    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const shouldOpenUpward = spaceBelow < popoverHeight + 16;

    const top = shouldOpenUpward
        ? anchorRect.top - popoverHeight - 8
        : anchorRect.bottom + 8;




    let left = anchorRect.right;

    if (left + popoverWidth > window.innerWidth - 8) {
        left = window.innerWidth - popoverWidth - 8;
    }
    if (left < 8) left = 8;




    const popoverContent = (
        <div
            ref={popoverRef}
            onClick={(e) => e.stopPropagation()}
            style={{ position: "fixed", top, left, width: popoverWidth }}
            className="z-50 rounded-2xl border border-line bg-white p-4 shadow-xl"
        >
            <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-ink/40">
                    Share
                </p>
                <button
                    onClick={onClose}
                    className="rounded-full p-1 text-ink/40 transition hover:bg-paper hover:text-ink"
                >
                    <X size={16} />
                </button>
            </div>

            <div className="mb-3 flex items-center gap-2">
                <input
                    readOnly
                    value={url}
                    className="flex-1 truncate rounded-lg border border-line bg-paper px-3 py-2 text-xs text-ink/70 outline-none"
                />
                <button
                    onClick={handleCopy}
                    className={`shrink-0 rounded-lg p-2 transition ${copied ? "bg-green-100 text-green-600" : "bg-paper text-ink/60 hover:bg-line"
                        }`}
                >
                    {copied ? <Check size={14} /> : <Copy size={16} />}
                </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
                {platforms.map((p) => (

                    <a
                        key={p.key}
                        href={getSharePlatformUrl(p.key, url, title)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={p.label}
                        className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white shadow-sm transition hover:scale-105 ${p.color}`}
                    >
                        <p.icon size={22} />
                    </a>
                ))}
            </div>
        </div >
    );

    return createPortal(popoverContent, document.body);
}