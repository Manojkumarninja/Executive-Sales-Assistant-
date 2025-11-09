"""
Check SA_AppNotification table structure
"""

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

try:
    connection = mysql.connector.connect(**DB_CONFIG)
    cursor = connection.cursor()

    print("[OK] Connected to database successfully!\n")

    # Describe table structure
    print("=" * 80)
    print("SA_AppNotification Table Structure:")
    print("=" * 80)
    cursor.execute("DESCRIBE SA_AppNotification")
    columns = cursor.fetchall()

    for col in columns:
        print(f"{col[0]:20s} | {col[1]:15s} | Null: {col[2]:3s} | Key: {col[3]:3s} | Default: {str(col[4]):10s}")

    print("\n" + "=" * 80)
    print("Sample Data (Latest 5 rows):")
    print("=" * 80)

    cursor.execute("SELECT * FROM SA_AppNotification ORDER BY date DESC LIMIT 5")
    rows = cursor.fetchall()

    # Get column names
    cursor.execute("DESCRIBE SA_AppNotification")
    column_names = [col[0] for col in cursor.fetchall()]
    print("\nColumns:", ", ".join(column_names))
    print()

    for row in rows:
        print(row)

    cursor.close()
    connection.close()

except Error as e:
    print(f"[ERROR] Database error: {e}")
