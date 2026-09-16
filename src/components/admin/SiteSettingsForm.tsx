"use client";

import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { SiteImageField } from "@/components/admin/SiteImageField";
import { BRAND, isSupabaseConfigured } from "@/lib/config";
import {
  deleteSiteImage,
  uploadSiteImage,
  validateSiteImageFile,
  type SiteImageSlot,
  type SiteImageUrlField,
} from "@/lib/site-images";
import {
  fetchAdminSiteSettings,
  saveSiteSettings,
  updateSiteImageUrl,
  validateSiteSettingsInput,
  type PublicSiteSettings,
} from "@/lib/site-settings";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { DEFAULT_THEME_ID, THEME_LIST, type ThemeId } from "@/lib/themes";

type FormState = Omit<PublicSiteSettings, "instagram_url" | "email" | "theme"> & {
  instagram_url: string;
  email: string;
  theme: ThemeId;
};

function toFormState(settings: PublicSiteSettings): FormState {
  return {
    ...settings,
    instagram_url: settings.instagram_url ?? "",
    email: settings.email ?? "",
    theme: THEME_LIST.find((theme) => theme.id === settings.theme)?.id ?? DEFAULT_THEME_ID,
  };
}

const inputClassName =
  "w-full rounded-2xl border border-lilac/40 px-4 py-3 outline-none focus:ring-2 focus:ring-purple-deep";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold">{label}</span>
      {hint ? <span className="mb-2 block text-xs text-ink-soft">{hint}</span> : null}
      {children}
    </label>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-[1.6rem] border border-lilac/30 bg-cream/60 p-4 sm:p-5">
      <h3 className="font-display text-xl text-ink">{title}</h3>
      {children}
    </section>
  );
}

