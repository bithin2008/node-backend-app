class CustomError extends Error {
  constructor(message,statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'CustomError';
    Error.captureStackTrace(this,this.constructor)
  }
}


module.exports = CustomError; 