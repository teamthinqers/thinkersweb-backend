import express from 'express';
import { db } from '@db';
import { entries, users, dots, wheels, chakras, vectorEmbeddings } from '@shared/schema';
import { eq, and, desc, sql, inArray, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { isAuthenticated } from '../auth';

// Schema removed - using direct validation for entries table format

const insertWheelSchema = z.object({
  name: z.string(),
  heading: z.string().optional(),
  goals: z.string().optional(),
  purpose: z.string().optional(),
  timeline: z.string().optional(),
  category: z.string(),
  color: z.string(),
  chakraId: z.string().optional(),
  userId: z.number()
});

const router = express.Router();

// Simple authentication check - any authenticated user can access DotSpark
const ensureAuthenticated = (req: any, res: any, next: any) => {
  // Use the existing isAuthenticated middleware logic
  if (req.isAuthenticated?.() || req.session?.userId) {
    // Ensure req.user is set for consistency
    if (!req.user && req.session?.userId) {
      req.user = { id: req.session.userId };
    }
    console.log(`✅ Authenticated user ${req.user?.id} accessing DotSpark`);
    return next();
  }
  
  console.log('❌ Authentication required');
  return res.status(401).json({ 
    error: 'Authentication required',
    message: 'Please sign in to access DotSpark features'
  });
};

// Create a new dot and store in entries table (consistent with existing data)
router.post('/dots', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Check if user wants raw mode (no AI processing)
    const rawMode = req.body.rawMode === true || req.body.captureMode === 'raw';
    
    // Validate input data using simplified validation for entries format
    let dotData = {
      oneWordSummary: req.body.oneWordSummary,
      summary: req.body.summary,
      anchor: req.body.anchor || '',
      pulse: req.body.pulse,
      sourceType: req.body.sourceType || 'text',
      captureMode: rawMode ? 'raw' : (req.body.captureMode || 'natural'),
      wheelId: req.body.wheelId && req.body.wheelId !== '' ? parseInt(req.body.wheelId) : null,
      voiceData: req.body.voiceData || null,
      rawMode: rawMode
    };
    
    // If NOT in raw mode, apply automatic processing (current behavior)
    if (!rawMode) {
      // Apply character limits and processing as before
      if (dotData.summary && dotData.summary.length > 220) {
        dotData.summary = dotData.summary.substring(0, 220);
      }
      if (dotData.anchor && dotData.anchor.length > 300) {
        dotData.anchor = dotData.anchor.substring(0, 300);
      }
      if (dotData.pulse && dotData.pulse.includes(' ')) {
        dotData.pulse = dotData.pulse.split(' ')[0];
      }
    }
    // In raw mode, preserve user input exactly as provided
    
    // Generate oneWordSummary if not provided
    if (!dotData.oneWordSummary) {
      try {
        const { generateOneWordSummary } = await import('../openai.js');
        dotData.oneWordSummary = await generateOneWordSummary(dotData.summary, dotData.anchor);
      } catch (error) {
        console.error('Error generating one-word summary:', error);
        dotData.oneWordSummary = dotData.summary.split(' ')[0] || 'Insight';
      }
    }
    
    // Basic validation
    if (!dotData.oneWordSummary || !dotData.summary || !dotData.pulse) {
      return res.status(400).json({ 
        error: 'Missing required fields: oneWordSummary, summary, and pulse are required' 
      });
    }
    
    // Create dot in proper dots table
    const [newDot] = await db.insert(dots).values({
      userId: userId,
      oneWordSummary: dotData.oneWordSummary,
      summary: dotData.summary,
      anchor: dotData.anchor,
      pulse: dotData.pulse,
      sourceType: dotData.sourceType,
      captureMode: dotData.captureMode === 'raw' ? 'natural' : dotData.captureMode,
      wheelId: dotData.wheelId,
      voiceData: dotData.voiceData ? JSON.stringify(dotData.voiceData) : null
    }).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `dot_${userId}_${newDot.id}_${Date.now()}`;
      const content = `${dotData.summary} ${dotData.anchor} ${dotData.pulse}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: 'dot',
        contentId: newDot.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          sourceType: dotData.sourceType,
          captureMode: dotData.captureMode,
          wheelId: dotData.wheelId,
          createdAt: newDot.createdAt
        })
      });
      
      console.log(`Stored dot ${newDot.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - dot is still created
    }
    
    // Return formatted response matching the fetch format
    const responseData = {
      id: `dot_${newDot.id}`,
      oneWordSummary: dotData.oneWordSummary,
      summary: dotData.summary,
      anchor: dotData.anchor,
      pulse: dotData.pulse,
      sourceType: dotData.sourceType,
      captureMode: dotData.captureMode,
      wheelId: dotData.wheelId?.toString(),
      timestamp: newDot.createdAt,
      createdAt: newDot.createdAt,
      updatedAt: newDot.updatedAt,
      voiceData: dotData.voiceData
    };
    
    res.status(201).json({
      success: true,
      dot: responseData,
      message: 'Dot created successfully'
    });
    
  } catch (error) {
    console.error('Error creating dot:', error);
    res.status(500).json({ 
      error: 'Failed to create dot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new wheel with Pinecone storage
router.post('/wheels', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Prepare wheel data with proper defaults for database schema
    const wheelCreateData = {
      userId: userId,
      heading: req.body.heading || req.body.name || '',
      goals: req.body.goals || '',
      timeline: req.body.timeline || '',
      category: req.body.category || 'Personal',
      color: req.body.color || '#F59E0B', // Default amber color
      chakraId: req.body.chakraId ? parseInt(req.body.chakraId) : null,
      positionX: req.body.positionX || Math.floor(Math.random() * 400) + 100,
      positionY: req.body.positionY || Math.floor(Math.random() * 300) + 100,
      radius: req.body.radius || 95,
      sourceType: req.body.sourceType || 'text',
      voiceData: req.body.voiceData || null
    };
    
    console.log('Creating wheel with data:', wheelCreateData);
    
    // Create wheel in database using raw insert
    const [newWheel] = await db.insert(wheels).values(wheelCreateData).returning();
    
    // Store in Pinecone for intelligence
    try {
      const vectorId = `wheel_${userId}_${newWheel.id}_${Date.now()}`;
      const content = `${newWheel.heading} ${newWheel.goals || ''} ${newWheel.timeline || ''}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: newWheel.chakraId ? 'wheel' : 'chakra',
        contentId: newWheel.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          category: newWheel.category,
          color: newWheel.color,
          chakraId: newWheel.chakraId,
          isChakra: !newWheel.chakraId,
          createdAt: newWheel.createdAt
        })
      });
      
      console.log(`Stored ${newWheel.chakraId ? 'wheel' : 'chakra'} ${newWheel.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - wheel is still created
    }
    
    res.status(201).json({
      success: true,
      wheel: newWheel,
      message: `${newWheel.chakraId ? 'Wheel' : 'Chakra'} created successfully`
    });
    
  } catch (error) {
    console.error('Error creating wheel:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
    res.status(500).json({ error: 'Failed to create wheel' });
  }
});

// Get all dots for the authenticated user from dots table
router.get('/dots', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { filterType, filterCount } = req.query;
    
    console.log(`🔍 Fetching dots for user ID: ${userId}`);
    console.log(`🎯 Filter params:`, { filterType, filterCount });
    
    // Build query based on filter parameters
    let queryOptions: any = {
      where: eq(dots.userId, userId),
      orderBy: desc(dots.createdAt),
      with: {
        wheel: true // Include wheel relationship data
      }
    };
    
    // Apply filtering based on filterType
    if (filterType && filterCount) {
      const count = parseInt(filterCount as string) || 4;
      
      if (filterType === 'dot') {
        // For dot filter: limit to recent dots
        queryOptions.limit = count;
        console.log(`📍 Applying DOT filter: showing ${count} recent dots`);
        
      } else if (filterType === 'wheel' || filterType === 'chakra') {
        // For wheel/chakra filters: only show dots from filtered wheels
        console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} Applying ${filterType.toUpperCase()} filter: showing dots from filtered wheels only`);
        
        // First get the filtered wheel IDs based on filter type
        let filteredWheelIds: number[] = [];
        
        if (filterType === 'wheel') {
          // Get recent N wheels
          const recentWheels = await db.query.wheels.findMany({
            where: and(
              eq(wheels.userId, userId),
              sql`${wheels.chakraId} IS NOT NULL` // Only wheels
            ),
            orderBy: desc(wheels.createdAt),
            limit: count
          });
          filteredWheelIds = recentWheels.map(w => w.id);
          
        } else if (filterType === 'chakra') {
          // Get recent N chakras, then get ALL their associated wheels
          const recentChakras = await db.query.wheels.findMany({
            where: and(
              eq(wheels.userId, userId),
              sql`${wheels.chakraId} IS NULL` // Only chakras
            ),
            orderBy: desc(wheels.createdAt),
            limit: count
          });
          
          if (recentChakras.length > 0) {
            const chakraIds = recentChakras.map(c => c.id);
            const associatedWheels = await db.query.wheels.findMany({
              where: and(
                eq(wheels.userId, userId),
                inArray(wheels.chakraId, chakraIds)
              ),
              orderBy: desc(wheels.createdAt)
            });
            filteredWheelIds = associatedWheels.map(w => w.id);
          }
        }
        
        console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} Found ${filteredWheelIds.length} filtered wheel IDs for dots:`, filteredWheelIds);
        
        if (filteredWheelIds.length > 0) {
          queryOptions.where = and(
            eq(dots.userId, userId),
            inArray(dots.wheelId, filteredWheelIds)
          );
        } else {
          // No filtered wheels found, return no dots
          queryOptions.where = sql`1 = 0`;
        }
      }
    }
    
    // First try to fetch from proper dots table
    let userDots = await db.query.dots.findMany(queryOptions);
    
    // If no dots found in dots table, fallback to entries table for backward compatibility
    if (userDots.length === 0) {
      console.log(`📊 No dots in dots table, checking entries table for user ${userId}`);
      
      // Build entries query with same filtering logic
      let entriesQueryOptions: any = {
        where: eq(entries.userId, userId),
        orderBy: desc(entries.createdAt)
      };
      
      // Apply same filtering logic to entries table
      if (filterType && filterCount) {
        const count = parseInt(filterCount as string) || 4;
        
        if (filterType === 'dot') {
          // For dot filter: limit to recent entries
          entriesQueryOptions.limit = count;
          console.log(`📍 Applying DOT filter to entries: showing ${count} recent entries`);
          
        } else if (filterType === 'wheel' || filterType === 'chakra') {
          // For wheel/chakra filters on entries: show entries with wheelId matching filtered wheels
          console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} Applying ${filterType.toUpperCase()} filter to entries: showing entries from filtered wheels`);
          
          // Get the same filtered wheel IDs as above
          let filteredWheelIds: number[] = [];
          
          if (filterType === 'wheel') {
            // Get recent N wheels
            const recentWheels = await db.query.wheels.findMany({
              where: and(
                eq(wheels.userId, userId),
                sql`${wheels.chakraId} IS NOT NULL` // Only wheels
              ),
              orderBy: desc(wheels.createdAt),
              limit: count
            });
            filteredWheelIds = recentWheels.map(w => w.id);
            
          } else if (filterType === 'chakra') {
            // Get recent N chakras, then get ALL their associated wheels
            const recentChakras = await db.query.wheels.findMany({
              where: and(
                eq(wheels.userId, userId),
                sql`${wheels.chakraId} IS NULL` // Only chakras
              ),
              orderBy: desc(wheels.createdAt),
              limit: count
            });
            
            if (recentChakras.length > 0) {
              const chakraIds = recentChakras.map(c => c.id);
              const associatedWheels = await db.query.wheels.findMany({
                where: and(
                  eq(wheels.userId, userId),
                  inArray(wheels.chakraId, chakraIds)
                ),
                orderBy: desc(wheels.createdAt)
              });
              filteredWheelIds = associatedWheels.map(w => w.id);
            }
          }
          
          console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} Found ${filteredWheelIds.length} filtered wheel IDs for entries:`, filteredWheelIds);
          
          // Note: entries table stores wheelId in JSON content, so we'll need to filter after parsing
          // For now, we'll get all entries and filter them during the mapping phase
          if (filteredWheelIds.length === 0) {
            entriesQueryOptions.where = sql`1 = 0`; // No wheels found, return no results
          }
          // Keep the base query if we have wheel IDs - we'll filter during JSON parsing
        }
      }
      
      const userEntries = await db.query.entries.findMany(entriesQueryOptions);
      
      console.log(`📊 Found ${userEntries.length} entries for user ${userId}`);
      
      // Parse JSON content and format as dots, then filter by wheelId if needed
      let formattedDots = userEntries.map(entry => {
        try {
          const content = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
          return {
            id: `entry_${entry.id}`,
            oneWordSummary: content.oneWordSummary || entry.title || 'Untitled',
            summary: content.summary || entry.title || 'No summary',
            anchor: content.anchor || '',
            pulse: content.pulse || 'neutral',
            sourceType: content.sourceType || 'text',
            captureMode: content.captureMode || 'natural',
            wheelId: content.wheelId || '',
            timestamp: entry.createdAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            voiceData: content.voiceData || null
          };
        } catch (parseError) {
          console.warn(`Failed to parse entry ${entry.id}:`, parseError);
          return {
            id: `entry_${entry.id}`,
            oneWordSummary: entry.title || 'Untitled',
            summary: entry.title || 'No summary',
            anchor: '',
            pulse: 'neutral',
            sourceType: 'text',
            captureMode: 'natural',
            wheelId: '',
            timestamp: entry.createdAt,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
            voiceData: null
          };
        }
      });
      
      // Apply wheel/chakra filtering to formatted dots based on wheelId in JSON content
      if (filterType && filterCount && (filterType === 'wheel' || filterType === 'chakra')) {
        // Get the same filtered wheel IDs as before
        let filteredWheelIds: number[] = [];
        const count = parseInt(filterCount as string) || 4;
        
        if (filterType === 'wheel') {
          const recentWheels = await db.query.wheels.findMany({
            where: and(eq(wheels.userId, userId), sql`${wheels.chakraId} IS NOT NULL`),
            orderBy: desc(wheels.createdAt),
            limit: count
          });
          filteredWheelIds = recentWheels.map(w => w.id);
          
        } else if (filterType === 'chakra') {
          const recentChakras = await db.query.wheels.findMany({
            where: and(eq(wheels.userId, userId), sql`${wheels.chakraId} IS NULL`),
            orderBy: desc(wheels.createdAt),
            limit: count
          });
          
          if (recentChakras.length > 0) {
            const chakraIds = recentChakras.map(c => c.id);
            const associatedWheels = await db.query.wheels.findMany({
              where: and(eq(wheels.userId, userId), inArray(wheels.chakraId, chakraIds)),
              orderBy: desc(wheels.createdAt)
            });
            filteredWheelIds = associatedWheels.map(w => w.id);
          }
        }
        
        console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} Filtering entries by wheel IDs:`, filteredWheelIds);
        
        if (filteredWheelIds.length > 0) {
          // Filter dots by wheelId (convert string wheelId to number for comparison)
          formattedDots = formattedDots.filter(dot => {
            const wheelId = dot.wheelId ? parseInt(dot.wheelId) : null;
            return wheelId && filteredWheelIds.includes(wheelId);
          });
          console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} After filtering by wheelId: ${formattedDots.length} dots`);
        } else {
          // No wheels found, return empty
          formattedDots = [];
          console.log(`${filterType === 'wheel' ? '🎡' : '🕉️'} No filtered wheels found, returning 0 dots`);
        }
      }
      
      console.log(`✅ Returning ${formattedDots.length} formatted dots from entries`);
      return res.json(formattedDots);
    }
    
    // Transform dots table data to frontend format
    const formattedDots = userDots.map(dot => ({
      id: `dot_${dot.id}`,
      oneWordSummary: dot.oneWordSummary,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      wheelId: dot.wheelId?.toString() || null,
      timestamp: dot.createdAt,
      createdAt: dot.createdAt,
      updatedAt: dot.updatedAt,
      voiceData: dot.voiceData ? JSON.parse(dot.voiceData) : null,
      // Include wheel data if available
      wheel: dot.wheel ? {
        id: dot.wheel.id.toString(),
        heading: dot.wheel.heading,
        goals: dot.wheel.goals
      } : null
    }));
    
    console.log(`✅ Returning ${formattedDots.length} formatted dots from dots table`);
    res.json(formattedDots);
    
  } catch (error) {
    console.error('❌ Error fetching user dots:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dots',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's wheels from the actual wheels table
router.get('/wheels', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { filterType, filterCount } = req.query;
    
    console.log(`🔍 Fetching wheels for user ID: ${userId}`);
    console.log(`🎯 Filter params:`, { filterType, filterCount });
    
    // Build query based on filter parameters
    let queryOptions: any = {
      where: eq(wheels.userId, userId),
      orderBy: desc(wheels.createdAt),
      with: {
        chakra: true // Include chakra relationship data
      }
    };
    
    // Apply filtering based on filterType
    if (filterType && filterCount) {
      const count = parseInt(filterCount as string) || 4;
      
      if (filterType === 'dot') {
        // For dot filter: hide all wheels and chakras
        console.log(`📍 DOT filter applied: hiding all wheels and chakras`);
        queryOptions.where = sql`1 = 0`; // Return no results
        
      } else if (filterType === 'wheel') {
        // For wheel filter: show recent N wheels only (not chakras)
        console.log(`🎡 WHEEL filter applied: showing ${count} recent wheels`);
        queryOptions.where = and(
          eq(wheels.userId, userId),
          sql`${wheels.chakraId} IS NOT NULL` // Only wheels (have chakraId)
        );
        queryOptions.limit = count;
        
      } else if (filterType === 'chakra') {
        // For chakra filter: show recent N chakras only (we'll add associated wheels separately)
        console.log(`🕉️ CHAKRA filter applied: showing ${count} recent chakras`);
        queryOptions.where = and(
          eq(wheels.userId, userId),
          sql`${wheels.chakraId} IS NULL` // Only chakras (no chakraId)
        );
        queryOptions.limit = count;
      }
    }
    
    // Query actual wheels table with chakra relationships
    let userWheels = await db.query.wheels.findMany(queryOptions);
    
    // For chakra filter, add all wheels associated with the selected chakras
    if (filterType === 'chakra' && filterCount && userWheels.length > 0) {
      const chakraIds = userWheels.map(chakra => chakra.id);
      console.log(`🕉️ Fetching ALL wheels associated with ${chakraIds.length} recent chakras:`, chakraIds);
      
      // Get ALL wheels associated with these chakras (no limit)
      const associatedWheels = await db.query.wheels.findMany({
        where: and(
          eq(wheels.userId, userId),
          inArray(wheels.chakraId, chakraIds)
        ),
        orderBy: desc(wheels.createdAt),
        with: {
          chakra: true
        }
      });
      
      console.log(`🕉️ Found ${associatedWheels.length} wheels associated with selected chakras`);
      
      // Merge and deduplicate wheels by ID to prevent duplicates
      const allWheels = [...userWheels, ...associatedWheels];
      const uniqueWheelsMap = new Map();
      
      allWheels.forEach(wheel => {
        uniqueWheelsMap.set(wheel.id, wheel);
      });
      
      userWheels = Array.from(uniqueWheelsMap.values());
      console.log(`🔧 Deduplicated result: ${allWheels.length} total -> ${userWheels.length} unique wheels`);
    }
    
    console.log(`📊 Found ${userWheels.length} wheels for user ${userId}`);
    
    // Transform to frontend format with chakra relationship data
    const formattedWheels = userWheels.map(wheel => ({
      id: wheel.id.toString(),
      name: wheel.heading,
      heading: wheel.heading,
      goals: wheel.goals,
      timeline: wheel.timeline,
      category: wheel.category || 'User Created',
      color: wheel.color,
      position: { x: wheel.positionX || 400, y: wheel.positionY || 300 },
      radius: wheel.radius || 95,
      chakraId: wheel.chakraId ? wheel.chakraId.toString() : undefined,
      sourceType: wheel.sourceType || 'text',
      createdAt: wheel.createdAt,
      updatedAt: wheel.updatedAt,
      // Include chakra data if available
      chakra: wheel.chakra ? {
        id: wheel.chakra.id.toString(),
        heading: wheel.chakra.heading,
        purpose: wheel.chakra.purpose
      } : null
    }));
    
    console.log(`✅ Returning ${formattedWheels.length} formatted wheels`);
    res.json(formattedWheels);
    
  } catch (error) {
    console.error('❌ Error fetching user wheels:', error);
    res.status(500).json({ 
      error: 'Failed to fetch wheels',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Create a new chakra 
router.post('/chakras', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Prepare chakra data with proper defaults for database schema
    const chakraCreateData = {
      userId: userId,
      heading: req.body.heading || req.body.name || '',
      purpose: req.body.purpose || '',
      timeline: req.body.timeline || '',
      color: req.body.color || '#B45309', // Default dark amber color
      positionX: req.body.positionX || Math.floor(Math.random() * 400) + 600,
      positionY: req.body.positionY || Math.floor(Math.random() * 300) + 400,
      radius: req.body.radius || 420,
      sourceType: req.body.sourceType || 'text',
      voiceData: req.body.voiceData || null
    };
    
    console.log('Creating chakra with data:', chakraCreateData);
    
    // Create chakra in database using actual chakras table
    const [newChakra] = await db.insert(chakras).values(chakraCreateData).returning();
    
    // Store in vector database for intelligence
    try {
      const vectorId = `chakra_${userId}_${newChakra.id}_${Date.now()}`;
      const content = `${newChakra.heading} ${newChakra.purpose || ''} ${newChakra.timeline || ''}`;
      
      // Store vector embedding reference
      await db.insert(vectorEmbeddings).values({
        contentType: 'chakra',
        contentId: newChakra.id,
        userId: userId,
        vectorId: vectorId,
        content: content,
        metadata: JSON.stringify({
          color: newChakra.color,
          isChakra: true,
          createdAt: newChakra.createdAt
        })
      });
      
      console.log(`Stored chakra ${newChakra.id} in vector database with ID: ${vectorId}`);
    } catch (vectorError) {
      console.warn('Failed to store in vector database:', vectorError);
      // Continue without vector storage - chakra is still created
    }
    
    res.status(201).json({
      success: true,
      chakra: newChakra,
      message: 'Chakra created successfully'
    });
    
  } catch (error) {
    console.error('Error creating chakra:', error);
    res.status(500).json({ 
      error: 'Failed to create chakra',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get user's chakras from the actual chakras table
router.get('/chakras', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    console.log(`🔍 Fetching chakras for user ID: ${userId}`);
    
    // Import chakras from schema
    const { chakras } = await import('@shared/schema');
    
    // Query actual chakras table
    const userChakras = await db.query.chakras.findMany({
      where: eq(chakras.userId, userId),
      orderBy: desc(chakras.createdAt)
    });
    
    console.log(`📊 Found ${userChakras.length} chakras for user ${userId}`);
    
    // Transform to frontend format
    const formattedChakras = userChakras.map(chakra => ({
      id: chakra.id.toString(),
      name: chakra.heading,
      heading: chakra.heading,
      purpose: chakra.purpose, // Chakras have purpose, not goals
      timeline: chakra.timeline,
      category: 'Life Purpose',
      color: chakra.color,
      position: { x: chakra.positionX || 400, y: chakra.positionY || 300 },
      radius: chakra.radius || 140, // Larger radius for chakras
      sourceType: chakra.sourceType || 'text',
      createdAt: chakra.createdAt,
      updatedAt: chakra.updatedAt
    }));
    
    console.log(`✅ Returning ${formattedChakras.length} formatted chakras from chakras table`);
    res.json(formattedChakras);
    
  } catch (error) {
    console.error('Error fetching chakras:', error);
    res.status(500).json({ error: 'Failed to fetch chakras' });
  }
});

// Get user's content statistics
router.get('/stats', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Count dots for this user (stored in entries table as JSON)
    const userEntries = await db.query.entries.findMany({
      where: eq(entries.userId, userId)
    });
    
    // Count wheels and chakras separately
    const userWheels = await db.query.wheels.findMany({
      where: eq(wheels.userId, userId)
    });
    
    const userChakras = await db.query.chakras.findMany({
      where: eq(chakras.userId, userId)
    });
    
    res.json({
      totalDots: userEntries.length,
      totalWheels: userWheels.length, // All wheels regardless of chakraId
      totalChakras: userChakras.length, // Actual chakras from chakras table
      lastActivity: userEntries.length > 0 ? userEntries[0]?.createdAt : (userWheels.length > 0 ? userWheels[0]?.createdAt : (userChakras.length > 0 ? userChakras[0]?.createdAt : null))
    });
    
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Update dot-to-wheel relationship
router.patch('/dots/:id/relationship', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const dotId = parseInt(req.params.id);
    const { wheelId } = req.body; // New wheel ID or null to remove relationship
    
    console.log(`🔗 Updating dot ${dotId} relationship to wheel ${wheelId} for user ${userId}`);
    
    // Validate wheelId if provided
    if (wheelId && wheelId !== null) {
      const targetWheel = await db.query.wheels.findFirst({
        where: and(eq(wheels.id, parseInt(wheelId)), eq(wheels.userId, userId))
      });
      
      if (!targetWheel) {
        return res.status(400).json({ error: 'Invalid wheel ID or access denied' });
      }
    }
    
    // Try updating in dots table first
    const dotResult = await db.update(dots)
      .set({ wheelId: wheelId ? parseInt(wheelId) : null })
      .where(and(eq(dots.id, dotId), eq(dots.userId, userId)))
      .returning();
    
    if (dotResult.length === 0) {
      // Fallback: Try updating in entries table
      const entryResult = await db.query.entries.findFirst({
        where: and(eq(entries.id, dotId), eq(entries.userId, userId))
      });
      
      if (entryResult) {
        try {
          const content = JSON.parse(entryResult.content || '{}');
          content.wheelId = wheelId;
          
          await db.update(entries)
            .set({ content: JSON.stringify(content) })
            .where(and(eq(entries.id, dotId), eq(entries.userId, userId)));
          
          console.log(`✅ Updated entry ${dotId} relationship in entries table`);
        } catch (parseError) {
          console.error('Failed to parse entry content:', parseError);
          return res.status(500).json({ error: 'Failed to update relationship' });
        }
      } else {
        return res.status(404).json({ error: 'Dot not found' });
      }
    } else {
      console.log(`✅ Updated dot ${dotId} relationship in dots table`);
    }
    
    res.json({ 
      success: true, 
      message: `Dot relationship ${wheelId ? 'updated' : 'removed'} successfully` 
    });
    
  } catch (error) {
    console.error('Error updating dot relationship:', error);
    res.status(500).json({ error: 'Failed to update relationship' });
  }
});

// Update wheel-to-chakra relationship  
router.patch('/wheels/:id/relationship', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const wheelId = parseInt(req.params.id);
    const { chakraId } = req.body; // New chakra ID or null to remove relationship
    
    console.log(`🔗 Updating wheel ${wheelId} relationship to chakra ${chakraId} for user ${userId}`);
    
    // Validate chakraId if provided
    if (chakraId && chakraId !== null) {
      const targetChakra = await db.query.chakras.findFirst({
        where: and(eq(chakras.id, parseInt(chakraId)), eq(chakras.userId, userId))
      });
      
      if (!targetChakra) {
        return res.status(400).json({ error: 'Invalid chakra ID or access denied' });
      }
    }
    
    // Update wheel's chakra relationship
    const updateResult = await db.update(wheels)
      .set({ chakraId: chakraId ? parseInt(chakraId) : null })
      .where(and(eq(wheels.id, wheelId), eq(wheels.userId, userId)))
      .returning();
    
    if (updateResult.length === 0) {
      return res.status(404).json({ error: 'Wheel not found' });
    }
    
    console.log(`✅ Updated wheel ${wheelId} relationship to chakra ${chakraId}`);
    
    res.json({ 
      success: true, 
      message: `Wheel relationship ${chakraId ? 'updated' : 'removed'} successfully` 
    });
    
  } catch (error) {
    console.error('Error updating wheel relationship:', error);
    res.status(500).json({ error: 'Failed to update relationship' });
  }
});

// Delete user's dot
router.delete('/dots/:id', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user!.id;
    const dotId = parseInt(req.params.id);
    
    // Verify ownership
    const existingDot = await db.query.dots.findFirst({
      where: and(eq(dots.id, dotId), eq(dots.userId, userId))
    });
    
    if (!existingDot) {
      return res.status(404).json({ error: 'Dot not found' });
    }
    
    // Delete from database
    await db.delete(dots).where(and(eq(dots.id, dotId), eq(dots.userId, userId)));
    
    // TODO: Delete from Pinecone vector database
    
    res.json({ success: true, message: 'Dot deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting dot:', error);
    res.status(500).json({ error: 'Failed to delete dot' });
  }
});

// ========================================
// COLLECTIVE INTELLIGENCE ENDPOINTS
// Fetch all users' content for community view
// ========================================

// Get all collective dots from all users
router.get('/collective/dots', async (req, res) => {
  try {
    console.log('🌍 Fetching collective dots from all users');
    
    const allDots = await db.query.dots.findMany({
      orderBy: desc(dots.createdAt),
      limit: 100, // Limit for performance
      with: {
        wheel: true,
        user: {
          columns: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${allDots.length} collective dots`);
    res.json(allDots);
    
  } catch (error) {
    console.error('Error fetching collective dots:', error);
    res.status(500).json({ error: 'Failed to fetch collective dots' });
  }
});

// Get all collective wheels from all users
router.get('/collective/wheels', async (req, res) => {
  try {
    console.log('🌍 Fetching collective wheels from all users');
    
    const allWheels = await db.query.wheels.findMany({
      orderBy: desc(wheels.createdAt),
      limit: 100, // Limit for performance
      with: {
        chakra: true,
        user: {
          columns: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${allWheels.length} collective wheels`);
    res.json(allWheels);
    
  } catch (error) {
    console.error('Error fetching collective wheels:', error);
    res.status(500).json({ error: 'Failed to fetch collective wheels' });
  }
});

// Get all collective chakras from all users
router.get('/collective/chakras', async (req, res) => {
  try {
    console.log('🌍 Fetching collective chakras from all users');
    
    const allChakras = await db.query.chakras.findMany({
      orderBy: desc(chakras.createdAt),
      limit: 50, // Limit for performance
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            fullName: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${allChakras.length} collective chakras`);
    res.json(allChakras);
    
  } catch (error) {
    console.error('Error fetching collective chakras:', error);
    res.status(500).json({ error: 'Failed to fetch collective chakras' });
  }
});

export default router;