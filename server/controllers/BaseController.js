const { AppError } = require('../middleware/errorHandler');
const { createAuditLog } = require('../utils/auditLogger');

class BaseController {
  constructor(model, modelName) {
    this.model = model;
    this.modelName = modelName;
  }

  // Create a single document
  async create(req) {
    const doc = await this.model.create({
      ...req.body,
      tenantId: req.user.tenantId
    });

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_CREATED`,
      resource: this.modelName,
      resourceId: doc._id,
      description: `Created new ${this.modelName}`,
      tenantId: req.user.tenantId
    });

    return doc;
  }

  // Get all documents with pagination, filtering, and search
  async findAll(req) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filterQuery = { tenantId: req.user.tenantId };
    
    // Add search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      const searchableFields = this.model.schema.obj.searchableFields || [];
      
      if (searchableFields.length > 0) {
        filterQuery.$or = searchableFields.map(field => ({
          [field]: searchRegex
        }));
      }
    }

    // Add field-specific filters
    Object.keys(req.query).forEach(key => {
      if (!['page', 'limit', 'search', 'sort'].includes(key) && this.model.schema.paths[key]) {
        filterQuery[key] = req.query[key];
      }
    });

    // Add date range filters if present
    if (req.query.startDate && req.query.endDate) {
      filterQuery.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Build sort query
    const sortQuery = {};
    if (req.query.sort) {
      const [field, order] = req.query.sort.split(':');
      sortQuery[field] = order === 'desc' ? -1 : 1;
    } else {
      sortQuery.createdAt = -1; // Default sort by creation date
    }

    const [docs, total] = await Promise.all([
      this.model
        .find(filterQuery)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit),
      this.model.countDocuments(filterQuery)
    ]);

    return {
      docs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get a single document by ID
  async findOne(req) {
    const doc = await this.model.findOne({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!doc) {
      throw new AppError(`${this.modelName} not found`, 404);
    }

    return doc;
  }

  // Update a single document
  async update(req) {
    const doc = await this.model.findOneAndUpdate(
      {
        _id: req.params.id,
        tenantId: req.user.tenantId
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!doc) {
      throw new AppError(`${this.modelName} not found`, 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_UPDATED`,
      resource: this.modelName,
      resourceId: doc._id,
      description: `Updated ${this.modelName}`,
      tenantId: req.user.tenantId,
      changes: {
        before: doc._original,
        after: doc.toObject()
      }
    });

    return doc;
  }

  // Delete a single document
  async delete(req) {
    const doc = await this.model.findOneAndDelete({
      _id: req.params.id,
      tenantId: req.user.tenantId
    });

    if (!doc) {
      throw new AppError(`${this.modelName} not found`, 404);
    }

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_DELETED`,
      resource: this.modelName,
      resourceId: doc._id,
      description: `Deleted ${this.modelName}`,
      tenantId: req.user.tenantId
    });

    return doc;
  }

  // Bulk create documents
  async bulkCreate(req) {
    const docs = req.body.map(doc => ({
      ...doc,
      tenantId: req.user.tenantId
    }));

    const created = await this.model.insertMany(docs);

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_BULK_CREATED`,
      resource: this.modelName,
      description: `Bulk created ${created.length} ${this.modelName}s`,
      tenantId: req.user.tenantId
    });

    return created;
  }

  // Bulk update documents
  async bulkUpdate(req) {
    const operations = req.body.map(({ _id, ...update }) => ({
      updateOne: {
        filter: { _id, tenantId: req.user.tenantId },
        update: { $set: update }
      }
    }));

    const result = await this.model.bulkWrite(operations);

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_BULK_UPDATED`,
      resource: this.modelName,
      description: `Bulk updated ${result.modifiedCount} ${this.modelName}s`,
      tenantId: req.user.tenantId
    });

    return result;
  }

  // Bulk delete documents
  async bulkDelete(req) {
    const result = await this.model.deleteMany({
      _id: { $in: req.body.ids },
      tenantId: req.user.tenantId
    });

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_BULK_DELETED`,
      resource: this.modelName,
      description: `Bulk deleted ${result.deletedCount} ${this.modelName}s`,
      tenantId: req.user.tenantId
    });

    return result;
  }

  // Export documents
  async export(req) {
    const docs = await this.model.find({
      tenantId: req.user.tenantId,
      ...(req.query.filter ? JSON.parse(req.query.filter) : {})
    });

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_EXPORTED`,
      resource: this.modelName,
      description: `Exported ${docs.length} ${this.modelName}s`,
      tenantId: req.user.tenantId
    });

    return docs;
  }

  // Import documents
  async import(req) {
    const docs = req.body.map(doc => ({
      ...doc,
      tenantId: req.user.tenantId,
      _id: undefined // Remove _id to create new documents
    }));

    const imported = await this.model.insertMany(docs);

    await createAuditLog({
      userId: req.user._id,
      action: `${this.modelName.toUpperCase()}_IMPORTED`,
      resource: this.modelName,
      description: `Imported ${imported.length} ${this.modelName}s`,
      tenantId: req.user.tenantId
    });

    return imported;
  }
}

module.exports = BaseController; 