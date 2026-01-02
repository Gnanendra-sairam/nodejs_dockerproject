const express = require('express');
const path = require('path');
const fs = require('fs');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/* ================= ROUTES ================= */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/profile-picture', (req, res) => {
  const img = fs.readFileSync(
    path.join(__dirname, 'images/profile-1.jpg')
  );
  res.writeHead(200, { 'Content-Type': 'image/jpg' });
  res.end(img, 'binary');
});

/* ================= MONGODB CONFIG ================= */

// ✅ Correct MongoDB URL for LOCAL Node + Docker MongoDB
const mongoUrl =
  'mongodb://admin:password@localhost:27017/my-db?authSource=admin';

const mongoClientOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const databaseName = 'my-db';

/* ================= API ================= */

app.post('/update-profile', async (req, res) => {
  let client;
  try {
    const userObj = req.body;
    userObj.userid = 1;

    client = await MongoClient.connect(mongoUrl, mongoClientOptions);
    const db = client.db(databaseName);

    await db.collection('users').updateOne(
      { userid: 1 },
      { $set: userObj },
      { upsert: true }
    );

    // ✅ Send response AFTER DB write
    res.send(userObj);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).send({ error: 'Profile update failed' });
  } finally {
    if (client) client.close();
  }
});

app.get('/get-profile', async (req, res) => {
  let client;
  try {
    client = await MongoClient.connect(mongoUrl, mongoClientOptions);
    const db = client.db(databaseName);

    const result = await db
      .collection('users')
      .findOne({ userid: 1 });

    res.send(result || {});
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).send({ error: 'Profile fetch failed' });
  } finally {
    if (client) client.close();
  }
});

/* ================= SERVER ================= */
app.listen(3000, () => {
  console.log('✅ App listening on port 3000');
});
