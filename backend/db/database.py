import json
import sqlite3
from datetime import datetime

DB = "forensics.db"

def get_conn():
    conn = sqlite3.connect(DB)
    conn.execute("""CREATE TABLE IF NOT EXISTS scans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_at TEXT,
        subject TEXT,
        sender TEXT,
        sender_ip TEXT,
        danger_percent INTEGER,
        verdict TEXT,
        location TEXT,
        findings TEXT)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT DEFAULT 'user')""")
    try:
        conn.execute("ALTER TABLE scans ADD COLUMN user_id INTEGER")
    except sqlite3.OperationalError:
        pass
        # New table for ThreatMailer reports: one row per investigation, full result stored as JSON
    conn.execute("""CREATE TABLE IF NOT EXISTS investigations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        inv_id TEXT,
        created_at TEXT,
        data TEXT)""")
    return conn

def save_scan(result, user_id=None):
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO scans (created_at, subject, sender, sender_ip, danger_percent, verdict, location, findings, user_id) VALUES (?,?,?,?,?,?,?,?,?)",
        (datetime.utcnow().isoformat(), result["subject"], result["sender"],
         result["sender_ip"], result["danger_percent"], result["verdict"],
         json.dumps(result["location"]), json.dumps(result["findings"]), user_id),
    )
    conn.commit()
    scan_id = cur.lastrowid
    conn.close()
    return scan_id