export const dynamic = 'force-dynamic'

import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import PaymentSuccessPageContent from '@/components/PaymentSuccessPageContent'

export default function PaymentSuccess() {
  return (
    <ClientOnlyWrapper>
      <PaymentSuccessPageContent />
    </ClientOnlyWrapper>
  )
}