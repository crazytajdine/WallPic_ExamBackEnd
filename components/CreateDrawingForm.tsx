"use client"
// components/CreateDrawingForm.tsx
import axios from "axios";
import { useState } from "react";

const CreateDrawingForm = () => {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [drawingUrl, setDrawingUrl] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "/api/drawings/create",
        {
          name,
          categoryId,
          drawingUrl,
        },
        {
          withCredentials: true, // Ensure cookies are sent
        }
      );
      alert("Drawing created successfully!");
      // Reset form or redirect as needed
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating drawing");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form Fields */}
      <button type="submit">Create Drawing</button>
    </form>
  );
};

export default CreateDrawingForm;
