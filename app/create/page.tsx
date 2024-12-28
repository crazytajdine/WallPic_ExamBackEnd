// app/create/page.tsx
"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Canvas = dynamic(() => import("@/components/Canvas"), { ssr: false });

const CreateDrawingPage = () => {
  const router = useRouter();
  const [drawingUrl, setDrawingUrl] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleSaveDrawing = (dataUrl: string) => {
    setDrawingUrl(dataUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !categoryId || !drawingUrl) {
      alert("Please provide all fields.");
      return;
    }

    try {
      await axios.post(
        "/api/drawings/create",
        { name, categoryId, drawingUrl },
        { withCredentials: true }
      );
      alert("Drawing created successfully!");
      router.push("/");
    } catch (error: any) {
      console.error("Error creating drawing:", error);
      alert(error.response?.data?.message || "Error creating drawing");
    }
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl mb-4">Create a New Drawing</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Drawing Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <select
          value={categoryId ?? ""}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <Canvas onSave={handleSaveDrawing} />
        <button
          type="submit"
          className="w-full p-2 bg-green-500 text-white rounded"
        >
          Submit Drawing
        </button>
      </form>
    </div>
  );
};

export default CreateDrawingPage;
