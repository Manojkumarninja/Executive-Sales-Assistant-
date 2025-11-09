"""Test targets API"""
import requests
import json

employee_id = "SNC1063"

print("Testing Daily Targets API:")
print(f"GET http://localhost:5000/api/targets/daily/{employee_id}")
response = requests.get(f"http://localhost:5000/api/targets/daily/{employee_id}")
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")

print("\n" + "="*50 + "\n")

print("Testing Weekly Targets API:")
print(f"GET http://localhost:5000/api/targets/weekly/{employee_id}")
response = requests.get(f"http://localhost:5000/api/targets/weekly/{employee_id}")
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2)}")
