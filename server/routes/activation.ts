/**
 * DotSpark Activation Routes
 * Handles user activation, code generation, and usage tracking
 */

import { Router } from 'express';
import { 
  activateDotSpark, 
  generateActivationCode, 
  redeemActivationCode, 
  getUsageStats,
  isDotSparkActivated 
} from '../usage-tracker';

const router = Router();

/**
 * Generate activation code for a user
 */
router.post('/generate-code', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const activationCode = generateActivationCode(userId);
    
    res.json({
      success: true,
      activationCode,
      message: 'Activation code generated successfully'
    });
  } catch (error) {
    console.error('Error generating activation code:', error);
    res.status(500).json({ error: 'Failed to generate activation code' });
  }
});

/**
 * Redeem activation code
 */
router.post('/redeem-code', async (req, res) => {
  try {
    const { code, userId } = req.body;

    if (!code || !userId) {
      return res.status(400).json({ error: 'Activation code and user ID are required' });
    }

    const success = redeemActivationCode(code, userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Your DotSpark is now active and ready to capture your thoughts',
        activated: true
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid activation code',
        activated: false
      });
    }
  } catch (error) {
    console.error('Error redeeming activation code:', error);
    res.status(500).json({ error: 'Failed to redeem activation code' });
  }
});

/**
 * Check activation status
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'Valid user ID is required' });
    }

    const isActivated = isDotSparkActivated(userId);
    const usageStats = getUsageStats(userId);
    
    res.json({
      isActivated,
      usageStats,
      canActivate: !isActivated
    });
  } catch (error) {
    console.error('Error checking activation status:', error);
    res.status(500).json({ error: 'Failed to check activation status' });
  }
});

/**
 * Get usage statistics
 */
router.get('/usage/:userId?', async (req, res) => {
  try {
    const userId = req.params.userId ? parseInt(req.params.userId) : undefined;
    const sessionId = req.query.sessionId as string;

    const usageStats = getUsageStats(userId, sessionId);
    
    res.json({
      success: true,
      usage: usageStats
    });
  } catch (error) {
    console.error('Error getting usage stats:', error);
    res.status(500).json({ error: 'Failed to get usage statistics' });
  }
});

/**
 * Manually activate user (for admin use)
 */
router.post('/activate', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    activateDotSpark(userId, sessionId);
    
    res.json({
      success: true,
      message: 'Your DotSpark is now active and ready to capture your thoughts',
      activated: true
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

export default router;