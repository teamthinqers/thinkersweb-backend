import React, { useState, useEffect } from "react";
import EntryCard from "@/components/entries/EntryCard";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";

interface AllEntriesProps {
  onEntryClick: (id: number) => void;
}

const AllEntries: React.FC<AllEntriesProps> = ({ onEntryClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const itemsPerPage = 9;

  const { categories } = useCategories();
  const { tags } = useTags();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, sortOrder, selectedCategory, selectedTags]);

  const { data, isLoading, error } = useQuery({
    queryKey: [
      `/api/entries`, 
      { 
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        sortBy,
        sortOrder,
        search: searchQuery,
        categoryId: selectedCategory,
        tagIds: selectedTags.length > 0 ? selectedTags : undefined
      }
    ]
  });

  const entries = data?.entries || [];
  const totalEntries = data?.total || 0;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);

  const handleSort = (value: string) => {
    // Parse sort option value (format: "field_order")
    const [field, order] = value.split("_");
    setSortBy(field);
    setSortOrder(order);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const toggleTag = (tagId: number) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId) 
        : [...prev, tagId]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedTags([]);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Entries</h1>
        <p className="text-gray-600">Browse and search through all your learning entries</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search className="h-5 w-5" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {(selectedCategory || selectedTags.length > 0) && (
                <Badge className="ml-2 bg-primary/20 text-primary border-0">
                  {(selectedCategory ? 1 : 0) + selectedTags.length}
                </Badge>
              )}
            </Button>
            
            <Select 
              value={`${sortBy}_${sortOrder}`} 
              onValueChange={handleSort}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
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

        {showFilters && (
          <div className="mt-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Category</h3>
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {tags?.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant={selectedTags.includes(tag.id) ? "default" : "tag"}
                      className="cursor-pointer"
                      onClick={() => toggleTag(tag.id)}
                    >
                      {tag.name}
                      {selectedTags.includes(tag.id) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                disabled={!selectedCategory && selectedTags.length === 0 && !searchQuery}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Loading entries...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          Error loading entries. Please try again.
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No entries found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory || selectedTags.length > 0
              ? "Try adjusting your filters or search query."
              : "Start adding your learning experiences to build your knowledge repository."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllEntries;
