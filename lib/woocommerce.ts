import WooCommerceRestApi from "@woocommerce/woocommerce-rest-api";

// Server-side only. Never import this file from a "use client" component —
// the consumer secret must never reach the browser.
const api = new WooCommerceRestApi({
  url: process.env.WOOCOMMERCE_URL as string,
  consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY as string,
  consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET as string,
  version: "wc/v3",
  queryStringAuth: true,
});

export type WooProduct = {
  id: number;
  name: string;
  sku: string;
  price: string;
  regular_price: string;
  permalink: string;
  stock_status: string;
  images: { src: string; alt: string }[];
  short_description: string;
};

export async function getProducts(params: {
  search?: string;
  per_page?: number;
  page?: number;
} = {}): Promise<WooProduct[]> {
  const response = await api.get("products", {
    per_page: params.per_page ?? 24,
    page: params.page ?? 1,
    ...(params.search ? { search: params.search } : {}),
  });
  return response.data as WooProduct[];
}

export async function getProduct(id: number): Promise<WooProduct> {
  const response = await api.get(`products/${id}`);
  return response.data as WooProduct;
}

export type WooOrderLineItem = {
  product_id: number;
  quantity: number;
};

export type WooOrderResult = {
  id: number;
  number: string;
  status: string;
  total: string;
  payment_url?: string;
  order_key?: string;
};

export async function createOrder(params: {
  email: string;
  companyName: string;
  lineItems: WooOrderLineItem[];
}): Promise<WooOrderResult> {
  const response = await api.post("orders", {
    payment_method: "trade-account",
    payment_method_title: "Trade Account",
    set_paid: false,
    billing: {
      email: params.email,
      company: params.companyName,
      first_name: params.companyName,
      last_name: "Trade Account",
    },
    line_items: params.lineItems,
  });
  return response.data as WooOrderResult;
}
export async function getProductsByIds(ids: number[]): Promise<WooProduct[]> {
  if (ids.length === 0) return [];
  try {
    const response = await api.get("products", {
      include: ids.join(","),
      per_page: Math.min(ids.length, 100),
    });
    return response.data as WooProduct[];
  } catch {
    return [];
  }
}
export type WooAddress = {
  first_name: string;
  last_name: string;
  company: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  country: string;
};

export async function createOrderWithDetails(params: {
  email: string;
  phone: string;
  companyId: string;
  billing: WooAddress;
  shipping: WooAddress;
  lineItems: WooOrderLineItem[];
  note?: string;
  poNumber?: string;
}): Promise<WooOrderResult> {
  const response = await api.post("orders", {
    set_paid: false,
    billing: { ...params.billing, email: params.email, phone: params.phone },
    shipping: params.shipping,
    customer_note: params.note ?? "",
    line_items: params.lineItems,
    meta_data: [
      { key: "trade_portal_company_id", value: params.companyId },
      ...(params.poNumber ? [{ key: "po_number", value: params.poNumber }] : []),
    ],
  });
  return response.data as WooOrderResult;
}