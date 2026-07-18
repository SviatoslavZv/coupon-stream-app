import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/taxonomy";

export default function CategoriesPage() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">
                Categories
            </h1>
            <p className="mt-2 text-ink/60">
                Browse deals by category across every store.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {CATEGORIES.map((category) => (
                    <Link
                        key={category.slug}
                        href={`/category/${category.slug}`}
                        className="rounded-2xl border border-line bg-white p-5 transition hover:shadow-md"
                    >
                        <h2 className="font-display text-lg font-bold text-ink">
                            {category.label}
                        </h2>
                        {category.subcategories.length > 0 && (
                            <p className="mt-1 text-sm text-ink/50">
                                {category.subcategories.map((sub) => sub.label).join(", ")}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}