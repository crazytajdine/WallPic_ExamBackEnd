// components/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

interface SearchBarProps {
  onSearch: (categoryId: number | null, drawingQuery: string) => void;
  onOpenPaintBoard: () => void;
  initialCategoryId: number | null;
  initialSearchQuery: string;
  toggleMode: () => void;
  isDragMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onOpenPaintBoard,
  initialCategoryId,
  initialSearchQuery,
  toggleMode,
  isDragMode,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryInput, setCategoryInput] = useState<string>("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [isSuggestionsVisible, setIsSuggestionsVisible] =
    useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [drawingQuery, setDrawingQuery] = useState<string>("");

  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch categories on component mount
    axios
      .get("/api/categories")
      .then((res) => setCategories(res.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  useEffect(() => {
    if (categoryInput.trim() === "") {
      setFilteredCategories([]);
      return;
    }

    const filtered = categories.filter((cat) =>
      cat.name.toLowerCase().includes(categoryInput.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [categoryInput, categories]);

  // Initialize SearchBar inputs based on props
  useEffect(() => {
    if (initialCategoryId) {
      const initialCategory = categories.find(
        (cat) => cat.id === initialCategoryId
      );
      if (initialCategory) {
        setSelectedCategory(initialCategory);
        setCategoryInput(initialCategory.name);
      }
    }
    if (initialSearchQuery) {
      setDrawingQuery(initialSearchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCategoryId, initialSearchQuery, categories]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCategoryInput(e.target.value);
    setSelectedCategory(null);
    onSearch(null, drawingQuery); // Reset search when category changes
    setIsSuggestionsVisible(true);
  };

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCategoryInput(category.name);
    setIsSuggestionsVisible(false);
    onSearch(category.id, drawingQuery);
  };

  const handleAddNewCategory = () => {
    const newCategoryName = categoryInput.trim();
    if (newCategoryName === "") return;

    // Example API call to add a new category
    axios
      .post("/api/categories", { name: newCategoryName })
      .then((res) => {
        const newCategory: Category = res.data;
        setCategories((prev) => [...prev, newCategory]);
        setSelectedCategory(newCategory);
        onSearch(newCategory.id, drawingQuery);
        setIsSuggestionsVisible(false);
        setCategoryInput(newCategory.name);
      })
      .catch((error) => {
        console.error("Error adding new category:", error);
        // Optionally, you can display an error message to the user here
      });
  };

  const handleDrawingSearch = () => {
    onSearch(selectedCategory ? selectedCategory.id : null, drawingQuery);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsSuggestionsVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex flex-col w-full space-y-4">
      {/* Category Autocomplete Input */}
      <div className="relative" ref={suggestionsRef}>
        <input
          type="text"
          placeholder="Search categories..."
          value={categoryInput}
          onChange={handleCategoryChange}
          onFocus={() => setIsSuggestionsVisible(true)}
          className="p-2 border rounded w-full"
        />
        {isSuggestionsVisible &&
          (filteredCategories.length > 0 || categoryInput.trim() !== "") && (
            <div className="absolute z-10 w-full bg-white border rounded shadow-md    overflow-y-auto">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                >
                  {cat.name}
                </div>
              ))}
              {/* Option to add a new category */}
              {categoryInput.trim() !== "" &&
                !categories.some(
                  (cat) =>
                    cat.name.toLowerCase() === categoryInput.toLowerCase()
                ) && (
                  <div
                    onClick={handleAddNewCategory}
                    className="px-4 py-2 hover:bg-gray-200 cursor-pointer text-blue-500"
                  >
                    + Add "{categoryInput}"
                  </div>
                )}
            </div>
          )}
      </div>

      {/* Drawing Search and Draw Button */}
      <div className="flex items-center space-x-2 ">
        <input
          type="text"
          placeholder="Search drawings..."
          value={drawingQuery}
          onChange={(e) => setDrawingQuery(e.target.value)}
          className="p-2 border rounded flex-grow"
        />
        <button
          onClick={toggleMode}
          className="ml-4 p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          {isDragMode ? "Switch to Grid View" : "Switch to Drag Mode"}
        </button>
        {selectedCategory && (
          <button
            onClick={onOpenPaintBoard}
            className="p-2 bg-green-500 text-white rounded"
          >
            Draw
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
