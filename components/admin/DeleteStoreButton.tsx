"use client";

export default function DeleteStoreButton() {
    return (
        <button
            type="submit"
            onClick={(e) => {
                if (!confirm("Delete this store and ALL its coupons?")) {
                    e.preventDefault();
                }
            }}
            className="text-xs font-medium text-coupon hover:text-coupon/70"
        >
            Delete
        </button>
    );
}