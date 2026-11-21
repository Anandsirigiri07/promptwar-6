# Firebase Free Tier (Spark Plan) Setup Guide for VAYUWISE AI

This guide walks you through setting up a **100% Free** Firebase project on the **Spark Plan ($0/month, No Credit Card Required)** for VAYUWISE AI.

---

## 1. Firebase Spark Free Tier Summary

The Spark Plan includes generous permanent free quotas that easily support development, demonstration, and evaluation:

| Service | Spark Free Tier Quota | VAYUWISE AI Usage |
| :--- | :--- | :--- |
| **Authentication** | Unlimited Email/Password & Anonymous Auth | User signup, login, session management |
| **Cloud Firestore** | **50,000 document reads / day**<br>**20,000 document writes / day**<br>**20,000 document deletes / day**<br>**1 GiB total storage** | Community pledges, actions, user preferences |
| **IndexedDB Cache** | Client-side cache (unlimited local) | Configured in `src/services/firebaseService.ts` to cache reads & conserve daily quota |
| **Simultaneous Connections** | 100 concurrent connections | More than adequate for demo & testing |
| **Cost** | **$0.00 / month forever** | **Zero billing risk** |

> [!NOTE]
> VAYUWISE AI does **not** use paid Firebase features like Cloud Functions external HTTP calls or Phone (SMS) Auth. The entire application runs within the 100% free Spark tier.

---

## 2. Step-by-Step Setup (Takes ~3 Minutes)

### Step 1: Create a Free Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g., `vayuwise-demo` or `vayuwise-ai`).
4. (Optional) Disable Google Analytics if not needed, then click **Create project**.
5. Ensure your plan is **Spark** (the default free tier).

---

### Step 2: Enable Firebase Authentication
1. In the left navigation, go to **Build** → **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab:
   - Click **Email/Password** → Enable the first toggle (**Email/Password**) → Click **Save**.
   - Click **Anonymous** → Enable the toggle → Click **Save**.
   *(Both providers are 100% free and require no external credentials or phone numbers).*

---

### Step 3: Create Cloud Firestore Database
1. In the left navigation, go to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose a Database location close to you (e.g., `asia-south1` (Mumbai), `us-central1`, or `eur3`).
4. For security rules, select **Start in production mode** (or test mode).
5. Click **Create**.

#### Deploy VAYUWISE Security Rules:
In the Firestore console, switch to the **Rules** tab, paste the contents of [`firestore.rules`](../firestore.rules), and click **Publish**.

Or, if you have the Firebase CLI installed:
```bash
npx firebase-tools deploy --only firestore:rules
```

---

### Step 4: Register Web App (Client Credentials)
1. Go to **Project Settings** (gear icon at the top left next to *Project Overview*).
2. Under the **General** tab, scroll down to **Your apps** and click the **Web** icon (`</>`).
3. Enter an App nickname (e.g., `vayuwise-web`). Do not check Firebase Hosting.
4. Click **Register app**.
5. Firebase will display `firebaseConfig`. Copy the corresponding values into your local `.env` file:

```ini
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

---

### Step 5: Generate Admin SDK Service Account (Server Credentials)
1. In **Project Settings**, go to the **Service accounts** tab.
2. Select **Node.js**.
3. Click **Generate new private key** → Click **Generate key**.
4. A JSON file will download to your computer. Open it and copy three values into your `.env` file:

```ini
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...=\n-----END PRIVATE KEY-----\n"
```

> [!IMPORTANT]
> Keep the quotes `"` around `FIREBASE_PRIVATE_KEY` and ensure newline `\n` characters are preserved. Never commit `.env` or service account JSON files to Git.

---

## 3. Quota Safety Features in VAYUWISE AI

To guarantee you never exceed Spark limits, VAYUWISE AI includes built-in safeguards:

1. **Client Persistent Caching**:
   `src/services/firebaseService.ts` initializes Firestore with `persistentLocalCache` and `persistentMultipleTabManager()`. Repeated page loads serve data from IndexedDB rather than consuming remote read quota.

2. **Server Query Clamping**:
   `server/services/firestoreService.ts` restricts queries with `.limit(50)` to prevent unbounded scans.

3. **Atomic Batch Transactions**:
   Pledge logging executes in atomic transactions (`runTransaction`) with deduplication keys to prevent spam writes.

4. **Transparent Demo Fallback**:
   If credentials are missing or the daily quota is exhausted, VAYUWISE AI gracefully drops back to local in-memory Demo Mode without throwing uncaught exceptions.

---

## 4. Local Offline Emulators (Alternative Zero-Cost Option)

If you prefer testing without creating a cloud Firebase project:

1. Start the Firebase Emulator Suite:
   ```bash
   npx firebase-tools emulators:start
   ```
2. In `.env`:
   ```ini
   VITE_FIREBASE_USE_EMULATOR=true
   FIRESTORE_EMULATOR_HOST=localhost:8080
   FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
   ```
3. Start VAYUWISE:
   ```bash
   npm run dev
   ```
   Both frontend and backend will automatically route through local emulators on `http://localhost:8080` (Firestore) and `http://localhost:9099` (Auth) with Emulator UI on `http://localhost:4000`.
