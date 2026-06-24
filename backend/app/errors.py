from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError
from werkzeug.exceptions import HTTPException


class APIError(Exception):
    """Application-level error carrying an HTTP status code and message."""

    def __init__(self, message, status_code=400, details=None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details

    def to_response(self):
        body = {"error": self.message}
        if self.details:
            body["details"] = self.details
        return body, self.status_code


def register_error_handlers(app):
    @app.errorhandler(APIError)
    def handle_api_error(err):
        return err.to_response()

    @app.errorhandler(ValidationError)
    def handle_validation_error(err):
        # Marshmallow validation failures -> 422 Unprocessable Entity.
        return {"error": "Validation failed", "details": err.messages}, 422

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(err):
        return {"error": "Database integrity error (possible duplicate value)"}, 409

    @app.errorhandler(404)
    def handle_not_found(err):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(405)
    def handle_method_not_allowed(err):
        return {"error": "Method not allowed"}, 405

    @app.errorhandler(HTTPException)
    def handle_http_exception(err):
        return {"error": err.description}, err.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(err):
        app.logger.exception("Unhandled exception")
        return {"error": "Internal server error"}, 500
