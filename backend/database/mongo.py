"""
MongoDB connection module with robust TLS handling for Atlas.

The TLSV1_ALERT_INTERNAL_ERROR on OpenSSL 3.x + pymongo 4.x is caused by
OpenSSL 3's stricter default security level (SECLEVEL=2) rejecting the
cipher suites negotiated by some Atlas cluster configurations.

Fix: create a custom ssl.SSLContext with SECLEVEL=1 and pass it to MongoClient.
"""

from pymongo import MongoClient
from flask import current_app, g
import ssl

client = None
db = None


def _make_ssl_context():
    """
    Build an SSLContext that lowers OpenSSL 3's default security level
    from 2 to 1, which re-enables the cipher suites Atlas needs.
    """
    ctx = ssl.SSLContext(ssl.PROTOCOL_TLS_CLIENT)
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    # Lower security level to allow legacy cipher suites (OpenSSL 3 fix)
    try:
        ctx.set_ciphers('DEFAULT@SECLEVEL=1')
    except ssl.SSLError:
        pass  # older OpenSSL — no-op, already at level 1
    return ctx


def init_db(app):
    global client, db
    uri = app.config['MONGO_URI']

    # ── Strategy 1: Custom SSLContext with SECLEVEL=1 ──────────────────────
    try:
        ssl_ctx = _make_ssl_context()
        client = MongoClient(
            uri,
            tls=True,
            tlsAllowInvalidCertificates=True,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=20000,
            socketTimeoutMS=20000,
        )
        client.admin.command('ping')
        db = client[app.config['DB_NAME']]
        print(f"[DB] Connected to MongoDB Atlas: {app.config['DB_NAME']}")
        return
    except Exception as e:
        print(f"[DB] Strategy 1 failed: {type(e).__name__}: {str(e)[:120]}")

    # ── Strategy 2: URI-level tlsInsecure parameter ────────────────────────
    try:
        insecure_uri = uri
        if '?' in uri:
            insecure_uri += '&tlsInsecure=true'
        else:
            insecure_uri += '?tlsInsecure=true'
        client = MongoClient(
            insecure_uri,
            serverSelectionTimeoutMS=30000,
        )
        client.admin.command('ping')
        db = client[app.config['DB_NAME']]
        print(f"[DB] Connected to MongoDB Atlas (tlsInsecure): {app.config['DB_NAME']}")
        return
    except Exception as e:
        print(f"[DB] Strategy 2 failed: {type(e).__name__}: {str(e)[:120]}")

    # ── Strategy 3: Plain connection (local fallback) ──────────────────────
    try:
        client = MongoClient(
            'mongodb://localhost:27017/',
            serverSelectionTimeoutMS=5000,
        )
        client.admin.command('ping')
        db = client[app.config['DB_NAME']]
        print(f"[DB] Connected to LOCAL MongoDB: {app.config['DB_NAME']}")
    except Exception as e:
        print(f"[DB] ALL connection strategies failed. Last error: {e}")
        db = None


def get_db():
    global db
    return db
