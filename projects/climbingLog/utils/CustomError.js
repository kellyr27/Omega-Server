class CustomError extends Error {
    constructor(message, statusCode) {
        super(message); // Pass the message to the Error constructor
        this.statusCode = statusCode;
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
    }
}

module.exports = CustomError;