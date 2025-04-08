"use client";
import { Product, ProductUpdate } from "@/app/types/product";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ChartContextProps {
  product: Product[] | null;
  token: string | null;
  refreshProduct: () => Promise<void>; // Đã sửa
}

const ProductContext = createContext<ChartContextProps | undefined>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [product, setProduct] = useState<Product[]>([])
  useEffect(() => {
    if (isLoading) return; // Đợi isLoading hoàn tất
    if (!token) return;

    fetch("http://localhost:5000/api/Product/Get-all-product-admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setProduct(res.data)
      }
      else {
        console.log(res)
      }
    })
  }, [token, isLoading]);
  const refreshProduct = async () => {
    fetch("http://localhost:5000/api/Product/Get-all-product-admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setProduct(res.data)
      }
      else {
        console.log(res)
      }
    })
  }
  return (
    <ProductContext.Provider value={{ product, token,refreshProduct }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useChart must be used within a ChartProvider");
  return context;
}