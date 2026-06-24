import os

from flask import Blueprint, jsonify

from app.extensions import db
from app.models import Customer, Order, Product

dashboard_bp = Blueprint("dashboard", __name__)

# Products at or below this stock level are considered "low stock".
LOW_STOCK_THRESHOLD = int(os.environ.get("LOW_STOCK_THRESHOLD", "10"))


@dashboard_bp.get("/dashboard")
def dashboard():
    total_products = db.session.query(Product).count()
    total_customers = db.session.query(Customer).count()
    total_orders = db.session.query(Order).count()

    low_stock_products = (
        Product.query.filter(Product.quantity <= LOW_STOCK_THRESHOLD)
        .order_by(Product.quantity)
        .all()
    )

    return (
        jsonify(
            {
                "total_products": total_products,
                "total_customers": total_customers,
                "total_orders": total_orders,
                "low_stock_threshold": LOW_STOCK_THRESHOLD,
                "low_stock_count": len(low_stock_products),
                "low_stock_products": [p.to_dict() for p in low_stock_products],
            }
        ),
        200,
    )
