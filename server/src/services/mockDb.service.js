/**
 * Mock Database Service
 * This service provides in-memory database functionality for testing
 * when MongoDB is not available
 */
class MockDbService {
  constructor() {
    this.collections = {
      users: [
        {
          _id: '1',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          password: '$2a$10$rrCvVFoAVgrCvLxvRg9vseK1.mjSL3gjZ9UFVnMXcJPGGIRYdMOGa', // password123
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '2',
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          password: '$2a$10$rrCvVFoAVgrCvLxvRg9vseK1.mjSL3gjZ9UFVnMXcJPGGIRYdMOGa', // password123
          role: 'patient',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      patients: [],
      appointments: []
    };
    
    console.log('Mock database initialized with test users');
  }
  
  /**
   * Find a document by query
   * @param {string} collection - Collection name
   * @param {Object} query - Query object
   * @returns {Object|null} - Found document or null
   */
  findOne(collection, query) {
    if (!this.collections[collection]) {
      return Promise.resolve(null);
    }
    
    const result = this.collections[collection].find(item => {
      return Object.keys(query).every(key => {
        return item[key] === query[key];
      });
    });
    
    return Promise.resolve(result || null);
  }
  
  /**
   * Find documents by query
   * @param {string} collection - Collection name
   * @param {Object} query - Query object
   * @returns {Array} - Array of found documents
   */
  find(collection, query = {}) {
    if (!this.collections[collection]) {
      return Promise.resolve([]);
    }
    
    if (Object.keys(query).length === 0) {
      return Promise.resolve([...this.collections[collection]]);
    }
    
    const results = this.collections[collection].filter(item => {
      return Object.keys(query).every(key => {
        return item[key] === query[key];
      });
    });
    
    return Promise.resolve(results);
  }
  
  /**
   * Insert a document
   * @param {string} collection - Collection name
   * @param {Object} document - Document to insert
   * @returns {Object} - Inserted document
   */
  insertOne(collection, document) {
    if (!this.collections[collection]) {
      this.collections[collection] = [];
    }
    
    const newDoc = {
      ...document,
      _id: String(this.collections[collection].length + 1),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.collections[collection].push(newDoc);
    return Promise.resolve(newDoc);
  }
  
  /**
   * Update a document
   * @param {string} collection - Collection name
   * @param {Object} query - Query object
   * @param {Object} update - Update object
   * @returns {Object} - Updated document
   */
  updateOne(collection, query, update) {
    if (!this.collections[collection]) {
      return Promise.resolve(null);
    }
    
    const index = this.collections[collection].findIndex(item => {
      return Object.keys(query).every(key => {
        return item[key] === query[key];
      });
    });
    
    if (index === -1) {
      return Promise.resolve(null);
    }
    
    const updatedDoc = {
      ...this.collections[collection][index],
      ...update,
      updatedAt: new Date()
    };
    
    this.collections[collection][index] = updatedDoc;
    return Promise.resolve(updatedDoc);
  }
  
  /**
   * Delete a document
   * @param {string} collection - Collection name
   * @param {Object} query - Query object
   * @returns {boolean} - Success status
   */
  deleteOne(collection, query) {
    if (!this.collections[collection]) {
      return Promise.resolve(false);
    }
    
    const index = this.collections[collection].findIndex(item => {
      return Object.keys(query).every(key => {
        return item[key] === query[key];
      });
    });
    
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    this.collections[collection].splice(index, 1);
    return Promise.resolve(true);
  }
}

module.exports = new MockDbService(); 