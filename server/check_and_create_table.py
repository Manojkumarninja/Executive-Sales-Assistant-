"""Check and create SalesExecutiveApp_Login table if needed"""
import mysql.connector
from mysql.connector import Error

# Database configuration
DB_CONFIG = {
    'host': '116.202.114.156',
    'port': 3971,
    'user': 'datalake_trw',
    'password': 'Tedd@13332!wq23',
    'database': 'datalake'
}

print("Connecting to database...")
try:
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()

    # Check if table exists
    print("\n1. Checking if SalesExecutiveApp_Login table exists...")
    cursor.execute("""
        SELECT COUNT(*)
        FROM information_schema.tables
        WHERE table_schema = 'datalake'
        AND table_name = 'SalesExecutiveApp_Login'
    """)
    table_exists = cursor.fetchone()[0]

    if table_exists:
        print("   ✅ Table exists!")

        # Show current structure
        print("\n2. Current table structure:")
        cursor.execute("DESCRIBE SalesExecutiveApp_Login")
        for row in cursor.fetchall():
            print(f"   - {row[0]}: {row[1]}")

        # Show count
        cursor.execute("SELECT COUNT(*) FROM SalesExecutiveApp_Login")
        count = cursor.fetchone()[0]
        print(f"\n3. Current users in table: {count}")

    else:
        print("   ❌ Table does NOT exist!")
        print("\n2. Creating SalesExecutiveApp_Login table...")

        create_table_sql = """
        CREATE TABLE SalesExecutiveApp_Login (
            id INT AUTO_INCREMENT PRIMARY KEY,
            employee_id VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            is_active BOOLEAN DEFAULT TRUE,
            reset_token VARCHAR(255) DEFAULT NULL,
            reset_token_expiry DATETIME DEFAULT NULL,
            INDEX idx_employee_id (employee_id),
            INDEX idx_email (email),
            INDEX idx_reset_token (reset_token)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        """

        cursor.execute(create_table_sql)
        connection.commit()
        print("   ✅ Table created successfully!")

        # Verify
        cursor.execute("DESCRIBE SalesExecutiveApp_Login")
        print("\n3. New table structure:")
        for row in cursor.fetchall():
            print(f"   - {row[0]}: {row[1]}")

    cursor.close()
    connection.close()

    print("\n" + "="*60)
    print("✅ DATABASE SETUP COMPLETE!")
    print("="*60)
    print("\nYou can now run: python app.py")

except Error as e:
    print(f"\n❌ Error: {e}")
    print("\nPlease check:")
    print("1. Database server is accessible")
    print("2. You have CREATE TABLE permissions")
    print("3. Network/firewall allows connection")
