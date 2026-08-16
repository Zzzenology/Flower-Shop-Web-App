#!/bin/bash
echo "Setting default stock for existing products..."
curl -X POST "http://localhost:5000/product/set-default-stock" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_VANZATOR_TOKEN_HERE" \
  -d '{"defaultStock": 100}'
echo "Default stock update completed!"
