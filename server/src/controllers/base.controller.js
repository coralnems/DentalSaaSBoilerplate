class BaseController {
  constructor(model) {
    this.model = model;
  }

  // Create a new document
  async create(req) {
    const document = new this.model(req.body);
    await document.save();
    return document;
  }

  // Find all documents with pagination
  async findAll(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const documents = await this.model.find()
      .skip(skip)
      .limit(limit);
      
    const total = await this.model.countDocuments();
    
    return {
      data: documents,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Find one document by ID
  async findOne(req) {
    const document = await this.model.findById(req.params.id);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    return document;
  }

  // Update a document
  async update(req) {
    const document = await this.model.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    return document;
  }

  // Delete a document
  async delete(req) {
    const document = await this.model.findByIdAndDelete(req.params.id);
    
    if (!document) {
      const error = new Error('Document not found');
      error.statusCode = 404;
      throw error;
    }
    
    return { message: 'Document deleted successfully' };
  }
}

module.exports = BaseController; 