// API client for LeetLab backend (Express + cookie JWT)
export const API_URL =
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) ||
  "http://localhost:3000/api/v1";

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, data);
  }
  return data as T;
}

export const api = {
  get: <T = any>(p: string) => request<T>(p),
  post: <T = any>(p: string, body?: any) => request<T>(p, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(p: string, body?: any) => request<T>(p, { method: "PUT", body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(p: string, body?: any) => request<T>(p, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  del: <T = any>(p: string, body?: any) => request<T>(p, { method: "DELETE", body: body ? JSON.stringify(body) : undefined }),
};

// ---------- Domain types ----------
export type Difficulty = "EASY" | "MEDIUM" | "HARD";
export type UserRole = "ADMIN" | "USER";

export interface SocialLink { platform: string; url: string; }

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: UserRole;
  rating?: number;
  reputation?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastSolvedDate?: string | null;
  country?: string;
  bio?: string | null;
  skills?: string[];
  socials?: SocialLink[];
  websiteUrl?: string | null;
  company?: string | null;
  jobTitle?: string | null;
}

export interface Problem {
  id: string;
  title: string;
  description: string;
  defficulty: Difficulty;
  tags: string[];
  examples: any;
  constraints: string;
  hints?: string | null;
  editorial?: string | null;
  testcases: any;
  codeSnippets: Record<string, string>;
  referenceSolutions: Record<string, string>;
  visibility: "PUBLIC" | "PRIVATE";
  createdAt: string;
  updatedAt: string;
  solvedBy?: { userId: string }[];
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  sourceCode: { code: string };
  language: string;
  stdin?: string | null;
  stdout?: string | null;
  stderr?: string | null;
  status: string;
  memory?: string | null;
  time?: string | null;
  createdAt: string;
  testCases?: TestCaseResult[];
  problem?: Problem;
  totalCount?: number;
  passedCount?: number;
  hiddenPassedCount?: number;
  hiddenFailedCount?: number;
  totalHiddenCases?: number;
}

export interface TestCaseResult {
  id?: string;
  testCase: number;
  passed: boolean;
  stdin?: string | null;
  stdout?: string | null;
  expected: string;
  stderr?: string | null;
  status: string;
  memory?: string | null;
  time?: string | null;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  problems?: { problem: Problem }[];
  createdAt: string;
}

export interface Contest {
  id: string;
  name: string;
  slug: string;
  type: string;
  status: string;
  startTime: string;
  endTime: string;
  description?: string;
  ratingFloor?: number;
  ratingCeil?: number;
  participantCount?: number;
  problems?: ContestProblem[];
}

export interface ContestProblem { id: string; label: string; points: number; problem: Problem; }

export interface DiscussPost {
  id: string;
  title: string;
  content: string;
  type?: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  views?: number;
  isPinned?: boolean;
  problemId?: string;
  user?: { id: string; name: string; username?: string; rating?: number; image?: string | null };
  author?: { id: string; name: string; rating?: number };
  createdAt: string;
  commentCount?: number;
  comments?: DiscussComment[];
  userVote?: "UPVOTE" | "DOWNVOTE" | null;
}

export interface DiscussComment {
  id: string;
  content: string;
  user: { id: string; name: string; image?: string | null };
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  user: { id: string; name: string; username?: string; country?: string; image?: string | null };
  rating: number;
  solved: number;
  contests: number;
}

export interface Badge { id: string; name: string; description: string; icon: string; earnedAt?: string; }

export interface ActivityDay { date: string; count: number; }

// ---------- Endpoints ----------
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<{ message: string; user: User }>("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post<{ message: string; user: User }>("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  check: () => api.get<{ message: string; user: User }>("/auth/check"),
};

export const problemsApi = {
  list: () => api.get<{ problems: Problem[] }>("/problems/get-all-problems"),
  get: (id: string) => api.get<{ problem: Problem }>(`/problems/get-problem/${id}`),
  create: (data: any) => api.post("/problems/create-problem", data),
  update: (id: string, data: any) => api.put(`/problems/update-problem/${id}`, data),
  remove: (id: string) => api.del(`/problems/delete-problem/${id}`),
  solved: () => api.get<{ problems: Problem[] }>("/problems/get-solved-problems"),
};

export const executeApi = {
  run: (data: {
    source_code: string;
    language_id: number;
    stdin: string[];
    expected_outputs: string[];
    problemId: string;
  }) => api.post<{ message: string; submission?: Submission }>("/execute-code", data),
};

export const submissionsApi = {
  all: () => api.get<{ submissions: Submission[] }>("/submissions/get-all-submissions"),
  byProblem: (problemId: string) =>
    api.get<{ submissions: Submission[] }>(`/submissions/get-submissions/${problemId}`),
  countByProblem: (problemId: string) =>
    api.get<{ count: number }>(`/submissions/get-submissions-count/${problemId}`),
  get: (id: string) => api.get<{ submission: Submission }>(`/submissions/get-submission/${id}`),
};

export const playlistsApi = {
  all: () => api.get<{ playlists: Playlist[] }>("/playlist"),
  get: (id: string) => api.get<{ playlist: Playlist }>(`/playlist/${id}`),
  create: (data: { name: string; description?: string }) => api.post("/playlist/create-playlist", data),
  addProblem: (playlistId: string, problemIds: string[]) =>
    api.post(`/playlist/${playlistId}/add-problem`, { problemIds }),
  remove: (playlistId: string) => api.del(`/playlist/${playlistId}`),
  removeProblem: (playlistId: string, problemIds: string[]) =>
    api.del(`/playlist/${playlistId}/remove-problem`, { problemIds }),
};

async function safeGet<T>(path: string, fallback: T): Promise<T> {
  try { return await api.get<T>(path); }
  catch (e: any) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return fallback;
    throw e;
  }
}
async function safePost<T>(path: string, body: any, fallback: T): Promise<T> {
  try { return await api.post<T>(path, body); }
  catch (e: any) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 501)) return fallback;
    throw e;
  }
}

