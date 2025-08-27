import React, { useState } from "react";
import EntryCard from "@/components/entries/EntryCard";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

// No props needed for this component since it's a standalone page
const FixedEntries = () => {
  // Create a local handler for entry clicks
  const onEntryClick = (id: number) => {
    console.log(`Entry ${id} clicked - would open details if this was in the app layout`);
    // In a standalone page we can't use the modal, so we'll just log
  }
  const [visibleEntries, setVisibleEntries] = useState(10);
  
  // Query entries for authenticated user
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/entries-fixed`],
    queryFn: () => {
      return fetch(`/api/entries?limit=${visibleEntries}&offset=0&sortBy=createdAt&sortOrder=desc`, {
          credentials: 'include'
        })
        .then(res => res.json());
    }
  });

  const entries = data?.entries || [];
  const totalEntries = data?.total || 0;

  const loadMoreEntries = () => {
    setVisibleEntries(prevCount => prevCount + 10);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All WhatsApp Entries</h1>
        <p className="text-gray-600">This page shows all your WhatsApp entries</p>
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
            Send some messages via WhatsApp to create entries.
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

          {entries.length < totalEntries && (
            <div className="flex justify-center gap-2 py-4">
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
  );
};

export default FixedEntries;