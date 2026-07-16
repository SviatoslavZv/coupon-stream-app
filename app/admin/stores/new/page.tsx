import { createStore } from "@/lib/actions/stores";

export default function NewStorePage() {
    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">
                Add Store
            </h1>

            <form action={createStore} className="flex flex-col gap-4">
                <div>
                    <label htmlFor="slug" className="mb-1 block text-sm font-medium text-ink">
                        Slug
                    </label>
                    <input
                        id="slug"
                        name="slug"
                        type="text"
                        required
                        placeholder="nike"
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

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
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-ink">
                        Logo URL
                    </label>
                    <input
                        id="logoUrl"
                        name="logoUrl"
                        type="text"
                        required
                        placeholder="https://..."
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <div>
                    <label htmlFor="websiteUrl" className="mb-1 block text-sm font-medium text-ink">
                        Website URL (fallback if no affiliate link yet)
                    </label>
                    <input
                        id="websiteUrl"
                        name="websiteUrl"
                        type="text"
                        placeholder="https://www.nike.com"
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
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
                        className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-full bg-coupon px-5 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    Create Store
                </button>
            </form>
        </div>
    );
}