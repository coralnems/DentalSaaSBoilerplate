const express = require('express');
const redisController = require('../controllers/redis.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/redis/:key
 * @desc    Get a value from Redis
 * @access  Private
 */
router.get('/:key', authenticate, redisController.getValue);

/**
 * @route   POST /api/redis
 * @desc    Set a value in Redis
 * @access  Private
 */
router.post('/', authenticate, redisController.setValue);

/**
 * @route   DELETE /api/redis/:key
 * @desc    Delete a key from Redis
 * @access  Private
 */
router.delete('/:key', authenticate, redisController.deleteKey);

module.exports = router; 