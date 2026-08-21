export default function DisclaimerPage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="font-display text-3xl font-black text-ink">
                Disclaimer
            </h1>
            <p className="mt-2 text-sm text-ink/60">Last updated: July 2026</p>

            <div className="mt-6 rounded-2xl border border-coupon bg-coupon/5 p-4 text-sm font-medium text-ink">
                By accessing or using CouponCreek, you fully and unconditionally
                accept all terms set out in this Disclaimer. If you do not agree,
                please discontinue use of the site immediately.
            </div>

            <div className="mt-8 flex flex-col gap-6 text-sm leading-relaxed text-ink/80">
                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        1. General Disclaimer
                    </h2>
                    <p>
                        CouponCreek is provided on an &quot;as is&quot; and &quot;as
                        available&quot; basis, without warranties of any kind, express or
                        implied. We make no representations or warranties of any kind,
                        express or implied, regarding the operation of the site or the
                        information, content, or materials included on it.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        2. Accuracy of Offers
                    </h2>
                    <p>
                        Promo codes, discounts, and offers listed on CouponCreek are set
                        and controlled entirely by third-party retailers. Retailers may
                        change, restrict, or discontinue any offer at any time and
                        without notice to us. While we make reasonable efforts to keep
                        listings current, we do not guarantee that any specific code,
                        discount, or offer will be valid, available, or work as described
                        at the time you attempt to use it.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        3. Affiliate Disclosure
                    </h2>
                    <p>
                        Some links on CouponCreek are affiliate links. If you click one
                        of these links and make a purchase, we may earn a commission
                        from the retailer. This comes at no additional cost to you and
                        does not affect the price you pay. Our affiliate relationships
                        do not influence which stores, brands, or offers we choose to
                        list.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        4. No Endorsement
                    </h2>
                    <p>
                        The inclusion of any store, brand, or product on CouponCreek does
                        not constitute an endorsement or guarantee of that store,
                        brand, or product. We are not responsible for the quality,
                        safety, legality, or any other aspect of goods or services
                        offered by third-party retailers.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        5. Third-Party Websites
                    </h2>
                    <p>
                        CouponCreek contains links to websites operated by third parties.
                        We have no control over, and assume no responsibility for, the
                        content, privacy policies, security practices, or actions of any
                        third-party website. Visiting a linked website is done entirely
                        at your own risk.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        6. Price and Availability Changes
                    </h2>
                    <p>
                        Prices, discounts, and product availability shown or implied on
                        CouponCreek are subject to change at any time by the relevant
                        retailer, without notice to us or to you. We are not responsible
                        for any discrepancy between the offer as listed and the offer as
                        presented on the retailer&apos;s website.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        7. Limitation of Liability
                    </h2>
                    <p>
                        To the fullest extent permitted by law, CouponCreek and its
                        operator shall not be liable for any direct, indirect,
                        incidental, consequential, or punitive damages arising out of or
                        related to your use of the site, your reliance on any
                        information provided, or your interactions with any third-party
                        retailer, including but not limited to lost savings, failed
                        transactions, or dissatisfaction with a purchased product or
                        service.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        8. Changes to This Disclaimer
                    </h2>
                    <p>
                        We may update this Disclaimer from time to time. Continued use
                        of the site after changes are posted constitutes your acceptance
                        of the updated Disclaimer.
                    </p>
                </section>

                <section>
                    <h2 className="mb-2 font-display text-lg font-bold text-ink">
                        9. Contact
                    </h2>
                    <p>
                        If you have questions about this Disclaimer, you can reach us at{" "}

                        <a
                            href="mailto:couponcreek@gmail.com"
                            className="text-coupon hover:underline"
                        >
                            couponcreek@gmail.com
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div >
    );
}