/**
 * HTTP Response utility for consistent API responses
 */
const httpResponder = {
  /**
   * Success response
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @param {Number} statusCode - HTTP status code
   * @returns {Object} Response object
   */
  success: (data = null, message = 'Operation successful', statusCode = 200) => {
    return {
      success: true,
      message,
      data,
      statusCode
    };
  },

  /**
   * Error response
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code
   * @param {Object} errors - Validation errors
   * @returns {Object} Response object
   */
  error: (message = 'An error occurred', statusCode = 500, errors = null) => {
    return {
      success: false,
      message,
      errors,
      statusCode
    };
  },
  
  /**
   * Not found response
   * @param {String} message - Not found message
   * @returns {Object} Response object
   */
  notFound: (message = 'Resource not found') => {
    return {
      success: false,
      message,
      statusCode: 404
    };
  }
};

module.exports = { httpResponder }; 