import firebase_admin
from firebase_admin import credentials, firestore, db as rtdb
import os

_app = None

def get_firebase_app():
    global _app
    if _app is None:
        cred = credentials.Certificate(os.environ["FIREBASE_SERVICE_ACCOUNT_PATH"])
        _app = firebase_admin.initialize_app(cred, {
            "databaseURL": os.environ["FIREBASE_RTDB_URL"]
        })
    return _app

def get_firestore():
    get_firebase_app()
    return firestore.client()

def get_rtdb():
    get_firebase_app()
    return rtdb.reference("/")