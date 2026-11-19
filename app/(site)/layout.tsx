import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SiteAnalytics from "@/components/layout/SiteAnalytics";

/** Public site frame: header, footer and visitor analytics. The admin area has its own. */
export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <SiteAnalytics />
        </>
    );
}