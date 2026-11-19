import Link from "next/link";
import { getGuidesForAdmin } from "@/lib/guides";
import { deleteGuide } from "@/lib/actions/guides";
import AdminTableFrame from "@/components/admin/AdminTableFrame";
import ConfirmSubmitButton from "@/components/admin/ConfirmSubmitButton";
import { ADMIN_ROUTES } from "@/lib/constants/admin";


export default async function AdminDashboard() {
    const guides = await getGuidesForAdmin();

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="mb-8 font-display text-2xl font-black text-ink">Dashboard</h1>

            <div className="mb-4 mt-10 flex items-center justify-between">
                <h2 className="font-display text-xl font-black text-ink">
                    Guides <span className="font-mono text-sm font-normal text-ink/50">({guides.length})</span>
                </h2>
                <Link
                    href={ADMIN_ROUTES.guideNew}
                    className="rounded-full bg-coupon px-4 py-2 text-sm font-semibold text-white transition hover:bg-coupon/90"
                >
                    + Add Guide
                </Link>
            </div>

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