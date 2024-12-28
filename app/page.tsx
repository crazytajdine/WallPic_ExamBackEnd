// app/page.tsx
"use client";

import { useState } from "react";
import SearchBar from "@/components/SearchBar";
import DrawingGrid from "@/components/DrawingGrid";

const MainPage = () => {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const handleSearch = (selectedCategoryId: number | null, query: string) => {
    setCategoryId(selectedCategoryId);
    setSearchQuery(query);
  };

  return (
    <div>
      <SearchBar onSearch={handleSearch} />
      <DrawingGrid categoryId={categoryId} searchQuery={searchQuery} />
    </div>
  );
};

export default MainPage;
