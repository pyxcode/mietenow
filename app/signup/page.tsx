import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import SignupPageContent from '@/components/SignupPageContent'

export default function SignupPage() {
  return (
    <ClientOnlyWrapper>
      <SignupPageContent />
    </ClientOnlyWrapper>
  )
}