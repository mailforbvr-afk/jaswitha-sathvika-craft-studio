import { ProductCard } from "@/components/site/ProductCard";
import type { Product } from "@/lib/supabase/types";

type ProductPreviewProps = {
  product: Product;
  onClose: () => void;
};

export function ProductPreview({ product, onClose }: ProductPreviewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-title"
        className="max-h-[90vh] w-full max-w-md overflow-auto rounded-[2rem] bg-cream p-4"
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="preview-title" className="font-display text-2xl">
            Preview
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white px-4 py-2 font-bold"
          >
            Close
          </button>
        </div>
        <ProductCard product={product} />
      </div>
    </div>
  );
}
