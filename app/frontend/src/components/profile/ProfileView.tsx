import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { profileApi, type ActivityItem, type ProfileDetails } from "./api";

const ACTIVITY_PAGE_SIZE = 3;

const ProfileView: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileDetails | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [activityPage, setActivityPage] = useState(1);
  const [activityHasMore, setActivityHasMore] = useState(true);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await profileApi.getProfile();
        if (!isMounted) return;
        setProfile(data);
      } catch (err) {
        if (!isMounted) return;
        setProfileError("Unable to load profile. Please try again.");
      } finally {
        if (isMounted) setProfileLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    loadMoreActivity(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadMoreActivity = async (page: number, replace = false) => {
    if (activityLoading) return;
    setActivityLoading(true);
    setActivityError(null);
    try {
      const res = await profileApi.getActivity(page, ACTIVITY_PAGE_SIZE);
      setActivity((prev) => (replace ? res.items : [...prev, ...res.items]));
      setActivityHasMore(res.hasMore);
      setActivityPage(page);
    } catch (err) {
      setActivityError("Failed to load activity.");
    } finally {
      setActivityLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const displayName = profile?.fullName || user?.username || "User";
  const avatarInitial = displayName[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-900 text-center text-sm font-semibold leading-8 text-slate-50 shadow-sm">
              UA
            </div>
            <span className="text-sm font-medium text-slate-700">CareerConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleEditProfile}
              className="hidden rounded-full border border-slate-200 px-4 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 sm:inline-flex"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-50 shadow hover:bg-slate-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-3 pb-10 pt-6 sm:px-4 lg:px-6">
        {/* Header section */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-sky-800 p-6 text-slate-50 shadow-xl sm:p-8">
          <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-screen">
            <div className="absolute -left-16 top-10 h-40 w-40 rounded-full bg-sky-400/40 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-52 w-52 rounded-3xl bg-indigo-500/30 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:gap-6">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-800/80 text-3xl font-semibold shadow-lg ring-2 ring-sky-300/70 sm:h-24 sm:w-24">
                  {avatarInitial}
                </div>
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                  {displayName}
                </h1>
                <p className="mt-1 text-sm text-slate-200 sm:text-sm">
                  {profile?.headline ?? "Loading role…"}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-200/80 sm:text-xs">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/40 px-3 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Open to opportunities
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/40 px-3 py-1">
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 21s-6.5-4.686-6.5-10.25A6.5 6.5 0 0112 4.25a6.5 6.5 0 016.5 6.5C18.5 16.314 12 21 12 21z"
                      />
                      <circle cx="12" cy="10.75" r="1.75" />
                    </svg>
                    {profile?.location ?? "Loading location…"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 sm:items-end">
              <div className="flex items-center gap-3 text-xs sm:text-sm">
                <div className="rounded-xl bg-slate-900/40 px-3 py-2 text-right">
                  <p className="font-semibold">
                    {profile?.connections.total.toLocaleString() ?? "—"}+
                  </p>
                  <p className="text-xs text-slate-300">Connections</p>
                </div>
                <div className="rounded-xl bg-slate-900/40 px-3 py-2 text-right">
                  <p className="font-semibold">
                    {profile?.connections.mutual.toLocaleString() ?? "—"}
                  </p>
                  <p className="text-xs text-slate-300">Mutual</p>
                </div>
              </div>
              <button
                onClick={handleEditProfile}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-xs font-semibold text-slate-900 shadow-sm ring-1 ring-slate-100 hover:bg-slate-100 sm:hidden"
              >
                Edit Profile
              </button>
            </div>
          </div>
        </section>

        {/* Content grid */}
        <section className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
          <div className="space-y-4">
            {/* About */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                About
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
                {profileLoading && "Loading profile…"}
                {profileError && (
                  <span className="text-red-600">{profileError}</span>
                )}
                {!profileLoading && !profileError && profile && profile.bio}
              </p>
            </div>

            {/* Skills */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Skills
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {(profile?.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900 shadow-sm"
                  >
                    {skill}
                  </span>
                ))}
                {profileLoading && (
                  <span className="h-6 w-24 animate-pulse rounded-full bg-slate-100" />
                )}
              </div>
            </div>

            {/* Education */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Education
              </h2>
              <div className="mt-3 space-y-3 text-xs sm:text-sm">
                {(profile?.education ?? []).map((edu) => (
                  <div key={edu.id} className="flex gap-3">
                    <div className="mt-1 h-8 w-8 flex-shrink-0 rounded-lg bg-slate-900/5 text-center text-xs font-semibold leading-8 text-slate-700">
                      EDU
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">
                        {edu.degree}
                      </p>
                      <p className="text-slate-700">{edu.school}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(edu.start_date).getFullYear()} –{" "}
                        {new Date(edu.end_date).getFullYear()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity timeline */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                  Recent Activity
                </h2>
                <span className="text-xs text-slate-500">Last 2 weeks</span>
              </div>

              <div className="mt-4 space-y-4">
                {activity.map((item, index) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold ${
                          item.type === "post"
                            ? "bg-sky-100 text-sky-900"
                            : item.type === "connection"
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-indigo-100 text-indigo-900"
                        }`}
                      >
                        {item.type === "post"
                          ? "POST"
                          : item.type === "connection"
                          ? "CONN"
                          : "UPD"}
                      </div>
                      {index !== activity.length - 1 && (
                        <div className="mt-1 h-8 w-px bg-slate-200" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900 sm:text-sm">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {item.description}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {new Date(item.timestamp).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}

                {activityError && (
                  <p className="text-xs text-red-600">{activityError}</p>
                )}

                {activity.length === 0 && !activityLoading && !activityError && (
                  <p className="text-xs text-slate-500">
                    No recent activity to show yet.
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                {activityHasMore ? (
                  <button
                    type="button"
                    onClick={() => loadMoreActivity(activityPage + 1)}
                    disabled={activityLoading}
                    className="text-xs font-semibold text-sky-700 hover:text-sky-800 disabled:cursor-not-allowed disabled:text-slate-400"
                  >
                    {activityLoading ? "Loading…" : "Load more activity"}
                  </button>
                ) : (
                  <span className="text-xs text-slate-400">
                    You&apos;re all caught up.
                  </span>
                )}

                {activityLoading && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-sky-500" />
                    Fetching updates…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right column cards */}
          <aside className="space-y-4">
            {/* Contact */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Contact Information
              </h2>
              <div className="mt-3 space-y-2 text-xs text-slate-700 sm:text-sm">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                    @
                  </span>
                  <span className="truncate">{profile?.contactEmail}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                    ☎
                  </span>
                  <span>{profile?.contactPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900/5 text-[11px]">
                    ⌖
                  </span>
                  <span>{profile?.location}</span>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Languages
              </h2>
              <div className="mt-3 space-y-2 text-xs text-slate-700 sm:text-sm">
                {(profile?.languages ?? []).map((lang) => (
                  <div
                    key={lang.name}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2"
                  >
                    <span>{lang.name}</span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {lang.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
                Snapshot
              </h2>
              <dl className="mt-3 space-y-2 text-xs text-slate-700 sm:text-sm">
                <div className="flex items-center justify-between">
                  <dt>Member since</dt>
                  <dd className="text-slate-500">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Profile completeness</dt>
                  <dd className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full w-3/4 rounded-full bg-sky-500" />
                    </div>
                    <span className="text-[11px] text-slate-500">75%</span>
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default ProfileView;
