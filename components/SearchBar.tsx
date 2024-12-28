"use client";
// components/SearchBar.tsx
import { useState, useEffect } from "react";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

interface SearchBarProps {
  onSearch: (categoryId: number | null) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    axios.get("/api/categories").then((res) => setCategories(res.data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value ? Number(e.target.value) : null;
    setSelected(value);
    onSearch(value);
  };

  return (
    <div className="flex items-center space-x-2">
      <select
        title="categories"
        value={selected ?? ""}
        onChange={handleChange}
        className="p-2 border rounded"
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>
      <input
        type="text"
        placeholder="Search drawings..."
        className="p-2 border rounded flex-grow"
      />
      <button className="p-2 bg-blue-500 text-white rounded">Search</button>
    </div>
  );
};

export default SearchBar;
