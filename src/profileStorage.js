// Shared profile storage contract. Keep this key aligned across Settings, first-launch setup, and the AI briefing popup.
export const PROFILE_NAME_KEY = 'weatherman_name';
export const readProfileName = () => {
  try { return (localStorage.getItem(PROFILE_NAME_KEY) || '').trim(); }
  catch { return ''; }
};
export const saveProfileName = (value) => {
  const cleaned = String(value ?? '').trim().slice(0, 40);
  if (!cleaned) return '';
  try { localStorage.setItem(PROFILE_NAME_KEY, cleaned); } catch { /* storage may be blocked */ }
  return cleaned;
};
