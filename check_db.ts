import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore/lite';
import fs from 'fs';
import { CATALOG } from './src/seedCatalog';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function check() {
  const c = collection(db, 'services');
  const snap = await getDocs(c);
  console.log("Services count: ", snap.size);
  const first = snap.docs[0];
  if (first) {
    console.log("First service:", JSON.stringify(first.data(), null, 2));
  }
}

check().catch(console.error);