export function SiteSettingsForm() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [values, setValues] = useState<FormState | null>(null);
  const [imageBusy, setImageBusy] = useState<SiteImageSlot | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabaseBrowserClient();

    async function boot() {
      if (!isSupabaseConfigured() || !supabase) {
        router.replace("/admin/login");
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }

      if (!cancelled) setCheckingAuth(false);

      try {
        const settings = await fetchAdminSiteSettings();
        if (!cancelled) setValues(toFormState(settings));
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load site settings. Please try again.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function signOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase?.auth.signOut();
    router.replace("/admin/login");
  }

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setValues((current) => current && { ...current, [key]: value });
  }

  function currentSettingsPayload(current: FormState): PublicSiteSettings {
    return {
      ...current,
      instagram_url: current.instagram_url,
      email: current.email,
    };
  }

  async function handleImageUpload(slot: SiteImageSlot, field: SiteImageUrlField, file: File) {
    if (!values) return;

    setError(null);
    setSuccess(null);

    const validationError = validateSiteImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setImageBusy(slot);
    let uploadedUrl: string | null = null;
    try {
      const previousUrl = values[field];
      uploadedUrl = await uploadSiteImage(slot, file);
      await updateSiteImageUrl(field, uploadedUrl, {
        ...currentSettingsPayload(values),
        [field]: uploadedUrl,
      });
      setValues((current) => current && { ...current, [field]: uploadedUrl });

      if (previousUrl && previousUrl !== uploadedUrl) {
        const cleanup = await deleteSiteImage(previousUrl);
        setSuccess(
          cleanup === "failed"
            ? "Photo saved. The previous file could not be removed from storage, but the website will use the new photo."
            : "Photo saved.",
        );
      } else {
        setSuccess("Photo saved.");
      }
    } catch (uploadError) {
      if (uploadedUrl) {
        await deleteSiteImage(uploadedUrl);
      }
      setError(
        uploadError instanceof Error ? uploadError.message : "Unable to upload the photo. Please try again.",
      );
    } finally {
      setImageBusy(null);
    }
  }

  async function handleImageRemove(slot: SiteImageSlot, field: SiteImageUrlField) {
    if (!values) return;

    setError(null);
    setSuccess(null);
    setImageBusy(slot);

    const previousUrl = values[field];
    try {
      await updateSiteImageUrl(field, null, {
        ...currentSettingsPayload(values),
        [field]: null,
      });
      setValues((current) => current && { ...current, [field]: null });

      const cleanup = await deleteSiteImage(previousUrl);
      setSuccess(
        cleanup === "failed"
          ? "Photo removed from the website. The file could not be deleted from storage."
          : "Photo removed.",
      );
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : "Unable to remove the photo. Please try again.",
      );
    } finally {
      setImageBusy(null);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values || imageBusy) return;

    setError(null);
    setSuccess(null);

    const payload = {
      ...values,
      instagram_url: values.instagram_url,
      email: values.email,
    };

    const validationError = validateSiteSettingsInput(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const saved = await saveSiteSettings(payload);
      setValues(toFormState(saved));
      setSuccess("Site settings saved. The public website will use this wording and theme.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save site settings.");
    } finally {
      setSaving(false);
    }
  }

  if (checkingAuth) {
    return <p className="p-8 text-center text-ink-soft">Checking sign-in…</p>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <AdminNav current="settings" onSignOut={() => void signOut()} />

      <section className="studio-card rounded-[2rem] bg-white p-5 sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-pink-deep">🎀 Admin</p>
        <h2 className="mt-2 font-display text-3xl text-ink">Site Settings</h2>
        <p className="mt-2 text-ink-soft">
          Change the words and photos visitors see on the public website. Product photos, prices and category names stay on the Products page.
        </p>

        <div className="mt-4 rounded-3xl bg-cream px-4 py-3 text-sm text-ink-soft">
          <p className="font-bold text-ink">WhatsApp number is managed through NEXT_PUBLIC_WHATSAPP_NUMBER.</p>
          <p className="mt-1">It is not stored in Site Settings. Update that environment value if the chat number changes.</p>
        </div>

        {error && !values ? <p className="mt-6 font-semibold text-pink-deep">{error}</p> : null}

        {loading ? (
          <p className="mt-6 rounded-3xl bg-cream px-4 py-8 text-center text-ink-soft">Loading site settings…</p>
        ) : values ? (
          <form onSubmit={onSubmit} className="mt-6 space-y-5">
            <Section title="🎀 Studio Information">
              <Field label="Studio Name" hint="Used in WhatsApp messages and as the studio’s full name.">
                <input value={values.studio_name} onChange={(event) => update("studio_name", event.target.value)} className={inputClassName} autoComplete="organization" />
              </Field>
              <Field label="Header Studio Name">
                <input value={values.header_studio_name} onChange={(event) => update("header_studio_name", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Header Tagline">
                <input value={values.header_tagline} onChange={(event) => update("header_tagline", event.target.value)} className={inputClassName} />
              </Field>
              <SiteImageField
                label="Logo"
                hint="Shown in the public header and footer. PNG, JPG or WebP, up to 5 MB. If no logo is uploaded, the studio name is shown instead."
                imageUrl={values.logo_url}
                alt={BRAND.logoAlt}
                busy={imageBusy === "logo"}
                actionNoun="Logo"
                onSelectFile={(file) => void handleImageUpload("logo", "logo_url", file)}
                onRemove={() => void handleImageRemove("logo", "logo_url")}
              />
            </Section>

            <Section title="🏠 Hero Section">
              <Field label="Hero Badge">
                <input value={values.hero_badge} onChange={(event) => update("hero_badge", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Main Title">
                <textarea rows={2} value={values.main_title} onChange={(event) => update("main_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Tagline">
                <input value={values.tagline} onChange={(event) => update("tagline", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Hero Description">
                <textarea rows={4} value={values.hero_description} onChange={(event) => update("hero_description", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Primary Button Text">
                <input value={values.hero_primary_button} onChange={(event) => update("hero_primary_button", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Secondary Button Text">
                <input value={values.hero_secondary_button} onChange={(event) => update("hero_secondary_button", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Hero Visual Title" hint="Shown on the right-side showcase, above the kids photo or craft collage.">
                <input value={values.hero_visual_title} onChange={(event) => update("hero_visual_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Hero Visual Caption">
                <input value={values.hero_visual_caption} onChange={(event) => update("hero_visual_caption", event.target.value)} className={inputClassName} />
              </Field>
              <SiteImageField
                label="👧 Kids Photo"
                hint="Shown on the right side of the homepage. JPG, PNG or WebP, up to 5 MB. If no photo is uploaded, the craft collage stays."
                imageUrl={values.hero_image_url}
                alt={BRAND.heroImageAlt}
                busy={imageBusy === "hero"}
                onSelectFile={(file) => void handleImageUpload("hero", "hero_image_url", file)}
                onRemove={() => void handleImageRemove("hero", "hero_image_url")}
              />
            </Section>

            <Section title="🌸 Collections">
              <p className="text-sm text-ink-soft">Category names still come from the Categories page.</p>
              <Field label="Eyebrow">
                <input value={values.collections_eyebrow} onChange={(event) => update("collections_eyebrow", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Section Title">
                <input value={values.collections_title} onChange={(event) => update("collections_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={values.collections_description} onChange={(event) => update("collections_description", event.target.value)} className={inputClassName} />
              </Field>
            </Section>

            <Section title="✨ Featured Creations">
              <Field label="Eyebrow">
                <input value={values.featured_eyebrow} onChange={(event) => update("featured_eyebrow", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Section Title">
                <input value={values.featured_title} onChange={(event) => update("featured_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={values.featured_description} onChange={(event) => update("featured_description", event.target.value)} className={inputClassName} />
              </Field>
            </Section>

            <Section title="🛍️ Gallery">
              <p className="text-sm text-ink-soft">Product names and prices still come from the Products page.</p>
              <Field label="Eyebrow">
                <input value={values.gallery_eyebrow} onChange={(event) => update("gallery_eyebrow", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Section Title">
                <input value={values.gallery_title} onChange={(event) => update("gallery_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Description">
                <textarea rows={3} value={values.gallery_description} onChange={(event) => update("gallery_description", event.target.value)} className={inputClassName} />
              </Field>
            </Section>

            <Section title="💕 Our Story">
              <Field label="Eyebrow">
                <input value={values.about_eyebrow} onChange={(event) => update("about_eyebrow", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Section Title">
                <input value={values.about_title} onChange={(event) => update("about_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Highlight" hint="Short line on the coloured side of the story card.">
                <input value={values.about_highlight} onChange={(event) => update("about_highlight", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="About Text">
                <textarea rows={6} value={values.about_text} onChange={(event) => update("about_text", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Story Section Title">
                <input value={values.story_section_title} onChange={(event) => update("story_section_title", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Story Section Text">
                <textarea rows={4} value={values.story_section_text} onChange={(event) => update("story_section_text", event.target.value)} className={inputClassName} />
              </Field>
            </Section>

            <Section title="📸 Story Photos">
              <p className="text-sm text-ink-soft">Each card can have its own photo. Cards without a photo keep a colourful placeholder.</p>
              <div className="space-y-5">
                <div className="space-y-4 rounded-[1.3rem] bg-white/80 p-4">
                  <p className="font-display text-lg text-ink">Story Card 1</p>
                  <Field label="Title">
                    <input value={values.story_card_1_title} onChange={(event) => update("story_card_1_title", event.target.value)} className={inputClassName} />
                  </Field>
                  <Field label="Text">
                    <textarea rows={3} value={values.story_card_1_text} onChange={(event) => update("story_card_1_text", event.target.value)} className={inputClassName} />
                  </Field>
                  <SiteImageField
                    label="Story Card 1 Photo"
                    hint="JPG, PNG or WebP, up to 5 MB."
                    imageUrl={values.story_card_1_image_url}
                    alt={values.story_card_1_title || "Story card 1"}
                    busy={imageBusy === "story-1"}
                    onSelectFile={(file) => void handleImageUpload("story-1", "story_card_1_image_url", file)}
                    onRemove={() => void handleImageRemove("story-1", "story_card_1_image_url")}
                  />
                </div>
                <div className="space-y-4 rounded-[1.3rem] bg-white/80 p-4">
                  <p className="font-display text-lg text-ink">Story Card 2</p>
                  <Field label="Title">
                    <input value={values.story_card_2_title} onChange={(event) => update("story_card_2_title", event.target.value)} className={inputClassName} />
                  </Field>
                  <Field label="Text">
                    <textarea rows={3} value={values.story_card_2_text} onChange={(event) => update("story_card_2_text", event.target.value)} className={inputClassName} />
                  </Field>
                  <SiteImageField
                    label="Story Card 2 Photo"
                    hint="JPG, PNG or WebP, up to 5 MB."
                    imageUrl={values.story_card_2_image_url}
                    alt={values.story_card_2_title || "Story card 2"}
                    busy={imageBusy === "story-2"}
                    onSelectFile={(file) => void handleImageUpload("story-2", "story_card_2_image_url", file)}
                    onRemove={() => void handleImageRemove("story-2", "story_card_2_image_url")}
                  />
                </div>
                <div className="space-y-4 rounded-[1.3rem] bg-white/80 p-4">
                  <p className="font-display text-lg text-ink">Story Card 3</p>
                  <Field label="Title">
                    <input value={values.story_card_3_title} onChange={(event) => update("story_card_3_title", event.target.value)} className={inputClassName} />
                  </Field>
                  <Field label="Text">
                    <textarea rows={3} value={values.story_card_3_text} onChange={(event) => update("story_card_3_text", event.target.value)} className={inputClassName} />
                  </Field>
                  <SiteImageField
                    label="Story Card 3 Photo"
                    hint="JPG, PNG or WebP, up to 5 MB."
                    imageUrl={values.story_card_3_image_url}
                    alt={values.story_card_3_title || "Story card 3"}
                    busy={imageBusy === "story-3"}
                    onSelectFile={(file) => void handleImageUpload("story-3", "story_card_3_image_url", file)}
                    onRemove={() => void handleImageRemove("story-3", "story_card_3_image_url")}
                  />
                </div>
              </div>
            </Section>

            <Section title="💌 Contact">
              <Field label="Eyebrow">
                <input value={values.contact_eyebrow} onChange={(event) => update("contact_eyebrow", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Heading">
                <input value={values.contact_heading} onChange={(event) => update("contact_heading", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Message">
                <textarea rows={3} value={values.contact_message} onChange={(event) => update("contact_message", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Button Text">
                <input value={values.contact_button_text} onChange={(event) => update("contact_button_text", event.target.value)} className={inputClassName} />
              </Field>
            </Section>

            <Section title="📱 Social / Contact">
              <Field label="Instagram URL (optional)">
                <input type="url" inputMode="url" value={values.instagram_url} onChange={(event) => update("instagram_url", event.target.value)} placeholder="https://instagram.com/yourstudio" className={inputClassName} />
              </Field>
              <Field label="Email (optional)">
                <input type="email" autoComplete="email" value={values.email} onChange={(event) => update("email", event.target.value)} placeholder="hello@example.com" className={inputClassName} />
              </Field>
            </Section>

            <Section title="🌷 Footer">
              <Field label="Footer Description">
                <textarea rows={3} value={values.footer_description} onChange={(event) => update("footer_description", event.target.value)} className={inputClassName} />
              </Field>
              <Field label="Copyright Text">
                <input value={values.footer_copyright} onChange={(event) => update("footer_copyright", event.target.value)} className={inputClassName} />
              </Field>
            </Section>

            <Section title="🎨 Website Theme">
              <p className="text-sm text-ink-soft">
                This changes the colours of the public website. Pink Dream stays selected unless you pick another look.
              </p>
              <fieldset>
                <legend className="sr-only">Website Theme</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {THEME_LIST.map((theme) => {
                    const selected = values.theme === theme.id;
                    return (
                      <label
                        key={theme.id}
                        className={`cursor-pointer rounded-[1.4rem] border p-4 transition focus-within:ring-2 focus-within:ring-purple-deep ${
                          selected
                            ? "border-purple-deep bg-white shadow-soft"
                            : "border-lilac/40 bg-white hover:border-purple-deep/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="theme"
                          value={theme.id}
                          checked={selected}
                          onChange={() => update("theme", theme.id)}
                          className="sr-only"
                        />
                        <span className="flex items-start gap-3">
                          <span className="text-2xl" aria-hidden="true">
                            {theme.emoji}
                          </span>
                          <span>
                            <span className="block font-display text-lg text-ink">{theme.name}</span>
                            <span className="mt-1 block text-sm text-ink-soft">{theme.description}</span>
                            <span className="mt-3 flex gap-1.5" aria-hidden="true">
                              {theme.preview.map((color) => (
                                <span
                                  key={color}
                                  className="h-5 w-5 rounded-full border border-white shadow-soft"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </span>
                            {selected ? (
                              <span className="mt-2 block text-xs font-bold text-purple-deep">Selected</span>
                            ) : null}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </Section>

            {error ? <p className="font-semibold text-pink-deep">{error}</p> : null}
            {success ? <p className="font-semibold text-mint-deep">{success}</p> : null}

            <button
              type="submit"
              disabled={saving || imageBusy !== null}
              className="rounded-full bg-purple-deep px-5 py-3 font-bold text-white hover:bg-ink disabled:opacity-60"
            >
              {saving ? "Saving…" : imageBusy ? "Uploading…" : "Save Settings"}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
