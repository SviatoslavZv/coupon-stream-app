"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Store } from "@/types";

export default function StoreSearch({ stores }: { stores: Store[] }) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const matches =
        query.trim().length > 0
            ? stores
                .filter((store) =>
                    store.name.toLowerCase().includes(query.trim().toLowerCase())
                )
                .slice(0, 6)
            : [];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (slug: string) => {
        setQuery("");
        setIsOpen(false);
        router.push(`/store/${slug}`);
    };

    return (
        <div ref={containerRef} className="relative flex-1">
            <input
                type="text"
                placeholder="Search stores by name…"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="w-full max-w-md rounded-full border border-line bg-white px-4 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-coupon focus:outline-none"
            />

            {isOpen && matches.length > 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full max-w-md rounded-2xl border border-line bg-white p-2 shadow-lg">
                    {matches.map((store) => (
                        <button
                            key={store.slug}
                            onClick={() => handleSelect(store.slug)}
                            className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-ink hover:bg-paper"
                        >
                            {store.name}
                        </button>
                    ))}
                </div>
            )}

            {isOpen && query.trim().length > 0 && matches.length === 0 && (
                <div className="absolute left-0 top-full z-50 mt-2 w-full max-w-md rounded-2xl border border-line bg-white p-3 text-sm text-ink/50 shadow-lg">
                    No stores found.
                </div>
            )}
        </div>
    );
}