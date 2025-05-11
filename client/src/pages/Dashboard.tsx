import React, { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import InsightSection from "@/components/dashboard/InsightSection";
import StatisticsSection from "@/components/dashboard/StatisticsSection";
import EntryCard from "@/components/entries/EntryCard";
import { useQuery } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DashboardProps {
  onEntryClick: (id: number) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onEntryClick }) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [visibleEntries, setVisibleEntries] = useState(6);

  // Use direct user ID 5 to always show your entries
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/entries`, { 
      limit: visibleEntries,
      offset: 0,
      sortBy: sortBy,
      sortOrder: sortOrder,
      directUserId: 5  // Always use user ID 5 (Aravindh's account)
    }],
    queryFn: ({ queryKey }) => {
      // Extract params from queryKey
      const [endpoint, params] = queryKey;
      // Build URL with params
      const url = new URL(endpoint as string, window.location.origin);
      
      // Add all params to URL
      Object.entries(params as Record<string, any>).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
      
      // Make fetch request
      return fetch(url.toString()).then(res => res.json());
    }
  });

  console.log('Dashboard received data:', data);
  
  // Ensure we handle the data correctly
  const entries = data?.entries || [];
  const totalEntries = data?.total ? parseInt(data.total) : 0;

  const handleSort = (value: string) => {
    // Parse sort option value (format: "field_order")
    const [field, order] = value.split("_");
    setSortBy(field);
    setSortOrder(order);
  };

  const loadMoreEntries = () => {
    setVisibleEntries(prevCount => prevCount + 6);
  };

  return (
    <>
      <DashboardHeader />
      <InsightSection />
      <StatisticsSection />

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Entries</h2>
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
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8">Loading entries...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">
            Error loading entries. Please try again.
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No entries yet</h3>
            <p className="text-gray-600 mb-4">
              Start adding your learning experiences to build your knowledge repository.
            </p>
          </div>
        ) : (
          <>
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
                  onClick={onEntryClick}
                />
              ))}
            </div>

            {entries.length < totalEntries && (
              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  className="text-primary hover:text-accent font-medium"
                  onClick={loadMoreEntries}
                >
                  Load more entries
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Dashboard;
