import { Suspense } from 'react'
import PaymentPageClient from '@/components/PaymentPageClient'

export const dynamic = 'force-dynamic'

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <PaymentPageClient />
    </Suspense>
  )
}