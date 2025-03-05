const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatment.controller');
const { authenticateJWT, authorizeRoles } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// GET /api/treatments - Get all treatments
router.get('/', async (req, res) => {
  try {
    const result = await treatmentController.findAll(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/treatments/active - Get active treatments
router.get('/active', async (req, res) => {
  try {
    const result = await treatmentController.findActive(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/treatments/search - Search treatments
router.get('/search', async (req, res) => {
  try {
    const result = await treatmentController.search(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/treatments/category/:category - Get treatments by category
router.get('/category/:category', async (req, res) => {
  try {
    const result = await treatmentController.findByCategory(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// GET /api/treatments/:id - Get treatment by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await treatmentController.findOne(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// POST /api/treatments - Create a new treatment (admin only)
router.post('/', authorizeRoles(['admin']), async (req, res) => {
  try {
    const result = await treatmentController.create(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// PUT /api/treatments/:id - Update a treatment (admin only)
router.put('/:id', authorizeRoles(['admin']), async (req, res) => {
  try {
    const result = await treatmentController.update(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

// DELETE /api/treatments/:id - Delete a treatment (admin only)
router.delete('/:id', authorizeRoles(['admin']), async (req, res) => {
  try {
    const result = await treatmentController.delete(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message,
    });
  }
});

module.exports = router; 