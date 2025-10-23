import NoSSRWrapper from '@/components/NoSSRWrapper'
import AboutPageContent from '@/components/AboutPageContent'

export const dynamic = 'force-dynamic'

export default function AboutPage() {
  return (
    <NoSSRWrapper>
      <AboutPageContent />
    </NoSSRWrapper>
  )
}