import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import CriteriaPageContent from '@/components/CriteriaPageContent'

export default function CriteriaPage() {
  return (
    <ClientOnlyWrapper>
      <CriteriaPageContent />
    </ClientOnlyWrapper>
  )
}