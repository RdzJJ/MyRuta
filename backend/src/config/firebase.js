import admin from 'firebase-admin'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../../firebase-service-account.json'), 'utf8')
)

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  })
}

export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
export const adminRtdb = admin.database()
export default admin