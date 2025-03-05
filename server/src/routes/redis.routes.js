const express = require('express');
const redisController = require('../controllers/redisController');
const { authenticateJWT } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/redis/:key
 * @desc    Get a value from Redis
 * @access  Private
 */
router.get('/:key', authenticateJWT, redisController.getValue);

/**
 * @route   POST /api/redis
 * @desc    Set a value in Redis
 * @access  Private
 */
router.post('/', authenticateJWT, redisController.setValue);

/**
 * @route   DELETE /api/redis/:key
 * @desc    Delete a key from Redis
 * @access  Private
 */
router.delete('/:key', authenticateJWT, redisController.deleteValue);

/**
 * @route   GET /api/redis/keys/:pattern
 * @desc    Get all keys matching a pattern
 * @access  Private
 */
router.get('/keys/:pattern', authenticateJWT, redisController.getKeys);

module.exports = router; 