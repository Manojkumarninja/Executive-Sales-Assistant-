"""Test database connection"""
import sys

print("Testing database connection...\n")

# Test 1: Check if mysql.connector is installed
print("1. Checking mysql-connector-python package...")
try:
    import mysql.connector
    print("   ✅ mysql-connector-python is installed")
except ImportError as e:
    print(f"   ❌ mysql-connector-python NOT installed")
    print(f"   Error: {e}")
    print("\n   FIX: Run this command:")
    print("   pip install mysql-connector-python")
    sys.exit(1)

# Test 2: Try to connect to database
print("\n2. Testing connection to database...")
DB_CONFIG = {
    'host': '116.202.114.156',
    'port': 3971,
    'user': 'datalake_trw',
    'password': 'Tedd@13332!wq23',
    'database': 'datalake'
}

try:
    connection = mysql.connector.connect(**DB_CONFIG)
    print(f"   ✅ Connected to database: {DB_CONFIG['database']}")

    # Test 3: Query Executive table
    print("\n3. Testing Executive table query...")
    cursor = connection.cursor()
    cursor.execute("SELECT COUNT(*) FROM Executive")
    count = cursor.fetchone()[0]
    print(f"   ✅ Found {count} executives in Executive table")

    # Test 4: Check SalesExecutiveApp_Login table
    print("\n4. Checking SalesExecutiveApp_Login table...")
    cursor.execute("SELECT COUNT(*) FROM SalesExecutiveApp_Login")
    login_count = cursor.fetchone()[0]
    print(f"   ✅ Found {login_count} users in SalesExecutiveApp_Login table")

    cursor.close()
    connection.close()

    print("\n" + "="*60)
    print("✅ ALL TESTS PASSED!")
    print("="*60)
    print("\nYou can now run: python app.py")

except mysql.connector.Error as e:
    print(f"   ❌ Database connection failed!")
    print(f"   Error: {e}")
    print(f"\n   Possible issues:")
    print(f"   - Database server is down")
    print(f"   - Firewall blocking port {DB_CONFIG['port']}")
    print(f"   - Incorrect credentials")
    print(f"   - Network/VPN issues")
    sys.exit(1)
except Exception as e:
    print(f"   ❌ Unexpected error: {e}")
    sys.exit(1)
