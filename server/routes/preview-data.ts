import express from 'express';
import { db } from '@db';
import { previewDots, previewWheels } from '@shared/schema.ts';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get all preview data for the grid
router.get('/grid/positions', async (req, res) => {
  try {
    // Fetch all preview wheels with their dots
    const wheels = await db.query.previewWheels.findMany({
      with: {
        dots: true,
        childWheels: {
          with: {
            dots: true
          }
        }
      },
    });

    // Transform data to match the expected format
    const transformedWheels = wheels.map(wheel => ({
      id: wheel.id,
      name: wheel.name,
      heading: wheel.heading,
      goals: wheel.goals,
      purpose: wheel.purpose,
      timeline: wheel.timeline,
      category: wheel.category,
      color: wheel.color,
      chakraId: wheel.chakraId,
      position: {
        x: wheel.positionX,
        y: wheel.positionY
      },
      radius: wheel.radius,
      dots: wheel.dots.map(dot => ({
        id: dot.id,
        oneWordSummary: dot.oneWordSummary,
        summary: dot.summary,
        anchor: dot.anchor,
        pulse: dot.pulse,
        wheelId: dot.wheelId,
        sourceType: dot.sourceType,
        captureMode: dot.captureMode,
        timestamp: dot.createdAt,
        voiceData: null
      })),
      connections: [], // Preview data doesn't need connections
      createdAt: wheel.createdAt
    }));

    // Separate chakras from regular wheels
    const chakras = transformedWheels.filter(w => !w.chakraId);
    const regularWheels = transformedWheels.filter(w => w.chakraId);

    // Calculate total counts
    const totalDots = transformedWheels.reduce((sum, wheel) => sum + wheel.dots.length, 0);
    const totalWheels = regularWheels.length;
    const totalChakras = chakras.length;

    res.json({
      success: true,
      data: {
        wheels: transformedWheels,
        chakras,
        regularWheels,
        totalDots,
        totalWheels,
        totalChakras,
        gridPositions: transformedWheels.map(wheel => ({
          id: wheel.id,
          position: wheel.position,
          radius: wheel.radius
        }))
      }
    });

  } catch (error) {
    console.error('Error fetching preview grid data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch preview grid data'
    });
  }
});

// Get preview dots with search functionality
router.get('/dots/search', async (req, res) => {
  try {
    const { q } = req.query;
    const searchTerm = q as string;

    let query = db.query.previewDots.findMany({
      with: {
        wheel: true
      }
    });

    let dots = await query;

    // Filter by search term if provided
    if (searchTerm && searchTerm.length > 0) {
      const searchLower = searchTerm.toLowerCase();
      dots = dots.filter(dot => 
        dot.summary.toLowerCase().includes(searchLower) ||
        dot.anchor.toLowerCase().includes(searchLower) ||
        dot.pulse.toLowerCase().includes(searchLower) ||
        dot.oneWordSummary.toLowerCase().includes(searchLower) ||
        (dot.wheel?.name.toLowerCase().includes(searchLower))
      );
    }

    // Transform to expected format
    const transformedDots = dots.map(dot => ({
      id: dot.id,
      oneWordSummary: dot.oneWordSummary,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      wheelId: dot.wheelId,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      timestamp: dot.createdAt,
      voiceData: null,
      wheel: dot.wheel ? {
        id: dot.wheel.id,
        name: dot.wheel.name,
        category: dot.wheel.category,
        color: dot.wheel.color
      } : null
    }));

    res.json({
      success: true,
      data: transformedDots,
      total: transformedDots.length
    });

  } catch (error) {
    console.error('Error searching preview dots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search preview dots'
    });
  }
});

// Get recent preview dots
router.get('/dots/recent', async (req, res) => {
  try {
    const { limit = 4 } = req.query;
    const limitNum = parseInt(limit as string, 10);

    const dots = await db.query.previewDots.findMany({
      limit: limitNum,
      orderBy: (previewDots, { desc }) => [desc(previewDots.createdAt)],
      with: {
        wheel: true
      }
    });

    // Transform to expected format
    const transformedDots = dots.map(dot => ({
      id: dot.id,
      oneWordSummary: dot.oneWordSummary,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      wheelId: dot.wheelId,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      timestamp: dot.createdAt,
      voiceData: null,
      wheel: dot.wheel ? {
        id: dot.wheel.id,
        name: dot.wheel.name,
        category: dot.wheel.category,
        color: dot.wheel.color
      } : null
    }));

    res.json({
      success: true,
      data: transformedDots
    });

  } catch (error) {
    console.error('Error fetching recent preview dots:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recent preview dots'
    });
  }
});

export default router;