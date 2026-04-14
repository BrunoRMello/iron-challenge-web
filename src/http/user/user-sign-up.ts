import { AuthError, createUserWithEmailAndPassword, updateProfile, UserCredential } from 'firebase/auth'

import { auth } from '@/firebase/client'
import { AuthErrorCustom } from '@/lib/auth/auth-error-custom'

import { setCookie } from 'cookies-next/client'
import { api } from '@/helpers/api'

export type TUserSignUpProps = {
  displayName: string;
  email: string
  password: string
}

export const signUp = async ({
  displayName,
  email,
  password,
}: TUserSignUpProps): Promise<void> => {
  try {
    const res: UserCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    )

    await updateProfile(res.user, { displayName });

    const token = await res?.user?.getIdToken()
    const uid = await res?.user?.uid

    api.post('/user', {
      token: uid,
    })
    .then(res => console.log('🚀 ~ api ~ res:', res.data))
    .catch(err => console.log('🚀 ~ api ~ err:', err))

    setCookie('token', token)
  } catch (err) {
    console.error('🚀 ~ err:', err)

    if ((err as AuthError)?.code) {
      const { code, message } = err as AuthError

      throw new AuthErrorCustom(code, message)
    }

    throw new AuthErrorCustom('unknown/error', 'Erro desconhecido.')
  }
}
