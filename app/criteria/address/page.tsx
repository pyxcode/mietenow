export const dynamic = 'force-dynamic'

import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import CriteriaAddressPageContent from '@/components/CriteriaAddressPageContent'

export default function CriteriaAddressPage() {
  return (
    <ClientOnlyWrapper>
      <CriteriaAddressPageContent />
    </ClientOnlyWrapper>
  )
}