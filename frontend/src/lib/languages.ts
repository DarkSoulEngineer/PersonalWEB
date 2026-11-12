/** GitHub linguist colours, softened where the original is unreadable on a dark background. */
const LANGUAGE_COLORS: Record<string, string> = {
  Python: "#4b8bbe",
  C: "#8d9196",
  "C++": "#f34b7d",
  Assembly: "#a07c45",
  PowerShell: "#5391fe",
  MATLAB: "#e16737",
  JavaScript: "#f1e05a",
  Java: "#b07219",
};

export function languageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#85877d";
}
