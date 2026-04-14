export const resetPasswordErrors: Record<
  string,
  { title: string; description: string }
> = {
  'auth/user-not-found': {
    title: 'Usuário não encontrado:',
    description: 'Nenhum usuário foi encontrado com o e-mail fornecido.',
  },
  'auth/invalid-email': {
    title: 'E-mail inválido:',
    description: 'O endereço de e-mail fornecido é inválido. Tente novamente.',
  },
  'unknown/error': {
    title: 'Erro desconhecido:',
    description:
      'Ocorreu um erro ao tentar recuperar a senha. Tente novamente mais tarde.',
  },
}

export const signInErrors: Record<
  string,
  { title: string; description: string }
> = {
  'auth/wrong-password': {
    title: 'Senha incorreta:',
    description: 'A senha fornecida está incorreta. Tente novamente.',
  },
  'auth/user-not-found': {
    title: 'Usuário não encontrado:',
    description: 'Nenhum usuário foi encontrado com o e-mail fornecido.',
  },
  'auth/too-many-requests': {
    title: 'Muitas tentativas:',
    description:
      'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.',
  },
  'auth/network-request-failed': {
    title: 'Problema de conexão:',
    description:
      'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
  },
  'auth/popup-closed-by-user': {
    title: 'Login cancelado:',
    description: 'O popup de autenticação foi fechado antes da conclusão.',
  },
  'auth/cancelled-popup-request': {
    title: 'Requisição cancelada:',
    description:
      'Já existe uma tentativa de login em andamento. Aguarde ou tente novamente.',
  },
  'unknown/error': {
    title: 'Erro desconhecido:',
    description:
      'Ocorreu um erro inesperado durante o login. Tente novamente mais tarde.',
  },
}

export const signUpErrors: Record<
  string,
  { title: string; description: string }
> = {
  'auth/email-already-in-use': {
    title: 'E-mail em uso:',
    description: 'O e-mail fornecido já está sendo usado por outra conta.',
  },
  'auth/weak-password': {
    title: 'Senha fraca:',
    description: 'A senha deve ter pelo menos 6 caracteres.',
  },
  'auth/invalid-email': {
    title: 'E-mail inválido:',
    description: 'O endereço de e-mail fornecido é inválido. Tente novamente.',
  },
  'auth/network-request-failed': {
    title: 'Problema de conexão:',
    description:
      'Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.',
  },
  'unknown/error': {
    title: 'Erro desconhecido:',
    description:
      'Ocorreu um erro inesperado durante a criação da conta. Tente novamente mais tarde.',
  },
}

export const formatErrorMessages = (
  type: 'resetpassword' | 'signin' | 'signup',
  code: string,
) => {
  const errorMessages = {
    resetpassword: resetPasswordErrors,
    signin: signInErrors,
    signup: signUpErrors,
  }
  return (
    errorMessages[type][code] || {
      title: 'Erro desconhecido:',
      description: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    }
  )
}
