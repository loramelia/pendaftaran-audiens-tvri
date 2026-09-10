export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ success: false, message: 'Method tidak diizinkan.' });
  const baseUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!baseUrl) return res.status(500).json({ success: false, message: 'Konfigurasi backend belum lengkap.' });
  const { fullName, phoneNumber } = req.body || {};
  try {
    const upstream = await fetch(baseUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fullName, phoneNumber }) });
    const result = await upstream.json();
    if (!result.success) return res.status(400).json(result);
    const phone = String(result.phoneNumber || '');
    const maskedPhone = phone.length > 7 ? `${phone.slice(0, 4)}xxxx${phone.slice(-3)}` : phone;
    return res.status(200).json({ ...result, maskedPhone });
  } catch (error) { return res.status(502).json({ success: false, message: 'Tidak dapat terhubung ke Google Sheets.' }); }
}
