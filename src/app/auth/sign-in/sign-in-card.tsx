import { Logo } from '@/components/logo'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { SignInForm } from './sign-in-form'

export function SignInCard() {
  return (
    <Card className="h-auto w-full max-w-96">
      <CardHeader className="flex h-auto w-full flex-col gap-4">
        <Logo />

        <div className="h-auto w-full">
          <CardTitle>Acessar conta</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar sua conta.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <SignInForm />
      </CardContent>

      <CardFooter className="flex h-auto w-full flex-col gap-4"></CardFooter>
    </Card>
  )
}
