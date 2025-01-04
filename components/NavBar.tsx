// components/Navbar.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import LogoutButton from "./LogoutButton";

interface NavbarProps {
  user: { id: number; username: string; email: string } | null;
  loading: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ user, loading }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode") === "true";
    setDarkMode(stored);
    if (stored) document.documentElement.classList.add("dark");
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem("darkMode", String(!darkMode));
    if (!darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav className="flex justify-between p-4 bg-gray-200 dark:bg-gray-800">
      <div className="flex space-x-4">
        <Link href="/">Home</Link>
      </div>
      <div className="flex items-center space-x-4">
        <button onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
        {!loading &&
          (user ? (
            <>
              <span className="text-gray-800 dark:text-gray-200">
                Hello, {user.username}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-800 dark:text-gray-200">
                Login
              </Link>
              <Link
                href="/register"
                className="text-gray-800 dark:text-gray-200"
              >
                Register
              </Link>
            </>
          ))}
      </div>
    </nav>
  );
};

export default Navbar;
