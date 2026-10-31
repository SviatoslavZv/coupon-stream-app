"use client";

import { useActionState, useState } from "react";
import type { GuideFormState } from "@/lib/actions/guides";
import { INTRO_RECOMMENDED_WORDS, META_DESCRIPTION_MAX } from "@/lib/constants/guides";
import { SALES_CALENDAR } from "@/lib/constants/sales-calendar";
import { CATEGORIES, GENDERS } from "@/lib/constants/taxonomy";
import type { GuideFormValues } from "@/lib/guides";
import { slugify } from "@/lib/utils";

const INPUT_CLASS =
    "w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none";
const LABEL_CLASS = "mb-1 block text-sm font-medium text-ink";

function countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function GuideForm({
    action,
    initialValues,
}: {
    action: (prevState: GuideFormState | null, formData: FormData) => Promise<GuideFormState>;
    initialValues?: GuideFormValues;
}) {
    const [state, formAction, isPending] = useActionState(action, null);

    const [title, setTitle] = useState(initialValues?.title ?? "");
    const [slug, setSlug] = useState(initialValues?.slug ?? "");
    const [isSlugTouched, setIsSlugTouched] = useState(Boolean(initialValues));
    const [intro, setIntro] = useState(initialValues?.intro ?? "");
    const [metaDescription, setMetaDescription] = useState(initialValues?.metaDescription ?? "");

    const introWords = countWords(intro);
    const isIntroInRange =
        introWords >= INTRO_RECOMMENDED_WORDS.min && introWords <= INTRO_RECOMMENDED_WORDS.max;
    const isMetaTooLong = metaDescription.length > META_DESCRIPTION_MAX;

    function handleTitleChange(value: string) {
        setTitle(value);
        if (!isSlugTouched) {
            setSlug(slugify(value));
        }
    }

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {initialValues && <input type="hidden" name="id" value={initialValues.id} />}

            {state?.error && (
                <div className="rounded-lg border border-coupon bg-coupon/5 px-3 py-2 text-sm text-coupon">
                    {state.error}
                </div>
            )}

            <div>
                <label htmlFor="title" className={LABEL_CLASS}>Title</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    required
                    placeholder="Men's Winter Boots Under $80"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className={INPUT_CLASS}
                />
            </div>

            <div>
                <label htmlFor="slug" className={LABEL_CLASS}>Slug</label>
                <div className="flex items-center gap-1 text-sm text-ink/50">
                    <span className="shrink-0">/guides/</span>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value);
                            setIsSlugTouched(true);
                        }}
                        className={INPUT_CLASS}
                    />
                </div>
                {initialValues?.isPublished && slug !== initialValues.slug && (
                    <p className="mt-1 text-xs text-coupon">
                        Changing the slug of a published guide breaks existing links to it.
                    </p>
                )}
            </div>

            <div>
                <label htmlFor="intro" className={LABEL_CLASS}>Intro</label>
                <textarea
                    id="intro"
                    name="intro"
                    required
                    rows={8}
                    placeholder="Who this guide is for, how the picks were chosen, what to look for…"
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    className={INPUT_CLASS}
                />
                <p className={`mt-1 text-xs ${isIntroInRange ? "text-green-700" : "text-ink/50"}`}>
                    {introWords} words · aim for {INTRO_RECOMMENDED_WORDS.min}–{INTRO_RECOMMENDED_WORDS.max}.
                    Separate paragraphs with an empty line.
                </p>
            </div>

            <div>
                <label htmlFor="metaDescription" className={LABEL_CLASS}>Meta description (optional)</label>
                <textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows={2}
                    placeholder="Leave empty to use the start of the intro"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className={INPUT_CLASS}
                />
                <p className={`mt-1 text-xs ${isMetaTooLong ? "text-coupon" : "text-ink/50"}`}>
                    {metaDescription.length}/{META_DESCRIPTION_MAX} characters
                </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label htmlFor="category" className={LABEL_CLASS}>Category</label>
                    <select
                        id="category"
                        name="category"
                        defaultValue={initialValues?.category ?? ""}
                        className={INPUT_CLASS}
                    >
                        <option value="">None</option>
                        {CATEGORIES.map((category) => (
                            <option key={category.slug} value={category.slug}>
                                {category.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="gender" className={LABEL_CLASS}>Gender</label>
                    <select
                        id="gender"
                        name="gender"
                        defaultValue={initialValues?.gender ?? ""}
                        className={INPUT_CLASS}
                    >
                        <option value="">None</option>
                        {GENDERS.map((gender) => (
                            <option key={gender.slug} value={gender.slug}>
                                {gender.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="eventSlug" className={LABEL_CLASS}>Event</label>
                    <select
                        id="eventSlug"
                        name="eventSlug"
                        defaultValue={initialValues?.eventSlug ?? ""}
                        className={INPUT_CLASS}
                    >
                        <option value="">None</option>
                        {SALES_CALENDAR.map((event) => (
                            <option key={event.slug} value={event.slug}>
                                {event.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-ink">
                <input
                    type="checkbox"
                    name="isPublished"
                    defaultChecked={initialValues?.isPublished ?? false}
                    className="h-4 w-4 accent-coupon"
                />
                Published (visible on the site)
            </label>

            <button
                type="submit"
                disabled={isPending}
                className="self-start rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90 disabled:opacity-50"
            >
                {isPending ? "Saving…" : initialValues ? "Save Changes" : "Create Guide"}
            </button>
        </form>
    );
}