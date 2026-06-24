from flask import Blueprint, jsonify, request

from app.errors import APIError
from app.extensions import db
from app.models import Customer
from app.schemas.customer import CustomerCreateSchema

customers_bp = Blueprint("customers", __name__, url_prefix="/customers")

create_schema = CustomerCreateSchema()


@customers_bp.post("")
def create_customer():
    data = create_schema.load(request.get_json(force=True, silent=True) or {})

    if Customer.query.filter_by(email=data["email"]).first():
        raise APIError("A customer with this email already exists", 409)

    customer = Customer(**data)
    db.session.add(customer)
    db.session.commit()
    return jsonify(customer.to_dict()), 201


@customers_bp.get("")
def list_customers():
    customers = Customer.query.order_by(Customer.id).all()
    return jsonify([c.to_dict() for c in customers]), 200


@customers_bp.get("/<int:customer_id>")
def get_customer(customer_id):
    customer = db.session.get(Customer, customer_id)
    if not customer:
        raise APIError("Customer not found", 404)
    return jsonify(customer.to_dict()), 200


@customers_bp.delete("/<int:customer_id>")
def delete_customer(customer_id):
    customer = db.session.get(Customer, customer_id)
    if not customer:
        raise APIError("Customer not found", 404)

    if customer.orders:
        raise APIError(
            "Cannot delete a customer that has existing orders", 409
        )

    db.session.delete(customer)
    db.session.commit()
    return jsonify({"message": "Customer deleted"}), 200
