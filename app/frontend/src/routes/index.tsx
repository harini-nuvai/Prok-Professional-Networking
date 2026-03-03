/**
 * routes/index.tsx — Application router.
 *
 * Public routes:  /login, /signup
 * Protected routes (require JWT):  /profile, /profile/edit, /posts, /jobs, /messages
 */
import React from "react";
import { createBrowserRouter } from "react-router-dom";

import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";
import ProtectedRoute from "../components/common/ProtectedRoute";
import Feed from "../components/feed/Feed";
import JobList from "../components/job-board/JobList";
import MessageList from "../components/messaging/MessageList";
import PostCreate from "../components/posts/PostCreate";
import PostList from "../components/posts/PostList";
import ProfileEdit from "../components/profile/ProfileEdit";
import ProfileView from "../components/profile/ProfileView";

export const router = createBrowserRouter([
  // ── Public routes ───────────────────────────────────────────────────────────
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },

  // ── Protected routes ────────────────────────────────────────────────────────
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfileView />
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile/edit",
    element: (
      <ProtectedRoute>
        <ProfileEdit />
      </ProtectedRoute>
    ),
  },
  {
    path: "/posts/create",
    element: (
      <ProtectedRoute>
        <PostCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/posts",
    element: (
      <ProtectedRoute>
        <PostList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/jobs",
    element: (
      <ProtectedRoute>
        <JobList />
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages",
    element: (
      <ProtectedRoute>
        <MessageList />
      </ProtectedRoute>
    ),
  },
]);
