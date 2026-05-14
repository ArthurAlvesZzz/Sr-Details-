export function getFirebaseFriendlyError(error: unknown, fallback: string = 'Ocorreu um erro.'): string {
  if (!error) return fallback;
  
  const err = error as any;
  const code = err.code || '';
  const message = err.message || '';

  if (code === 'permission-denied' || message.includes('permission-denied')) {
    return 'Sem permissão para esta ação. Verifique se seu usuário tem a role necessária no adminUsers.';
  }
  if (code === 'not-found' || message.includes('not-found')) {
    return 'Recurso não encontrado.';
  }
  if (code === 'unauthenticated' || message.includes('unauthenticated')) {
    return 'Usuário não autenticado.';
  }
  if (code === 'unavailable' || message.includes('unavailable') || message.includes('offline')) {
    return 'Serviço temporariamente indisponível. Verifique sua conexão.';
  }
  if (code === 'failed-precondition' || message.includes('failed-precondition')) {
    return 'Falha na pré-condição da operação.';
  }
  if (code === 'auth/operation-not-allowed' || message.includes('operation-not-allowed')) {
    return 'O provedor de autenticação não está habilitado no Firebase Console.';
  }
  if (code === 'auth/invalid-credential' || message.includes('invalid-credential') || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Credenciais inválidas. Verifique e-mail e senha.';
  }

  return message ? `${fallback} (${message})` : fallback;
}