export const contestsApi = {
  all: () => safeGet<{ contests: Contest[] }>("/contests", { contests: [] }),
  get: (slug: string) => safeGet<{ contest: Contest | null }>(`/contests/${slug}`, { contest: null }),
  register: (slug: string) => api.post(`/contests/${slug}/register`),
  standings: (slug: string) => safeGet<{ standings: any[] }>(`/contests/${slug}/standings`, { standings: [] }),
  create: (data: Partial<Contest>) => safePost("/contests", data, { ok: false }),
};

export const discussApi = {
  all: (params?: { type?: string; tag?: string; q?: string; problemId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.type) qs.set("type", params.type);
    if (params?.tag) qs.set("tag", params.tag);
    if (params?.q) qs.set("q", params.q);
    if (params?.problemId) qs.set("problemId", params.problemId);
    const s = qs.toString();
    return api.get<{ discussions: DiscussPost[] }>(`/discussions/all${s ? "?" + s : ""}`);
  },
  byProblem: (problemId: string) => api.get<{ discussions: DiscussPost[] }>(`/discussions/problem/${problemId}`),
  create: (data: { title: string; content: string; problemId?: string; tags?: string[]; type?: string }) =>
    api.post<{ discussion: DiscussPost }>("/discussions/create", data),
  vote: (id: string, type: "UPVOTE" | "DOWNVOTE") =>
    api.post<{ votes: { upvotes: number; downvotes: number } }>(`/discussions/vote/${id}`, { type }),
  getComments: (discussionId: string) =>
    api.get<{ comments: DiscussComment[] }>(`/comments/${discussionId}`),
  addComment: (discussionId: string, content: string) =>
    api.post<{ comment: DiscussComment }>("/comments/add", { discussionId, content }),
};

export const leaderboardApi = {
  all: (params?: { range?: "all" | "week" | "month" }) => {
    const qs = params?.range ? `?range=${params.range}` : "";
    return safeGet<{ entries: LeaderboardEntry[] }>(`/leaderboard${qs}`, { entries: [] });
  },
};

export const usersApi = {
  byUsername: (username: string) =>
    safeGet<{ user: User | null; badges: Badge[]; stats: any }>(`/users/${username}`, { user: null, badges: [], stats: {} }),
  badges: () => safeGet<{ badges: Badge[] }>("/users/me/badges", { badges: [] }),
  activity: (userId: string, year?: number) => {
    const qs = year ? `?year=${year}` : "";
    return safeGet<{ activities: ActivityDay[]; totalActive: number; maxStreak: number; currentStreak: number }>(
      `/analytics/heatmap${qs}`,
      { activities: [], totalActive: 0, maxStreak: 0, currentStreak: 0 }
    ).then(r => ({
      activity: r.activities,
      totalActive: r.totalActive,
      maxStreak: r.maxStreak,
      currentStreak: r.currentStreak
    }));
  },
  stats: () => safeGet<{ stats: any }>("/analytics/stats", { stats: {} }),
  topicStats: (userId: string) =>
    safeGet<{ stats: { tag: string; solved: number; total: number }[] }>(
      `/users/${userId}/topic-stats`,
      { stats: [] }
    ),
  updateProfile: (data: Partial<User>) =>
    api.patch<{ user: User }>("/users/me/profile", data),
  uploadAvatar: async (file: File) => {
    const fd = new FormData();
    fd.append("avatar", file);
    const res = await fetch(`${API_URL}/users/me/avatar`, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!res.ok) throw new ApiError("Upload failed", res.status);
    return res.json() as Promise<{ user: User }>;
  },
};

export const adminApi = {
  users: () => safeGet<{ users: User[] }>("/users/admin/all", { users: [] }),
  setRole: (userId: string, role: UserRole) =>
    api.patch<{ ok: boolean }>(`/users/admin/${userId}/role`, { role }),
  banUser: (userId: string) =>
    api.del<{ ok: boolean }>(`/users/admin/${userId}`),
  stats: () => safeGet<{ users: number; problems: number; submissions: number; contests: number }>(
    "/users/admin/stats",
    { users: 0, problems: 0, submissions: 0, contests: 0 }
  ),
};

export const aiApi = {
  review: (submissionId: string) => api.get(`/ai/review/${submissionId}`),
};

// Judge0 language IDs
export const LANGUAGES: { id: number; name: string; key: string; monaco: string }[] = [
  { id: 71, name: "Python (3.8.1)", key: "PYTHON", monaco: "python" },
  { id: 63, name: "JavaScript (Node 12)", key: "JAVASCRIPT", monaco: "javascript" },
  { id: 62, name: "Java (OpenJDK 13)", key: "JAVA", monaco: "java" },
  { id: 54, name: "C++ (GCC 9.2)", key: "CPP", monaco: "cpp" },
];
