import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/hooks/AuthContext'
import { ToastContainer } from "react-toastify"
import { ChartProvider } from '@/hooks/ChartContext'
import { ProductProvider } from '@/hooks/ProductContext'
import { BrandProvider } from '@/hooks/BrandContext'
import { CategoryProvider } from '@/hooks/CategoryContext'
import { VariantProvider } from '@/hooks/VariantContext'
// import { ChartProvider } from '@/hooks/ChartContext'
export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: '',
  generator: '',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ChartProvider>
            <ProductProvider>
              <BrandProvider>
              <CategoryProvider>
                <VariantProvider>
                  {children}
                </VariantProvider>
              </CategoryProvider>
              </BrandProvider>
            </ProductProvider>
          </ChartProvider>
        </AuthProvider>
        <ToastContainer />
      </body>
    </html >
  )
}
