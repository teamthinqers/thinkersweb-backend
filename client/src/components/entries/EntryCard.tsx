import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface Tag {
  id: number;
  name: string;
}

interface EntryCardProps {
  id: number;
  title: string;
  content: string;
  category?: string;
  categoryColor?: string; 
  createdAt: Date | string;
  tags?: Tag[];
  onClick: (id: number) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({
  id,
  title,
  content,
  category,
  categoryColor = "#6366f1",
  createdAt,
  tags = [],
  onClick,
}) => {
  // Convert to Date object if string
  const createdDate = typeof createdAt === "string" ? new Date(createdAt) : createdAt;
  
  // Get relative time (e.g., "2 days ago")
  const timeAgo = formatDistanceToNow(createdDate, { addSuffix: true });
  
  // Get category variant for badge
  const getCategoryVariant = () => {
    if (!category) return "default";
    
    const lowerCaseCategory = category.toLowerCase();
    if (lowerCaseCategory === "professional") return "professional";
    if (lowerCaseCategory === "personal") return "personal";
    if (lowerCaseCategory === "health") return "health";
    if (lowerCaseCategory === "finance") return "finance";
    
    return "default";
  };
  
  // Strip markdown and html for plain text preview
  const getTextPreview = (markdown: string) => {
    const strippedText = markdown
      .replace(/```[^`]*```/g, '') // Remove code blocks
      .replace(/#{1,6}\s?[^#\n]+/g, '') // Remove headings
      .replace(/\*\*|__/g, '') // Remove bold
      .replace(/\*|_/g, '') // Remove italic
      .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
      .replace(/\n/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
    
    return strippedText.length > 180 ? strippedText.substring(0, 180) + '...' : strippedText;
  };

  return (
    <Card 
      className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => onClick(id)}
    >
      <CardContent className="p-5">
        <div className="flex items-center space-x-2 mb-3">
          {category && (
            <Badge 
              variant={getCategoryVariant()} 
              style={{ backgroundColor: `${categoryColor}10`, color: categoryColor }}
              className="capitalize"
            >
              {category}
            </Badge>
          )}
          <span className="text-xs text-gray-500">{timeAgo}</span>
        </div>
        
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {getTextPreview(content)}
        </p>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="tag" className="text-xs">
                {tag.name}
              </Badge>
            ))}
            {tags.length > 3 && (
              <Badge variant="tag" className="text-xs">
                +{tags.length - 3} more
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EntryCard;
