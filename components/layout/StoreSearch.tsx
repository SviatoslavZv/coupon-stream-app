"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Store } from "@/types";

interface StoreSearchProps {
    stores: Store[];
    isMobileOverlay?: boolean;
    onCloseMobile?: () => void;
}

export default function StoreSearch({
    stores,
    isMobileOverlay = false,
    onCloseMobile,
}: StoreSearchProps) {
    const [query, setQuery] = useState("");
    const [filteredStores, setFilteredStores] = useState<Store[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Фокус на инпут при открытии мобильного оверлея
    useEffect(() => {
        if (isMobileOverlay && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isMobileOverlay]);

    // Фильтрация с оптимизацией transition
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);

        if (!val.trim()) {
            setFilteredStores([]);
            setIsOpen(false);
            return;
        }

        startTransition(() => {
            const matches = stores.filter((store) =>
                store.name.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredStores(matches.slice(0, 8)); // Ограничиваем выдачу 8 элементами
            setIsOpen(true);
        });
    };

    const handleSelect = () => {
        setQuery("");
        setIsOpen(false);
        if (onCloseMobile) onCloseMobile();
    };


    useEffect(() => {
        if (isMobileOverlay) return;

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
    }, [isMobileOverlay]);


    // Топ популярные магазины для быстрого выбора — сортируем по количеству офферов
    const popularStores = [...stores]
        .sort((a, b) => b.offerCount - a.offerCount)
        .slice(0, 5);

    return (
        <div
            ref={containerRef}
            className={`relative w-full ${isMobileOverlay ? "h-full" : ""}`}
        >

            {/* Поисковая строка */}

            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search stores (e.g. Nike, ASOS)..."
                    className="w-full rounded-full border border-line bg-white py-2.5 pl-10 pr-10 text-sm text-ink placeholder:text-ink/40 focus:border-coupon focus:outline-none focus:ring-2 focus:ring-coupon/20 transition-all"
                />
                <svg
                    className="absolute left-3.5 h-4 w-4 text-ink/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>

                {query && (
                    <button
                        type="button"
                        onClick={() => {
                            setQuery("");
                            setFilteredStores([]);
                            setIsOpen(false);
                        }}
                        className="absolute right-3 text-ink/40 hover:text-ink text-xs p-1"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Выпадающие результаты (для Десктопа или Мобильного оверлея) */}
            {(isOpen || isMobileOverlay) && (
                <div
                    className={`${isMobileOverlay
                        ? "mt-4 w-full"
                        : "absolute left-0 right-0 top-full z-50 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-line bg-white p-2 shadow-xl"
                        }`}
                >
                    {/* Если пользователь ничего не ввел — показываем популярное */}
                    {!query.trim() && isMobileOverlay && (
                        <div className="p-2">
                            <p className="text-xs font-semibold uppercase tracking-wider text-ink/40 mb-3">
                                Popular Stores
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {popularStores.map((store) => (
                                    <Link
                                        key={store.slug}
                                        href={`/store/${store.slug}`}
                                        onClick={handleSelect}
                                        className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-medium text-ink hover:border-coupon"
                                    >
                                        <span>{store.name}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Результаты поиска */}
                    {query.trim() && filteredStores.length > 0 && (
                        <div className="flex flex-col gap-1">
                            {filteredStores.map((store) => (
                                <Link
                                    key={store.slug}
                                    href={`/store/${store.slug}`}
                                    onClick={handleSelect}
                                    className="flex items-center justify-between rounded-xl p-2.5 hover:bg-paper transition"
                                >
                                    <div className="flex items-center gap-3">
                                        {store.logoUrl ? (
                                            <Image
                                                src={store.logoUrl}
                                                alt={store.name}
                                                width={32}
                                                height={32}
                                                className="h-8 w-8 rounded-lg object-contain border border-line/50 p-0.5"
                                            />
                                        ) : (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coupon/10 font-bold text-coupon text-xs">
                                                {store.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-ink">
                                            {store.name}
                                        </span>
                                    </div>
                                    <span className="text-xs text-ink/40">
                                        {store.offerCount || 0} offers
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Если ничего не найдено */}
                    {query.trim() && filteredStores.length === 0 && !isPending && (
                        <div className="p-4 text-center text-xs text-ink/50">
                            No stores found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}