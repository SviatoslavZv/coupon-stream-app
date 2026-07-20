import { createStore } from "@/lib/actions/stores";
import StoreForm from "@/components/admin/StoreForm";

export default function NewStorePage() {
    return (
        <div className="mx-auto max-w-xl px-4 py-10">
            <h1 className="mb-4 font-display text-2xl font-black text-ink">
                Add Store
            </h1>

            <StoreForm action={createStore} />
        </div>
    );
}