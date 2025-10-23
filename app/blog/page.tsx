import NoSSRWrapper from '@/components/NoSSRWrapper'
import BlogPageContent from '@/components/BlogPageContent'

export const dynamic = 'force-dynamic'

export default function BlogPage() {
  return (
    <NoSSRWrapper>
      <BlogPageContent />
    </NoSSRWrapper>
  )
}