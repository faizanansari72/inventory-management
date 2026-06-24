from app.routes.products import products_bp
from app.routes.customers import customers_bp
from app.routes.orders import orders_bp
from app.routes.dashboard import dashboard_bp


def register_blueprints(app):
    app.register_blueprint(products_bp)
    app.register_blueprint(customers_bp)
    app.register_blueprint(orders_bp)
    app.register_blueprint(dashboard_bp)
