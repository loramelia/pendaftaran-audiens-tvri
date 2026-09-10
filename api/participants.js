function maskPhone(phone) {
  const value = String(phone || '');
  return value.length > 7 ? `${value.slice(0, 4)}xxxx${value.slice(-3)}` : value;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ success: false, message: 'Method tidak diizinkan.' });
  const baseUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!baseUrl) return res.status(500).json({ success: false, message: 'Konfigurasi backend belum lengkap.' });
  try {
    const upstream = await fetch(`${baseUrl}?action=participants`);
    const result = await upstream.json();
    if (!result.success) return res.status(502).json(result);
    const data = (result.data || []).map(item => ({ id: item.id, name: item.name, phone: maskPhone(item.phone), rawPhone: item.phone, time: item.time }));
    return res.status(200).json({ success: true, data });
  } catch (error) { return res.status(502).json({ success: false, message: 'Tidak dapat terhubung ke Google Sheets.' }); }
}
