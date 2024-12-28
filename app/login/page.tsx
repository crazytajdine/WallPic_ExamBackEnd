// app/login/page.tsx
"use client";

import axios from "axios";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    try {
      const response = await axios.post("/api/auth/login", form, {
        withCredentials: true, // To accept and send cookies
      });
      alert(response.data.message);
      router.push("/");
    } catch (error: any) {
      setErrors(
        error.response?.data?.message
          ? [error.response.data.message]
          : ["Login failed"]
      );
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl mb-4">Login</h1>
      {errors.length > 0 && (
        <div className="mb-4 text-red-500">
          {errors.map((err, idx) => (
            <p key={idx}>{err}</p>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
