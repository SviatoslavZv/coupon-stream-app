"use client";

import { useRef, useState } from "react";
import { Share2 } from "lucide-react";
import SharePopover from "@/components/ui/SharePopover";

export default function ShareButton({
    path,
    title,
    className,
    children = "Share",
}: {
    path: string;
    title: string;
    className?: string;
    children?: React.ReactNode;
}) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const [shareUrl, setShareUrl] = useState("");
    const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleShareClick = async () => {
        const url = new URL(path, window.location.origin).toString();

        if (navigator.share) {
            try {
                await navigator.share({ title, url });
            } catch {
                // User cancelled the native share sheet — nothing to do.
            }
            return;
        }

        if (buttonRef.current) {
            setAnchorRect(buttonRef.current.getBoundingClientRect());
        }
        setShareUrl(url);
        setIsPopoverOpen(true);
    };

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleShareClick}
                aria-label="Share"
                className={
                    className ??
                    "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
                }
            >
                <Share2 size={16} />
                {children}
            </button>

            {isPopoverOpen && anchorRect && (
                <SharePopover
                    url={shareUrl}
                    title={title}
                    onClose={() => setIsPopoverOpen(false)}
                    anchorRect={anchorRect}
                />
            )}
        </>
    );
}