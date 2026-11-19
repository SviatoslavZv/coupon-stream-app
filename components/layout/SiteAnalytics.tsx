import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

/** Visitor analytics for the public site only: the admin area is not tracked. */
export default function SiteAnalytics() {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

    return (
        <>
            {/* Vercel Analytics & Speed Insights */}
            <Analytics />
            <SpeedInsights />

            {/* Third-party analytics */}
            {gaId && <GoogleAnalytics gaId={gaId} />}
            {clarityId && (
                <Script
                    id="microsoft-clarity"
                    strategy="afterInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `,
                    }}
                />
            )}
        </>
    );
}