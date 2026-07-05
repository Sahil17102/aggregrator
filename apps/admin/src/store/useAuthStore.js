// store/useAuthStore.js
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

function isTokenExpired(token) {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp < Date.now() / 1000;
  } catch (err) {
    return true; // treat invalid/undecodable token as expired
  }
}

function decodeUserFromToken(token) {
  try {
    const decoded = jwtDecode(token);
    return {
      id: decoded.id || decoded.userId || decoded.sub || "",
      name:
        decoded.name ||
        decoded.username ||
        decoded.fullName ||
        decoded.email?.split("@")?.[0] ||
        "",
      email: decoded.email || decoded.adminEmail || "",
      role: decoded.role || decoded.type || decoded.userType || "SUPERADMIN",
    };
  } catch {
    return null;
  }
}

function readStoredUser(token, userId) {
  try {
    const storedUser = JSON.parse(localStorage.getItem("adminUser") || "null");
    if (storedUser) return storedUser;
  } catch {
    localStorage.removeItem("adminUser");
  }

  const decodedUser = decodeUserFromToken(token);
  if (!decodedUser) return null;
  return { ...decodedUser, id: decodedUser.id || userId || "" };
}

export const useAuthStore = create((set) => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  const userId = localStorage.getItem("userId");

  const isRefreshValid = refreshToken && !isTokenExpired(refreshToken);

  if (!isRefreshValid) {
    localStorage.clear();
  }

  return {
    token: isRefreshValid ? accessToken : null,
    refreshToken: isRefreshValid ? refreshToken : null,
    userId: isRefreshValid ? userId : null,
    user: isRefreshValid ? readStoredUser(accessToken, userId) : null,
    isLoggedIn: isRefreshValid && !!accessToken,

    login: (token, userId, refreshToken, user = null) => {
      const decodedUser = decodeUserFromToken(token);
      const adminUser = {
        ...(decodedUser || {}),
        ...(user || {}),
        id: user?.id || userId || decodedUser?.id || "",
        name:
          user?.name ||
          user?.username ||
          user?.fullName ||
          decodedUser?.name ||
          user?.email?.split("@")?.[0] ||
          "",
        email: user?.email || decodedUser?.email || "",
        role: user?.role || decodedUser?.role || "SUPERADMIN",
      };

      localStorage.setItem("accessToken", token);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("userId", userId);
      localStorage.setItem("adminUser", JSON.stringify(adminUser));

      set({
        token,
        refreshToken,
        userId,
        user: adminUser,
        isLoggedIn: true,
      });
    },

    logout: () => {
      localStorage.clear();
      set({
        token: null,
        refreshToken: null,
        userId: null,
        user: null,
        isLoggedIn: false,
      });
    },
  };
});
