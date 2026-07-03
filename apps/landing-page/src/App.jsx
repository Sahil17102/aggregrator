import { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppShell from "./components/layout/AppShell";
import PageLoader from "./components/common/PageLoader";

const CLIENT_APP_FALLBACK_URL = "https://courier-aggregator-client.vercel.app";

function getClientPanelUrl(configuredUrl, path) {
  const fallbackUrl = `${CLIENT_APP_FALLBACK_URL}${path}`;

  if (!configuredUrl) return fallbackUrl;

  try {
    const url = new URL(configuredUrl, CLIENT_APP_FALLBACK_URL);
    const urlSignature = `${url.hostname}${url.pathname}`.toLowerCase();

    if (urlSignature.includes("admin")) return fallbackUrl;

    url.pathname = path;
    return url.toString();
  } catch {
    return fallbackUrl;
  }
}

const configuredClientAuthUrl = import.meta.env.VITE_CLIENT_AUTH_URL;
const clientAuthUrl = getClientPanelUrl(configuredClientAuthUrl, "/login");
const clientSignupUrl = getClientPanelUrl(
  import.meta.env.VITE_CLIENT_SIGNUP_URL || configuredClientAuthUrl,
  "/signup",
);

const ContactPage = lazy(() => import("./pages/ContactPage"));
const HomePage = lazy(() => import("./pages/HomePage"));
const RateCalculatorPage = lazy(() => import("./pages/RateCalculatorPage"));
const TrackingPage = lazy(() => import("./pages/TrackingPage"));
const WeightCalculatorPage = lazy(() => import("./pages/WeightCalculatorPage"));

function ScrollRestoration() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function AuthRedirect({ targetUrl }) {
  useEffect(() => {
    window.location.assign(targetUrl);
  }, [targetUrl]);

  return <PageLoader />;
}

function App() {
  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<AppShell />} path="/">
            <Route element={<HomePage />} index />
            <Route element={<TrackingPage />} path="tracking" />
            <Route element={<RateCalculatorPage />} path="rate-calculator" />
            <Route element={<WeightCalculatorPage />} path="weight-calculator" />
            <Route element={<AuthRedirect targetUrl={clientAuthUrl} />} path="login" />
            <Route element={<AuthRedirect targetUrl={clientSignupUrl} />} path="signup" />
            <Route element={<ContactPage />} path="contact" />
          </Route>
          <Route element={<Navigate replace to="/" />} path="*" />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
