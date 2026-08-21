import Link from "next/link";

export default function CookiePolicyPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">
                Cookie Policy
            </h1>
            <p className="mt-2 text-sm text-ink/70">Last updated: July 2026</p>

            <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink/80">
                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        1. What Are Cookies
                    </h2>
                    <p>
                        Cookies are small text files stored on your device when you visit
                        a website. They help sites function properly and can be used to
                        collect anonymized usage data.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        2. How We Use Cookies
                    </h2>
                    <p>
                        We use a minimal set of cookies necessary for basic site
                        functionality (for example, keeping an administrator signed in to
                        our management dashboard). We may also use analytics cookies to
                        understand how visitors use our site, in an anonymized and
                        aggregated form.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        3. Third-Party Cookies
                    </h2>
                    <p>
                        When you click through to a retailer&apos;s website, that site
                        may set its own cookies in accordance with its own cookie and
                        privacy policies. We do not control these third-party cookies.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        4. Managing Cookies
                    </h2>
                    <p>
                        Most browsers allow you to control cookies through their
                        settings, including blocking or deleting them. Please note that
                        disabling cookies may affect certain site functionality.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        5. Contact
                    </h2>
                    <p>
                        If you have questions about our Cookie Policy, you can reach us at{" "}
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