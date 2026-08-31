"use client";

import { useActionState, useState, useRef, useEffect } from "react";
import type { StoreFormState } from "@/lib/actions/stores";
import { slugify, extractDomain, faviconUrl } from "@/lib/utils";

interface StoreFormValues {
    id?: string;
    slug?: string;
    name?: string;
    logoUrl?: string;
    websiteUrl?: string | null;
    affiliateLink?: string | null;
    bannerUrl?: string | null;
    bannerLink?: string | null;
}

export default function StoreForm({
    action,
    initialValues,
}: {
    action: (
        prevState: StoreFormState | null,
        formData: FormData
    ) => Promise<StoreFormState>;
    initialValues?: StoreFormValues;
}) {
    const [state, formAction, isPending] = useActionState(action, null);

    const isEditing = Boolean(initialValues?.id);

    const [name, setName] = useState(initialValues?.name ?? "");
    const [slug, setSlug] = useState(initialValues?.slug ?? "");
    const [websiteUrl, setWebsiteUrl] = useState(initialValues?.websiteUrl ?? "");
    const [logoUrl, setLogoUrl] = useState(initialValues?.logoUrl ?? "");

    const [isSlugTouched, setIsSlugTouched] = useState(isEditing);
    const [isLogoTouched, setIsLogoTouched] = useState(isEditing);
    const [showSlugField, setShowSlugField] = useState(false);
    const [showLogoField, setShowLogoField] = useState(false);


    const slugFieldRef = useRef<HTMLDivElement>(null);
    const logoFieldRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                showSlugField &&
                slugFieldRef.current &&
                !slugFieldRef.current.contains(event.target as Node)
            ) {
                setShowSlugField(false);
            }
            if (
                showLogoField &&
                logoFieldRef.current &&
                !logoFieldRef.current.contains(event.target as Node)
            ) {
                setShowLogoField(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showSlugField, showLogoField]);


    const handleNameChange = (value: string) => {
        setName(value);
        if (!isSlugTouched) {
            setSlug(slugify(value));
        }
    };

    const handleWebsiteUrlChange = (value: string) => {
        setWebsiteUrl(value);
        if (!isLogoTouched) {
            const domain = extractDomain(value);
            if (domain) {
                setLogoUrl(faviconUrl(domain));
            }
        }
    };

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {initialValues?.id && (
                <input type="hidden" name="id" value={initialValues.id} />
            )}

            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
            )}

            <div>
                <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                    Name
                </label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Nike"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div ref={slugFieldRef}>
                {showSlugField ? (
                    <div>
                        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-ink">
                            URL Slug
                        </label>
                        <input
                            id="slug"
                            name="slug"
                            type="text"
                            required
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.target.value);
                                setIsSlugTouched(true);
                            }}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        />
                    </div>
                ) : (
                    <>
                        <input type="hidden" name="slug" value={slug} />
                        <button
                            type="button"
                            onClick={() => setShowSlugField(true)}
                            className="self-start text-xs font-medium text-ink/40 underline hover:text-ink"
                        >
                            Customize URL slug ({slug || "auto-generated"})
                        </button>
                    </>
                )}
            </div>

            <div>
                <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium text-ink">
                    Website URL
                </label>
                <input
                    id="websiteUrl"
                    name="websiteUrl"
                    type="text"
                    placeholder="https://www.nike.com"
                    value={websiteUrl ?? ""}
                    onChange={(e) => handleWebsiteUrlChange(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div>
                <p className="mb-1 text-sm font-medium text-ink">Logo</p>
                <div className="flex items-center gap-3">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={logoUrl}
                            alt="Logo preview"
                            className="h-10 w-10 shrink-0 rounded-full border border-line bg-paper object-contain p-1"
                        />
                    ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-dashed border-line text-xs text-ink/30">
                            ?
                        </div>
                    )}
                    <p className="text-xs text-ink/60">
                        {websiteUrl && websiteUrl !== "https://www."
                            ? "Fetched automatically from the website above."
                            : "Add a website URL to fetch a logo automatically."}
                    </p>
                </div>

                <div ref={logoFieldRef}>
                    {showLogoField ? (
                        <input
                            id="logoUrl"
                            name="logoUrl"
                            type="text"
                            required
                            value={logoUrl}
                            onChange={(e) => {
                                setLogoUrl(e.target.value);
                                setIsLogoTouched(true);
                            }}
                            className="mt-2 w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        />
                    ) : (
                        <>
                            <input type="hidden" name="logoUrl" value={logoUrl} />
                            <button
                                type="button"
                                onClick={() => setShowLogoField(true)}
                                className="mt-1 text-xs font-medium text-ink/40 underline hover:text-ink"
                            >
                                Change logo manually
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div>
                <label htmlFor="affiliateLink" className="mb-1 block text-sm font-medium text-ink">
                    Affiliate Link (leave empty until approved)
                </label>
                <input
                    id="affiliateLink"
                    name="affiliateLink"
                    type="text"
                    placeholder="https://www.awin1.com/..."
                    defaultValue={initialValues?.affiliateLink ?? ""}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div className="border-t border-line pt-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/40">
                    Desktop Banner (optional)
                </p>

                <div className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="bannerUrl" className="mb-1 block text-sm font-medium text-ink">
                            Banner Image URL
                        </label>
                        <input
                            id="bannerUrl"
                            name="bannerUrl"
                            type="text"
                            placeholder="https://www.awltovhc.com/image-..."
                            defaultValue={initialValues?.bannerUrl ?? ""}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="bannerLink" className="mb-1 block text-sm font-medium text-ink">
                            Banner Click-Through Link
                        </label>
                        <input
                            id="bannerLink"
                            name="bannerLink"
                            type="text"
                            placeholder="https://www.tkqlhce.com/click-..."
                            defaultValue={initialValues?.bannerLink ?? ""}
                            className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90 disabled:opacity-50"
            >
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Create Store"}
            </button>
        </form>
    );
}