// These deliberately small rules flag obvious emergencies; they are not medical triage.
const emergencyPatterns = [
  /\b(severe|crushing) chest pain\b/,
  /\b(cannot|can't|unable to) breathe\b|severe (difficulty breathing|shortness of breath)/,
  /\b(unconscious|loss of consciousness|not breathing)\b/,
  /\b(uncontrolled|heavy|severe) bleeding\b/,
  /\b(face droop|facial droop|slurred speech|stroke symptoms|severe allergic reaction|anaphylaxis)\b/,
  /\b(kill myself|end my life|suicide|suicidal|hurt myself right now)\b/,
  /dau nguc (du doi|nghiem trong)|khong tho duoc|kho tho (du doi|nghiem trong)/,
  /bat tinh|mat y thuc|ngung tho|chay mau (khong cam|o at)|meo mieng|liet nua nguoi/,
  /soc phan ve|tu tu|tu sat|ket lieu (cuoc doi|ban than)/,
];

export function emergencyGuidance(text: string): string | null {
  const normalized = text.normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/đ/g, 'd').toLowerCase();
  if (!emergencyPatterns.some((pattern) => pattern.test(normalized))) return null;
  return 'Những gì bạn mô tả có thể cần hỗ trợ khẩn cấp. Hãy gọi 115 tại Việt Nam (hoặc số cấp cứu nơi bạn ở), hoặc đến khoa cấp cứu ngay. Nếu có thể, nhờ người tin cậy ở bên và hỗ trợ; đừng chờ chatbot hay lịch hẹn. Nếu bạn có ý định tự làm hại bản thân, hãy tránh xa vật có thể gây hại và gọi cấp cứu/người tin cậy ngay. Đây là cảnh báo an toàn tự động, không phải chẩn đoán. Serene không thay thế bác sĩ.\n\nThese symptoms may need emergency care. Call your local emergency number now; do not wait for this chat or an appointment.';
}
