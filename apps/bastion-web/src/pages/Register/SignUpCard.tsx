import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface SignUpCardProps {
  onSignUpClick: () => void;
}

export function SignUpCard({ onSignUpClick }: SignUpCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onSignUpClick} className="w-full">
          Sign Up
        </Button>
      </CardContent>
    </Card>
  )
}
