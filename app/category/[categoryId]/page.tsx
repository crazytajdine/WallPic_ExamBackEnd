// app/category/[categoryId]/page.tsx
"use client";

import { useParams } from "next/navigation";
import SearchBar from "@/components/SearchBar";
import DrawingGrid from "@/components/DrawingGrid";
import { useState, useEffect } from "react";
import axios from "axios";

const CategoryPage = () => {
  const params = useParams();
  const categoryId = params.categoryId ? Number(params.categoryId) : null;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    if (categoryId) {
      axios.get(`/api/categories`).then((res) => {
        const category = res.data.find(
          (cat: { id: number; name: string }) => cat.id === categoryId
        );
        if (category) {
          setCategoryName(category.name);
        }
      });
    }
  }, [categoryId]);

  const handleSearch = (selectedCategoryId: number | null, query: string) => {
    // In category page, selectedCategoryId should remain the current category
    setSearchQuery(query);
  };

  return (
    <div>
      <h2 className="text-2xl mb-4">Category: {categoryName}</h2>
      <SearchBar onSearch={handleSearch} />
      <DrawingGrid categoryId={categoryId} searchQuery={searchQuery} />
    </div>
  );
};

export default CategoryPage;
