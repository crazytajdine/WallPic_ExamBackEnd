// components/SearchBar.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";

interface Category {
  id: number;
  name: string;
}

interface SearchBarProps {
  onCategorySelect: (categoryId: number | null) => void;
  onNameChange: (nameQuery: string) => void;
  onOpenPaintBoard: () => void;
  initialCategoryId: number | null;
  initialSearchQuery: string;
  toggleMode: () => void;
  isDragMode: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onCategorySelect,
  onNameChange,
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
  const [drawingQuery, setDrawingQuery] = useState<string>(initialSearchQuery);
  const [isCategoriesLoading, setIsCategoriesLoading] =
    useState<boolean>(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const suggestionsRef = useRef<HTMLDivElement>(null);
  const nameSearchTimeout = useRef<NodeJS.Timeout | null>(null);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const res = await axios.get("/api/categories");
        setCategories(res.data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError("Failed to load categories.");
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Filter categories based on input
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

  // Handle category input changes
  const handleCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategoryInput(value);
    setSelectedCategory(null);
    setIsSuggestionsVisible(true);
  };

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setCategoryInput(category.name);
    setIsSuggestionsVisible(false);
    onCategorySelect(category.id);
  };

  // Handle adding a new category
  const handleAddNewCategory = async () => {
    const newCategoryName = categoryInput.trim();
    if (newCategoryName === "") return;

    try {
      const res = await axios.post("/api/categories", {
        name: newCategoryName,
      });
      const newCategory: Category = res.data;
      setCategories((prev) => [...prev, newCategory]);
      setSelectedCategory(newCategory);
      onCategorySelect(newCategory.id);
      setIsSuggestionsVisible(false);
      setCategoryInput(newCategory.name);
    } catch (error) {
      console.error("Error adding new category:", error);
      // Optionally, display an error message to the user
    }
  };

  // Handle name query input changes with debounce
  const handleNameQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDrawingQuery(value);

    if (nameSearchTimeout.current) {
      clearTimeout(nameSearchTimeout.current);
    }

    nameSearchTimeout.current = setTimeout(() => {
      onNameChange(value);
    }, 300);
  };

  // Handle form submission (prevent default)
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No action needed since search is handled on input change
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
    <form
      onSubmit={handleFormSubmit}
      className="flex flex-col w-full space-y-4"
    >
      {/* Category Autocomplete Input */}
      <div className="relative" ref={suggestionsRef}>
        <input
          type="text"
          placeholder="Search categories..."
          value={categoryInput}
          onChange={handleCategoryChange}
          onFocus={() => setIsSuggestionsVisible(true)}
          className="p-2 border rounded w-full"
          aria-label="Search categories"
        />
        {isCategoriesLoading && <p>Loading categories...</p>}
        {categoryError && <p className="text-red-500">{categoryError}</p>}
        {isSuggestionsVisible &&
          (filteredCategories.length > 0 || categoryInput.trim() !== "") && (
            <div className="absolute z-10 w-full bg-white border rounded shadow-md overflow-y-auto max-h-60">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                  role="option"
                  aria-selected={selectedCategory?.id === cat.id}
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
                    role="option"
                  >
                    + Add "{categoryInput}"
                  </div>
                )}
            </div>
          )}
      </div>

      {/* Drawing Search and Action Buttons */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search drawings..."
          value={drawingQuery}
          onChange={handleNameQueryChange}
          className="p-2 border rounded flex-grow"
          aria-label="Search drawings"
        />
        {/* Removed Search Button */}
        <button
          type="button"
          onClick={toggleMode}
          className="ml-2 p-2 bg-gray-800 text-white rounded hover:bg-gray-700"
        >
          {isDragMode ? "Switch to Grid View" : "Switch to Drag Mode"}
        </button>
        {selectedCategory && (
          <button
            type="button"
            onClick={onOpenPaintBoard}
            className="p-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Draw
          </button>
        )}
      </div>
    </form>
  );
};

export default SearchBar;
