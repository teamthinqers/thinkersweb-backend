import React from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";
import { useTags } from "@/hooks/useTags";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LightbulbIcon, PlusIcon } from "lucide-react";

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
    { icon: "ri-dashboard-line", label: "Dashboard", path: "/" },
    { icon: "ri-book-2-line", label: "All Entries", path: "/entries" },
    { icon: "ri-eye-line", label: "Insights", path: "/insights" },
    { icon: "ri-star-line", label: "Favorites", path: "/favorites" },
  ];

  const sidebarClasses = isMobile
    ? "fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out"
    : "w-64 flex-shrink-0 border-r border-gray-200 bg-white h-full overflow-y-auto";

  return (
    <div className={sidebarClasses}>
      <div className="px-6 py-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-800 flex items-center">
          <LightbulbIcon className="mr-2 h-5 w-5 text-primary" />
          Learning Repo
        </h1>
      </div>

      <div className="p-4">
        <Button 
          className="w-full flex items-center justify-center"
          onClick={onNewEntry}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Entry
        </Button>
      </div>

      <ScrollArea className="flex-1 h-[calc(100vh-9rem)]">
        <nav className="mt-2 px-4">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-2">Navigation</h2>
          <ul>
            {navItems.map((item) => (
              <li key={item.path} className="mb-1">
                <Link href={item.path}>
                  <a 
                    className={`flex items-center px-3 py-2 rounded-md ${
                      location === item.path
                        ? "bg-indigo-50 text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={isMobile ? onClose : undefined}
                  >
                    <i className={`${item.icon} mr-2`}></i> {item.label}
                  </a>
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
