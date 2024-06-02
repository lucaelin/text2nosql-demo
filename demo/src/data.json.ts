export default [
  {
    "bookingId": "BKG001",
    "userDetails": {
      "userId": "USR1001",
      "name": "Eva Müller",
      "email": "eva.muller@example.com",
      "phone": "+4915123456789",
    },
    "bookingDetails": {
      "checkIn": "2024-05-15T15:00:00Z",
      "checkOut": "2024-05-20T11:00:00Z",
      "roomType": "Deluxe",
      "guests": 2,
    },
    "paymentDetails": {
      "totalAmount": 850.00,
      "currency": "EUR",
      "status": "Paid",
      "paymentMethod": {
        "methodType": "Credit Card",
        "details": {
          "cardNumber": "1234 5678 9012 3456",
          "expiryDate": "09/26",
          "cvv": "321",
        },
      },
    },
    "serviceDetails": [
      {
        "serviceName": "Spa",
        "price": 200.00,
      },
      {
        "serviceName": "Breakfast",
        "price": 50.00,
      },
    ],
    "bookingStatus": "Confirmed",
  },
  {
    "bookingId": "BKG002",
    "userDetails": {
      "userId": "USR1002",
      "name": "Luca Bianchi",
      "email": "luca.bianchi@example.com",
      "phone": "+393331234567",
    },
    "bookingDetails": {
      "checkIn": "2024-06-10T15:00:00Z",
      "checkOut": "2024-06-15T11:00:00Z",
      "roomType": "Suite",
      "guests": 4,
    },
    "paymentDetails": {
      "totalAmount": 1500.00,
      "currency": "EUR",
      "status": "Pending",
      "paymentMethod": {
        "methodType": "Paypal",
        "details": {
          "account": "luca.bianchi@paypal.com",
        },
      },
    },
    "serviceDetails": [
      {
        "serviceName": "City Tour",
        "price": 300.00,
      },
      {
        "serviceName": "Dinner Reservation",
        "price": 180.00,
      },
    ],
    "bookingStatus": "Pending",
  },
  {
    "bookingId": "BKG003",
    "userDetails": {
      "userId": "USR1003",
      "name": "Alice Dubois",
      "email": "alice.dubois@example.com",
      "phone": "+33123456789",
    },
    "bookingDetails": {
      "checkIn": "2024-07-01T15:00:00Z",
      "checkOut": "2024-07-05T11:00:00Z",
      "roomType": "Standard",
      "guests": 1,
    },
    "paymentDetails": {
      "totalAmount": 400.00,
      "currency": "EUR",
      "status": "Failed",
      "paymentMethod": {
        "methodType": "Debit Card",
        "details": {
          "cardNumber": "9876 5432 1098 7654",
          "expiryDate": "03/25",
          "cvv": "789",
        },
      },
    },
    "serviceDetails": [
      {
        "serviceName": "Gym Access",
        "price": 30.00,
      },
    ],
    "bookingStatus": "Cancelled",
  },
  {
    "bookingId": "BKG004",
    "userDetails": {
      "userId": "USR2001",
      "name": "Henrik Ibsen",
      "email": "henrik.ibsen@example.com",
      "phone": "+4723123456",
    },
    "bookingDetails": {
      "checkIn": "2024-08-20T15:00:00Z",
      "checkOut": "2024-08-25T11:00:00Z",
      "roomType": "Standard",
      "guests": 2,
    },
    "paymentDetails": {
      "totalAmount": 650.00,
      "currency": "EUR",
      "status": "Paid",
      "paymentMethod": {
        "methodType": "Credit Card",
        "details": {
          "cardNumber": "4567 8901 2345 6789",
          "expiryDate": "11/27",
          "cvv": "456",
        },
      },
    },
    "serviceDetails": [
      {
        "serviceName": "Massage",
        "price": 100.00,
      },
    ],
    "bookingStatus": "Confirmed",
  },
  {
    "bookingId": "BKG005",
    "userDetails": {
      "userId": "USR2002",
      "name": "Clara Schumann",
      "email": "clara.schumann@example.com",
      "phone": "+49301234567",
    },
    "bookingDetails": {
      "checkIn": "2024-09-05T15:00:00Z",
      "checkOut": "2024-09-10T11:00:00Z",
      "roomType": "Deluxe",
      "guests": 3,
    },
    "paymentDetails": {
      "totalAmount": 1200.00,
      "currency": "EUR",
      "status": "Pending",
      "paymentMethod": {
        "methodType": "Bank Transfer",
        "details": {
          "bankName": "EuroBank",
          "accountNumber": "DE89370400440532013000",
        },
      },
    },
    "serviceDetails": [
      {
        "serviceName": "Airport Shuttle",
        "price": 50.00,
      },
      {
        "serviceName": "Dinner for 3",
        "price": 150.00,
      },
    ],
    "bookingStatus": "Confirmed",
  },
  {
    "bookingId": "BKG006",
    "userDetails": {
      "userId": "USR2003",
      "name": "Giulia Rossi",
      "email": "giulia.rossi@example.com",
      "phone": "+390612345678",
    },
    "bookingDetails": {
      "checkIn": "2024-10-15T15:00:00Z",
      "checkOut": "2024-10-20T11:00:00Z",
      "roomType": "Suite",
      "guests": 4,
    },
    "paymentDetails": {
      "totalAmount": 1800.00,
      "currency": "EUR",
      "status": "Paid",
      "paymentMethod": {
        "methodType": "Credit Card",
        "details": {
          "cardNumber": "9876 5432 1098 7654",
          "expiryDate": "05/29",
          "cvv": "987",
        },
      },
    },
    "serviceDetails": [
      {
        "serviceName": "Private Tour",
        "price": 250.00,
      },
      {
        "serviceName": "Spa Day",
        "price": 300.00,
      },
    ],
    "bookingStatus": "Confirmed",
  },
];
