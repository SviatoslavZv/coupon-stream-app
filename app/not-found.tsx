import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotFoundContent from "@/components/layout/NotFoundContent";

// Unmatched URLs: only the root layout is around this page, so it brings the site header and footer itself
export default function NotFound() {
    return (
        <>
            <Header />
            <main className="flex-1">
                <NotFoundContent />
            </main>
            <Footer />
        </>
    );
}