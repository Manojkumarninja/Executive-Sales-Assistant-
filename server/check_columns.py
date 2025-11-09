"""Check Executive table columns"""
import mysql.connector
import sys
import io

# Fix encoding
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
    cursor = connection.cursor()

    print("Executive table structure:")
    cursor.execute("DESCRIBE Executive")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\nSample data from Executive:")
    cursor.execute("SELECT * FROM Executive WHERE role = 'BUSINESS_DEVELOPMENT_EXECUTIVE' LIMIT 1")
    columns = [desc[0] for desc in cursor.description]
    print(f"  Columns: {', '.join(columns)}")

    row = cursor.fetchone()
    if row:
        for col, val in zip(columns, row):
            print(f"  {col}: {val}")

    cursor.close()
    connection.close()

except Exception as e:
    print(f"Error: {e}")
