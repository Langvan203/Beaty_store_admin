// "use client";
// import { chartData } from "@/app/types/chartData";
// import { createContext, useContext, useState, useEffect } from "react";
// import { useAuth } from "./AuthContext";

// interface ChartContextProps {
//   chartData: chartData | null
//   token: string | null;
//   refreshChart: (customYear?: number) => Promise<void>; // Đã sửa
// }

// const ChartContext = createContext<ChartContextProps | undefined>(undefined);

// export function ChartProvider({ children }: { children: React.ReactNode }) {
//   const { token, isLoading } = useAuth();
  
//   const [chartData, setChartData] = useState<chartData | null>(null)
//   useEffect(() => {
//     if (isLoading) return; // Đợi isLoading hoàn tất
//     if (!token) return;

//     fetch("http://localhost:5000/api/Order/Get-order-chart?year=2025", {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }).then((res) => res.json()).then((res) => {
//       if (res.status === 1) {
//         setChartData(res.data)
//       }
//       else {
//         console.log(res)
//       }
//     })


//   }, [token, isLoading]);

//   const refreshChart = async (customYear?: number) => {
//     fetch(`http://localhost:5000/api/Order/Get-order-chart?year=${customYear}`, {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }).then((res) => res.json()).then((res) => {
//       if (res.status === 1) {
//         setChartData(res.data)
//       }
//       else {
//         console.log(res)
//       }
//     })
//   }
//   return (
//     <ChartContext.Provider value={{ chartData, token, refreshChart }}>
//       {children}
//     </ChartContext.Provider>
//   );
// }

// export function useChart() {
//   const context = useContext(ChartContext);
//   if (!context) throw new Error("useChart must be used within a ChartProvider");
//   return context;
// }
"use client";
import { chartData } from "@/app/types/chartData";
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

interface ChartContextProps {
  chartData: chartData | null;
  token: string | null;
  refreshChart: (year: number | string) => Promise<void>;
  selectedYear: number | string;
  setSelectedYear: (year: number | string) => void;
}

const ChartContext = createContext<ChartContextProps | undefined>(undefined);

export function ChartProvider({ children }: { children: React.ReactNode }) {
  const { token, isLoading } = useAuth();
  const currentYear = new Date().getFullYear();
  
  const [chartData, setChartData] = useState<chartData | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | string>(currentYear);
  
  useEffect(() => {
    if (isLoading) return; // Đợi isLoading hoàn tất
    if (!token) return;
    
    // Gọi refreshChart khi component mount với năm hiện tại
    refreshChart(selectedYear);
  }, [token, isLoading, selectedYear]);

  const refreshChart = async (year: number | string = selectedYear): Promise<void> => {
    if (!token) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/Order/Get-order-chart?year=${year}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const result = await response.json();
      
      if (result.status === 1) {
        setChartData(result.data);
      } else {
        console.error("Failed to fetch chart data:", result);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    }
  };

  return (
    <ChartContext.Provider value={{ 
      chartData, 
      token, 
      refreshChart, 
      selectedYear, 
      setSelectedYear 
    }}>
      {children}
    </ChartContext.Provider>
  );
}

export function useChart() {
  const context = useContext(ChartContext);
  if (!context) throw new Error("useChart must be used within a ChartProvider");
  return context;
}