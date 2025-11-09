import mysql.connector
import sys
import io

# Set UTF-8 encoding for console output
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

DB_CONFIG = {
    'host': '116.202.114.156',
    'port': 3971,
    'user': 'datalake_trw',
    'password': 'Tedd@13332!wq23',
    'database': 'datalake'
}

try:
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor(dictionary=True)

    print("\n" + "="*70)
    print("CHECKING LEADERBOARD TABLE")
    print("="*70)

    # Check if LeaderBoard table exists
    cursor.execute("SHOW TABLES LIKE 'LeaderBoard'")
    table_exists = cursor.fetchone()

    if table_exists:
        print("✅ LeaderBoard table found!")

        # Get table structure
        print("\n📋 Table Structure:")
        cursor.execute("DESCRIBE LeaderBoard")
        columns = cursor.fetchall()
        for col in columns:
            print(f"   - {col['Field']}: {col['Type']} {col['Null']} {col['Key']} {col['Default']}")

        # Get sample data
        print("\n📊 Sample Data (first 5 rows):")
        cursor.execute("SELECT * FROM LeaderBoard LIMIT 5")
        rows = cursor.fetchall()
        for i, row in enumerate(rows, 1):
            print(f"\n   Row {i}:")
            for key, value in row.items():
                print(f"      {key}: {value}")

        # Check unique values for grouping columns
        print("\n🔍 Checking grouping columns:")
        cursor.execute("SELECT DISTINCT day_segment FROM LeaderBoard")
        periods = cursor.fetchall()
        print(f"   day_segment values: {[p['day_segment'] for p in periods]}")

        cursor.execute("SELECT DISTINCT layer FROM LeaderBoard")
        layers = cursor.fetchall()
        print(f"   layer values: {[l['layer'] for l in layers]}")

        # Count records by segment
        cursor.execute("SELECT day_segment, COUNT(*) as count FROM LeaderBoard GROUP BY day_segment")
        counts = cursor.fetchall()
        print(f"\n📊 Record counts:")
        for count in counts:
            print(f"   {count['day_segment']}: {count['count']} records")

    else:
        print("❌ LeaderBoard table not found!")
        print("\n📋 Available tables:")
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        for table in tables:
            print(f"   - {list(table.values())[0]}")

    print("\n" + "="*70)

except Exception as e:
    print(f"❌ Error: {e}")
finally:
    if connection and connection.is_connected():
        cursor.close()
        connection.close()
