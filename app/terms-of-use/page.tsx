import Link from "next/link";

export default function TermsOfUsePage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-10 animate-fade-in-up">
            <h1 className="font-display text-3xl font-black text-ink">
                Terms of Use
            </h1>
            <p className="mt-2 text-sm text-ink/70">Last updated: July 2026</p>

            <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink/80">
                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        1. Acceptance of Terms
                    </h2>
                    <p>
                        By accessing or using CouponCreek, you agree to be bound by these
                        Terms of Use. If you do not agree, please do not use our site.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        2. Nature of Our Service
                    </h2>
                    <p>
                        CouponCreek is a free service that aggregates publicly available
                        promo codes, coupons, and deals from third-party retailers. We do
                        not sell products or process payments — all purchases are made
                        directly with the retailer.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        3. No Guarantee of Accuracy
                    </h2>
                    <p>
                        While we make reasonable efforts to keep listed offers accurate
                        and up to date, promo codes and deals are set by third-party
                        retailers and may change or expire without notice. We do not
                        guarantee that any specific code or offer will work at the time
                        you use it.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        4. Affiliate Relationships
                    </h2>
                    <p>
                        CouponCreek may receive a commission when you click through to a
                        retailer and make a purchase, through affiliate partnerships. This
                        does not influence which offers we list or affect the price you
                        pay.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        5. Limitation of Liability
                    </h2>
                    <p>
                        CouponCreek is provided &quot;as is&quot; without warranties of
                        any kind. We are not responsible for any loss or damage resulting
                        from your use of third-party retailer websites, products, or
                        services.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        6. Changes to These Terms
                    </h2>
                    <p>
                        We may update these Terms of Use from time to time. Continued use
                        of the site after changes are posted constitutes acceptance of
                        the updated terms.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        7. Contact
                    </h2>
                    <p>
                        If you have questions about these Terms of Use, you can reach us at{" "}
                        <a
                            href="mailto:couponcreek@gmail.com"
                            className="text-coupon-dark underline hover:no-underline"
                        >
                            couponcreek@gmail.com
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}