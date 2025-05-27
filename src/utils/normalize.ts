// Função para remover acentos e normalizar
// export const normalize = (text: string) =>
//   text
//     .toLowerCase()
//     .normalize("NFD")
//     .replace(/[\u0300-\u036f]/g, "");

export const normalize = (text: string) => {
  const substitutions: Record<string, string> = {
    "\\beh\\b": "é",
    "\\bpq\\b": "porque",
    "\\bvc\\b": "você",
    "\\btb\\b": "também",
    "\\btd\\b": "tudo",
    "\\bblz\\b": "beleza",
    "\\bta\\b": "tá",
    "\\bobg\\b": "obrigado",
    "\\btmj\\b": "tamo junto",
    "\\blgl\\b": "legal",
  };

  let normalized = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  for (const [pattern, replacement] of Object.entries(substitutions)) {
    normalized = normalized.replace(new RegExp(pattern, "g"), replacement);
  }

  return normalized;
};
