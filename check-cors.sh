#!/bin/bash

# This script checks if the API has the correct CORS headers to allow all origins.

API_URL="http://localhost:3000/api/health"
TEST_ORIGIN="https://some-random-domain.com"

echo "Checking CORS for $API_URL with a test origin: $TEST_ORIGIN"

response_headers=$(curl -s -I -X GET -H "Origin: $TEST_ORIGIN" "$API_URL")

echo "Response headers:"
echo "$response_headers"

# Check for Access-Control-Allow-Origin: *
# The -i flag for grep makes it case-insensitive
# The `\s*` handles potential whitespace differences.
if echo "$response_headers" | grep -q -i "Access-Control-Allow-Origin:\s*\*"; then
  echo "CORS is working correctly. 'Access-Control-Allow-Origin: *' header is present."
  exit 0
else
  echo "CORS header 'Access-Control-Allow-Origin: *' not found or has an incorrect value."
  exit 1
fi