"""
Sales Executive App - Python Flask Backend
Connects to MySQL database and handles authentication
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import pooling, Error
import hashlib
import datetime
import secrets
import os

app = Flask(__name__)

# CORS configuration - Allow Vercel frontend and localhost
ALLOWED_ORIGINS = [
    'http://localhost:5173',  # Local development
    'http://localhost:3000',  # Alternative local
    'https://*.vercel.app',   # Vercel deployments
    '*'  # Allow all origins (remove in production for security)
]
CORS(app, origins=ALLOWED_ORIGINS, supports_credentials=True)

# Database configuration with connection pooling
DB_CONFIG = {
    'host': '116.202.114.156',
    'port': 3971,
    'user': 'datalake_trw',
    'password': 'Tedd@13332!wq23',
    'database': 'datalake'
}

# Create connection pool for better performance
# Pool reuses connections instead of creating new ones for each request
try:
    connection_pool = pooling.MySQLConnectionPool(
        pool_name="sales_app_pool",
        pool_size=5,  # 5 connections in the pool
        pool_reset_session=True,
        **DB_CONFIG
    )
    print("[OK] Database connection pool created successfully")
except Error as e:
    print(f"[ERROR] Error creating connection pool: {e}")
    connection_pool = None

def get_db_connection():
    """Get database connection from pool"""
    try:
        if connection_pool:
            connection = connection_pool.get_connection()
            return connection
        else:
            # Fallback to direct connection if pool fails
            connection = mysql.connector.connect(**DB_CONFIG)
            return connection
    except Error as e:
        print(f"[ERROR] Database connection error: {e}")
        return None

def hash_password(password):
    """Hash password using SHA-256"""
    return hashlib.sha256((password + 'SALES_EXEC_SALT').encode()).hexdigest()

def verify_password(password, hashed):
    """Verify password against hash"""
    return hash_password(password) == hashed

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    connection = get_db_connection()
    if connection:
        connection.close()
        return jsonify({
            'success': True,
            'message': 'Sales Executive App API is running with database!',
            'timestamp': datetime.datetime.now().isoformat()
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Database connection failed'
        }), 500

@app.route('/api/keep-alive', methods=['GET'])
def keep_alive():
    """Keep-alive endpoint to prevent Render from sleeping
    Can be pinged by external cron job services (cron-job.org, etc.)
    Lightweight endpoint that doesn't hit database"""
    return jsonify({
        'success': True,
        'status': 'alive',
        'timestamp': datetime.datetime.now().isoformat(),
        'message': 'Server is awake and ready'
    })

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Signup endpoint - validates against Executive table"""
    data = request.get_json()
    employee_id = data.get('employee_id', '').strip()
    password = data.get('password', '')

    print(f"\n[INFO] Signup request for: {employee_id}")

    # Validate inputs
    if not employee_id or not password:
        return jsonify({
            'success': False,
            'message': 'All fields are required'
        }), 400

    if len(password) < 6:
        return jsonify({
            'success': False,
            'message': 'Password must be at least 6 characters'
        }), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({
            'success': False,
            'message': 'Database connection failed'
        }), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Step 1: Check if employee exists in Executive table with correct role
        print("[CHECK] Checking Executive table...")
        cursor.execute(
            "SELECT employee_id, Name, email, role FROM Executive WHERE employee_id = %s AND role = %s",
            (employee_id, 'BUSINESS_DEVELOPMENT_EXECUTIVE')
        )
        executive = cursor.fetchone()

        if not executive:
            print(f"[ERROR] Employee {employee_id} not found or not authorized")
            return jsonify({
                'success': False,
                'message': 'Employee ID not found or not authorized. Only Business Development Executives can register.'
            }), 403

        print(f"[OK] Employee found: {executive['Name']} - {executive['role']}")

        # Step 2: Check if already registered
        print("[CHECK] Checking if already registered...")
        cursor.execute(
            "SELECT employee_id FROM SalesExecutiveApp_Login WHERE employee_id = %s",
            (employee_id,)
        )
        existing = cursor.fetchone()

        if existing:
            print(f"[ERROR] Employee {employee_id} already registered")
            return jsonify({
                'success': False,
                'message': 'User already registered. Please login.'
            }), 409

        # Step 3: Hash password and insert into SalesExecutiveApp_Login
        print("🔐 Hashing password...")
        hashed_password = hash_password(password)

        print("💾 Inserting into SalesExecutiveApp_Login table...")
        cursor.execute(
            """INSERT INTO SalesExecutiveApp_Login
               (employee_id, password_hash, full_name, email, role, status, created_at, last_login, deleted)
               VALUES (%s, %s, %s, %s, %s, 'active', NOW(), NOW(), 0)""",
            (employee_id, hashed_password, executive['Name'], executive['email'], executive['role'])
        )
        connection.commit()

        print(f"[OK] User {employee_id} registered successfully in database!")

        # Generate token
        token = f"token-{employee_id}-{secrets.token_hex(16)}"

        return jsonify({
            'success': True,
            'message': 'Signup successful!',
            'token': token,
            'user': {
                'employee_id': employee_id,
                'full_name': executive['Name'],
                'email': executive['email'],
                'role': executive['role']
            }
        }), 201

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({
            'success': False,
            'message': 'Database error during signup',
            'error': str(e)
        }), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login endpoint"""
    data = request.get_json()
    employee_id = data.get('employee_id', '').strip()
    password = data.get('password', '')

    print(f"\n🔑 Login request for: {employee_id}")

    # Validate inputs
    if not employee_id or not password:
        return jsonify({
            'success': False,
            'message': 'Employee ID and password are required'
        }), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({
            'success': False,
            'message': 'Database connection failed'
        }), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get user from database
        print("[CHECK] Fetching user from SalesExecutiveApp_Login...")
        cursor.execute(
            "SELECT employee_id, password_hash, full_name, email, role FROM SalesExecutiveApp_Login WHERE employee_id = %s",
            (employee_id,)
        )
        user = cursor.fetchone()

        if not user:
            print(f"[ERROR] User {employee_id} not found")
            return jsonify({
                'success': False,
                'message': 'Invalid employee ID or password'
            }), 401

        # Verify password
        print("🔐 Verifying password...")
        if not verify_password(password, user['password_hash']):
            print("[ERROR] Invalid password")
            return jsonify({
                'success': False,
                'message': 'Invalid employee ID or password'
            }), 401

        # Update last login
        print("[INFO] Updating last login...")
        cursor.execute(
            "UPDATE SalesExecutiveApp_Login SET last_login = NOW() WHERE employee_id = %s",
            (employee_id,)
        )
        connection.commit()

        print(f"[OK] Login successful for {employee_id}")

        # Generate token
        token = f"token-{employee_id}-{secrets.token_hex(16)}"

        return jsonify({
            'success': True,
            'message': 'Login successful!',
            'token': token,
            'user': {
                'employee_id': user['employee_id'],
                'full_name': user['full_name'],
                'email': user['email'],
                'role': user['role'],
                'last_login': datetime.datetime.now().isoformat()
            }
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({
            'success': False,
            'message': 'Database error during login',
            'error': str(e)
        }), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    """Forgot password endpoint - placeholder for email sending"""
    data = request.get_json()
    employee_id = data.get('employee_id', '').strip()

    print(f"\n📧 Password reset requested for: {employee_id}")

    # In production, this would:
    # 1. Fetch email from Executive table
    # 2. Generate reset token
    # 3. Send email with reset link

    return jsonify({
        'success': True,
        'message': 'Password reset email sent successfully. (Demo mode - feature coming soon)'
    }), 200

@app.route('/api/incentives/daily/<employee_id>', methods=['GET'])
def get_daily_incentives(employee_id):
    """Get daily incentive calculations for an employee with slab targets"""
    print(f"\n💰 Fetching daily incentives for: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Final Daily Overall Incentive Achievement
        cursor.execute(
            """SELECT
                employee_id,
                sum(max_variable_pay) as max_variable_pay,
                sum(Achievement) as Achievement,
                sum(slab1_target) as slab1_target,
                sum(slab2_target) as slab2_target,
                sum(slab3_target) as slab3_target
            FROM
            (SELECT
                employee_id,
                metric,
                MAX(max_variable_pay) AS max_variable_pay,
                MAX(CASE WHEN slab_segment = 'slab1' THEN variable_pay * incentive_percent END) AS slab1_target,
                MAX(CASE WHEN slab_segment = 'slab2' THEN variable_pay * incentive_percent END) AS slab2_target,
                MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END) AS slab3_target,
                CASE
                    WHEN MAX(Achievement) <= MAX(CASE WHEN slab_segment = 'slab1' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab1' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab1' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab1' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab2' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab2' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab2' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab2' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab3' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab3' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)

                    ELSE MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)
                END AS Achievement
            FROM (
                SELECT
                    dt.employee_id,
                    dt.date,
                    dt.metric,
                    dt.incentive_percent,
                    ((e.variable_pay / 31)) * dt.incentive_percent as max_variable_pay,
                    ((e.variable_pay / 31)) AS variable_pay,
                    dt.contribution,
                    dt.slab_segment,
                    MAX(dt.target) AS target,
                    MAX(da.Achievement) AS Achievement
                FROM DayTargets dt
                LEFT JOIN DayAchievement da
                    ON dt.date = da.date
                    AND dt.metric = da.metric
                    AND dt.employee_id = da.employee_id
                LEFT JOIN Executive e
                    ON e.employee_id = dt.employee_id
                WHERE dt.employee_id = %s
                  AND dt.date = CURDATE()
                GROUP BY
                    dt.employee_id,
                    dt.date,
                    dt.metric,
                    e.variable_pay,
                    dt.contribution,
                    dt.slab_segment,
                    dt.incentive_percent
            ) AS base
            GROUP BY employee_id, metric) base1
            GROUP BY employee_id""",
            (employee_id,)
        )
        result = cursor.fetchone()

        if result:
            max_target = float(result['max_variable_pay']) if result['max_variable_pay'] else 0
            achievement = float(result['Achievement']) if result['Achievement'] else 0

            incentive_data = {
                'max_target': max_target,
                'achieved_amount': achievement,
                'remaining_amount': max_target - achievement,
                'slab1_target': float(result['slab1_target']) if result['slab1_target'] else 0,
                'slab2_target': float(result['slab2_target']) if result['slab2_target'] else 0,
                'slab3_target': float(result['slab3_target']) if result['slab3_target'] else 0
            }
            print(f"[OK] Daily incentive: ₹{incentive_data['achieved_amount']:.2f} / ₹{incentive_data['max_target']:.2f}")
            return jsonify({'success': True, 'incentives': incentive_data}), 200
        else:
            return jsonify({'success': True, 'incentives': {
                'max_target': 0,
                'achieved_amount': 0,
                'remaining_amount': 0,
                'slab1_target': 0,
                'slab2_target': 0,
                'slab3_target': 0
            }}), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/incentives/weekly/<employee_id>', methods=['GET'])
def get_weekly_incentives(employee_id):
    """Get weekly incentive calculations for an employee with slab targets"""
    print(f"\n💰 Fetching weekly incentives for: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Final Weekly Overall Incentive Achievement
        cursor.execute(
            """SELECT
                employee_id,
                sum(max_variable_pay) as max_variable_pay,
                sum(Achievement) as Achievement,
                sum(slab1_target) as slab1_target,
                sum(slab2_target) as slab2_target,
                sum(slab3_target) as slab3_target
            FROM
            (SELECT
                employee_id,
                metric,
                MAX(max_variable_pay) AS max_variable_pay,
                MAX(CASE WHEN slab_segment = 'slab1' THEN variable_pay * incentive_percent END) AS slab1_target,
                MAX(CASE WHEN slab_segment = 'slab2' THEN variable_pay * incentive_percent END) AS slab2_target,
                MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END) AS slab3_target,
                CASE
                    WHEN MAX(Achievement) <= MAX(CASE WHEN slab_segment = 'slab1' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab1' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab1' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab1' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab2' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab2' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab2' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab2' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab3' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab3' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)

                    ELSE MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)
                END AS Achievement
            FROM (
                SELECT
                    wt.employee_id,
                    wt.yearweek,
                    wt.metric,
                    wt.incentive_percent,
                    ((e.variable_pay / 31) * 7) * wt.incentive_percent as max_variable_pay,
                    ((e.variable_pay / 31) * 7) AS variable_pay,
                    wt.contribution,
                    wt.slab_segment,
                    MAX(wt.target) AS target,
                    MAX(wa.Achievement) AS Achievement
                FROM WeekTargets wt
                LEFT JOIN WeekAchievement wa
                    ON wt.yearweek = wa.yearweek
                    AND wt.metric = wa.metric
                    AND wt.employee_id = wa.employee_id
                LEFT JOIN Executive e
                    ON e.employee_id = wt.employee_id
                WHERE wt.employee_id = %s
                  AND wt.yearweek = yearweek(curdate() + interval 1 day, 1)
                GROUP BY
                    wt.employee_id,
                    wt.yearweek,
                    wt.metric,
                    e.variable_pay,
                    wt.contribution,
                    wt.slab_segment,
                    wt.incentive_percent
            ) AS base
            GROUP BY employee_id, metric) base1
            GROUP BY employee_id""",
            (employee_id,)
        )
        result = cursor.fetchone()

        if result:
            max_target = float(result['max_variable_pay']) if result['max_variable_pay'] else 0
            achievement = float(result['Achievement']) if result['Achievement'] else 0

            incentive_data = {
                'max_target': max_target,
                'achieved_amount': achievement,
                'remaining_amount': max_target - achievement,
                'slab1_target': float(result['slab1_target']) if result['slab1_target'] else 0,
                'slab2_target': float(result['slab2_target']) if result['slab2_target'] else 0,
                'slab3_target': float(result['slab3_target']) if result['slab3_target'] else 0
            }
            print(f"[OK] Weekly incentive: ₹{incentive_data['achieved_amount']:.2f} / ₹{incentive_data['max_target']:.2f}")
            return jsonify({'success': True, 'incentives': incentive_data}), 200
        else:
            return jsonify({'success': True, 'incentives': {
                'max_target': 0,
                'achieved_amount': 0,
                'remaining_amount': 0,
                'slab1_target': 0,
                'slab2_target': 0,
                'slab3_target': 0
            }}), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/targets/daily/<employee_id>', methods=['GET'])
def get_daily_targets(employee_id):
    """Get daily targets and achievements for an employee with slab info and incentive pending"""
    print(f"\n📊 Fetching daily targets with slabs for: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get daily targets with slab information and incentive pending
        cursor.execute(
            """SELECT
                employee_id,
                metric,
                MAX(target) AS Target,
                MAX(achievement) AS Achievement,
                MAX(CASE WHEN slab_segment = 'slab1' THEN target END) AS slab1_target,
                MAX(CASE WHEN slab_segment = 'slab2' THEN target END) AS slab2_target,
                MAX(CASE WHEN slab_segment = 'slab3' THEN target END) AS slab3_target,
                MAX(max_variable_pay) - IFNULL(CASE
                    WHEN MAX(Achievement) <= MAX(CASE WHEN slab_segment = 'slab1' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab1' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab1' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab1' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab2' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab2' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab2' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab2' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab3' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab3' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)

                    ELSE MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)
                END, 0) AS Incentive_Pending
            FROM (
                SELECT
                    dt.employee_id,
                    dt.date,
                    dt.metric,
                    dt.unit,
                    dt.incentive_percent,
                    ((e.variable_pay / 31)) * dt.incentive_percent as max_variable_pay,
                    ((e.variable_pay / 31)) AS variable_pay,
                    dt.contribution,
                    dt.slab_segment,
                    MAX(dt.target) AS target,
                    MAX(da.Achievement) AS Achievement
                FROM DayTargets dt
                LEFT JOIN DayAchievement da
                    ON dt.date = da.date
                    AND dt.metric = da.metric
                    AND dt.employee_id = da.employee_id
                LEFT JOIN Executive e
                    ON e.employee_id = dt.employee_id
                WHERE dt.employee_id = %s
                  AND dt.date = CURDATE()
                GROUP BY
                    dt.employee_id,
                    dt.date,
                    dt.metric,
                    dt.unit,
                    e.variable_pay,
                    dt.contribution,
                    dt.slab_segment,
                    dt.incentive_percent
            ) AS base
            GROUP BY employee_id, metric""",
            (employee_id,)
        )
        targets = cursor.fetchall()

        # Get unit information for each metric
        cursor.execute(
            """SELECT DISTINCT metric, unit FROM DayTargets
               WHERE employee_id = %s AND date = CURDATE()""",
            (employee_id,)
        )
        units = {row['metric']: row['unit'] for row in cursor.fetchall()}

        # Format results
        result = []
        for target in targets:
            metric_name = target['metric']
            target_value = float(target['Target']) if target['Target'] else 0
            achievement_value = float(target['Achievement']) if target['Achievement'] else 0
            slab1 = float(target['slab1_target']) if target['slab1_target'] else 0
            slab2 = float(target['slab2_target']) if target['slab2_target'] else 0
            slab3 = float(target['slab3_target']) if target['slab3_target'] else 0
            incentive_pending = float(target['Incentive_Pending']) if target['Incentive_Pending'] else 0

            result.append({
                'metric': metric_name,
                'unit': units.get(metric_name, ''),
                'target': target_value,
                'achieved': achievement_value,
                'slab1_target': slab1,
                'slab2_target': slab2,
                'slab3_target': slab3,
                'incentive_pending': incentive_pending
            })

        print(f"[OK] Found {len(result)} daily targets with slab info")
        return jsonify({'success': True, 'targets': result}), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/targets/weekly/<employee_id>', methods=['GET'])
def get_weekly_targets(employee_id):
    """Get weekly targets and achievements for an employee with slab info and incentive pending"""
    print(f"\n📊 Fetching weekly targets with slabs for: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get weekly targets with slab information and incentive pending
        cursor.execute(
            """SELECT
                employee_id,
                metric,
                MAX(target) AS Target,
                MAX(achievement) AS Achievement,
                MAX(CASE WHEN slab_segment = 'slab1' THEN target END) AS slab1_target,
                MAX(CASE WHEN slab_segment = 'slab2' THEN target END) AS slab2_target,
                MAX(CASE WHEN slab_segment = 'slab3' THEN target END) AS slab3_target,
                MAX(max_variable_pay) - IFNULL(CASE
                    WHEN MAX(Achievement) <= MAX(CASE WHEN slab_segment = 'slab1' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab1' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab1' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab1' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab2' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab2' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab2' THEN variable_pay * incentive_percent END)

                    WHEN MAX(Achievement) BETWEEN MAX(CASE WHEN slab_segment = 'slab2' THEN target END) AND MAX(CASE WHEN slab_segment = 'slab3' THEN target END)
                        THEN (MAX(Achievement) / MAX(CASE WHEN slab_segment = 'slab3' THEN target END))
                             * MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)

                    ELSE MAX(CASE WHEN slab_segment = 'slab3' THEN variable_pay * incentive_percent END)
                END, 0) AS Incentive_Pending
            FROM (
                SELECT
                    wt.employee_id,
                    wt.yearweek,
                    wt.metric,
                    wt.unit,
                    wt.incentive_percent,
                    ((e.variable_pay / 31) * 7) * wt.incentive_percent as max_variable_pay,
                    ((e.variable_pay / 31) * 7) AS variable_pay,
                    wt.contribution,
                    wt.slab_segment,
                    MAX(wt.target) AS target,
                    MAX(wa.Achievement) AS Achievement
                FROM WeekTargets wt
                LEFT JOIN WeekAchievement wa
                    ON wt.yearweek = wa.yearweek
                    AND wt.metric = wa.metric
                    AND wt.employee_id = wa.employee_id
                LEFT JOIN Executive e
                    ON e.employee_id = wt.employee_id
                WHERE wt.employee_id = %s
                  AND wt.yearweek = YEARWEEK(CURDATE() + INTERVAL 1 DAY, 1)
                GROUP BY
                    wt.employee_id,
                    wt.yearweek,
                    wt.metric,
                    wt.unit,
                    e.variable_pay,
                    wt.contribution,
                    wt.slab_segment,
                    wt.incentive_percent
            ) AS base
            GROUP BY employee_id, metric""",
            (employee_id,)
        )
        targets = cursor.fetchall()

        # Get unit information for each metric
        cursor.execute(
            """SELECT DISTINCT metric, unit FROM WeekTargets
               WHERE employee_id = %s AND yearweek = YEARWEEK(CURDATE() + INTERVAL 1 DAY, 1)""",
            (employee_id,)
        )
        units = {row['metric']: row['unit'] for row in cursor.fetchall()}

        # Format results
        result = []
        for target in targets:
            metric_name = target['metric']
            target_value = float(target['Target']) if target['Target'] else 0
            achievement_value = float(target['Achievement']) if target['Achievement'] else 0
            slab1 = float(target['slab1_target']) if target['slab1_target'] else 0
            slab2 = float(target['slab2_target']) if target['slab2_target'] else 0
            slab3 = float(target['slab3_target']) if target['slab3_target'] else 0
            incentive_pending = float(target['Incentive_Pending']) if target['Incentive_Pending'] else 0

            result.append({
                'metric': metric_name,
                'unit': units.get(metric_name, ''),
                'target': target_value,
                'achieved': achievement_value,
                'slab1_target': slab1,
                'slab2_target': slab2,
                'slab3_target': slab3,
                'incentive_pending': incentive_pending
            })

        print(f"[OK] Found {len(result)} weekly targets with slab info")
        return jsonify({'success': True, 'targets': result}), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/leaderboard/<employee_id>', methods=['GET'])
def get_leaderboard(employee_id):
    """Get leaderboard rankings for an employee"""
    # Get query parameters
    period = request.args.get('period', 'day')  # 'day' or 'week'
    layer = request.args.get('layer', 'city')   # 'city' or 'cluster'

    print(f"\n🏆 Fetching leaderboard for: {employee_id} (period: {period}, layer: {layer})")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Query includes layer_value for grouping by cluster and cluster from Executive table
        query = """
            SELECT
                lb.employee_id,
                lb.Ranking as rank,
                lb.Achievement * 100 as achievement,
                lb.layer_value,
                e.Name as name,
                e.cluster as cluster
            FROM LeaderBoard lb
            INNER JOIN Executive e ON lb.employee_id = e.employee_id
            WHERE lb.day_segment = %s
                AND lb.layer = %s
            ORDER BY lb.layer_value ASC, lb.Ranking ASC
        """

        cursor.execute(query, (period, layer))
        rankings = cursor.fetchall()

        # Format results based on layer type
        if layer == 'cluster':
            # Group by cluster
            grouped_rankings = {}
            for rank_data in rankings:
                cluster_name = rank_data['layer_value']
                if cluster_name not in grouped_rankings:
                    grouped_rankings[cluster_name] = []

                grouped_rankings[cluster_name].append({
                    'rank': int(rank_data['rank']),
                    'name': rank_data['name'],
                    'employee_id': rank_data['employee_id'],
                    'achievement': float(rank_data['achievement']) if rank_data['achievement'] is not None else 0.0,
                    'cluster': rank_data['cluster'] if rank_data['cluster'] else 'Unknown',
                    'isCurrentUser': rank_data['employee_id'] == employee_id
                })

            # Convert to array format
            result = []
            for cluster_name, cluster_rankings in grouped_rankings.items():
                result.append({
                    'cluster': cluster_name,
                    'rankings': cluster_rankings
                })

            print(f"[OK] Found {len(rankings)} rankings in {len(result)} clusters for {period}/{layer}")
            return jsonify({
                'success': True,
                'rankings': result,
                'period': period,
                'layer': layer,
                'grouped': True
            }), 200
        else:
            # City view - flat list
            result = []
            for rank_data in rankings:
                result.append({
                    'rank': int(rank_data['rank']),
                    'name': rank_data['name'],
                    'employee_id': rank_data['employee_id'],
                    'achievement': float(rank_data['achievement']) if rank_data['achievement'] is not None else 0.0,
                    'cluster': rank_data['cluster'] if rank_data['cluster'] else 'Unknown',
                    'isCurrentUser': rank_data['employee_id'] == employee_id
                })

            print(f"[OK] Found {len(result)} rankings for {period}/{layer}")
            return jsonify({
                'success': True,
                'rankings': result,
                'period': period,
                'layer': layer,
                'grouped': False
            }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Get Nudge Zone customers - Target Customers
@app.route('/api/customers/nudge-zone/<employee_id>', methods=['GET'])
def get_nudge_zone_customers(employee_id):
    """Get target customers from SA_HomePageTargetCustomers table"""
    print(f"\n📋 Fetching Nudge Zone customers for: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM SA_HomePageTargetCustomers
            WHERE employee_id = %s
            ORDER BY customer_id
        """

        cursor.execute(query, (employee_id,))
        raw_customers = cursor.fetchall()

        # Transform data to match frontend expectations
        customers = []
        for customer in raw_customers:
            customers.append({
                'customerId': customer.get('customer_id'),
                'customerName': customer.get('customername') or 'Unknown',
                'phoneNumber': str(customer.get('contactnumber')) if customer.get('contactnumber') else 'N/A',
                'lastOrder': f"{customer.get('LastOrder')} days ago" if customer.get('LastOrder') else 'No orders yet'
            })

        print(f"[OK] Found {len(customers)} Nudge Zone customers")
        if customers:
            print(f"📄 Sample customer data: {customers[0]}")

        return jsonify({
            'success': True,
            'customers': customers
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Get So Close customers - App Funnel Customers
@app.route('/api/customers/so-close/<employee_id>', methods=['GET'])
def get_so_close_customers(employee_id):
    """Get app funnel customers from SA_HomePageAppFunnelCustomers table"""
    print(f"\n🔥 Fetching So Close customers for: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        query = """
            SELECT *
            FROM SA_HomePageAppFunnelCustomers
            WHERE employee_id = %s
            ORDER BY customer_id
        """

        cursor.execute(query, (employee_id,))
        raw_customers = cursor.fetchall()

        # Transform data to match frontend expectations
        customers = []
        for customer in raw_customers:
            customers.append({
                'customerId': customer.get('customer_id'),
                'customerName': customer.get('customername') or 'Unknown',
                'phoneNumber': str(customer.get('contactnumber')) if customer.get('contactnumber') else 'N/A',
                'lastSeen': f"{int(customer.get('LastOpened'))} hours ago" if customer.get('LastOpened') else 'Recently'
            })

        print(f"[OK] Found {len(customers)} So Close customers")
        if customers:
            print(f"📄 Sample customer data: {customers[0]}")

        return jsonify({
            'success': True,
            'customers': customers
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# Log app events for analytics
@app.route('/api/events/log', methods=['POST'])
def log_event():
    """Log app events to SA_AppEvents table"""
    try:
        data = request.json
        employee_id = data.get('employee_id')
        event_name = data.get('event_name')
        meta_data = data.get('meta_data', '')

        if not employee_id or not event_name:
            return jsonify({
                'success': False,
                'message': 'Missing required fields: employee_id and event_name'
            }), 400

        print(f"📊 Logging event: {event_name} for {employee_id}")

        connection = get_db_connection()
        if not connection:
            return jsonify({'success': False, 'message': 'Database connection failed'}), 500

        cursor = connection.cursor()

        # Get current date and time
        now = datetime.datetime.now()
        entry_date = now.strftime('%Y-%m-%d')
        entry_time = now.strftime('%H:%M:%S')

        # Parse meta_data if it's a string (convert back to dict for JSON column)
        import json
        if isinstance(meta_data, str):
            try:
                meta_data_json = json.loads(meta_data) if meta_data else {}
            except:
                meta_data_json = {"raw": meta_data}
        else:
            meta_data_json = meta_data if meta_data else {}

        # Convert to JSON string for MySQL JSON column
        meta_data_str = json.dumps(meta_data_json)

        # Insert event into SA_AppEvents table
        query = """
            INSERT INTO SA_AppEvents (entry_date, entry_time, employee_id, event_name, meta_data)
            VALUES (%s, %s, %s, %s, %s)
        """

        cursor.execute(query, (entry_date, entry_time, employee_id, event_name, meta_data_str))
        connection.commit()

        print(f"[OK] Event logged: {event_name} at {entry_time}")

        cursor.close()
        connection.close()

        return jsonify({
            'success': True,
            'message': 'Event logged successfully',
            'event': {
                'entry_date': entry_date,
                'entry_time': entry_time,
                'employee_id': employee_id,
                'event_name': event_name
            }
        }), 200

    except Error as e:
        print(f"[ERROR] Database error logging event: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    except Exception as e:
        print(f"[ERROR] Error logging event: {e}")
        return jsonify({'success': False, 'message': 'Server error', 'error': str(e)}), 500

# Get customers by metric for Target page
@app.route('/api/target-customers/<employee_id>', methods=['GET'])
def get_target_customers(employee_id):
    """Get customers for a specific metric and period from SA_CustomerPageCustomers table"""
    metric = request.args.get('metric', '')
    period = request.args.get('period', 'daily')  # 'daily' or 'weekly'

    # Map period to layer
    layer = 'day' if period == 'daily' else 'week'

    print(f"\n🎯 Fetching customers for metric '{metric}' ({period}, layer: {layer}) for employee: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Query to get customers from SA_CustomerPageCustomers based on layer (day/week) and metric
        if metric:
            query = """
                SELECT *
                FROM SA_CustomerPageCustomers
                WHERE employee_id = %s AND layer = %s AND metric = %s
                ORDER BY customer_id
            """
            cursor.execute(query, (employee_id, layer, metric))
        else:
            query = """
                SELECT *
                FROM SA_CustomerPageCustomers
                WHERE employee_id = %s AND layer = %s
                ORDER BY customer_id
            """
            cursor.execute(query, (employee_id, layer))

        raw_customers = cursor.fetchall()

        # Transform data to match frontend expectations
        # Group customers by customer_id and aggregate SKUs to avoid duplicates
        customer_dict = {}
        for customer in raw_customers:
            customer_id = customer.get('customer_id')

            # Create customer entry if not exists
            if customer_id not in customer_dict:
                customer_dict[customer_id] = {
                    'customerId': customer_id,
                    'customerName': customer.get('customername') or 'Unknown',
                    'phoneNumber': str(customer.get('contactnumber')) if customer.get('contactnumber') else 'N/A',
                    'source': 'target-page',
                    'skusToPitch': []
                }

            # Add SKU to the customer's SKU list if available
            if customer.get('skuid') and customer.get('Sku'):
                # Avoid duplicate SKUs for the same customer
                sku_exists = any(
                    sku.get('id') == customer.get('skuid')
                    for sku in customer_dict[customer_id]['skusToPitch']
                )

                if not sku_exists:
                    customer_dict[customer_id]['skusToPitch'].append({
                        'id': customer.get('skuid'),
                        'name': customer.get('Sku'),
                        'category': 'Product',
                        'image': '📦'
                    })

        # Convert dictionary to list
        customers = list(customer_dict.values())

        print(f"[OK] Found {len(customers)} customers for metric '{metric}' ({period}, layer: {layer})")
        if customers:
            print(f"📄 Sample customer data: {customers[0]}")

        return jsonify({
            'success': True,
            'customers': customers,
            'metric': metric,
            'period': period
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# ============================================================================
# ATTENTION TAB ENDPOINTS (SA_CustomerPageAttention)
# ============================================================================

@app.route('/api/attention/metrics/<employee_id>', methods=['GET'])
def get_attention_metrics(employee_id):
    """Get distinct metrics from SA_CustomerPageAttention for an employee"""
    print(f"\n[CHECK] Fetching attention metrics for employee: {employee_id}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get metrics for this employee OR records with NULL employee_id
        query = """
            SELECT DISTINCT metric
            FROM SA_CustomerPageAttention
            WHERE (employee_id = %s OR employee_id IS NULL) AND metric IS NOT NULL
            ORDER BY metric
        """

        cursor.execute(query, (employee_id,))
        results = cursor.fetchall()

        metrics = [row['metric'] for row in results if row['metric']]

        print(f"[OK] Found {len(metrics)} distinct metrics for attention tab")

        return jsonify({
            'success': True,
            'metrics': metrics,
            'count': len(metrics)
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/attention/customers/<employee_id>', methods=['GET'])
def get_attention_customers(employee_id):
    """Get unique customers for a specific metric from SA_CustomerPageAttention"""
    metric = request.args.get('metric', '')
    print(f"\n[CHECK] Fetching attention customers for metric '{metric}' and employee: {employee_id}")

    if not metric:
        return jsonify({'success': False, 'message': 'Metric parameter is required'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get unique customers for this metric
        # Include customers with matching employee_id OR NULL employee_id
        # If metric is "All", return customers from all metrics
        if metric == 'All':
            query = """
                SELECT DISTINCT
                    customer_id,
                    customername,
                    contactnumber
                FROM SA_CustomerPageAttention
                WHERE (employee_id = %s OR employee_id IS NULL)
                ORDER BY customer_id
            """
            cursor.execute(query, (employee_id,))
        else:
            query = """
                SELECT DISTINCT
                    customer_id,
                    customername,
                    contactnumber
                FROM SA_CustomerPageAttention
                WHERE (employee_id = %s OR employee_id IS NULL) AND metric = %s
                ORDER BY customer_id
            """
            cursor.execute(query, (employee_id, metric))
        raw_customers = cursor.fetchall()

        # Transform data to match frontend expectations
        customers = []
        for customer in raw_customers:
            customers.append({
                'customerId': customer.get('customer_id'),
                'customerName': customer.get('customername') or 'Unknown',
                'phoneNumber': str(customer.get('contactnumber')) if customer.get('contactnumber') else 'N/A'
            })

        print(f"[OK] Found {len(customers)} unique customers for metric '{metric}'")

        return jsonify({
            'success': True,
            'customers': customers,
            'metric': metric,
            'count': len(customers)
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/attention/sku-details/<employee_id>/<customer_id>', methods=['GET'])
def get_attention_sku_details(employee_id, customer_id):
    """Get SKU details for a specific customer from SA_CustomerPageAttention"""
    metric = request.args.get('metric', '')
    print(f"\n[CHECK] Fetching SKU details for customer {customer_id}, metric '{metric}', employee: {employee_id}")

    if not metric:
        return jsonify({'success': False, 'message': 'Metric parameter is required'}), 400

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get all SKU details for this customer and metric
        # Include records where employee_id matches OR is NULL (for records not assigned to specific employees)
        # If metric is "All", return all SKU records across all metrics
        if metric == 'All':
            query = """
                SELECT
                    skuid,
                    skuname,
                    metric,
                    orderkg,
                    billedkg,
                    salekg,
                    returnkg,
                    readjustmentkg,
                    shopreachtime,
                    ontime,
                    date
                FROM SA_CustomerPageAttention
                WHERE (employee_id = %s OR employee_id IS NULL)
                    AND customer_id = %s
                ORDER BY date DESC, metric, skuid
            """
            cursor.execute(query, (employee_id, customer_id))
        else:
            query = """
                SELECT
                    skuid,
                    skuname,
                    metric,
                    orderkg,
                    billedkg,
                    salekg,
                    returnkg,
                    readjustmentkg,
                    shopreachtime,
                    ontime,
                    date
                FROM SA_CustomerPageAttention
                WHERE (employee_id = %s OR employee_id IS NULL)
                    AND customer_id = %s
                    AND metric = %s
                ORDER BY date DESC, skuid
            """
            cursor.execute(query, (employee_id, customer_id, metric))
        sku_records = cursor.fetchall()

        # Transform data to match frontend expectations
        skus = []
        for record in sku_records:
            # Format shopreachtime if it exists
            reach_time = None
            if record.get('shopreachtime'):
                reach_time = str(record['shopreachtime'])

            skus.append({
                'skuId': record.get('skuid'),
                'skuName': record.get('skuname') or 'Unknown SKU',
                'metric': record.get('metric'),  # Include metric for "All" filter
                'orderKg': float(record.get('orderkg')) if record.get('orderkg') is not None else 0,
                'billedKg': float(record.get('billedkg')) if record.get('billedkg') is not None else 0,
                'saleKg': float(record.get('salekg')) if record.get('salekg') is not None else 0,
                'returnKg': float(record.get('returnkg')) if record.get('returnkg') is not None else 0,
                'readjustmentKg': float(record.get('readjustmentkg')) if record.get('readjustmentkg') is not None else 0,
                'shopReachTime': reach_time,
                'onTime': bool(record.get('ontime')) if record.get('ontime') is not None else False,
                'date': record.get('date').strftime('%Y-%m-%d') if record.get('date') else None
            })

        print(f"[OK] Found {len(skus)} SKU records for customer {customer_id}")

        return jsonify({
            'success': True,
            'skus': skus,
            'count': len(skus),
            'customerId': customer_id,
            'metric': metric
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

# ============================================================================
# BASE TAB ENDPOINTS (SA_CustomerPageBase)
# ============================================================================

@app.route('/api/base/customers/<employee_id>', methods=['GET'])
def get_base_customers(employee_id):
    """Get all base customers for an employee with optional filters"""
    customer_id_filter = request.args.get('customer_id', '')
    contact_filter = request.args.get('contact', '')

    print(f"\n[CHECK] Fetching base customers for employee: {employee_id}")
    if customer_id_filter:
        print(f"[FILTER] Customer ID: {customer_id_filter}")
    if contact_filter:
        print(f"[FILTER] Contact Number: {contact_filter}")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Build query with optional filters
        query = """
            SELECT
                customer_id,
                customername,
                contactnumber,
                customertype,
                customernature,
                locality,
                facility,
                cluster,
                latestsubscriptionenddate,
                latestsubscriptionamount,
                LOD
            FROM SA_CustomerPageBase
            WHERE (employee_id = %s OR employee_id IS NULL)
        """

        params = [employee_id]

        # Add customer_id filter if provided
        if customer_id_filter:
            query += " AND customer_id = %s"
            params.append(int(customer_id_filter))

        # Add contact filter if provided
        if contact_filter:
            query += " AND contactnumber = %s"
            params.append(int(contact_filter))

        query += " ORDER BY customername"

        cursor.execute(query, tuple(params))
        customers = cursor.fetchall()

        # Transform data to match frontend expectations
        formatted_customers = []
        for customer in customers:
            formatted_customers.append({
                'customerId': customer.get('customer_id'),
                'customerName': customer.get('customername') or 'Unknown',
                'phoneNumber': str(customer.get('contactnumber')) if customer.get('contactnumber') else 'N/A',
                'customerType': customer.get('customertype'),
                'customerNature': customer.get('customernature'),
                'locality': customer.get('locality'),
                'facility': customer.get('facility'),
                'cluster': customer.get('cluster'),
                'subscriptionEndDate': customer.get('latestsubscriptionenddate').strftime('%Y-%m-%d') if customer.get('latestsubscriptionenddate') else None,
                'subscriptionAmount': float(customer.get('latestsubscriptionamount')) if customer.get('latestsubscriptionamount') else None,
                'lastOrderDate': customer.get('LOD').strftime('%Y-%m-%d') if customer.get('LOD') else None
            })

        print(f"[OK] Found {len(formatted_customers)} base customers")

        return jsonify({
            'success': True,
            'customers': formatted_customers,
            'count': len(formatted_customers)
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

@app.route('/api/notifications', methods=['GET'])
def get_notifications():
    """Get app notifications from SA_AppNotification table"""
    print(f"\n📢 Fetching app notifications...")

    connection = get_db_connection()
    if not connection:
        return jsonify({'success': False, 'message': 'Database connection failed'}), 500

    try:
        cursor = connection.cursor(dictionary=True)

        # Get notifications ordered by date (most recent first) and priority
        cursor.execute(
            """SELECT Id, date, heading, description, priority
               FROM SA_AppNotification
               WHERE date <= CURDATE()
               ORDER BY priority DESC, date DESC
               LIMIT 10"""
        )
        notifications = cursor.fetchall()

        # Transform to match frontend expectations
        news_items = []
        for notif in notifications:
            # Determine type based on priority
            priority = float(notif['priority']) if notif['priority'] else 0
            if priority >= 8:
                notif_type = 'alert'
                badge = 'URGENT'
            elif priority >= 5:
                notif_type = 'announcement'
                badge = 'NEW'
            else:
                notif_type = 'update'
                badge = None

            # Format date
            notif_date = notif['date'].strftime('%B %d, %Y') if notif['date'] else None

            news_items.append({
                'id': notif['Id'],
                'title': notif['heading'] or 'Notification',
                'content': notif['description'] or '',
                'date': notif_date,
                'type': notif_type,
                'badge': badge,
                'priority': priority
            })

        print(f"[OK] Found {len(news_items)} notifications")
        return jsonify({
            'success': True,
            'notifications': news_items,
            'count': len(news_items)
        }), 200

    except Error as e:
        print(f"[ERROR] Database error: {e}")
        return jsonify({'success': False, 'message': 'Database error', 'error': str(e)}), 500
    finally:
        if connection and connection.is_connected():
            cursor.close()
            connection.close()

if __name__ == '__main__':
    # Set UTF-8 encoding for console output
    import sys
    import io
    if sys.stdout.encoding != 'utf-8':
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

    print("\n" + "="*70)
    print("SALES EXECUTIVE APP - PYTHON FLASK BACKEND")
    print("="*70)
    print("📊 Server: http://localhost:5000")
    print("💚 Health Check: http://localhost:5000/api/health")
    print(f"🗄️  Database: {DB_CONFIG['database']} @ {DB_CONFIG['host']}:{DB_CONFIG['port']}")
    print("\n✨ Features:")
    print("   [OK] Validates against Executive table")
    print("   [OK] Only allows BUSINESS_DEVELOPMENT_EXECUTIVE role")
    print("   [OK] Stores data in SalesExecutiveApp_Login table")
    print("   [OK] Password hashing with SHA-256")
    print("   [OK] Login with database verification")
    print("="*70 + "\n")

    # Test database connection
    print("[CHECK] Testing database connection...")
    connection = get_db_connection()
    if connection:
        try:
            cursor = connection.cursor()
            cursor.execute("SELECT COUNT(*) FROM Executive")
            count = cursor.fetchone()[0]
            print(f"[OK] Database connected! Found {count} executives in database\n")
            cursor.close()
            connection.close()
        except Error as e:
            print(f"[ERROR] Database query failed: {e}\n")
    else:
        print("[ERROR] Failed to connect to database\n")

    print("🚀 Starting Flask server...\n")

    # Get port from environment variable (Render sets this) or use 5000 for local dev
    port = int(os.environ.get('PORT', 5000))
    debug_mode = os.environ.get('FLASK_ENV') != 'production'

    app.run(host='0.0.0.0', port=port, debug=debug_mode)
