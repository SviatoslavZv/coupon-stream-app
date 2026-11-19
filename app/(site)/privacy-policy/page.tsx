import Link from "next/link";

export default function PrivacyPolicyPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-10 animate-fade-in-up">
            <h1 className="font-display text-3xl font-black text-ink">
                Privacy Policy
            </h1>
            <p className="mt-2 text-sm text-ink/70">Last updated: July 2026</p>

            <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink/80">
                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        1. Introduction
                    </h2>
                    <p>
                        CouponCreek (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                        respects your privacy. This Privacy Policy explains what
                        information we collect when you visit our website and how we use
                        it.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        2. Information We Collect
                    </h2>
                    <p>
                        We do not require account registration to browse or use
                        CouponCreek. We do not collect personal information such as your
                        name, email address, or payment details through normal use of the
                        site. We may use standard analytics tools (such as Vercel
                        Analytics) that collect anonymized, aggregated usage data — for
                        example, which pages are visited and general traffic patterns —
                        to help us improve the site.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        3. Affiliate Links
                    </h2>
                    <p>
                        CouponCreek participates in affiliate marketing programs. When
                        you click certain links or buttons on our site to visit a
                        retailer, we may earn a commission if you make a purchase, at no
                        additional cost to you. This does not affect the price you pay.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        4. Cookies
                    </h2>
                    <p>
                        Our site may use cookies for basic functionality and analytics.
                        See our{" "}
                        <Link href="/cookie-policy" className="text-coupon-dark underline hover:no-underline">
                            Cookie Policy
                        </Link>{" "}
                        for more details.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        5. Third-Party Sites
                    </h2>
                    <p>
                        Our site contains links to third-party retailer websites. We are
                        not responsible for the privacy practices or content of those
                        external sites. We encourage you to review their privacy policies
                        before providing any personal information.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        6. Contact
                    </h2>
                    <p>
                        If you have questions about this Privacy Policy, you can reach us at{" "}

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