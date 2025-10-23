import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import HomePageContent from '@/components/HomePageContent'

export default function HomePage() {
  return (
    <ClientOnlyWrapper>
      <HomePageContent />
    </ClientOnlyWrapper>
  )
}