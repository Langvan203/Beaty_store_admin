"use client";
import { Category } from "@/app/types/categories";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ChartContextProps {
  Category: Category[] | null;
  token: string | null;
  refeshCategories: () => Promise<void>;
}

const CategoryContext = createContext<ChartContextProps | undefined>(undefined);

export function CategoryProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const [Category, setCategory] = useState<Category[]>([])
  useEffect(() => {
    if (isLoading) return; // Đợi isLoading hoàn tất
    if (!token) return;


    fetch("http://localhost:5000/api/Category/Get-all-categories-admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setCategory(res.data)
      }
      else {
        console.log(res)
      }
    })


  }, [token, isLoading]);
  const refeshCategories = async () => {
    fetch("http://localhost:5000/api/Category/Get-all-categories-admin", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((res) => res.json()).then((res) => {
      if (res.status === 1) {
        setCategory(res.data)
      }
      else {
        console.log(res)
      }
    })
  }
  return (
    <CategoryContext.Provider value={{ Category, token,refeshCategories }}>
      {children}
    </CategoryContext.Provider>
  );
}

export function useCategory() {
  const context = useContext(CategoryContext);
  if (!context) throw new Error("useChart must be used within a ChartProvider");
  return context;
}