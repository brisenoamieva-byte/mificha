"use client";

import Link from "next/link";
import { ExternalLink, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { getCurrentUser } from "@/lib/auth";
import { buildPublicAcademyUrl } from "@/lib/public-academy";
import { slugify } from "@/lib/slugify";
import { uploadAcademyLogo } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { MexicoLocationSelect } from "@/components/ui/mexico-location-select";
import { resolveMunicipalityName, resolveStateName } from "@/lib/mexico-locations";
import { cn } from "@/lib/utils";

const inputClassName = cn(
  "mt-1 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900",
  "placeholder:text-slate-400 focus:border-[#1B4F8C] focus:outline-none focus:ring-2 focus:ring-[#1B4F8C]/20",
);

function getErrorMessage(error: unknown) {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : null;

  if (code === "23505") {
    return "Ese slug ya está en uso. Elige otro identificador.";
  }

  if (error instanceof Error) {
    if (error.message.includes("academies_slug_key")) {
      return "Ese slug ya está en uso. Elige otro identificador.";
    }
    if (error.message.includes("duplicate key")) {
      return "Ya existe una academia con esos datos.";
    }
    return error.message;
  }
  return "No se pudo guardar la academia. Intenta de nuevo.";
}

export function AcademyForm() {
  const router = useRouter();
  const { academy, refresh } = useDashboard();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#1B4F8C");
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!academy) return;

    setName(academy.name);
    setSlug(academy.slug);
    setSlugEdited(true);
    setDescription(academy.description ?? "");
    setState(resolveStateName(academy.state ?? ""));
    setCity(
      resolveMunicipalityName(
        resolveStateName(academy.state ?? ""),
        academy.city ?? "",
      ),
    );
    setAddress(academy.address ?? "");
    setPhone(academy.phone ?? "");
    setWebsite(academy.website ?? "");
    setLogoUrl(academy.logo_url);
    setPrimaryColor(academy.primary_color || "#1B4F8C");
    setIsPublic(academy.is_public);
  }, [academy]);

  const landingUrl = useMemo(() => {
    if (!slug) return null;
    return buildPublicAcademyUrl(slug);
  }, [slug]);

  function handleNameChange(value: string) {
    setName(value);
    if (!slugEdited && !academy) {
      setSlug(slugify(value));
    }
  }

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !academy) return;

    setUploadingLogo(true);
    setError(null);

    try {
      const url = await uploadAcademyLogo(academy.id, file);
      setLogoUrl(url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "No se pudo subir el logo.",
      );
    } finally {
      setUploadingLogo(false);
      event.target.value = "";
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const user = await getCurrentUser();
      if (!user) throw new Error("Sesión expirada. Vuelve a iniciar sesión.");

      const payload = {
        name: name.trim(),
        slug: slugify(slug.trim() || name),
        description: description.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        address: address.trim() || null,
        phone: phone.trim() || null,
        website: website.trim() || null,
        logo_url: logoUrl,
        primary_color: primaryColor,
        is_public: isPublic,
      };

      if (academy) {
        const { error: updateError } = await supabase
          .from("academies")
          .update(payload)
          .eq("id", academy.id);

        if (updateError) throw updateError;
        setSuccess("Academia actualizada correctamente.");
      } else {
        const { error: insertError } = await supabase.from("academies").insert({
          ...payload,
          owner_id: user.id,
        });

        if (insertError) throw insertError;
        setSuccess("Academia registrada correctamente.");
      }

      await refresh();
      if (!academy) {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Nombre de la academia *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(event) => handleNameChange(event.target.value)}
          className={inputClassName}
          placeholder="Ej. Academia Deportiva Monterrey"
        />
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium text-slate-700">
          Identificador público (slug) *
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          required
          readOnly={Boolean(academy)}
          value={slug}
          onChange={(event) => {
            if (academy) return;
            setSlugEdited(true);
            setSlug(slugify(event.target.value));
          }}
          className={cn(
            inputClassName,
            academy && "cursor-not-allowed bg-slate-50 text-slate-500",
          )}
          placeholder="academia-monterrey"
        />
        <p className="mt-2 text-sm text-slate-500">
          URL pública: mificha.mx/a/{slug || "tu-academia"}
        </p>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700">
          Descripción
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className={inputClassName}
          placeholder="Cuéntanos sobre la filosofía y formación de tu academia."
        />
      </div>

      <MexicoLocationSelect
        state={state}
        city={city}
        onStateChange={setState}
        onCityChange={setCity}
        selectClassName={inputClassName}
        required={false}
      />

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-slate-700">
          Dirección
        </label>
        <input
          id="address"
          name="address"
          type="text"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          className={inputClassName}
          placeholder="Av. Universidad 123, Col. Centro"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className={inputClassName}
            placeholder="81 1234 5678"
          />
        </div>

        <div>
          <label htmlFor="website" className="block text-sm font-medium text-slate-700">
            Sitio web
          </label>
          <input
            id="website"
            name="website"
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            className={inputClassName}
            placeholder="https://tuacademia.com"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-[120px_minmax(0,1fr)] sm:items-end">
        <div>
          <label htmlFor="primaryColor" className="block text-sm font-medium text-slate-700">
            Color primario
          </label>
          <input
            id="primaryColor"
            name="primaryColor"
            type="color"
            value={primaryColor}
            onChange={(event) => setPrimaryColor(event.target.value)}
            className="mt-1 h-12 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-1"
          />
        </div>

        <div>
          <span className="block text-sm font-medium text-slate-700">Logo</span>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo de la academia"
                className="h-16 w-16 rounded-xl border border-slate-200 object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-500">
                Sin logo
              </div>
            )}
            <button
              type="button"
              disabled={!academy || uploadingLogo}
              onClick={() => logoInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-4 w-4" />
              {uploadingLogo ? "Subiendo..." : "Subir logo"}
            </button>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
          {!academy ? (
            <p className="mt-2 text-xs text-slate-500">
              Guarda la academia primero para subir el logo.
            </p>
          ) : null}
        </div>
      </div>

      <label className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-4">
        <div>
          <p className="text-sm font-medium text-slate-900">Landing pública</p>
          <p className="text-sm text-slate-500">
            Activa la página pública en mificha.mx/a/{slug || "tu-academia"}
          </p>
          <p className="mt-2 text-xs leading-5 text-amber-700">
            Solo expone datos de jugadores con ficha autorizada. El directorio
            general requiere consentimiento adicional por jugador.
          </p>
        </div>
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(event) => setIsPublic(event.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-[#1B4F8C] focus:ring-[#1B4F8C]"
        />
      </label>

      {academy && isPublic && landingUrl ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">Vista previa landing</p>
              <p className="text-sm text-slate-500">{landingUrl}</p>
            </div>
            <Link
              href={`/a/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1B4F8C] hover:underline"
            >
              Abrir landing
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <iframe
            title="Vista previa landing academia"
            src={`/a/${slug}`}
            className="mt-4 h-[420px] w-full rounded-xl border border-slate-200 bg-white"
          />
        </div>
      ) : null}

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      {success ? (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-[#1B4F8C] px-5 py-3 text-sm font-semibold text-white hover:bg-[#164278] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading
          ? "Guardando..."
          : academy
            ? "Guardar cambios"
            : "Registrar academia"}
      </button>
    </form>
  );
}
