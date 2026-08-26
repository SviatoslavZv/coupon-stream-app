import Link from "next/link";
import { SALES_CALENDAR } from "@/lib/constants/sales-calendar";

export default function SalesCalendarPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-10 animate-fade-in-up">
            <h1 className="font-display text-3xl font-black text-ink">
                US Sales Calendar
            </h1>
            <p className="mt-2 text-ink/70">
                The biggest shopping seasons of the year, and where to find the best
                deals for each.
            </p>

            <div className="mt-8 flex flex-col gap-4">
                {SALES_CALENDAR.map((event) => (
                    <div
                        key={event.slug}
                        className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div>
                            <span className="font-mono text-xs uppercase tracking-wide text-coupon-dark">
                                {event.period}
                            </span>
                            <h2 className="font-display text-lg font-bold text-ink">
                                {event.name}
                            </h2>
                            <p className="mt-1 text-sm text-ink/70">{event.description}</p>
                        </div>

                        <Link
                            href={event.linkHref}
                            className="shrink-0 whitespace-nowrap rounded-full border border-line px-4 py-2 text-center text-sm font-medium text-ink transition hover:border-coupon hover:text-coupon"
                        >
                            {event.linkLabel}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
}