// components/LogoutButton.tsx
"use client";

import axios from "axios";

const LogoutButton = () => {

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to logout?")) return;

    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
      window.location.href = "/login";
    } catch (error: any) {
      alert(error.response?.data?.message || "Error logging out");
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
