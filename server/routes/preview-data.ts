import { Request, Response } from 'express';
import { db } from '@db';
import { dots, wheels, previewDots, previewWheels } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function saveCurrentDataAsPreview(req: Request, res: Response) {
  try {
    console.log('Starting to save current data as preview data...');

    // Clear existing preview data
    await db.delete(previewDots);
    await db.delete(previewWheels);

    // Get all current wheels and dots
    const currentWheels = await db.query.wheels.findMany({
      orderBy: (wheels, { asc }) => [asc(wheels.id)],
    });

    const currentDots = await db.query.dots.findMany({
      orderBy: (dots, { asc }) => [asc(dots.id)],
    });

    console.log(`Found ${currentWheels.length} wheels and ${currentDots.length} dots to convert to preview data`);

    // Convert wheels to preview wheels
    const previewWheelsData = currentWheels.map((wheel) => ({
      id: `preview-wheel-${wheel.id}`,
      name: wheel.name,
      heading: wheel.heading,
      goals: wheel.goals,
      purpose: wheel.purpose,
      timeline: wheel.timeline,
      category: wheel.category,
      color: wheel.color,
      chakraId: wheel.chakraId ? `preview-wheel-${wheel.chakraId}` : null,
      positionX: wheel.positionX,
      positionY: wheel.positionY,
      radius: wheel.radius,
    }));

    // Convert dots to preview dots
    const previewDotsData = currentDots.map((dot) => ({
      id: `preview-dot-${dot.id}`,
      summary: dot.summary,
      anchor: dot.anchor,
      pulse: dot.pulse,
      wheelId: dot.wheelId ? `preview-wheel-${dot.wheelId}` : null,
      sourceType: dot.sourceType,
      captureMode: dot.captureMode,
      positionX: dot.positionX,
      positionY: dot.positionY,
    }));

    // Insert preview wheels first (for foreign key constraints)
    if (previewWheelsData.length > 0) {
      await db.insert(previewWheels).values(previewWheelsData);
      console.log(`Inserted ${previewWheelsData.length} preview wheels`);
    }

    // Insert preview dots
    if (previewDotsData.length > 0) {
      await db.insert(previewDots).values(previewDotsData);
      console.log(`Inserted ${previewDotsData.length} preview dots`);
    }

    // Get counts for response
    const chakraCount = currentWheels.filter(w => w.chakraId === null).length;
    const wheelCount = currentWheels.filter(w => w.chakraId !== null).length;
    const dotCount = currentDots.length;

    console.log('Preview data save completed successfully');

    res.json({
      success: true,
      message: 'Current data successfully saved as preview data',
      saved: {
        chakras: chakraCount,
        wheels: wheelCount,
        dots: dotCount,
        total: chakraCount + wheelCount + dotCount
      }
    });

  } catch (error) {
    console.error('Error saving current data as preview:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save current data as preview data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function getPreviewData(req: Request, res: Response) {
  try {
    const wheels = await db.query.previewWheels.findMany({
      with: {
        dots: true,
        childWheels: true,
      },
      orderBy: (previewWheels, { asc }) => [asc(previewWheels.id)],
    });

    const dots = await db.query.previewDots.findMany({
      orderBy: (previewDots, { asc }) => [asc(previewDots.id)],
    });

    // Separate chakras (no chakraId) and regular wheels (have chakraId)
    const chakras = wheels.filter(w => w.chakraId === null);
    const regularWheels = wheels.filter(w => w.chakraId !== null);

    res.json({
      success: true,
      data: {
        chakras,
        wheels: regularWheels,
        dots,
        counts: {
          chakras: chakras.length,
          wheels: regularWheels.length,
          dots: dots.length,
          total: chakras.length + regularWheels.length + dots.length
        }
      }
    });

  } catch (error) {
    console.error('Error getting preview data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get preview data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export async function clearPreviewData(req: Request, res: Response) {
  try {
    await db.delete(previewDots);
    await db.delete(previewWheels);

    res.json({
      success: true,
      message: 'Preview data cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing preview data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear preview data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}