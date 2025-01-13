"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Moon, Sun, User, Pencil } from "lucide-react";
import LogoutButton from "./LogoutButton";
import axios from "axios";

const Navbar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  // All hooks are called unconditionally at the top
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{
    id: number;
    username: string;
    email: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch current user
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/auth/me", { withCredentials: true });
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (!mounted) {
    return null; // Conditional rendering happens **after** all hooks
  }

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 container mx-auto">
        <Link href="/" className="flex items-center space-x-2">
          <Pencil className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl text-primary">SketchEcho</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 rounded-full"
                    >
                      <User className="h-[1.2rem] w-[1.2rem]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <span>Signed in as </span>
                      <span className="font-medium ml-1">{user.username}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <LogoutButton />
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">Sign up</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
