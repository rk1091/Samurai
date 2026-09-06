// Capitalizes the first letter only — "success" -> "Success",
// "gemini-1.5-flash" -> "Gemini-1.5-flash". Deliberately not using CSS
// text-transform:capitalize, which capitalizes every hyphen-separated
// "word" and produces "Gpt-4O-Mini"-style artifacts on model names.
export function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
