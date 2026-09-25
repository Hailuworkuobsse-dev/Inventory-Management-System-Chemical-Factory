import React, { lazy, Suspense } from "react";
import { Navigate, RouteObject } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { PublicLayout } from "../layouts/PublicLayout";
import { LoadingScreen } from "../components/common/LoadingScreen";

const Landing = lazy(() => import("../pages/public/Landing"));
const Login = lazy(() => import("../pages/public/Login"));

export const publicRoutes: RouteObject[] = [
  // Landing – full-bleed marketing layout at "/"
  {
    path: "/",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <PublicLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Landing />
          </Suspense>
        ),
      },
    ],
  },
  // Auth – centered card layout at "/login"
  {
    path: "/login",
    element: (
      <Suspense fallback={<LoadingScreen />}>
        <AuthLayout />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <Login />
          </Suspense>
        ),
      },
    ],
  },
  // Catch-all: unknown URLs go back to the landing page
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];