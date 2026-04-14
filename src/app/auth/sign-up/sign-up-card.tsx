import { Logo } from '@/components/logo'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { SignUpForm } from './sign-up-form'

export function SignUpCard() {
  return (
    <Card className="h-auto w-full max-w-96">
      <CardHeader className="flex h-auto w-full flex-col gap-4">
        <Logo />

        <div className="h-auto w-full">
          <CardTitle>Criar conta</CardTitle>
          <CardDescription>Inscreva-se para começar.</CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <SignUpForm />
      </CardContent>

      <CardFooter className="flex h-auto w-full flex-col gap-4"></CardFooter>
    </Card>
  )
}
