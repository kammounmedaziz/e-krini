#!/bin/bash

# Test face login with base64 image

echo "Testing face login..."

# Create a small test image (1x1 pixel red jpeg in base64)
TEST_IMAGE="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k="

# Test with username (should work even if face not recognized)
echo "Test 1: Login with username hint"
curl -X POST http://localhost:3001/api/v1/auth/login-face \
  -H "Content-Type: application/json" \
  -d "{\"imageData\":\"$TEST_IMAGE\",\"username\":\"medazizkammoun\"}" \
  2>&1 | jq '.'

echo -e "\n---\n"

# Test without username (requires AI face recognition)
echo "Test 2: Login without username (pure face recognition)"
curl -X POST http://localhost:3001/api/v1/auth/login-face \
  -H "Content-Type: application/json" \
  -d "{\"imageData\":\"$TEST_IMAGE\"}" \
  2>&1 | jq '.'
