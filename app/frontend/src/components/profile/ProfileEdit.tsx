import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { profileApi, type Language, type ProfileDetails } from "./api";

interface ProfileFormValues {
  fullName: string;
  headline: string;
  location: string;
  bio: string;
  contactEmail: string;
  contactPhone: string;
  skills: string;
  languages: string;
}

type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>;

const emptyValues: ProfileFormValues = {
  fullName: "",
  headline: "",
  location: "",
  bio: "",
  contactEmail: "",
  contactPhone: "",
  skills: "",
  languages: "",
};

const ProfileEdit: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [initialProfile, setInitialProfile] = useState<ProfileDetails | null>(null);
  const [values, setValues] = useState<ProfileFormValues>(emptyValues);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof ProfileFormValues, boolean>>>(
    {},
  );

  const [loading, setLoading] = useState(true);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const profile = await profileApi.getProfile();
        if (!isMounted) return;
        setInitialProfile(profile);

        setValues({
          fullName: profile.fullName || user?.username || "",
          headline: profile.headline,
          location: profile.location,
          bio: profile.bio,
          contactEmail: profile.contactEmail,
          contactPhone: profile.contactPhone,
          skills: profile.skills.join(", "),
          languages: profile.languages.map((l) => `${l.name} (${l.level})`).join(", "),
        });
        setAvatarPreview(profile.avatarUrl ?? null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const validateField = (name: keyof ProfileFormValues, value: string): string | "" => {
    const trimmed = value.trim();

    if (["fullName", "headline", "location", "bio", "contactEmail"].includes(name)) {
      if (!trimmed) return "This field is required.";
    }

    if (name === "fullName" && trimmed && trimmed.length < 3) {
      return "Name should be at least 3 characters.";
    }

    if (name === "bio" && trimmed && trimmed.length < 30) {
      return "Tell a bit more about yourself (min 30 characters).";
    }

    if (name === "contactEmail" && trimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        return "Enter a valid email address.";
      }
    }

    if (name === "contactPhone" && trimmed) {
      const phoneDigits = trimmed.replace(/[^\d]/g, "");
      if (phoneDigits.length < 8) {
        return "Phone number looks too short.";
      }
    }

    return "";
  };

  const validateAll = (current: ProfileFormValues): ProfileFormErrors => {
    const nextErrors: ProfileFormErrors = {};
    (Object.keys(current) as (keyof ProfileFormValues)[]).forEach((key) => {
      const msg = validateField(key, current[key]);
      if (msg) nextErrors[key] = msg;
    });
    return nextErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as { name: keyof ProfileFormValues; value: string };
    const nextValues = { ...values, [name]: value };
    setValues(nextValues);

    if (touched[name]) {
      const fieldError = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: fieldError || undefined }));
    }
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target as { name: keyof ProfileFormValues; value: string };
    setTouched((prev) => ({ ...prev, [name]: true }));
    const fieldError = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: fieldError || undefined }));
  };

  const parsedLanguages: Language[] = useMemo(() => {
    if (!values.languages.trim()) return [];
    return values.languages.split(",").map((raw) => {
      const match = raw.trim().match(/^(.*?)(?:\((.*?)\))?$/);
      const name = (match?.[1] ?? "").trim();
      const level = (match?.[2] ?? "Proficient").trim();
      return { name, level };
    });
  }, [values.languages]);

  const parsedSkills = useMemo(
    () =>
      values.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    [values.skills],
  );

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);

    setUploading(true);
    setUploadProgress(0);

    const start = Date.now();
    const duration = 1000;

    const tick = () => {
      const elapsed = Date.now() - start;
      const next = Math.min(100, Math.round((elapsed / duration) * 100));
      setUploadProgress(next);
      if (next < 100) {
        requestAnimationFrame(tick);
      } else {
        setTimeout(() => setUploading(false), 200);
      }
    };

    requestAnimationFrame(tick);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitSuccess(false);

    const nextErrors = validateAll(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setTouched(
        Object.keys(values).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {} as Partial<Record<keyof ProfileFormValues, boolean>>,
        ),
      );
      return;
    }

    setSubmitting(true);
    try {
      await profileApi.updateProfile({
        fullName: values.fullName.trim(),
        headline: values.headline.trim(),
        location: values.location.trim(),
        bio: values.bio.trim(),
        contactEmail: values.contactEmail.trim(),
        contactPhone: values.contactPhone.trim(),
        skills: parsedSkills,
        languages: parsedLanguages,
        avatarUrl: avatarPreview ?? initialProfile?.avatarUrl,
      });
      setSubmitSuccess(true);
      setTimeout(() => navigate("/profile"), 700);
    } catch (err) {
      setSubmitError("Unable to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl animate-pulse rounded-3xl bg-white p-6 shadow-sm sm:p-8">
          <div className="h-6 w-40 rounded bg-slate-100" />
          <div className="mt-6 space-y-3">
            <div className="h-4 w-full rounded bg-slate-100" />
            <div className="h-4 w-5/6 rounded bg-slate-100" />
            <div className="h-4 w-3/4 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-4 lg:px-6">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-5 shadow-sm sm:p-7">
        <header className="flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
              Edit profile
            </h1>
            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Keep your profile up to date so recruiters see the best version of you.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </header>

        <form onSubmit={handleSubmit} className="mt-5 space-y-6">
          {/* Avatar + basic info */}
          <section className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] sm:p-5">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Profile image
              </p>
              <div
                {...getRootProps()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-6 text-center text-xs transition ${
                  isDragActive
                    ? "border-sky-500 bg-sky-50/70 text-sky-900"
                    : "border-slate-200 bg-white text-slate-500 hover:border-sky-400 hover:bg-sky-50/60"
                }`}
              >
                <input {...getInputProps()} />
                <div className="flex items-center gap-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatarPreview}
                        alt="Profile preview"
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      (values.fullName || user?.username || "?")[0]?.toUpperCase()
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800">
                      Drag &amp; drop an image
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      PNG or JPG up to 2MB. A clear, centered headshot works best.
                    </p>
                  </div>
                </div>
                {uploading && (
                  <div className="mt-4 flex w-full items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-[width]"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {uploadProgress}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Full name
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                />
                {touched.fullName && errors.fullName && (
                  <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="headline"
                  className="block text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Headline
                </label>
                <input
                  id="headline"
                  name="headline"
                  value={values.headline}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="eg. Embedded Systems Engineer | Digital Electronics | PCB Design"
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                />
                {touched.headline && errors.headline && (
                  <p className="mt-1 text-xs text-red-600">{errors.headline}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="block text-xs font-medium text-slate-700 sm:text-sm"
                >
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  value={values.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                />
                {touched.location && errors.location && (
                  <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                )}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="rounded-2xl border border-slate-100 p-4 sm:p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              About
            </h2>
            <div className="mt-3">
              <label
                htmlFor="bio"
                className="block text-xs font-medium text-slate-700 sm:text-sm"
              >
                Summary
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={values.bio}
                onChange={handleChange}
                onBlur={handleBlur}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
              />
              {touched.bio && errors.bio && (
                <p className="mt-1 text-xs text-red-600">{errors.bio}</p>
              )}
            </div>
          </section>

          {/* Contact */}
          <section className="grid gap-4 rounded-2xl border border-slate-100 p-4 sm:grid-cols-2 sm:p-5">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Contact
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-xs font-medium text-slate-700 sm:text-sm"
                  >
                    Email
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    value={values.contactEmail}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                  />
                  {touched.contactEmail && errors.contactEmail && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.contactEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-xs font-medium text-slate-700 sm:text-sm"
                  >
                    Phone
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    value={values.contactPhone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                  />
                  {touched.contactPhone && errors.contactPhone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Skills &amp; languages
              </h2>
              <div className="mt-3 space-y-3">
                <div>
                  <label
                    htmlFor="skills"
                    className="block text-xs font-medium text-slate-700 sm:text-sm"
                  >
                    Skills
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    value={values.skills}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Embedded Systems, Digital Electronics, PCB Design..."
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                  />
                </div>

                <div>
                  <label
                    htmlFor="languages"
                    className="block text-xs font-medium text-slate-700 sm:text-sm"
                  >
                    Languages
                  </label>
                  <input
                    id="languages"
                    name="languages"
                    value={values.languages}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Tamil (Native), English (Professional), Hindi (Conversational)"
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-sky-100 placeholder:text-slate-400 focus:border-sky-400 focus:ring-2"
                  />
                </div>

                {parsedSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {parsedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-900"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>

          {submitError && (
            <p className="text-xs text-red-600 sm:text-sm">{submitError}</p>
          )}
          {submitSuccess && (
            <p className="text-xs text-emerald-600 sm:text-sm">
              Profile updated. Redirecting to your profile…
            </p>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Discard changes
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-slate-900 px-5 py-1.5 text-xs font-semibold text-slate-50 shadow-sm hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {submitting && (
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-slate-50 border-t-transparent" />
              )}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;