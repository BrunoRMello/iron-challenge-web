const resetPasswordSuccess = {
  title: 'E-mail enviado:',
  description:
    'Um e-mail de recuperação de senha foi enviado. Verifique sua caixa de entrada.',
}

export const signInSuccess = {
  title: 'Login realizado:',
  description: 'Você foi autenticado com sucesso. Bem-vindo!',
}

export const signUpSuccess = {
  title: 'Conta criada:',
  description: 'Sua conta foi criada com sucesso. Bem-vindo!',
}

export const formatSuccessMessages = (
  type: 'resetpassword' | 'signin' | 'signup',
) => {
  const successMessages = {
    resetpassword: resetPasswordSuccess,
    signin: signInSuccess,
    signup: signUpSuccess,
  }
  return successMessages[type]
}
