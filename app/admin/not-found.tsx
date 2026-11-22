import Link from "next/link";
import { ADMIN_ROUTES } from "@/lib/constants/admin";

// notFound() in an admin page (a deleted coupon, link or guide): stay inside the admin frame
export default function AdminNotFound() {
    return (
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
            <h1 className="font-display text-2xl font-black text-ink">Not found</h1>
            <p className="mt-2 text-sm text-ink/70">It may have been deleted, or the address is wrong.</p>
            <Link
                href={ADMIN_ROUTES.dashboard}
                className="mt-6 inline-block rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:bg-ink/90"
            >
                Dashboard
            </Link>
        </div>
    );
}