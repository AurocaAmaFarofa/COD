// Regras de senha forte. O servidor valida as mesmas regras (src/routes/auth.js).
export const REGRAS_SENHA = [
  { id: 'tamanho', texto: 'Pelo menos 8 caracteres', ok: (s) => s.length >= 8 },
  { id: 'maiuscula', texto: 'Uma letra maiúscula', ok: (s) => /\p{Lu}/u.test(s) },
  { id: 'minuscula', texto: 'Uma letra minúscula', ok: (s) => /\p{Ll}/u.test(s) },
  { id: 'numero', texto: 'Um número', ok: (s) => /\d/.test(s) },
  { id: 'simbolo', texto: 'Um símbolo (ex.: ! @ # $ %)', ok: (s) => /[^\p{L}\d\s]/u.test(s) },
  { id: 'espaco', texto: 'Sem espaços', ok: (s) => !/\s/.test(s) },
]

export function senhaForte(senha) {
  return REGRAS_SENHA.every((regra) => regra.ok(senha))
}
