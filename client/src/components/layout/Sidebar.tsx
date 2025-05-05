import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LightbulbIcon, 
  PlusIcon, 
  LayoutDashboard, 
  BookOpen, 
  Eye, 
  Star, 
  Users, 
  Plus, 
  Hash
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  onNewEntry: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile, onNewEntry }) => {
  const [location] = useLocation();
  const { categories, isLoading: categoriesLoading } = useCategories(true);
  const { tags, isLoading: tagsLoading } = useTags(true);

  // Only show top 10 most used tags in sidebar
  const topTags = tags?.slice(0, 10) || [];

  if (!isOpen) return null;

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, label: "All Entries", path: "/entries" },
    { icon: Eye, label: "Insights", path: "/insights" },
    { icon: Star, label: "Favorites", path: "/favorites" },
    { icon: Users, label: "Network", path: "/network" },
  ];

  const sidebarClasses = isMobile
    ? "fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-xl transform transition-transform duration-200 ease-in-out border-r"
    : "w-64 flex-shrink-0 border-r h-full overflow-y-auto bg-card/50";

  return (
    <div className={sidebarClasses}>
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <LightbulbIcon className="mr-2 h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
            Learning Repo
          </span>
        </h1>
      </div>

      <div className="p-4">
        <Button 
          className="w-full flex items-center justify-center shadow-sm"
          onClick={onNewEntry}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Entry
        </Button>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-9rem)]">
        <nav className="mt-2 px-4">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 ml-2">Navigation</h2>
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link 
                  href={item.path}
                  className={`flex items-center px-3 py-2.5 rounded-md ${
                    location === item.path
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={isMobile ? onClose : undefined}
                >
                  {React.createElement(item.icon, { 
                    className: "mr-2 h-4.5 w-4.5", 
                    size: 18 
                  })}
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {categoriesLoading ? (
            <div className="py-4 px-3 text-sm text-gray-500">Loading categories...</div>
          ) : (
            <>
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 mt-6">Categories</h2>
              <ul>
                {categories?.map((category) => (
                  <li key={category.id} className="mb-1">
                    <div className="flex items-center justify-between px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 cursor-pointer">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </div>
                  </li>
                ))}
                <li>
                  <div className="px-3 py-2 text-gray-500 hover:text-primary cursor-pointer flex items-center">
                    <i className="ri-add-line mr-1"></i> Add category
                  </div>
                </li>
              </ul>
            </>
          )}

          {tagsLoading ? (
            <div className="py-4 px-3 text-sm text-gray-500">Loading tags...</div>
          ) : (
            <>
              <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2 mt-6">Tags</h2>
              <div className="flex flex-wrap gap-2 px-3">
                {topTags.map((tag) => (
                  <span 
                    key={tag.id}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-primary hover:text-white cursor-pointer"
                  >
                    {tag.name}
                    {tag.count && (
                      <span className="ml-1 text-xs opacity-70">{tag.count}</span>
                    )}
                  </span>
                ))}
                {tags && tags.length > 10 && (
                  <span className="px-2 py-1 text-primary text-xs hover:underline cursor-pointer mt-2">
                    View all tags
                  </span>
                )}
              </div>
            </>
          )}
        </nav>
        <Separator className="my-4" />
        <div className="px-4 pb-4 text-xs text-gray-500">
          <p>Learning Repository v1.0</p>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
