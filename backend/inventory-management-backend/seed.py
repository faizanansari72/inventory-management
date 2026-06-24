"""Populate the database with sample data. Run: python seed.py"""

from app import create_app
from app.extensions import db
from app.models import Customer, Product

app = create_app()

SAMPLE_PRODUCTS = [
    {"name": "Wireless Mouse", "sku": "WM-001", "price": 19.99, "quantity": 50},
    {"name": "Mechanical Keyboard", "sku": "KB-002", "price": 79.99, "quantity": 8},
    {"name": "USB-C Hub", "sku": "HUB-003", "price": 34.50, "quantity": 5},
    {"name": "27\" Monitor", "sku": "MON-004", "price": 229.00, "quantity": 15},
    {"name": "Laptop Stand", "sku": "LS-005", "price": 24.99, "quantity": 3},
]

SAMPLE_CUSTOMERS = [
    {"full_name": "Alice Johnson", "email": "alice@example.com", "phone": "555-0101"},
    {"full_name": "Bob Smith", "email": "bob@example.com", "phone": "555-0102"},
    {"full_name": "Carol Lee", "email": "carol@example.com", "phone": "555-0103"},
]


def seed():
    with app.app_context():
        print("Dropping all tables to reset schema...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        for p in SAMPLE_PRODUCTS:
            db.session.add(Product(**p))
        for c in SAMPLE_CUSTOMERS:
            db.session.add(Customer(**c))
        db.session.commit()
        print("Seeded sample products and customers.")


if __name__ == "__main__":
    seed()
