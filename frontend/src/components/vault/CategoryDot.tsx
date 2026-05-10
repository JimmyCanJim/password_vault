import type { Category } from "@/lib/vault";

export const CATEGORY_COLORS: Record<Category, string> = {
  Account: "var(--teal)",
  PIN: "var(--coral)",
  "Wi-Fi": "var(--amber)",
  Card: "var(--indigo)",
  Note: "var(--seal)",
};

export function CategoryDot({ category, size = 12 }: { category: Category; size?: number }) {
  return (
    <span
      aria-hidden
      className="inline-block rounded-full"
      style={{ width: size, height: size, backgroundColor: CATEGORY_COLORS[category] }}
    />
  );
}
