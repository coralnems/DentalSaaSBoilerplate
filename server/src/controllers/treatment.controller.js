const BaseController = require('./base.controller');
const Treatment = require('../models/Treatment');

class TreatmentController extends BaseController {
  constructor() {
    super(Treatment);
  }

  // Find treatments by category
  async findByCategory(req) {
    const { category } = req.params;
    const treatments = await this.model.find({ category, isActive: true });
    
    return {
      data: treatments,
      pagination: {
        total: treatments.length,
        page: 1,
        limit: treatments.length,
        pages: 1
      }
    };
  }

  // Find active treatments
  async findActive(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const treatments = await this.model.find({ isActive: true })
      .skip(skip)
      .limit(limit);
      
    const total = await this.model.countDocuments({ isActive: true });
    
    return {
      data: treatments,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Search treatments
  async search(req) {
    const { query } = req.query;
    
    if (!query) {
      return await this.findActive(req);
    }

    const searchRegex = new RegExp(query, 'i');
    
    const treatments = await this.model.find({
      $and: [
        { isActive: true },
        {
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { category: searchRegex },
            { code: searchRegex }
          ]
        }
      ]
    });

    return {
      data: treatments,
      pagination: {
        total: treatments.length,
        page: 1,
        limit: treatments.length,
        pages: 1
      }
    };
  }
}

module.exports = new TreatmentController(); 