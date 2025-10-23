export const dynamic = 'force-dynamic'

import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import PaymentPageContent from '@/components/PaymentPageContent'

export default function PaymentPage() {
  return (
    <ClientOnlyWrapper>
      <PaymentPageContent />
    </ClientOnlyWrapper>
  )
}