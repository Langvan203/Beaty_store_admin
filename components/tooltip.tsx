import React from "react";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      categoryName: string;
      percentSales: number;
      // Bạn có thể thêm các trường khác nếu cần
    }
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const { categoryName, percentSales } = payload[0].payload;
    return (
      <div className="custom-tooltip" style={{ backgroundColor: "#fff", padding: "5px", border: "1px solid #ccc" }}>
        <p>{`${categoryName}`}</p>
        <p>{`Percent Sales: ${percentSales.toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
