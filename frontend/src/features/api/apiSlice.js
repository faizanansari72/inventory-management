import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Resolve the backend URL with this precedence:
//   1. Runtime config injected by Docker (window.ENV.VITE_API_URL)
//   2. Build-time Vite env (VITE_API_URL) — used on Vercel/Netlify
//   3. Local dev fallback
const runtimeUrl =
  typeof window !== "undefined" && window.ENV && window.ENV.VITE_API_URL;
const rawBaseUrl =
  runtimeUrl || import.meta.env.VITE_API_URL || "http://localhost:5000";

// Normalize the configured URL so a protocol-less value (e.g.
// "my-backend.up.railway.app") isn't treated as a relative path by the browser.
const normalizeBaseUrl = (url) => {
  let u = String(url).trim().replace(/\/+$/, "");
  if (u && !/^https?:\/\//i.test(u)) {
    // Assume HTTPS unless it's an explicit localhost/127.0.0.1 dev address.
    u = (/^(localhost|127\.0\.0\.1)/.test(u) ? "http://" : "https://") + u;
  }
  return u;
};

const API_BASE_URL = normalizeBaseUrl(rawBaseUrl);

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE_URL }),
  tagTypes: ["Product", "Customer", "Order", "Dashboard"],
  endpoints: (builder) => ({
    // ---------- Dashboard ----------
    getDashboard: builder.query({
      query: () => "/dashboard",
      providesTags: ["Dashboard"],
    }),

    // ---------- Products ----------
    getProducts: builder.query({
      query: () => "/products",
      providesTags: ["Product"],
    }),
    getProduct: builder.query({
      query: (id) => `/products/${id}`,
      providesTags: (r, e, id) => [{ type: "Product", id }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Product", "Dashboard"],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Product", "Dashboard"],
    }),

    // ---------- Customers ----------
    getCustomers: builder.query({
      query: () => "/customers",
      providesTags: ["Customer"],
    }),
    createCustomer: builder.mutation({
      query: (body) => ({ url: "/customers", method: "POST", body }),
      invalidatesTags: ["Customer", "Dashboard"],
    }),
    deleteCustomer: builder.mutation({
      query: (id) => ({ url: `/customers/${id}`, method: "DELETE" }),
      invalidatesTags: ["Customer", "Dashboard"],
    }),

    // ---------- Orders ----------
    getOrders: builder.query({
      query: () => "/orders",
      providesTags: ["Order"],
    }),
    getOrder: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (r, e, id) => [{ type: "Order", id }],
    }),
    createOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      // An order changes stock and totals, so refresh everything affected.
      invalidatesTags: ["Order", "Product", "Dashboard"],
    }),
    deleteOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}`, method: "DELETE" }),
      invalidatesTags: ["Order", "Product", "Dashboard"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetProductsQuery,
  useGetProductQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCustomersQuery,
  useCreateCustomerMutation,
  useDeleteCustomerMutation,
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useDeleteOrderMutation,
} = apiSlice;
