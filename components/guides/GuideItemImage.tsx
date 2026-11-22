"use client";

import { useState } from "react";

/** Same box for the photo and the placeholder, so every card in a guide lines up */
const BOX_CLASS = "h-32 w-full rounded-xl sm:h-28 sm:w-28 sm:shrink-0";

/**
 * Guide pages are rendered on the server, so a picture may fail before React starts listening for onError.
 * When React gets the <img>, this checks whether the browser has already given up on it.
 */
function hasFailed(img: HTMLImageElement | null): boolean {
    return Boolean(img?.complete && img.naturalWidth === 0);
}

/**
 * Product photo of a guide card. Without a photo, or when the store blocks it on other sites,
 * shows the store logo instead (or the store's first letter), so the card never has an empty hole.
 */
export default function GuideItemImage({
    imageUrl,
    title,
    storeName,
    storeLogoUrl,
}: {
    imageUrl: string | null;
    title: string;
    storeName: string;
    storeLogoUrl: string | null;
}) {
    const [photoFailed, setPhotoFailed] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);

    if (imageUrl && !photoFailed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={imageUrl}
                alt={title}
                loading="lazy"
                ref={(img) => {
                    if (hasFailed(img)) setPhotoFailed(true);
                }}
                onError={() => setPhotoFailed(true)}
                className={`${BOX_CLASS} object-contain`}
            />
        );
    }

    // Decorative: the store name is written in the card, so screen readers skip this box
    return (
        <div aria-hidden="true" className={`${BOX_CLASS} flex items-center justify-center bg-paper`}>
            {storeLogoUrl && !logoFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={storeLogoUrl}
                    alt=""
                    loading="lazy"
                    ref={(img) => {
                        if (hasFailed(img)) setLogoFailed(true);
                    }}
                    onError={() => setLogoFailed(true)}
                    className="h-12 w-12 object-contain"
                />
            ) : (
                <span className="font-display text-3xl font-black text-ink/30">
                    {storeName.charAt(0).toUpperCase()}
                </span>
            )}
        </div>
    );
}