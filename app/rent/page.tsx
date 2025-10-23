import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import RentPageContent from '@/components/RentPageContent'

export default function RentPage() {
  return (
    <ClientOnlyWrapper>
      <RentPageContent />
    </ClientOnlyWrapper>
  )
}