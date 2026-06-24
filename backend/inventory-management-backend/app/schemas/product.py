from marshmallow import Schema, fields, validate


class ProductCreateSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    sku = fields.String(required=True, validate=validate.Length(min=1, max=100))
    description = fields.String(required=False, allow_none=True)
    price = fields.Decimal(
        required=True, validate=validate.Range(min=0), as_string=False
    )
    quantity = fields.Integer(
        required=True, validate=validate.Range(min=0)
    )


class ProductUpdateSchema(Schema):
    """All fields optional for partial updates (PUT)."""

    name = fields.String(validate=validate.Length(min=1, max=255))
    sku = fields.String(validate=validate.Length(min=1, max=100))
    description = fields.String(allow_none=True)
    price = fields.Decimal(validate=validate.Range(min=0), as_string=False)
    quantity = fields.Integer(validate=validate.Range(min=0))
