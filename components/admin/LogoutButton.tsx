"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleLogout}
            className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink transition hover:bg-white"
        >
            Log out
        </button>
    );
}