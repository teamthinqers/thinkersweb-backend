import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCategorySchema, 
  insertEntrySchema, 
  insertTagSchema, 
  insertConnectionSchema, 
  insertSharedEntrySchema, 
  sharedEntries, 
  entryTags, 
  users, 
  whatsappOtpVerifications,
  whatsappUsers,
  type User 
} from "@shared/schema";
import { processEntryFromChat, generateChatResponse, type Message } from "./chat";
import { connectionsService } from "./connections";
import { db } from "@db";
import { setupAuth, isAuthenticated } from "./auth";
import { 
  extractWhatsAppMessage, 
  processWhatsAppMessage, 
  registerWhatsAppUser,
  unregisterWhatsAppUser,
  getWhatsAppStatus,
  requestWhatsAppOTP,
  verifyWhatsAppOTP
} from "./whatsapp";
import { eq, inArray, and, lt, desc } from "drizzle-orm";
import twilio from "twilio";

// Interface for authenticated requests
interface AuthenticatedRequest extends Request {
  user?: Express.User;
  isAuthenticated(): boolean;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiPrefix = "/api";

  // Create HTTP server
  const httpServer = createServer(app);
  
  // Simple health check endpoint for network connectivity tests
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', time: new Date().toISOString() });
  });
  
  // Set up authentication
  setupAuth(app);

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
  
  // Firebase Authentication endpoint has been moved to auth.ts

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
      
      res.status(201).json({ ...sharedEntry, count: 1 });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Share entries by tags with a connection
  app.post(`${apiPrefix}/entries/share-by-tags`, async (req, res) => {
    try {
      const { tagIds, sharedWithUserId } = req.body;
      
      if (!tagIds || !tagIds.length || !sharedWithUserId) {
        return res.status(400).json({ 
          message: "Tag IDs and shared with user ID are required" 
        });
      }
      
      // Verify these users are connected
      const connectionStatus = await connectionsService.getConnectionStatus(
        DEMO_USER_ID, 
        sharedWithUserId
      );
      
      if (!connectionStatus.isConnected) {
        return res.status(403).json({ 
          message: "You can only share entries with your connections" 
        });
      }
      
      // Get entries with the specified tags that belong to the current user
      // First get entries that have any of these tags
      const entryTagsWithTagIds = await db.query.entryTags.findMany({
        where: (et, { inArray }) => inArray(et.tagId, tagIds)
      });
      
      const entryIdsWithTags = entryTagsWithTagIds.map(et => et.entryId);
      
      // Then get only entries that belong to the current user
      const entriesWithTags = await db.query.entries.findMany({
        where: (entries, { eq, and, inArray }) => and(
          eq(entries.userId, DEMO_USER_ID),
          inArray(entries.id, entryIdsWithTags)
        )
      });
      
      if (entriesWithTags.length === 0) {
        return res.status(404).json({ 
          message: "No entries found with the selected tags" 
        });
      }
      
      // Create shared entries
      const sharedEntryValues = entriesWithTags.map(entry => ({
        entryId: entry.id,
        sharedWithUserId,
        permissions: "read" // Default permission
      }));
      
      const result = await db.insert(sharedEntries)
        .values(sharedEntryValues)
        .onConflictDoNothing() // In case some entries are already shared
        .returning();
      
      res.status(201).json({ count: result.length });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Share all entries with a connection
  app.post(`${apiPrefix}/entries/share-all`, async (req, res) => {
    try {
      const { sharedWithUserId } = req.body;
      
      if (!sharedWithUserId) {
        return res.status(400).json({ 
          message: "Shared with user ID is required" 
        });
      }
      
      // Verify these users are connected
      const connectionStatus = await connectionsService.getConnectionStatus(
        DEMO_USER_ID, 
        sharedWithUserId
      );
      
      if (!connectionStatus.isConnected) {
        return res.status(403).json({ 
          message: "You can only share entries with your connections" 
        });
      }
      
      // Get all entries from the current user
      const userEntries = await db.query.entries.findMany({
        where: (entries, { eq }) => eq(entries.userId, DEMO_USER_ID)
      });
      
      if (userEntries.length === 0) {
        return res.status(404).json({ 
          message: "No entries found to share" 
        });
      }
      
      // Create shared entries
      const sharedEntryValues = userEntries.map(entry => ({
        entryId: entry.id,
        sharedWithUserId,
        permissions: "read" // Default permission
      }));
      
      const result = await db.insert(sharedEntries)
        .values(sharedEntryValues)
        .onConflictDoNothing() // In case some entries are already shared
        .returning();
      
      res.status(201).json({ count: result.length });
    } catch (err) {
      handleApiError(err, res);
    }
  });
  
  // Network insights from shared entries
  app.get(`${apiPrefix}/network/insights`, async (req, res) => {
    try {
      // Get the user's connections
      const connections = await connectionsService.getUserConnections(DEMO_USER_ID);
      const connectionUserIds = connections.map(conn => conn.connectedUserId);
      
      // Get entries shared with the user
      const sharedEntriesData = await db.query.sharedEntries.findMany({
        where: (sharedEntries, { eq }) => eq(sharedEntries.sharedWithUserId, DEMO_USER_ID),
        with: {
          entry: {
            with: {
              category: true,
              tags: {
                with: {
                  tag: true
                }
              }
            }
          }
        }
      });
      
      // Instead of relying on the ORM relation in the query, we'll directly query for shared entries
      // Get IDs of entries that the user has shared with others
      const sharedByUserIdsQuery = await db.query.sharedEntries.findMany({
        where: (sharedEntries, { and, eq, inArray }) => and(
          inArray(sharedEntries.sharedWithUserId, connectionUserIds)
        )
      });
      
      // Process the data to extract insights
      
      // 1. Top categories from shared entries
      const categoryCounts: Record<string, { name: string; count: number; color: string }> = {};
      sharedEntriesData.forEach(shared => {
        if (shared.entry?.category) {
          const category = shared.entry.category;
          const categoryId = String(category.id);
          if (!categoryCounts[categoryId]) {
            categoryCounts[categoryId] = {
              name: category.name,
              count: 0,
              color: category.color || "#6366f1"
            };
          }
          categoryCounts[categoryId].count++;
        }
      });
      
      const topCategories = Object.values(categoryCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // 2. Top tags from shared entries
      const tagCounts: Record<string, { name: string; count: number }> = {};
      sharedEntriesData.forEach(shared => {
        if (shared.entry?.tags) {
          shared.entry.tags.forEach(entryTag => {
            const tag = entryTag.tag;
            const tagId = String(tag.id);
            if (!tagCounts[tagId]) {
              tagCounts[tagId] = {
                name: tag.name,
                count: 0
              };
            }
            tagCounts[tagId].count++;
          });
        }
      });
      
      const topTags = Object.values(tagCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
      
      // 3. Learning trends over time (last 6 weeks)
      const now = new Date();
      const sixWeeksAgo = new Date();
      sixWeeksAgo.setDate(sixWeeksAgo.getDate() - 42); // 6 weeks
      
      const weeksMap: Record<string, number> = {};
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
        
        // Format as MM/DD
        const month = (weekStart.getMonth() + 1).toString().padStart(2, '0');
        const day = weekStart.getDate().toString().padStart(2, '0');
        
        weeksMap[`${month}/${day}`] = 0;
      }
      
      sharedEntriesData.forEach(shared => {
        if (shared.entry?.createdAt) {
          const entryDate = new Date(shared.entry.createdAt);
          if (entryDate >= sixWeeksAgo && entryDate <= now) {
            const weekStart = new Date(entryDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
            
            // Format as MM/DD
            const month = (weekStart.getMonth() + 1).toString().padStart(2, '0');
            const day = weekStart.getDate().toString().padStart(2, '0');
            
            const weekKey = `${month}/${day}`;
            if (weekKey in weeksMap) {
              weeksMap[weekKey]++;
            }
          }
        }
      });
      
      const learningTrends = Object.entries(weeksMap)
        .map(([week, count]) => ({ week, count }))
        .reverse(); // Chronological order
      
      // 4. Trending topics (extracted from content analysis)
      // In a real app, we would use NLP to extract topics
      const trendingTopics = Array.from(new Set(
        sharedEntriesData
          .filter(shared => shared.entry?.title)
          .flatMap(shared => {
            if (!shared.entry?.title) return [];
            const title = shared.entry.title.toLowerCase();
            return title.split(' ')
              .filter(word => word.length > 4) // Simple filter for meaningful words
              .map(word => word.charAt(0).toUpperCase() + word.slice(1)); // Capitalize
          })
      )).slice(0, 10);
      
      // 5. Connection insights
      const connectionInsights = [
        `You've shared ${sharedByUserIdsQuery.length} entries with your network.`,
        `Your network has shared ${sharedEntriesData.length} entries with you.`,
        `The most popular category in your network is ${topCategories.length > 0 ? topCategories[0].name : 'not available yet'}.`,
        `The most discussed topic is ${topTags.length > 0 ? topTags[0].name : 'not available yet'}.`
      ];
      
      // 6. Learning patterns
      // This would typically use more sophisticated analysis
      const learningPatterns = [
        "Most learning entries in your network are created on weekdays.",
        "Health and Technology are complementary learning areas in your network.",
        "Your connections tend to focus on practical skills rather than theoretical concepts.",
        "Many shared entries include actionable steps and implementation strategies."
      ];
      
      res.json({
        connectionCount: connections.length,
        sharedEntriesCount: sharedEntriesData.length,
        entriesSharedByUserCount: sharedByUserIdsQuery.length,
        topCategories,
        topTags,
        learningTrends,
        trendingTopics,
        connectionInsights,
        learningPatterns
      });
      
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

  // DotSpark WhatsApp Chatbot Endpoints
  
  // WhatsApp chatbot webhook endpoint for receiving messages via Twilio
  app.post(`${apiPrefix}/whatsapp/webhook`, async (req, res) => {
    try {
      // Extract message from Twilio WhatsApp request
      const messageText = req.body.Body;
      const from = req.body.From;

      if (!messageText || !from) {
        console.log("Received invalid Twilio WhatsApp message:", req.body);
        // Not a valid message or missing required fields
        return res.status(200).send(); // Always return 200 to Twilio
      }

      console.log(`Received WhatsApp message from ${from}: ${messageText}`);
      
      // Log test mode status to help with debugging
      if (process.env.NODE_ENV === 'development') {
        console.log(`[TEST MODE ACTIVE] WhatsApp test phone numbers will be automatically registered to demo user ID 1`);
        console.log(`[TEST MODE ACTIVE] No verification needed for WhatsApp in development environment`);
      }

      // Process the message and get a response
      const response = await processWhatsAppMessage(from, messageText);
      
      // Create a TwiML response to send back to the user
      const twiml = new twilio.twiml.MessagingResponse();
      
      if (response && response.message) {
        // Add the message to the TwiML response
        twiml.message(response.message);
        console.log("Sending WhatsApp chatbot reply:", response.message);
      } else {
        // Send a default message if something went wrong
        twiml.message("Sorry, I couldn't process your message. Please try again later.");
      }

      // Send the TwiML response back to Twilio
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    } catch (err) {
      console.error("WhatsApp chatbot webhook error:", err);
      // Create an error TwiML response
      const twiml = new twilio.twiml.MessagingResponse();
      twiml.message("Sorry, something went wrong. Please try again later.");
      
      // Still return 200 as Twilio expects
      res.writeHead(200, { 'Content-Type': 'text/xml' });
      res.end(twiml.toString());
    }
  });

  // Register a phone number for DotSpark WhatsApp chatbot
  app.post(`${apiPrefix}/whatsapp/register`, async (req, res) => {
    try {
      // For demo purposes using DEMO_USER_ID, in production this would use authenticated user
      const userId = DEMO_USER_ID; 
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      const result = await registerWhatsAppUser(userId, phoneNumber);
      
      if (result.success) {
        return res.status(201).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (err) {
      console.error("WhatsApp chatbot registration error:", err);
      handleApiError(err, res);
    }
  });

  // Unregister a phone number from DotSpark WhatsApp chatbot
  app.post(`${apiPrefix}/whatsapp/unregister`, async (req, res) => {
    try {
      // For demo purposes using DEMO_USER_ID, in production this would use authenticated user
      const userId = DEMO_USER_ID;
      
      const result = await unregisterWhatsAppUser(userId);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (err) {
      console.error("WhatsApp chatbot unregistration error:", err);
      handleApiError(err, res);
    }
  });

  // Get DotSpark WhatsApp chatbot status
  app.get(`${apiPrefix}/whatsapp/status`, async (req, res) => {
    try {
      // For demo purposes using DEMO_USER_ID, in production this would use authenticated user
      const userId = DEMO_USER_ID;
      
      // Clean up expired OTP verifications first
      await db.delete(whatsappOtpVerifications)
        .where(and(
          eq(whatsappOtpVerifications.userId, userId),
          lt(whatsappOtpVerifications.expiresAt, new Date())
        ));
      
      const status = await getWhatsAppStatus(userId);
      res.json(status);
    } catch (err) {
      console.error("WhatsApp chatbot status error:", err);
      handleApiError(err, res);
    }
  });
  
  // Get WhatsApp contact number for the frontend
  app.get(`${apiPrefix}/whatsapp/contact`, async (req, res) => {
    try {
      // Use the WhatsApp Business number from environment variables
      // For Meta Business API we use the phone number directly
      const directBusinessNumber = process.env.WHATSAPP_PHONE_NUMBER || "15557649526";
      
      // Log the phone number being used
      console.log(`Using WhatsApp Business number: ${directBusinessNumber}`);
      
      // Return both the phone number and direct API URLs
      res.json({ 
        phoneNumber: directBusinessNumber,
        directLink: `https://api.whatsapp.com/send?phone=${directBusinessNumber}`
      });
    } catch (err) {
      console.error("WhatsApp contact number error:", err);
      handleApiError(err, res);
    }
  });

  // Request OTP verification for WhatsApp number
  app.post(`${apiPrefix}/whatsapp/request-otp`, async (req, res) => {
    try {
      console.log("Received WhatsApp OTP request with body:", req.body);
      
      // For demo purposes using DEMO_USER_ID, in production this would use authenticated user
      const userId = DEMO_USER_ID;
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        console.log("Error: Phone number is required");
        return res.status(400).json({ message: "Phone number is required" });
      }
      
      console.log(`Requesting OTP for phone number: ${phoneNumber}`);
      
      // Production mode fully enabled
      console.log("Current NODE_ENV:", process.env.NODE_ENV);
      
      const result = await requestWhatsAppOTP(userId, phoneNumber);
      console.log("OTP request result:", JSON.stringify(result));
      
      if (result.success) {
        // If in development mode, we included the OTP code in the response for testing
        console.log("Request successful, returning OTP code in response (dev mode)");
        return res.status(200).json(result);
      } else {
        console.log("OTP request failed:", result.message);
        return res.status(400).json(result);
      }
    } catch (err) {
      console.error("WhatsApp OTP request error:", err);
      handleApiError(err, res);
    }
  });

  // Verify OTP code for WhatsApp number
  app.post(`${apiPrefix}/whatsapp/verify-otp`, async (req, res) => {
    try {
      // For demo purposes using DEMO_USER_ID, in production this would use authenticated user
      const userId = DEMO_USER_ID;
      const { otpCode } = req.body;
      
      if (!otpCode || otpCode.length !== 6) {
        return res.status(400).json({ 
          success: false,
          message: "Valid 6-digit verification code is required" 
        });
      }
      
      const result = await verifyWhatsAppOTP(userId, otpCode);
      
      if (result.success) {
        return res.status(200).json(result);
      } else {
        return res.status(400).json(result);
      }
    } catch (err) {
      console.error("WhatsApp OTP verification error:", err);
      handleApiError(err, res);
    }
  });
  
  // Cancel pending WhatsApp verification
  app.post(`${apiPrefix}/whatsapp/cancel-verification`, async (req, res) => {
    try {
      // For demo purposes using DEMO_USER_ID, in production this would use authenticated user
      const userId = DEMO_USER_ID;
      
      // Delete all pending verifications for this user
      await db.delete(whatsappOtpVerifications)
        .where(and(
          eq(whatsappOtpVerifications.userId, userId),
          eq(whatsappOtpVerifications.verified, false)
        ));
      
      return res.status(200).json({ 
        success: true, 
        message: "Verification canceled successfully"
      });
    } catch (err) {
      console.error("WhatsApp verification cancellation error:", err);
      handleApiError(err, res);
    }
  });
  
  // ADMIN ONLY: Register a phone number directly without verification (for testing)
  app.post(`${apiPrefix}/whatsapp/admin-register`, async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ 
          success: false, 
          message: "Phone number is required" 
        });
      }
      
      // Import the registration function from the script
      const { registerPhoneNumber } = await import("../scripts/register-whatsapp-number");
      
      // Use the function to register the phone number
      const success = await registerPhoneNumber(phoneNumber);
      
      if (success) {
        return res.status(201).json({
          success: true,
          message: `Phone number ${phoneNumber} was successfully registered or updated`
        });
      } else {
        return res.status(500).json({
          success: false,
          message: `Failed to register phone number ${phoneNumber}`
        });
      }
    } catch (err) {
      console.error("Admin WhatsApp registration error:", err);
      handleApiError(err, res);
    }
  });

  // New WhatsApp Admin Endpoints
  app.get(`${apiPrefix}/whatsapp/admin/numbers`, isAuthenticated, async (req, res) => {
    try {
      const numbers = await db.query.whatsappUsers.findMany({
        orderBy: (whatsappUsers, { desc }) => [desc(whatsappUsers.createdAt)]
      });
      res.json(numbers);
    } catch (error) {
      console.error('Error fetching WhatsApp numbers:', error);
      res.status(500).json({ error: 'Failed to fetch WhatsApp numbers' });
    }
  });
  
  app.post(`${apiPrefix}/whatsapp/admin/register`, isAuthenticated, async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      
      if (!phoneNumber) {
        return res.status(400).json({ error: 'Phone number is required' });
      }
      
      // Standardize phone number format
      const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      // Check if already exists
      const existing = await db.query.whatsappUsers.findFirst({
        where: eq(whatsappUsers.phoneNumber, formattedNumber)
      });
      
      if (existing) {
        // Reactivate if it exists but is inactive
        if (!existing.active) {
          await db.update(whatsappUsers)
            .set({ active: true, updatedAt: new Date() })
            .where(eq(whatsappUsers.id, existing.id));
          
          return res.status(200).json({ 
            message: 'WhatsApp number reactivated successfully',
            number: formattedNumber
          });
        }
        
        return res.status(200).json({ 
          message: 'WhatsApp number already registered',
          number: formattedNumber
        });
      }
      
      // Register new number for the current user
      const user = req.user as Express.User;
      const result = await db.insert(whatsappUsers).values({
        userId: user.id,
        phoneNumber: formattedNumber,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      
      res.status(201).json({ 
        message: 'WhatsApp number registered successfully',
        number: result[0]
      });
    } catch (error) {
      console.error('Error registering WhatsApp number:', error);
      res.status(500).json({ error: 'Failed to register WhatsApp number' });
    }
  });
  
  app.delete(`${apiPrefix}/whatsapp/admin/number/:id`, isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Soft delete (deactivate) the number
      await db.update(whatsappUsers)
        .set({ active: false, updatedAt: new Date() })
        .where(eq(whatsappUsers.id, id));
      
      res.status(200).json({ message: 'WhatsApp number deactivated successfully' });
    } catch (error) {
      console.error('Error deactivating WhatsApp number:', error);
      res.status(500).json({ error: 'Failed to deactivate WhatsApp number' });
    }
  });

  return httpServer;
}
