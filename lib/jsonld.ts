// JSON.stringify does not escape "<", so a title containing "</script>" would end the
// JSON-LD <script> block early and let the rest run as HTML. Escape the characters
// that matter inside a script element. The result is still valid JSON.
const LS = String.fromCharCode(0x2028);
const PS = String.fromCharCode(0x2029);

export function jsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .split(LS).join('\\u2028')
    .split(PS).join('\\u2029');
}
