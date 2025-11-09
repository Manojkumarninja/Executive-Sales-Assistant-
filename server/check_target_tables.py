"""Check target tables structure"""
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

    print("1. DayTargets table structure:")
    cursor.execute("DESCRIBE DayTargets")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\n2. WeekTargets table structure:")
    cursor.execute("DESCRIBE WeekTargets")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\n3. DayAchievement table structure:")
    cursor.execute("DESCRIBE DayAchievement")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\n4. WeekAchievement table structure:")
    cursor.execute("DESCRIBE WeekAchievement")
    for row in cursor.fetchall():
        print(f"  {row[0]}: {row[1]}")

    print("\n5. Sample DayTargets for SNC1063:")
    cursor.execute("SELECT * FROM DayTargets WHERE employee_id = 'SNC1063' AND date = CURDATE()")
    columns = [desc[0] for desc in cursor.description]
    print(f"  Columns: {', '.join(columns)}")
    for row in cursor.fetchall():
        for col, val in zip(columns, row):
            print(f"    {col}: {val}")
        print("  ---")

    print("\n6. Sample WeekTargets for SNC1063:")
    cursor.execute("SELECT * FROM WeekTargets WHERE employee_id = 'SNC1063' AND yearweek = YEARWEEK(CURDATE(), 1)")
    columns = [desc[0] for desc in cursor.description]
    print(f"  Columns: {', '.join(columns)}")
    for row in cursor.fetchall():
        for col, val in zip(columns, row):
            print(f"    {col}: {val}")
        print("  ---")

    cursor.close()
    connection.close()

except Exception as e:
    print(f"Error: {e}")
