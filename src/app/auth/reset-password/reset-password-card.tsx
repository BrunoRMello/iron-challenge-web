import { Logo } from '@/components/logo'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { ResetPasswordForm } from './reset-password-form'

export function ResetPasswordCard() {
  return (
    <Card className="h-auto w-full max-w-96">
      <CardHeader className="flex h-auto w-full flex-col gap-4">
        <Logo />

        <div className="h-auto w-full">
          <CardTitle>Recuperar senha</CardTitle>
          <CardDescription>
            Digite seu e-mail para redefinir sua senha.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <ResetPasswordForm />
      </CardContent>

      <CardFooter className="flex h-auto w-full flex-col gap-4"></CardFooter>
    </Card>
  )
}
