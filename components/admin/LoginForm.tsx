"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const router = useRouter();

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const supabase = createClient();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsSubmitting(false);

        if (error) {
            setError("Invalid email or password.");
            return;
        }

        router.push("/admin");
        router.refresh();
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                    Email
                </label>
                <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                    Password
                </label>
                <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-lg border border-line px-3 py-2 text-sm text-ink focus:border-coupon focus:outline-none"
                />
            </div>

            {error && <p className="text-sm text-coupon">{error}</p>}

            <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-ink px-5 py-2 text-sm font-semibold text-white transition hover:bg-ink/90 disabled:opacity-50"
            >
                {isSubmitting ? "Signing in…" : "Sign in"}
            </button>
        </form>
    );
}