# 🍃 MongoDB Atlas Quick Setup (Testing App)

Step-by-step flow for classroom/demo apps (`class_08_mongo` style).

## 1) Create a MongoDB account and cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create an account.
2. Create a new project.
3. Create a free cluster (M0 is enough for learning/testing).
4. Wait for cluster provisioning to finish.

## 2) Create a database user

1. Open **Database Access** in Atlas.
2. Click **Add New Database User**.
3. Choose username + password.
4. Give permissions (for testing you can use `Read and write to any database`).
5. Save the user.

## 3) Allow your IP (for classroom testing)

1. Open **Network Access** in Atlas.
2. Click **Add IP Address**.
3. Add `0.0.0.0/0` (Allow access from anywhere).

For this small testing app, `0.0.0.0/0` is fine to avoid connection issues while learning.

## 4) Get your connection string

1. Open **Clusters** → click **Connect**.
2. Choose **Drivers**.
3. Copy the `mongodb+srv://...` URI.
4. Replace placeholders:
   - `<username>` with your DB user
   - `<password>` with your DB user password
   - Optional: add `/your_db_name` in the URI path

## 5) Connect from Node.js app

1. Install driver:
   - `npm i mongodb`
2. Create a DB connection module (example: `db.js`) with:
   - `MongoClient`
   - `connectToDb()` (connect once on server start)
   - `getDb()` (reuse the connected DB in routes/controllers/services)
3. In your app entry point:
   - call `await connectToDb()` before handling requests
4. Use collections in handlers:
   - `getDb().collection('reminders')...`

## 6) Suggested flow in code

`index.js` (server start) → `connectToDb()` from `db.js` → route handler calls `getDb()` → collection query/insert/update → JSON response.
