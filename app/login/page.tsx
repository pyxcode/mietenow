export const dynamic = 'force-dynamic'

import ClientOnlyWrapper from '@/components/ClientOnlyWrapper'
import LoginPageContent from '@/components/LoginPageContent'

export default function LoginPage() {
  return (
    <ClientOnlyWrapper>
      <LoginPageContent />
    </ClientOnlyWrapper>
  )
}