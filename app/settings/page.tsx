'use client';
import { useState, useEffect } from 'react';
import { Settings, Save, Image } from 'lucide-react';

interface BusinessSettings {
  name: string;
  address: string;
  phone1: string;
  phone2: string;
  viber_whatsapp: string;
  facebook_page: string;
  tiktok_page: string;
  thank_you_message: string;
  logo_path: string;
  facebook_qr_path: string;
  tiktok_qr_path: string;
  slogan_line1: string;
  slogan_line2: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => setSettings(d));
  }, []);

  const update = (key: keyof BusinessSettings, value: string) => {
    setSettings(p => p ? { ...p, [key]: value } : p);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!settings) return <div className="p-6 text-gray-400">Loading…</div>;

  const Field = ({ label, field, type = 'text', help }: { label: string; field: keyof BusinessSettings; type?: string; help?: string }) => (
    <div>
      <label className="form-label">{label}</label>
      <input
        className="form-input"
        type={type}
        value={settings[field]}
        onChange={e => update(field, e.target.value)}
      />
      {help && <p className="text-xs text-gray-400 mt-1">{help}</p>}
    </div>
  );

  return (
    <div className="p-6 max-w-3xl space-y-6">
      <div className="flex items-center gap-2">
        <Settings size={22} className="text-gray-600" />
        <h1 className="text-xl font-bold text-gray-900">Business Settings</h1>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Business Information</h2>
          <Field label="Business Name" field="name" />
          <div>
            <label className="form-label">Address</label>
            <textarea
              className="form-input h-20 resize-none"
              value={settings.address}
              onChange={e => update('address', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone 1" field="phone1" />
            <Field label="Phone 2" field="phone2" />
          </div>
          <Field label="Viber / WhatsApp" field="viber_whatsapp" />
        </div>

        {/* Branding */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Branding & Slogan</h2>
          <Field label="Slogan Line 1" field="slogan_line1" help="e.g. Your Future" />
          <Field label="Slogan Line 2" field="slogan_line2" help="e.g. Your Success" />
          <div>
            <label className="form-label">Thank You Message</label>
            <textarea
              className="form-input h-16 resize-none"
              value={settings.thank_you_message}
              onChange={e => update('thank_you_message', e.target.value)}
            />
          </div>
        </div>

        {/* Social / QR */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b">Social Media & QR Codes</h2>
          <Field label="Facebook Page" field="facebook_page" />
          <Field label="TikTok Page" field="tiktok_page" />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Logo Path</label>
              <input className="form-input" value={settings.logo_path} onChange={e => update('logo_path', e.target.value)} />
              <p className="text-xs text-gray-400 mt-1">Path relative to /public, e.g. /oryx-logo.png</p>
              {settings.logo_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_path} alt="Logo preview" className="mt-2 h-12 object-contain border rounded" onError={e => (e.currentTarget.style.display='none')} />
              )}
            </div>
            <div />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Facebook QR Code Path</label>
              <input className="form-input" value={settings.facebook_qr_path} onChange={e => update('facebook_qr_path', e.target.value)} />
              {settings.facebook_qr_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.facebook_qr_path} alt="FB QR" className="mt-2 w-16 h-16 object-contain border rounded" onError={e => (e.currentTarget.style.display='none')} />
              )}
            </div>
            <div>
              <label className="form-label">TikTok QR Code Path</label>
              <input className="form-input" value={settings.tiktok_qr_path} onChange={e => update('tiktok_qr_path', e.target.value)} />
              {settings.tiktok_qr_path && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.tiktok_qr_path} alt="TT QR" className="mt-2 w-16 h-16 object-contain border rounded" onError={e => (e.currentTarget.style.display='none')} />
              )}
            </div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <strong>To update QR codes or logo:</strong> Place image files in the <code>/public</code> folder, then update the path here.
            For example: copy <code>qr-facebook.png</code> to <code>c:\...\InoviceFlow\public\qr-facebook.png</code>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          {saved && (
            <span className="text-green-600 text-sm flex items-center gap-1 self-center">
              ✓ Settings saved!
            </span>
          )}
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

