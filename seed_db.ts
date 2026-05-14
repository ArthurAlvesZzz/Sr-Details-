import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore/lite';
import fs from 'fs';
import { CATALOG } from './src/seedCatalog';

const configStr = fs.readFileSync('firebase-applet-config.json', 'utf8');
const firebaseConfig = JSON.parse(configStr);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  const categories = [
    { id: "lavagens", name: "Lavagens", slug: "lavagens", displayOrder: 1, active: true },
    { id: "motos", name: "Motos", slug: "motos", displayOrder: 2, active: true },
    { id: "interior", name: "Interior", slug: "interior", displayOrder: 3, active: true },
    { id: "motor", name: "Motor", slug: "motor", displayOrder: 4, active: true },
    { id: "pintura", name: "Pintura", slug: "pintura", displayOrder: 5, active: true },
    { id: "pacotes", name: "Pacotes", slug: "pacotes", displayOrder: 7, active: true },
    { id: "servicos-individuais", name: "Serviços Individuais", slug: "servicos-individuais", displayOrder: 8, active: true },
    { id: "cuidados-pintura", name: "Cuidados com a Pintura", slug: "cuidados-pintura", displayOrder: 9, active: true },
    { id: "cuidados-internos", name: "Cuidados Internos", slug: "cuidados-internos", displayOrder: 10, active: true },
    { id: "protecao-estetica", name: "Proteção e Estética", slug: "protecao-estetica", displayOrder: 11, active: true }
  ];

  console.log("Seeding categories...");
  for (const cat of categories) {
    await setDoc(doc(db, 'serviceCategories', cat.id), cat);
  }

  console.log("Seeding services...", CATALOG.length);
  for (const svc of CATALOG) {
    await setDoc(doc(db, 'services', svc.id), svc);
  }
  
  console.log("Done.");
}

seed().catch(console.error);
