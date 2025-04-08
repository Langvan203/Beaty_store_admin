"use client";
import { Brand } from "@/app/types/brand";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ChartContextProps {
  brand: Brand[] | null;
  token: string | null;
  refeshBrand: () => Promise<void>;
}

const BrandContext = createContext<ChartContextProps | undefined>(undefined);

export function BrandProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [brand, setBrand] = useState<Brand[]>([])
  useEffect(() => {
    if (isLoading) return; // Đợi isLoading hoàn tất
    if (!token) return;


    fetch("http://localhost:5000/api/Brand/GetAllBrandAdmin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setBrand(res.data)
      }
      else {
        console.log(res)
      }
    })


  }, [token, isLoading]);
  const refeshBrand = async () => {
    fetch("http://localhost:5000/api/Brand/GetAllBrandAdmin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setBrand(res.data)
      }
      else {
        console.log(res)
      }
    })
  }
  return (
    <BrandContext.Provider value={{ brand, token, refeshBrand }}>
      {children}
    </BrandContext.Provider>
  );
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error("useChart must be used within a ChartProvider");
  return context;
}