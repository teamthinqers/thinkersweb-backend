import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchIcon, BellIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface HeaderProps {
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "This feature is coming soon!",
      duration: 3000,
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
      <div className="flex-1 flex items-center justify-center sm:justify-start">
        <form className="relative w-full max-w-xl" onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="Search your learnings..."
            className="pl-10 pr-4 py-2 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <SearchIcon className="h-5 w-5" />
          </div>
        </form>
      </div>

      <div className="ml-4 flex items-center">
        <button 
          className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-2"
          onClick={handleNotifications}
        >
          <BellIcon className="h-5 w-5" />
        </button>
        <div className="relative">
          <Avatar className="h-8 w-8 border-2 border-white shadow">
            <AvatarFallback className="bg-primary text-white">UR</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;
