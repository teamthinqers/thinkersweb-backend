import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to human readable string
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj instanceof Date && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        })
      : '';
  } catch {
    return '';
  }
}

// Truncate text to a specific length
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
}

// Parse markdown to plain text for previews
export function markdownToPlainText(markdown: string): string {
  if (!markdown) return '';
  
  return markdown
    .replace(/```[^`]*```/g, '') // Remove code blocks
    .replace(/#{1,6}\s?[^#\n]+/g, '') // Remove headings
    .replace(/\*\*|__/g, '') // Remove bold
    .replace(/\*|_/g, '') // Remove italic
    .replace(/\[[^\]]*\]\([^)]*\)/g, '') // Remove links
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

// Get color for a category
export function getCategoryColor(categoryName: string | undefined, defaultColor: string = "#6366f1"): string {
  if (!categoryName) return defaultColor;
  
  const name = categoryName.toLowerCase();
  
  if (name === "professional") return "#6366f1";
  if (name === "personal") return "#8b5cf6";
  if (name === "health") return "#10b981";
  if (name === "finance") return "#f59e0b";
  
  return defaultColor;
}

// Get variant name for badges based on category
export function getCategoryVariant(categoryName: string | undefined): string {
  if (!categoryName) return "default";
  
  const name = categoryName.toLowerCase();
  
  if (name === "professional") return "professional";
  if (name === "personal") return "personal";
  if (name === "health") return "health";
  if (name === "finance") return "finance";
  
  return "default";
}
