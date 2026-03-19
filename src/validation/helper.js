


function normalizePhone(raw) {
  if (raw === null || raw === undefined) return null;

  const s = String(raw).trim();

  // reject letters and weird symbols (optional but recommended)
  if (!/^[0-9()+\-.\s]+$/.test(s)) return null;

  const digits = s.replace(/\D/g, ""); // keep digits only

  // NANP: 10 digits, or 11 digits starting with 1
  let ten;
  if (digits.length === 10) ten = digits;
  else if (digits.length === 11 && digits.startsWith("1")) ten = digits.slice(1);
  else return null;

  const area = ten.slice(0, 3);
  const first = ten.slice(3, 6);
  const last = ten.slice(6);

  return `+1 (${area}) ${first}-${last}`;
}


export default normalizePhone;

