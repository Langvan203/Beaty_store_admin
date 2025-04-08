export interface Product {
    id: number;
    name: string;
    category: string;
    brand: string;
    price: number;
    stock: number;
    discount: number;
}


export interface ProductUpdate {
    id: number;
    name: string;
    desscription: string;
    price: number;
    stock: number;
    discount: number;
    categoryId: string;
    brandId: string;
    ingredient: string;
    userManual: string;
    variant: string[]; // lưu các id
    images: File[];
    existingImages: [
        {
            id: number;
            url: string;
            isMain: boolean;
        }
    ]
    mainNewImageIndex: number;
}