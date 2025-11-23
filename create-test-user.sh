#!/bin/bash

echo "Creating test user: medazizkammoun"

curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "medazizkammoun",
    "email": "medaziz@test.com",
    "password": "Password123!",
    "firstName": "Medaziz",
    "lastName": "Kammoun",
    "phoneNumber": "+21612345678",
    "role": "client"
  }'

echo ""
echo "User created! Now face login should work."
