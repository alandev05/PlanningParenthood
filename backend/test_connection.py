#!/usr/bin/env python3
"""
Simple test script to help debug network connectivity
"""

import socket
import subprocess
import sys

def get_local_ip():
    """Get the local IP address"""
    try:
        # Connect to a remote address to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except:
        return "127.0.0.1"

def test_server_connection(host, port):
    """Test if server is accessible"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(3)
        result = s.connect_ex((host, port))
        s.close()
        return result == 0
    except:
        return False

if __name__ == "__main__":
    print("🔍 Network Connectivity Test")
    print("=" * 40)
    
    # Get local IP
    local_ip = get_local_ip()
    print(f"Your computer's IP address: {local_ip}")
    
    # Test different addresses
    test_addresses = [
        ("localhost", 8001),
        ("127.0.0.1", 8001),
        (local_ip, 8001),
        ("10.189.115.63", 8001),
        ("192.168.1.100", 8001),
        ("192.168.0.100", 8001)
    ]
    
    print(f"\nTesting server connectivity on port 8001:")
    working_addresses = []
    
    for host, port in test_addresses:
        is_working = test_server_connection(host, port)
        status = "✅ WORKING" if is_working else "❌ Not accessible"
        print(f"  {host}:{port} - {status}")
        
        if is_working:
            working_addresses.append(f"http://{host}:{port}")
    
    if working_addresses:
        print(f"\n🎉 Working backend URLs:")
        for url in working_addresses:
            print(f"  {url}")
        
        print(f"\n📱 For your mobile device, try:")
        print(f"  {working_addresses[0]}")
    else:
        print(f"\n❌ No working connections found.")
        print(f"Make sure the server is running with:")
        print(f"  cd backend && python3 server.py")
    
    print(f"\n💡 To test manually:")
    print(f"  curl http://{local_ip}:8001/api/health")
