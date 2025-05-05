import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertCategorySchema, insertEntrySchema, insertTagSchema, insertConnectionSchema, insertSharedEntrySchema, sharedEntries } from "@shared/schema";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { connectionsService } from "./connections";
import { db } from "@db";

// Interface for authenticated requests (will be used later when auth is implemented)
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    username: string;
    email: string;
  };
  isAuthenticated(): boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Create HTTP server
  const httpServer = createServer(app);

  // Error handler middleware for API routes
  const handleApiError = (err: any, res: any) => {
    console.error("API Error:", err);

    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation error", errors: err.format() });
    }

    return res.status(500).json({ message: "Internal server error" });
  };

  // Categories endpoints
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const withCount = req.query.withCount === "true";
      const categories = withCount
        ? await storage.getCategoryWithEntryCount()
        : await storage.getAllCategories();
      res.json(categories);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.post(`${apiPrefix}/categories`, async (req, res) => {
    try {
      const data = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(data);
      res.status(201).json(newCategory);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.put(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const data = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, data);

      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(updatedCategory);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.delete(`${apiPrefix}/categories/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      await storage.deleteCategory(id);
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Tags endpoints
  app.get(`${apiPrefix}/tags`, async (req, res) => {
    try {
      const withCount = req.query.withCount === "true";
      const tags = withCount
        ? await storage.getTagsWithCount()
        : await storage.getAllTags();
      res.json(tags);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.post(`${apiPrefix}/tags`, async (req, res) => {
    try {
      const data = insertTagSchema.parse(req.body);
      const newTag = await storage.createTag(data);
      res.status(201).json(newTag);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.put(`${apiPrefix}/tags/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const data = insertTagSchema.parse(req.body);
      const updatedTag = await storage.updateTag(id, data);

      if (!updatedTag) {
        return res.status(404).json({ message: "Tag not found" });
      }

      res.json(updatedTag);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.delete(`${apiPrefix}/tags/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      await storage.deleteTag(id);
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Related tags
  app.get(`${apiPrefix}/tags/:id/related`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tag ID" });
      }

      const relatedTags = await storage.getRelatedTags(id);
      res.json(relatedTags);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Entries endpoints
  app.get(`${apiPrefix}/entries`, async (req, res) => {
    try {
      const { categoryId, tagIds, search, favorite, limit, offset, sortBy, sortOrder } = req.query;
      
      const options = {
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        tagIds: tagIds ? (tagIds as string).split(',').map(id => parseInt(id)) : undefined,
        searchQuery: search as string,
        isFavorite: favorite === 'true' ? true : undefined,
        limit: limit ? parseInt(limit as string) : 10,
        offset: offset ? parseInt(offset as string) : 0,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: (sortOrder as 'asc' | 'desc') || 'desc'
      };
      
      const result = await storage.getAllEntries(options);
      res.json(result);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.get(`${apiPrefix}/entries/search`, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }

      const entries = await storage.searchEntries(query);
      res.json(entries);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.get(`${apiPrefix}/entries/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      const entry = await storage.getEntryWithDetails(id);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(entry);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.post(`${apiPrefix}/entries`, async (req, res) => {
    try {
      // Create separate schema for API validation
      const apiSchema = z.object({
        title: z.string().min(3, "Title must be at least 3 characters"),
        content: z.string().min(10, "Content must be at least 10 characters"),
        categoryId: z.number().optional(),
        isFavorite: z.boolean().optional(),
        tagIds: z.array(z.number()).optional(),
        relatedEntryIds: z.array(z.number()).optional(),
      });

      const data = apiSchema.parse(req.body);
      const newEntry = await storage.createEntry(data);
      res.status(201).json(newEntry);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.put(`${apiPrefix}/entries/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // Create separate schema for API validation
      const apiSchema = z.object({
        title: z.string().min(3, "Title must be at least 3 characters").optional(),
        content: z.string().min(10, "Content must be at least 10 characters").optional(),
        categoryId: z.number().nullable().optional(),
        isFavorite: z.boolean().optional(),
        tagIds: z.array(z.number()).optional(),
        relatedEntryIds: z.array(z.number()).optional(),
      });

      const data = apiSchema.parse(req.body);
      const updatedEntry = await storage.updateEntry(id, data);

      if (!updatedEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(updatedEntry);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.put(`${apiPrefix}/entries/:id/favorite`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      const updatedEntry = await storage.toggleFavorite(id);

      if (!updatedEntry) {
        return res.status(404).json({ message: "Entry not found" });
      }

      res.json(updatedEntry);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.delete(`${apiPrefix}/entries/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      await storage.deleteEntry(id);
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Analytics endpoints
  app.get(`${apiPrefix}/analytics/categories`, async (req, res) => {
    try {
      const data = await storage.getEntriesByCategory();
      res.json(data);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.get(`${apiPrefix}/analytics/frequency`, async (req, res) => {
    try {
      const weeks = req.query.weeks ? parseInt(req.query.weeks as string) : 8;
      const data = await storage.getEntryFrequencyByWeek(weeks);
      res.json(data);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  app.get(`${apiPrefix}/insights`, async (req, res) => {
    try {
      const insights = await storage.getInsights();
      res.json(insights);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // User and connection endpoints
  // For demo purposes, we'll use a hardcoded user ID (1) until auth is implemented
  const DEMO_USER_ID = 1;
  
  // Get all connections for the current user
  app.get(`${apiPrefix}/connections`, async (req, res) => {
    try {
      const connections = await connectionsService.getUserConnections(DEMO_USER_ID);
      res.json(connections);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Get all pending connection requests for the current user
  app.get(`${apiPrefix}/connections/requests`, async (req, res) => {
    try {
      const requests = await connectionsService.getConnectionRequests(DEMO_USER_ID);
      res.json(requests);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Create a new connection request
  app.post(`${apiPrefix}/connections`, async (req, res) => {
    try {
      const { connectedUserId } = req.body;
      
      if (!connectedUserId) {
        return res.status(400).json({ message: "Connected user ID is required" });
      }
      
      const newConnection = await connectionsService.createConnectionRequest(
        DEMO_USER_ID,
        connectedUserId
      );
      
      res.status(201).json(newConnection);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Accept a connection request
  app.post(`${apiPrefix}/connections/:id/accept`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      const updatedConnection = await connectionsService.acceptConnectionRequest(id, DEMO_USER_ID);
      res.json(updatedConnection);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Reject a connection request
  app.post(`${apiPrefix}/connections/:id/reject`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      await connectionsService.rejectConnectionRequest(id, DEMO_USER_ID);
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Remove a connection
  app.delete(`${apiPrefix}/connections/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid connection ID" });
      }
      
      await connectionsService.removeConnection(id, DEMO_USER_ID);
      res.status(204).send();
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Search for users
  app.get(`${apiPrefix}/users/search`, async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query || query.length < 2) {
        return res.status(400).json({ message: "Search query must be at least 2 characters" });
      }
      
      const users = await connectionsService.searchUsers(query, DEMO_USER_ID);
      res.json(users);
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Share an entry with a connection
  app.post(`${apiPrefix}/entries/share`, async (req, res) => {
    try {
      const { entryId, sharedWithUserId } = req.body;
      
      if (!entryId || !sharedWithUserId) {
        return res.status(400).json({ 
          message: "Entry ID and shared with user ID are required" 
        });
      }
      
      // First verify this is the user's entry
      const entry = await storage.getEntryById(entryId);
      if (!entry) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      // Then verify these users are connected
      const connectionStatus = await connectionsService.getConnectionStatus(
        DEMO_USER_ID, 
        sharedWithUserId
      );
      
      if (!connectionStatus.isConnected) {
        return res.status(403).json({ 
          message: "You can only share entries with your connections" 
        });
      }
      
      // Create the shared entry
      const [sharedEntry] = await db.insert(sharedEntries)
        .values({
          entryId,
          sharedWithUserId,
          permissions: "read" // Default permission
        })
        .returning();
      
      res.status(201).json(sharedEntry);
    } catch (err) {
      handleApiError(err, res);
    }
  });

  // Chat interface endpoints
  app.post(`${apiPrefix}/chat/process`, async (req, res) => {
    try {
      const { message, messages } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Process the user's message to create an entry
      const processedEntry = await processEntryFromChat(message, messages);
      
      // Find or create tags
      let tagIds: number[] = [];
      if (processedEntry.tagNames && processedEntry.tagNames.length > 0) {
        const tagPromises = processedEntry.tagNames.map(async (tagName) => {
          // Check if tag exists
          const existingTags = await storage.getAllTags();
          const existingTag = existingTags.find(t => 
            t.name.toLowerCase() === tagName.toLowerCase()
          );
          
          if (existingTag) {
            return existingTag.id;
          } else {
            // Create new tag
            const newTag = await storage.createTag({ name: tagName });
            return newTag.id;
          }
        });
        
        tagIds = await Promise.all(tagPromises);
      }
      
      // Create the entry with the processed data
      const newEntry = await storage.createEntry({
        title: processedEntry.title,
        content: processedEntry.content,
        categoryId: processedEntry.categoryId,
        tagIds: tagIds
      });
      
      res.status(201).json({ entry: newEntry, success: true });
    } catch (err) {
      console.error("Chat processing error:", err);
      handleApiError(err, res);
    }
  });
  
  app.post(`${apiPrefix}/chat/respond`, async (req, res) => {
    try {
      const { message, messages } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Generate a response to the user's message
      const response = await generateChatResponse(message, messages);
      
      res.json({ 
        response,
        success: true
      });
    } catch (err) {
      console.error("Chat response error:", err);
      handleApiError(err, res);
    }
  });

  return httpServer;
}
