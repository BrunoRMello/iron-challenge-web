import { AuthError, sendPasswordResetEmail } from 'firebase/auth'

import { auth } from '@/firebase/client'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

type TUserResetPasswordProps = {
  email: string
}

export const resetPassword = async ({
  email,
}: TUserResetPasswordProps): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email)
  } catch (err) {
    console.log('🚀 ~ err:', err)

    if ((err as AuthError)?.code) {
      const { code, message } = err as AuthError

      throw new AuthErrorCustom(code, message)
    }

    throw new AuthErrorCustom('unknown/error', 'Erro desconhecido.')
  }
}
