from marshmallow import Schema, fields, validate


class CustomerCreateSchema(Schema):
    full_name = fields.String(required=True, validate=validate.Length(min=1, max=255))
    email = fields.Email(required=True, validate=validate.Length(max=255))
    phone = fields.String(
        required=False, allow_none=True, validate=validate.Length(max=50)
    )
