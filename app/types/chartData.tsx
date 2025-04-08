export interface chartData {
    totalOrders: number;
    totalProducts: number;
    totalRevenue: number;
    totalUsers: number;
    recentOrders: orderLast[];
    monthlySales: monthly[];
    categoryDistribution: catgoryDis[];
}

export interface orderLast {
    id: number;
    name: number;
    orderDate: string;
    totalAmount: number;
    status: string;
}

export interface monthly {
    month: number;
    sales: number;
}

export interface catgoryDis {
    categoryName: string;
    categoryID: number;
    sales: number;
    percentSales: number;
}