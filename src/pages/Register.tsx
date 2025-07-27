import { useUser } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'
import SignupForm from '@/components/SignupForm'

export default function Auth() {
  const { isSignedIn } = useUser()

  if (isSignedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
    <SignupForm/>
    </div>
  )
}
