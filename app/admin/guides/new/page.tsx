import { createGuide } from "@/lib/actions/guides";
import GuideForm from "@/components/admin/GuideForm";

export default function NewGuidePage() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <h1 className="mb-6 font-display text-2xl font-black text-ink">Add Guide</h1>
            <GuideForm action={createGuide} />
        </div>
    );
}