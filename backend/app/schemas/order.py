from marshmallow import Schema, fields, validate


class OrderItemSchema(Schema):
    product_id = fields.Integer(required=True, validate=validate.Range(min=1))
    quantity = fields.Integer(required=True, validate=validate.Range(min=1))


class OrderCreateSchema(Schema):
    customer_id = fields.Integer(required=True, validate=validate.Range(min=1))
    items = fields.List(
        fields.Nested(OrderItemSchema),
        required=True,
        validate=validate.Length(min=1),
    )
