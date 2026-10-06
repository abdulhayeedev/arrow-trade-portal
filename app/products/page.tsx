import { getProducts } from "@/lib/woocommerce";
import { addToBasket, toggleSavedPart } from "@/app/products/actions";
import { getSavedProductIds } from "@/lib/saved-parts";
import { createClient } from "@/lib/supabase/server";
import SiteHeader from "@/components/SiteHeader";

export const revalidate = 300; // re-fetch from WooCommerce at most every 5 minutes

const PER_PAGE = 20;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; message?: string; page?: string };
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const savedIds = await getSavedProductIds(user?.id ?? null);

  const query = searchParams.q?.trim();
  const currentPage = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const products = query
    ? await getProducts({ search: query, page: currentPage, per_page: PER_PAGE })
    : [];

  const pageLink = (page: number) =>
    `/products?q=${encodeURIComponent(query ?? "")}&page=${page}`;

  return (
    <main className="min-h-screen bg-[#FAFAFB] text-[#14171F]">
      <SiteHeader active="Find products" user={user} />

      <div className="mx-auto max-w-[1280px] px-10 py-10">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-[28px] font-bold">
            {query ? `Results for "${query}"` : "Search for a product"}
          </h1>
          <a href="/" className="text-sm font-semibold text-[#FF4438]">
            ← Back to search
          </a>
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
          <>
            <div className="grid grid-cols-4 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-[#E5E5E7] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(20,23,31,0.10)]"
                >
                  <a
                    href={product.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-square bg-[#FAFAFB] p-8"
                  >
                    {product.images?.[0]?.src ? (
                      <img
                        src={product.images[0].src}
                        alt={product.images[0].alt || product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="text-xs text-[#9AA2B1]">No image</span>
                      </div>
                    )}
                  </a>
                  <div className="flex grow flex-col gap-1.5 border-t border-[#F1F2F4] p-4">
                    <a
                      href={product.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-[#14171F] hover:text-[#FF4438]"
                    >
                      {product.name}
                    </a>
                    <span className="text-[11px] text-[#9AA2B1]">SKU: {product.sku || "—"}</span>

                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-heading text-lg font-bold text-[#FF4438]">
                        £{product.price}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${
                          product.stock_status === "instock" ? "text-[#1D7A34]" : "text-[#9AA2B1]"
                        }`}
                      >
                        {product.stock_status === "instock" ? "In stock" : "Out of stock"}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      {product.stock_status === "instock" && (
                        <form action={addToBasket} className="grow">
                          <input type="hidden" name="wooProductId" value={product.id} />
                          <input type="hidden" name="productName" value={product.name} />
                          <input type="hidden" name="price" value={product.price} />
                          <input type="hidden" name="returnQuery" value={query} />
                          <button
                            type="submit"
                            className="h-10 w-full rounded-xl bg-[#14171F] text-[12.5px] font-bold text-white transition-colors hover:bg-[#2A2E38]"
                          >
                            Add to basket
                          </button>
                        </form>
                      )}
                      {user && (
                        <form action={toggleSavedPart}>
                          <input type="hidden" name="wooProductId" value={product.id} />
                          <input type="hidden" name="productName" value={product.name} />
                          <input type="hidden" name="returnQuery" value={query} />
                          <input type="hidden" name="returnPage" value={currentPage} />
                          <button
                            type="submit"
                            aria-label={
                              savedIds.has(product.id) ? "Remove from saved parts" : "Save this part"
                            }
                            title={
                              savedIds.has(product.id) ? "Remove from saved parts" : "Save this part"
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E5E5E7] bg-white transition-colors hover:border-[#FF4438]"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill={savedIds.has(product.id) ? "#FF4438" : "none"}
                              stroke={savedIds.has(product.id) ? "#FF4438" : "#6B7280"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 flex items-center justify-center gap-3">
              {currentPage > 1 && (
                <a
                  href={pageLink(currentPage - 1)}
                  className="flex h-9 items-center rounded-lg border border-[#E5E5E7] bg-white px-4 text-sm font-semibold text-[#14171F] shadow-sm"
                >
                  ← Previous
                </a>
              )}
              <span className="text-sm font-semibold text-[#6B7280]">Page {currentPage}</span>
              {products.length === PER_PAGE && (
                <a
                  href={pageLink(currentPage + 1)}
                  className="flex h-9 items-center rounded-lg border border-[#E5E5E7] bg-white px-4 text-sm font-semibold text-[#14171F] shadow-sm"
                >
                  Next →
                </a>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}