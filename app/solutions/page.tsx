import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import SolutionsPageContent from '@/components/SolutionsPageContent'

export default function SolutionsPage() {
  return (
    <ClientOnlyWrapper>
      <SolutionsPageContent />
    </ClientOnlyWrapper>
  )
}