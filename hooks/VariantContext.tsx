"use client";
import { Variant } from "@/app/types/variant";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ChartContextProps {
  Variant: Variant[] | null;
  token: string | null;
  refreshVariant: () => Promise<void>;
}

const VariantContext = createContext<ChartContextProps | undefined>(undefined);

export function VariantProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [Variant, setVariant] = useState<Variant[]>([])
  useEffect(() => {
    if (isLoading) return; // Đợi isLoading hoàn tất
    if (!token) return;


    fetch("http://localhost:5000/api/VariantType/Get-all-variantype-admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setVariant(res.data)
      }
      else {
        console.log(res)
      }
    })

  }, [token, isLoading]);
  const refreshVariant = async () => {
    fetch("http://localhost:5000/api/VariantType/Get-all-variantype-admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setVariant(res.data)
      }
      else {
        console.log(res)
      }
    })
  }
  return (
    <VariantContext.Provider value={{ Variant, token,refreshVariant }}>
      {children}
    </VariantContext.Provider>
  );
}

export function useVariant() {
  const context = useContext(VariantContext);
  if (!context) throw new Error("useChart must be used within a ChartProvider");
  return context;
}