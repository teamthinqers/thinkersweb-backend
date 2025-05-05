import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import AllEntries from "@/pages/AllEntries";
import Insights from "@/pages/Insights";
import Favorites from "@/pages/Favorites";
import AppLayout from "@/components/layout/AppLayout";
import { useState } from "react";
import EntryDetail from "@/components/entries/EntryDetail";
import EntryForm from "@/components/entries/EntryForm";

function Router() {
  const [showEntryDetail, setShowEntryDetail] = useState(false);
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<number | null>(null);

  const openEntryDetail = (id: number) => {
    setCurrentEntryId(id);
    setShowEntryDetail(true);
  };

  const closeEntryDetail = () => {
    setShowEntryDetail(false);
    setCurrentEntryId(null);
  };

  const openNewEntryForm = () => {
    setCurrentEntryId(null);
    setShowEntryForm(true);
  };

  const openEditEntryForm = (id: number) => {
    setCurrentEntryId(id);
    setShowEntryForm(true);
  };

  const closeEntryForm = () => {
    setShowEntryForm(false);
    setCurrentEntryId(null);
  };

  return (
    <AppLayout onNewEntry={openNewEntryForm}>
      <Switch>
        <Route path="/" component={() => <Dashboard onEntryClick={openEntryDetail} />} />
        <Route path="/entries" component={() => <AllEntries onEntryClick={openEntryDetail} />} />
        <Route path="/insights" component={Insights} />
        <Route path="/favorites" component={() => <Favorites onEntryClick={openEntryDetail} />} />
        <Route component={NotFound} />
      </Switch>

      {showEntryDetail && currentEntryId && (
        <EntryDetail 
          entryId={currentEntryId} 
          isOpen={showEntryDetail} 
          onClose={closeEntryDetail} 
          onEdit={openEditEntryForm} 
        />
      )}

      <EntryForm 
        isOpen={showEntryForm} 
        onClose={closeEntryForm} 
        entryId={currentEntryId} 
      />
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
