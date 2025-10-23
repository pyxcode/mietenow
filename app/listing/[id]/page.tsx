export const dynamic = 'force-dynamic'

import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import ListingDetailPageContent from '@/components/ListingDetailPageContent'

export default function ListingDetailPage() {
  return (
    <ClientOnlyWrapper>
      <ListingDetailPageContent />
    </ClientOnlyWrapper>
  )
}