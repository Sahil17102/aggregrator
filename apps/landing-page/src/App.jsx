import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import PageLoader from "./components/common/PageLoader";

const localClientOrigin = "http://localhost:5173";
const productionClientOrigin = "https://app.choicemee.in";

const clientOrigin = (() => {
  const explicitUrl = import.meta.env.VITE_CLIENT_APP_URL || import.meta.env.VITE_CLIENT_AUTH_URL;
  if (explicitUrl) {
    try {
      return new URL(explicitUrl).origin;
    } catch (_error) {
      return explicitUrl.replace(/\/login\/?$/, "");
    }
  }

  if (typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/i.test(window.location.hostname)) {
    return localClientOrigin;
  }

  return productionClientOrigin;
})();

const targetPathMap = {
  "/": "/",
  "/login": "/login",
  "/tracking": "/tracking",
  "/rate-calculator": "/rate-calculator",
  "/weight-calculator": "/weight-calculator",
  "/contact": "/",
};

function LegacyForwarder() {
  const location = useLocation();

  useEffect(() => {
    const mappedPath = targetPathMap[location.pathname] || location.pathname || "/";
    const target = new URL(`${mappedPath}${location.search}${location.hash}`, clientOrigin).toString();

    if (window.location.href !== target) {
      window.location.replace(target);
    }
  }, [location]);

  return <PageLoader />;
}

function App() {
  return (
    <Routes>
      <Route element={<LegacyForwarder />} path="*" />
    </Routes>
  );
}

export default App;
