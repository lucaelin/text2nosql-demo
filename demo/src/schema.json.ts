export default {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Bookings",
  "type": "array",
  "items": {
    "title": "Booking",
    "type": "object",
    "properties": {
      "bookingId": {
        "type": "string",
        "example": "BKG123456"
      },
      "userDetails": {
        "type": "object",
        "properties": {
          "userId": {
            "type": "string",
            "example": "USR12345"
          },
          "name": {
            "type": "string",
            "example": "John Doe"
          },
          "email": {
            "type": "string",
            "format": "email",
            "example": "john.doe@example.com"
          },
          "phone": {
            "type": "string",
            "example": "+1234567890"
          }
        },
        "required": [
          "userId",
          "name",
          "email",
          "phone"
        ]
      },
      "bookingDetails": {
        "type": "object",
        "properties": {
          "checkIn": {
            "type": "string",
            "format": "date-time",
            "example": "2024-01-03T15:00:00Z"
          },
          "checkOut": {
            "type": "string",
            "format": "date-time",
            "example": "2024-01-10T11:00:00Z"
          },
          "roomType": {
            "type": "string",
            "example": "Deluxe"
          },
          "guests": {
            "type": "integer",
            "example": 2
          }
        },
        "required": [
          "checkIn",
          "checkOut",
          "roomType",
          "guests"
        ]
      },
      "paymentDetails": {
        "type": "object",
        "properties": {
          "totalAmount": {
            "type": "number",
            "example": 599.99
          },
          "currency": {
            "type": "string",
            "example": "USD"
          },
          "status": {
            "type": "string",
            "enum": [
              "Paid",
              "Pending",
              "Failed"
            ],
            "example": "Paid"
          },
          "paymentMethod": {
            "type": "object",
            "properties": {
              "methodType": {
                "type": "string",
                "enum": [
                  "Credit Card",
                  "Debit Card",
                  "Paypal"
                ],
                "example": "Credit Card"
              },
              "details": {
                "type": "object",
                "properties": {
                  "cardNumber": {
                    "type": "string",
                    "example": "1234 5678 9012 3456"
                  },
                  "expiryDate": {
                    "type": "string",
                    "example": "12/24"
                  },
                  "cvv": {
                    "type": "string",
                    "example": "123"
                  }
                },
                "required": [
                  "cardNumber",
                  "expiryDate",
                  "cvv"
                ]
              }
            },
            "required": [
              "methodType",
              "details"
            ]
          }
        },
        "required": [
          "totalAmount",
          "currency",
          "status",
          "paymentMethod"
        ]
      },
      "serviceDetails": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "serviceName": {
              "type": "string",
              "example": "Spa"
            },
            "price": {
              "type": "number",
              "example": 120.00
            }
          },
          "required": [
            "serviceName",
            "price"
          ]
        }
      },
      "bookingStatus": {
        "type": "string",
        "enum": [
          "Confirmed",
          "Pending",
          "Cancelled"
        ],
        "example": "Confirmed"
      }
    },
    "required": [
      "bookingId",
      "userDetails",
      "bookingDetails",
      "paymentDetails",
      "serviceDetails",
      "bookingStatus"
    ]
  }
}