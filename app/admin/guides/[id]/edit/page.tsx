import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuideForEdit } from "@/lib/guides";
import { updateGuide } from "@/lib/actions/guides";
import GuideForm from "@/components/admin/GuideForm";

export default async function EditGuidePage(props: PageProps<"/admin/guides/[id]/edit">) {
    const { id } = await props.params;
    const guide = await getGuideForEdit(id);

    if (!guide) {
        notFound();
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h1 className="font-display text-2xl font-black text-ink">Edit Guide</h1>
                {guide.isPublished && (
                    <Link
                        href={`/guides/${guide.slug}`}
                        target="_blank"
                        className="text-sm font-medium text-ink/60 hover:text-ink"
                    >
                        View on site ↗
                    </Link>
                )}
            </div>
            <GuideForm action={updateGuide} initialValues={guide} />
        </div>
    );
}