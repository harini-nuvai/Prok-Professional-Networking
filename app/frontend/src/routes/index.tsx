import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import Signup from '../components/auth/Signup';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ProfileView from '../components/profile/ProfileView';
import ProfileEdit from '../components/profile/ProfileEdit';
import PostCreate from '../components/posts/PostCreate';
import PostList from '../components/posts/PostList';
import Feed from '../components/feed/Feed';
import JobList from '../components/job-board/JobList';
import MessageList from '../components/messaging/MessageList';

const protect = (element: React.ReactNode) => (
  <ProtectedRoute>{element}</ProtectedRoute>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/feed',
    element: protect(<Feed />),
  },
  {
    path: '/profile',
    element: protect(<ProfileView />),
  },
  {
    path: '/profile/edit',
    element: protect(<ProfileEdit />),
  },
  {
    path: '/posts/create',
    element: protect(<PostCreate />),
  },
  {
    path: '/posts',
    element: protect(<PostList />),
  },
  {
    path: '/jobs',
    element: protect(<JobList />),
  },
  {
    path: '/messages',
    element: protect(<MessageList />),
  },
]);
