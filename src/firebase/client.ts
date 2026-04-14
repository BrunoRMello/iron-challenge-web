// import { Analytics, getAnalytics } from 'firebase/analytics'
import { getApps, initializeApp } from 'firebase/app'
import { Auth, getAuth } from 'firebase/auth'
import { Firestore, getFirestore } from 'firebase/firestore'
import { FirebaseStorage, getStorage } from 'firebase/storage'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const currentApps = getApps()

let auth: Auth
let firestore: Firestore
let storage: FirebaseStorage
// let analytics: Analytics | undefined

if (!currentApps.length) {
  const app = initializeApp(config)

  auth = getAuth(app)
  firestore = getFirestore(app)
  storage = getStorage(app)

  // if (typeof window !== 'undefined') {
  //   analytics = getAnalytics(app)
  // }
} else {
  const app = currentApps[0]

  auth = getAuth(app)
  firestore = getFirestore(app)
  storage = getStorage(app)

  // if (typeof window !== 'undefined') {
  //   analytics = getAnalytics(app)
  // }
}

export { auth, firestore, storage }
