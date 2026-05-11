import { Container } from "@/components/Container";
import { getPackages } from "./actions";
import { PackagesView } from "./PackagesView";
import { getTranslations } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function PackagesPage() {
  const initialPackages = await getPackages();
  const dict = await getTranslations();

  return (
    <PackagesView initialPackages={initialPackages} />
  );
}
