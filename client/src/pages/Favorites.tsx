import React, { useState } from "react";
import EntryCard from "@/components/entries/EntryCard";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star } from "lucide-react";

interface FavoritesProps {
  onEntryClick: (id: number) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ onEntryClick }) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { data, isLoading, error } = useQuery({
    queryKey: [
      `/api/entries`, 
      { 
        favorite: true,
        sortBy,
        sortOrder
      }
    ]
  });

  const entries = data?.entries || [];

  const handleSort = (value: string) => {
    // Parse sort option value (format: "field_order")
    const [field, order] = value.split("_");
    setSortBy(field);
    setSortOrder(order);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Favorite Entries</h1>
        <p className="text-gray-600">Your most valuable learning experiences</p>
      </div>

      <div className="flex justify-end mb-4">
        <div className="flex items-center">
          <span className="mr-2 text-sm text-gray-500">Sort by:</span>
          <Select 
            value={`${sortBy}_${sortOrder}`} 
            onValueChange={handleSort}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt_desc">Date (Newest)</SelectItem>
              <SelectItem value="createdAt_asc">Date (Oldest)</SelectItem>
              <SelectItem value="title_asc">Title (A-Z)</SelectItem>
              <SelectItem value="title_desc">Title (Z-A)</SelectItem>
              <SelectItem value="updatedAt_desc">Last Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading favorite entries...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Error loading entries. Please try again.
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-center mb-4">
            <Star className="h-12 w-12 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite entries yet</h3>
          <p className="text-gray-600 mb-4">
            Mark entries as favorites to easily access important learnings.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry: any) => (
            <EntryCard
              key={entry.id}
              id={entry.id}
              title={entry.title}
              content={entry.content}
              category={entry.category?.name}
              categoryColor={entry.category?.color}
              createdAt={entry.createdAt}
              tags={entry.tags}
              onClick={onEntryClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
