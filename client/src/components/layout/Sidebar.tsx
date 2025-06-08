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
  BookOpen, 
  Eye, 
  Star, 
  Users, 
  Plus, 
  Hash,
  Brain,
  Settings as SettingsIcon
} from "lucide-react";

// Define interfaces for category and tag
interface CategoryWithCount {
  id: number;
  name: string;
  color: string;
  count: number;
}

interface TagWithCount {
  id: number;
  name: string;
  count: number;
}

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
    { icon: LightbulbIcon, label: "Home", path: "/" },
    { icon: BookOpen, label: "All Entries", path: "/entries" },
    { icon: Eye, label: "Insights", path: "/insights" },
    { icon: Star, label: "Favorites", path: "/favorites" },
    { icon: Users, label: "Network", path: "/network" },
    { icon: Brain, label: "DotSpark Config", path: "/sectioned-dotspark-tuning", isSpecial: true },
    { icon: SettingsIcon, label: "Settings", path: "/settings" },
  ];

  const sidebarClasses = isMobile
    ? "fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-xl transform transition-transform duration-200 ease-in-out border-r"
    : "w-64 flex-shrink-0 border-r h-full overflow-y-auto bg-card/50";

  return (
    <div className={sidebarClasses}>
      <div className="px-6 py-5 border-b">
        <h1 className="text-xl font-bold flex items-center">
          <LightbulbIcon className="mr-2 h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            DotSpark
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
                      : item.isSpecial
                        ? "text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-800 dark:hover:text-amber-300 font-medium"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                  onClick={isMobile ? onClose : undefined}
                >
                  {React.createElement(item.icon, { 
                    className: `mr-2 ${
                      item.label === "Home" 
                        ? "text-primary" 
                        : item.isSpecial 
                          ? "text-amber-600" 
                          : ""
                    }`, 
                    size: item.label === "Home" || item.isSpecial ? 20 : 18 
                  })}
                  {item.label === "Home" ? (
                    <span className="font-medium text-primary">Home</span>
                  ) : item.isSpecial ? (
                    <span className="font-medium bg-gradient-to-r from-amber-700 to-orange-800 bg-clip-text text-transparent">{item.label}</span>
                  ) : (
                    item.label
                  )}
                </Link>
              </li>
            ))}
          </ul>

          {categoriesLoading ? (
            <div className="py-3 px-3 text-sm text-muted-foreground flex items-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
              Loading categories...
            </div>
          ) : (
            <>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 mt-8 ml-2">Categories</h2>
              <ul className="space-y-1">
                {categories?.map((category: CategoryWithCount) => (
                  <li key={category.id}>
                    <div className="flex items-center justify-between px-3 py-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors">
                      <div className="flex items-center">
                        <span 
                          className="w-3 h-3 rounded-full mr-2.5" 
                          style={{ backgroundColor: category.color }}
                        ></span>
                        <span>{category.name}</span>
                      </div>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full font-medium">
                        {category.count}
                      </span>
                    </div>
                  </li>
                ))}
                <li>
                  <div className="px-3 py-2 text-muted-foreground hover:text-primary cursor-pointer flex items-center transition-colors mt-1">
                    <Plus className="h-3.5 w-3.5 mr-1.5" /> Add category
                  </div>
                </li>
              </ul>
            </>
          )}

          {tagsLoading ? (
            <div className="py-3 px-3 text-sm text-muted-foreground flex items-center">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mr-2"></div>
              Loading tags...
            </div>
          ) : (
            <>
              <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3 mt-8 ml-2">Tags</h2>
              <div className="flex flex-wrap gap-1.5 px-3">
                {topTags.map((tag: TagWithCount) => (
                  <span 
                    key={tag.id}
                    className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full hover:bg-primary/20 hover:text-primary cursor-pointer transition-colors flex items-center"
                  >
                    <Hash className="h-3 w-3 mr-0.5 opacity-70" />
                    {tag.name}
                    {tag.count && (
                      <span className="ml-1 text-xs opacity-70">{tag.count}</span>
                    )}
                  </span>
                ))}
                {tags && tags.length > 10 && (
                  <span className="px-2 py-0.5 text-primary text-xs hover:underline cursor-pointer mt-1 flex items-center">
                    View all tags
                  </span>
                )}
              </div>
            </>
          )}
        </nav>
        <Separator className="my-6 opacity-50" />
        <div className="px-4 pb-4 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">DotSpark v1.0</p>
          <div className="flex items-center text-muted-foreground/70">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500 mr-1.5"></span>
            <span className="text-xs">Connected</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
