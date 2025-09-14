#!/bin/bash

# Get current IP address
IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

echo "Current IP: $IP"

# Update frontend .env
echo "EXPO_PUBLIC_COMPUTER_IP=$IP" > frontend/.env

echo "Updated frontend/.env with IP: $IP"
echo "Restart your Expo dev server to apply changes"
