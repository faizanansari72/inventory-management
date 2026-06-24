from flask import Flask, jsonify
from flask_cors import CORS

from app.config import Config
from app.errors import register_error_handlers
from app.extensions import db, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions.
    db.init_app(app)
    migrate.init_app(app, db)

    origins = app.config["CORS_ORIGINS"]
    if origins != "*":
        origins = [o.strip() for o in origins.split(",") if o.strip()]
    CORS(app, resources={r"/*": {"origins": origins}})

    # Import models so they are registered with SQLAlchemy metadata.
    from app import models  # noqa: F401

    # Register routes and error handlers.
    from app.routes import register_blueprints

    register_blueprints(app)
    register_error_handlers(app)

    @app.get("/")
    def index():
        return jsonify(
            {
                "service": "Inventory & Order Management API",
                "status": "ok",
                "endpoints": ["/products", "/customers", "/orders", "/dashboard"],
            }
        )

    @app.get("/health")
    def health():
        return jsonify({"status": "healthy"}), 200

    # Create tables on startup if migrations haven't been run (handy for demos).
    with app.app_context():
        db.create_all()

    return app
