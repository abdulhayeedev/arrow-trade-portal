// Read-only audit of every product attribute in the WooCommerce catalogue.
// Run from the project folder:
//   node --env-file=.env.local scripts/audit-attributes.mjs
// Optional: add a number to limit pages while testing, e.g. "... 5" reads 5 pages (500 products).

import fs from "node:fs";
import { pathToFileURL } from "node:url";
import pkg from "@woocommerce/woocommerce-rest-api";

const WooCommerceRestApi = pkg.default ?? pkg;

const clean = (s) => String(s ?? "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const csv = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const pct = (n, d) => (d ? Math.round((n / d) * 100) : 0);

export function analyse(products) {
  const attrs = new Map(); // normalised name -> stats
  const cats = new Map(); // category name -> stats
  let withoutAttrs = 0;

  for (const p of products) {
    const catNames = (p.categories ?? []).map((c) => clean(c.name)).filter(Boolean);
    const list = (p.attributes ?? []).filter((a) => clean(a.name));
    if (list.length === 0) withoutAttrs++;

    for (const c of catNames.length ? catNames : ["(no category)"]) {
      const s = cats.get(c) ?? { products: 0, withAttrs: 0 };
      s.products++;
      if (list.length) s.withAttrs++;
      cats.set(c, s);
    }

    for (const a of list) {
      const name = clean(a.name);
      const key = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
      const s = attrs.get(key) ?? {
        variants: new Map(),
        products: 0,
        values: 0,
        numeric: 0,
        withUnit: 0,
        samples: new Set(),
        cats: new Map(),
      };
      s.products++;
      s.variants.set(name, (s.variants.get(name) ?? 0) + 1);
      for (const c of catNames.length ? catNames : ["(no category)"]) {
        s.cats.set(c, (s.cats.get(c) ?? 0) + 1);
      }
      for (const raw of a.options ?? []) {
        const v = clean(raw);
        if (!v) continue;
        s.values++;
        if (/^-?\d+([.,]\d+)?$/.test(v)) s.numeric++;
        else if (/\d/.test(v) && /[a-zA-Z%"°]/.test(v)) s.withUnit++;
        if (s.samples.size < 6) s.samples.add(v);
      }
      attrs.set(key, s);
    }
  }
  return { attrs, cats, withoutAttrs, total: products.length };
}

export function toCsv({ attrs, cats }) {
  const attrRows = [...attrs.entries()]
    .sort((a, b) => b[1].products - a[1].products)
    .map(([, s]) => {
      const topCats = [...s.cats.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([c, n]) => `${c} (${n})`)
        .join("; ");
      const variants = [...s.variants.entries()].map(([v, n]) => `${v} (${n})`).join(" | ");
      return [
        variants,
        s.products,
        pct(s.numeric, s.values) + "%",
        pct(s.withUnit, s.values) + "%",
        topCats,
        [...s.samples].join(" | "),
      ]
        .map(csv)
        .join(",");
    });
  const attrCsv =
    "attribute (spelling variants),products using it,% plain numbers,% numbers with text/units,top categories,sample values\n" +
    attrRows.join("\n");

  const catRows = [...cats.entries()]
    .sort((a, b) => b[1].products - a[1].products)
    .map(([c, s]) => [c, s.products, s.withAttrs, pct(s.withAttrs, s.products) + "%"].map(csv).join(","));
  const catCsv = "category,products,products with attributes,% with attributes\n" + catRows.join("\n");

  return { attrCsv, catCsv };
}

async function main() {
  const { WOOCOMMERCE_URL, WOOCOMMERCE_CONSUMER_KEY, WOOCOMMERCE_CONSUMER_SECRET } = process.env;
  if (!WOOCOMMERCE_URL || !WOOCOMMERCE_CONSUMER_KEY || !WOOCOMMERCE_CONSUMER_SECRET) {
    console.error("Missing WooCommerce settings. Run with: node --env-file=.env.local scripts/audit-attributes.mjs");
    process.exit(1);
  }

  const api = new WooCommerceRestApi({
    url: WOOCOMMERCE_URL,
    consumerKey: WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: WOOCOMMERCE_CONSUMER_SECRET,
    version: "wc/v3",
    queryStringAuth: true,
    timeout: 60000,
  });

  const maxPages = Number(process.argv[2]) || Infinity;
  const products = [];

  for (let page = 1; page <= maxPages; page++) {
    let res;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        res = await api.get("products", {
          per_page: 100,
          page,
          status: "publish",
          _fields: "id,name,categories,attributes",
        });
        break;
      } catch (err) {
        if (attempt === 3) throw err;
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
    }
    const batch = res.data ?? [];
    products.push(...batch);
    process.stdout.write(`\rRead ${products.length} products (page ${page})...`);
    if (batch.length < 100) break;
  }
  console.log("\nAnalysing...");

  const result = analyse(products);
  const { attrCsv, catCsv } = toCsv(result);
  fs.writeFileSync("attribute-audit.csv", attrCsv);
  fs.writeFileSync("category-audit.csv", catCsv);

  console.log(`\nProducts read:            ${result.total}`);
  console.log(`Products with no attributes: ${result.withoutAttrs} (${pct(result.withoutAttrs, result.total)}%)`);
  console.log(`Distinct attribute names:    ${result.attrs.size}`);
  console.log("\nWrote attribute-audit.csv and category-audit.csv in this folder.");
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error("\nAudit failed:", err.message);
    process.exit(1);
  });
}