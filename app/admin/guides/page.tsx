import type { Metadata } from "next";
import Link from "next/link";
import { getGuidesForAdmin } from "@/lib/guides";
import { deleteGuide } from "@/lib/actions/guides";
import { ADMIN_ROUTES } from "@/lib/constants/admin";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";

export const metadata: Metadata = {
    title: "Guides",
};

export default async function AdminGuidesPage() {
    const guides = await getGuidesForAdmin();

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <AdminPageHeader title="Guides" count={guides.length}>
                <Link
                    href={ADMIN_ROUTES.guideNew}
                    className="rounded-full bg-coupon px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    + Add Guide
                </Link>
            </AdminPageHeader>

            <AdminTableFrame>
                <table className="w-full text-left text-sm">
                    <thead className="border-b border-line bg-paper">
                        <tr>
                            <th className="px-5 py-3 font-medium text-ink/60">Title</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Items</th>
                            <th className="px-5 py-3 font-medium text-ink/60">Status</th>
                            <th className="px-5 py-3 font-medium text-ink/60"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {guides.map((guide) => (
                            <tr key={guide.id} className="border-b border-line last:border-0">
                                <td className="px-5 py-3 font-medium text-ink">{guide.title}</td>
                                <td className="px-5 py-3 font-mono text-ink/60">{guide.itemCount}</td>
                                <td className={`px-5 py-3 text-xs font-medium ${guide.isPublished ? "text-green-600" : "text-ink/40"}`}>
                                    {guide.isPublished ? "Published" : "Draft"}
                                </td>
                                <td className="px-5 py-3">
                                    <div className="flex items-center justify-end gap-3">
                                        <Link
                                            href={ADMIN_ROUTES.guideEdit(guide.id)}
                                            className="text-xs font-medium text-ink/60 hover:text-ink"
                                        >
                                            Edit
                                        </Link>
                                        <form action={deleteGuide}>
                                            <input type="hidden" name="id" value={guide.id} />
                                            <ConfirmSubmitButton
                                                message="Delete this guide? Its links and coupons stay, only the guide is removed."
                                                className="text-xs font-medium text-coupon hover:text-coupon/70"
                                            >
                                                Delete
                                            </ConfirmSubmitButton>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </AdminTableFrame>
        </div>
    );
}