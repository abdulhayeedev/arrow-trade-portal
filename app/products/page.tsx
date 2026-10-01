import { getProducts } from "@/lib/woocommerce";
import { addToBasket } from "@/app/products/actions";

export const revalidate = 300; // re-fetch from WooCommerce at most every 5 minutes

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; message?: string };
}) {
  const query = searchParams.q?.trim();
  const products = query ? await getProducts({ search: query }) : [];

  return (
    <main className="min-h-screen bg-white px-12 py-12 text-[#14171F]">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">
          {query ? `Results for "${query}"` : "Search for a product"}
        </h1>
        <div className="flex items-center gap-5">
          <a href="/basket" className="text-sm font-semibold text-[#14171F]">
            Basket →
          </a>
          <a href="/" className="text-sm font-semibold text-[#FF4438]">
            ← Back to search
          </a>
        </div>
      </div>

      {searchParams.message && (
        <div className="mb-6 rounded-lg border border-[#1D7A34] bg-[#EAF6EC] px-4 py-3 text-sm text-[#1D7A34]">
          {searchParams.message}
        </div>
      )}

      {!query ? (
        <p className="text-[#6B7280]">
          Use the search bar on the homepage to find a product by reference, dimensions, or
          application.
        </p>
      ) : products.length === 0 ? (
        <p className="text-[#6B7280]">No products found for that search.</p>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-col overflow-hidden rounded-xl border border-[#E5E5E7] bg-white shadow-sm"
            >
              <a href={product.permalink} target="_blank" rel="noopener noreferrer">
                <div className="flex h-40 items-center justify-center bg-[#FAFAFB]">
                  {product.images?.[0]?.src ? (
                    <img
                      src={product.images[0].src}
                      alt={product.images[0].alt || product.name}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-[#9AA2B1]">No image</span>
                  )}
                </div>
              </a>
              <div className="flex flex-col gap-1 p-4">
                <a
                  href={product.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[#14171F] hover:text-[#FF4438]"
                >
                  {product.name}
                </a>
                <span className="text-xs text-[#9AA2B1]">SKU: {product.sku || "—"}</span>
                <span className="mt-1 text-sm font-bold text-[#FF4438]">£{product.price}</span>
                <span
                  className={`mt-1 text-xs font-semibold ${
                    product.stock_status === "instock" ? "text-[#1D7A34]" : "text-[#9AA2B1]"
                  }`}
                >
                  {product.stock_status === "instock" ? "In stock" : "Out of stock"}
                </span>

                {product.stock_status === "instock" && (
                  <form action={addToBasket} className="mt-2">
                    <input type="hidden" name="wooProductId" value={product.id} />
                    <input type="hidden" name="productName" value={product.name} />
                    <input type="hidden" name="price" value={product.price} />
                    <input type="hidden" name="returnQuery" value={query} />
                    <button
                      type="submit"
                      className="h-9 w-full rounded-lg bg-[#14171F] text-xs font-bold text-white"
                    >
                      Add to basket
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}