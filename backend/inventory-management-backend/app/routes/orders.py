from decimal import Decimal

from flask import Blueprint, jsonify, request

from app.errors import APIError
from app.extensions import db
from app.models import Customer, Order, OrderItem, Product
from app.schemas.order import OrderCreateSchema

orders_bp = Blueprint("orders", __name__, url_prefix="/orders")

create_schema = OrderCreateSchema()


@orders_bp.post("")
def create_order():
    data = create_schema.load(request.get_json(force=True, silent=True) or {})

    customer = db.session.get(Customer, data["customer_id"])
    if not customer:
        raise APIError("Customer not found", 404)

    # Merge duplicate product lines so stock checks use the true requested total.
    requested = {}
    for line in data["items"]:
        requested[line["product_id"]] = requested.get(line["product_id"], 0) + line[
            "quantity"
        ]

    order = Order(customer_id=customer.id, total_amount=Decimal("0"))
    total = Decimal("0")

    for product_id, qty in requested.items():
        product = db.session.get(Product, product_id)
        if not product:
            raise APIError(f"Product {product_id} not found", 404)

        if product.quantity < qty:
            raise APIError(
                f"Insufficient stock for '{product.name}' "
                f"(requested {qty}, available {product.quantity})",
                409,
            )

        # Reduce stock and record a line item with a price snapshot.
        product.quantity -= qty
        subtotal = product.price * qty
        total += subtotal

        order.items.append(
            OrderItem(
                product_id=product.id,
                quantity=qty,
                unit_price=product.price,
            )
        )

    # Total is computed server-side; clients cannot set it.
    order.total_amount = total

    db.session.add(order)
    db.session.commit()
    return jsonify(order.to_dict()), 201


@orders_bp.get("")
def list_orders():
    orders = Order.query.order_by(Order.id.desc()).all()
    return jsonify([o.to_dict() for o in orders]), 200


@orders_bp.get("/<int:order_id>")
def get_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        raise APIError("Order not found", 404)
    return jsonify(order.to_dict()), 200


@orders_bp.delete("/<int:order_id>")
def delete_order(order_id):
    order = db.session.get(Order, order_id)
    if not order:
        raise APIError("Order not found", 404)

    # Cancelling an order restores the stock it had consumed.
    for item in order.items:
        product = db.session.get(Product, item.product_id)
        if product:
            product.quantity += item.quantity

    db.session.delete(order)
    db.session.commit()
    return jsonify({"message": "Order cancelled and stock restored"}), 200
