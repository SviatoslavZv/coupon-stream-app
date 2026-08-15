import { getStores } from "@/lib/stores";
import HeaderClient from "@/components/layout/HeaderClient";

export default async function Header() {
    const stores = await getStores();

    return <HeaderClient stores={stores} />;
}