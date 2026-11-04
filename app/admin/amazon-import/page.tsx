import { requireAdmin } from "@/lib/auth";
import { searchAmazonProducts } from "@/lib/partnerboost";

export default async function AmazonImportPage() {
    await requireAdmin();

    const page = await searchAmazonProducts({
        category: "Clothing, Shoes & Jewelry",
        subcategory: "Boots",
        onlyWithCoupon: true,
    });

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="mb-4 font-display text-2xl font-black text-ink">Amazon Import (test)</h1>
            <p className="mb-4 text-sm text-ink/70">
                Products: {page.products.length} · skipped: {page.skipped} · more pages:{" "}
                {page.nextCursor ? "yes" : "no"}
            </p>
            <pre className="overflow-x-auto rounded-xl bg-white p-4 text-xs">
                {JSON.stringify(page.products.slice(0, 3), null, 2)}
            </pre>
        </div>
    );
}