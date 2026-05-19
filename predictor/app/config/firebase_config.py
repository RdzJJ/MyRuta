import firebase_admin
from firebase_admin import credentials, firestore, db
import os

def init_firebase():
    if not firebase_admin._apps:
        cred = credentials.Certificate("firebase-service-account.json")
        firebase_admin.initialize_app(cred, {
            "databaseURL": os.getenv("FIREBASE_DATABASE_URL")
        })

def get_firestore():
    return firestore.client()

def get_realtime_db():
    return db.reference()