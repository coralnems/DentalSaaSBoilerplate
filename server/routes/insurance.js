const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { check, validationResult } = require('express-validator');
const InsuranceService = require('../services/InsuranceService');

// @route   POST api/insurance/verify
// @desc    Verify insurance coverage
// @access  Private
router.post('/verify',
  [
    auth,
    [
      check('provider', 'Insurance provider is required').not().isEmpty(),
      check('policyNumber', 'Policy number is required').matches(/^[A-Z0-9]{10}$/),
      check('coveragePercentage', 'Coverage percentage must be between 0 and 100').optional().isInt({ min: 0, max: 100 })
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const verificationResult = await InsuranceService.verifyInsurance(req.body);
      res.json(verificationResult);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// @route   POST api/insurance/claims
// @desc    Submit an insurance claim
// @access  Private
router.post('/claims',
  [
    auth,
    [
      check('provider', 'Insurance provider is required').not().isEmpty(),
      check('policyNumber', 'Policy number is required').matches(/^[A-Z0-9]{10}$/),
      check('treatment', 'Treatment information is required').not().isEmpty(),
      check('amount', 'Amount is required').isNumeric()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const claimResult = await InsuranceService.submitClaim(req.body);
      res.json(claimResult);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// @route   GET api/insurance/claims/:claimId
// @desc    Check claim status
// @access  Private
router.get('/claims/:claimId',
  [
    auth,
    [
      check('provider', 'Insurance provider is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const status = await InsuranceService.checkClaimStatus(req.params.claimId, req.query.provider);
      res.json(status);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

// @route   GET api/insurance/analytics
// @desc    Get insurance analytics
// @access  Private
router.get('/analytics',
  auth,
  async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      const analytics = await InsuranceService.getInsuranceAnalytics({ startDate, endDate });
      res.json(analytics);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router; 