"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { fetchCommerceSettings, saveCommerceSettings, validateCommerceSettings } from "@/lib/commerce";
import { isSupabaseConfigured } from "@/lib/config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { CommerceSettingsInput } from "@/lib/supabase/types";

const inputClass = "w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-4 rounded-[1.6rem] border border-lilac/30 bg-cream/60 p-5"><h3 className="font-display text-xl text-ink">{title}</h3>{children}</section>;
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (checked: boolean) => void; label: string; hint: string }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-white p-4"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-purple-deep" /><span><span className="block font-bold text-ink">{label}</span><span className="mt-1 block text-sm text-ink-soft">{hint}</span></span></label>;
}

export function PaymentShippingSettings() {
  const router = useRouter();
  const [values, setValues] = useState<CommerceSettingsInput | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [razorpayConfigured, setRazorpayConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = getSupabaseBrowserClient();
      if (!isSupabaseConfigured() || !supabase || !(await supabase.auth.getSession()).data.session) { router.replace("/admin/login"); return; }
      try {
        const [settings, config] = await Promise.all([fetchCommerceSettings(), fetch("/api/checkout/config").then((response) => response.ok ? response.json() : null)]);
        if (!cancelled) {
          setValues({ razorpay_enabled: settings.razorpay_enabled, manual_upi_enabled: settings.manual_upi_enabled, upi_id: settings.upi_id, upi_qr_url: settings.upi_qr_url, manual_shipping_enabled: settings.manual_shipping_enabled, shiprocket_enabled: settings.shiprocket_enabled, shipping_charge: settings.shipping_charge, free_shipping_threshold: settings.free_shipping_threshold, serviceable_pincodes: settings.serviceable_pincodes });
          setRazorpayConfigured(Boolean(config?.razorpayConfigured));
        }
      } catch (loadError) { if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load settings."); }
      finally { if (!cancelled) setLoading(false); }
    }
    void load(); return () => { cancelled = true; };
  }, [router]);

  function update<K extends keyof CommerceSettingsInput>(key: K, value: CommerceSettingsInput[K]) { setValues((current) => current && { ...current, [key]: value }); }

  async function signOut() { await getSupabaseBrowserClient()?.auth.signOut(); router.replace("/admin/login"); }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!values) return; setError(null); setSuccess(null);
    const validation = validateCommerceSettings(values); if (validation) { setError(validation); return; }
    setSaving(true); try { await saveCommerceSettings(values); setSuccess("Payment and shipping settings saved."); } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Unable to save settings."); } finally { setSaving(false); }
  }

  return <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6"><AdminNav current="commerce" onSignOut={() => void signOut()} />
    <section className="studio-card rounded-[2rem] bg-white p-5 sm:p-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-deep">🎀 Admin</p><h2 className="mt-2 font-display text-3xl text-ink">Payment & Shipping</h2><p className="mt-2 text-ink-soft">Only enabled and fully configured methods can be used at checkout. Shipping is booked manually unless Shiprocket is configured later.</p>
      {loading ? <p className="mt-6 rounded-3xl bg-cream p-6 text-center text-ink-soft">Loading payment and shipping settings…</p> : null}
      {error ? <p className="mt-5 rounded-2xl bg-petal/50 p-3 font-semibold text-pink-deep">{error}</p> : null}
      {success ? <p className="mt-5 rounded-2xl bg-mint/30 p-3 font-semibold text-mint-deep">{success}</p> : null}
      {values ? <form onSubmit={save} className="mt-6 space-y-5">
        <Card title="Razorpay online payment"><Toggle checked={values.razorpay_enabled} onChange={(checked) => update("razorpay_enabled", checked)} label="Enable Razorpay at checkout" hint="Uses server-only test credentials. Live payments stay off until you explicitly change the environment variables." /><p className="rounded-2xl bg-white p-3 text-sm text-ink-soft">Configuration status: <strong className="text-ink">{razorpayConfigured ? "Ready for test mode" : "Configuration required"}</strong>. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET only in Cloudflare Worker secrets.</p></Card>
        <Card title="Manual UPI payment"><Toggle checked={values.manual_upi_enabled} onChange={(checked) => update("manual_upi_enabled", checked)} label="Enable manual UPI" hint="Customers submit a transaction reference. Orders remain pending until you verify them." /><label className="block text-sm font-bold">UPI ID<input value={values.upi_id ?? ""} onChange={(event) => update("upi_id", event.target.value || null)} placeholder="name@bank" className={`${inputClass} mt-1 font-normal`} /></label><label className="block text-sm font-bold">QR code image URL <span className="font-normal text-ink-soft">(optional)</span><input type="url" value={values.upi_qr_url ?? ""} onChange={(event) => update("upi_qr_url", event.target.value || null)} placeholder="https://…" className={`${inputClass} mt-1 font-normal`} /></label></Card>
        <Card title="Manual shipping"><Toggle checked={values.manual_shipping_enabled} onChange={(checked) => update("manual_shipping_enabled", checked)} label="Enable manual shipping" hint="Use India Post or any courier and add tracking details later from Orders." /><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-bold">Shipping charge (₹)<input type="number" min="0" step="0.01" value={values.shipping_charge} onChange={(event) => update("shipping_charge", Number(event.target.value))} className={`${inputClass} mt-1 font-normal`} /></label><label className="block text-sm font-bold">Free shipping above (₹)<input type="number" min="0" step="0.01" value={values.free_shipping_threshold ?? ""} onChange={(event) => update("free_shipping_threshold", event.target.value === "" ? null : Number(event.target.value))} className={`${inputClass} mt-1 font-normal`} /></label></div><label className="block text-sm font-bold">Serviceable pincodes <span className="font-normal text-ink-soft">(comma-separated; leave blank for all Indian pincodes)</span><textarea value={values.serviceable_pincodes.join(", ")} onChange={(event) => update("serviceable_pincodes", event.target.value.split(/[\s,]+/).filter(Boolean))} className={`${inputClass} mt-1 min-h-24 font-normal`} placeholder="560001, 560002" /></label></Card>
        <Card title="Shiprocket automation"><Toggle checked={values.shiprocket_enabled} onChange={(checked) => update("shiprocket_enabled", checked)} label="Enable Shiprocket integration" hint="This switch is independent of manual shipping. Automation remains configuration-required until server-side credentials and supported API access are added; no Shiprocket API calls are made by this version." /><p className="rounded-2xl bg-white p-3 text-sm text-ink-soft">Status: <strong className="text-ink">{values.shiprocket_enabled ? "Enabled — configuration required" : "Disabled"}</strong>.</p></Card>
        <button type="submit" disabled={saving} className="rounded-full bg-purple-deep px-6 py-3 font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save payment & shipping settings"}</button>
      </form> : null}
    </section></div>;
}
