import type { Education, Experience } from "../../types";

/**
 * Profile domain types used by the profile view + edit screens.
 */

export interface Language {
  name: string;
  level: string;
}

export interface ConnectionsSummary {
  total: number;
  mutual: number;
}

export interface ActivityItem {
  id: number;
  type: "post" | "connection" | "profile_update";
  title: string;
  description: string;
  timestamp: string;
}

export interface ProfileDetails {
  id: number;
  fullName: string;
  headline: string;
  location: string;
  avatarUrl?: string;
  bio: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
  languages: Language[];
  connections: ConnectionsSummary;
  contactEmail: string;
  contactPhone: string;
}

type ProfileUpdatePayload = Partial<
  Pick<
    ProfileDetails,
    | "fullName"
    | "headline"
    | "location"
    | "bio"
    | "skills"
    | "languages"
    | "contactEmail"
    | "contactPhone"
    | "avatarUrl"
  >
>;

// ── Mock data — replace with real API on Day 4 ─────────────────────────────────

let profileState: ProfileDetails = {
  id: 1,
  fullName: "Harini D",
  headline: "Software Engineer · #OpenToWork",
  location: "Erode, Tamil Nadu, India",
  avatarUrl: undefined,
  bio: "Aspiring Software Engineer currently interning at Nuvai AI Solutions Pvt Ltd. Passionate about building modern web applications with JavaScript, React, and Python. Actively looking for opportunities as a Software Engineer, Full Stack Developer, or Frontend Developer.",
  skills: ["JavaScript", "HTML", "CSS", "Python"],
  experience: [
    {
      id: 1,
      title: "Software Engineer Intern",
      company: "Nuvai AI Solutions Pvt Ltd",
      start_date: "2025-12-01",
      end_date: "2026-04-01",
      description:
        "Working on AI-powered web application features, contributing to frontend components and integration of Python-based services.",
    },
  ],
  education: [
    {
      id: 1,
      school: "Government College of Engineering, Erode",
      degree: "Bachelor of Engineering - BE",
      field: "Electrical and Electronics Engineering",
      start_date: "2022-11-01",
      end_date: "2026-11-01",
    },
    {
      id: 2,
      school: "AKT Memorial Vidya Saaket School, Kallakurichi",
      degree: "Higher Secondary Education",
      field: "Science",
      start_date: "2020-06-01",
      end_date: "2022-04-30",
    },
  ],
  languages: [
    { name: "English", level: "Professional" },
    { name: "Tamil", level: "Native" },
  ],
  connections: {
    total: 212,
    mutual: 0,
  },
  contactEmail: "harinidhandapani7@gmail.com",
  contactPhone: "+91 80150 32354",
};

const activityItems: ActivityItem[] = [
  {
    id: 1,
    type: "post",
    title: "Starting as Software Engineer Intern at Nuvai",
    description:
      "I’m happy to share that I’m starting a new position as Software Engineer Intern at Nuvai AI Solutions Pvt Ltd!",
    timestamp: "2026-02-01T10:15:00Z",
  },
  {
    id: 2,
    type: "post",
    title: "Python Using AI workshop",
    description:
      "Attended the 'Python Using AI' workshop by AI For Techies and learned about interactive visualizations, AI-powered debugging, and code optimization.",
    timestamp: "2025-10-10T14:45:00Z",
  },
  {
    id: 3,
    type: "profile_update",
    title: "Open to work as Software Engineer",
    description:
      "Marked profile as open to Software Engineer, Full Stack Developer, and Frontend Developer roles (on-site, hybrid, and remote).",
    timestamp: "2025-09-20T09:10:00Z",
  },
  {
    id: 4,
    type: "connection",
    title: "Reached 200+ connections",
    description: "Grew the network to over 200 professional connections on LinkedIn.",
    timestamp: "2025-08-18T17:30:00Z",
  },
  {
    id: 5,
    type: "profile_update",
    title: "Updated skills in JavaScript, HTML, CSS, and Python",
    description: "Added core web development and Python skills to the profile.",
    timestamp: "2025-07-15T08:20:00Z",
  },
];

function delay<T>(value: T, ms = 600): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export const profileApi = {
  /**
   * Fetch the current profile (mocked).
   */
  async getProfile(): Promise<ProfileDetails> {
    return delay(profileState);
  },

  /**
   * Update the profile in-memory and return the new state.
   * Simulates a network round-trip.
   */
  async updateProfile(payload: ProfileUpdatePayload): Promise<ProfileDetails> {
    profileState = {
      ...profileState,
      ...payload,
      // Perform shallow merges for arrays when provided
      skills: payload.skills ?? profileState.skills,
      languages: payload.languages ?? profileState.languages,
    };
    return delay(profileState, 800);
  },

  /**
   * Paginated activity feed for lazy loading.
   */
  async getActivity(page: number, pageSize: number): Promise<{
    items: ActivityItem[];
    hasMore: boolean;
  }> {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = activityItems.slice(start, end);
    const hasMore = end < activityItems.length;
    return delay({ items, hasMore }, 700);
  },
};
