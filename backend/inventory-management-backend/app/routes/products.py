from flask import Blueprint, jsonify, request

from app.errors import APIError
from app.extensions import db
from app.models import Product
from app.schemas.product import ProductCreateSchema, ProductUpdateSchema

products_bp = Blueprint("products", __name__, url_prefix="/products")

create_schema = ProductCreateSchema()
update_schema = ProductUpdateSchema()


@products_bp.post("")
def create_product():
    data = create_schema.load(request.get_json(force=True, silent=True) or {})

    if Product.query.filter_by(sku=data["sku"]).first():
        raise APIError("A product with this SKU already exists", 409)

    product = Product(**data)
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@products_bp.get("")
def list_products():
    products = Product.query.order_by(Product.id).all()
    return jsonify([p.to_dict() for p in products]), 200


@products_bp.get("/<int:product_id>")
def get_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        raise APIError("Product not found", 404)
    return jsonify(product.to_dict()), 200


@products_bp.put("/<int:product_id>")
def update_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        raise APIError("Product not found", 404)

    data = update_schema.load(request.get_json(force=True, silent=True) or {})

    # If SKU is changing, ensure it stays unique.
    new_sku = data.get("sku")
    if new_sku and new_sku != product.sku:
        if Product.query.filter_by(sku=new_sku).first():
            raise APIError("A product with this SKU already exists", 409)

    for key, value in data.items():
        setattr(product, key, value)

    db.session.commit()
    return jsonify(product.to_dict()), 200


@products_bp.delete("/<int:product_id>")
def delete_product(product_id):
    product = db.session.get(Product, product_id)
    if not product:
        raise APIError("Product not found", 404)

    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted"}), 200
