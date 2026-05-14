export function getFirebaseFriendlyError(error: unknown, fallback: string): string {
  const err = error as any;
  const code = err?.code || "";
  const message = err?.message || "";

  if (code.includes("permission-denied") || message.includes("permission-denied")) {
    return "Sem permissão para executar esta ação. Verifique sua role em adminUsers.";
  }

  if (code.includes("not-found") || message.includes("not-found")) {
    return "Registro não encontrado no banco de dados.";
  }

  if (code.includes("unauthenticated") || message.includes("unauthenticated")) {
    return "Sessão expirada ou usuário não autenticado.";
  }

  if (code.includes("unavailable") || message.includes("unavailable") || message.includes("offline")) {
    return "Firebase indisponível no momento. Tente novamente.";
  }

  return message ? `${fallback}: ${message}` : fallback;
}
