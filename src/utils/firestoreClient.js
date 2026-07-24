import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, where, getDocs, deleteDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { firebaseApp } from './firebaseConfig';

const db = getFirestore(firebaseApp);

export const addDocument = async (collectionName, data) => {
  try {
    const col = collection(db, collectionName);
    const docRef = await addDoc(col, data);
    return { id: docRef.id, ...data };
  } catch (err) {
    console.error('addDocument error', err);
    return null;
  }
};

export const listenToCollection = (collectionName, onUpdate, opts = {}) => {
  try {
    const col = collection(db, collectionName);
    const q = opts.orderBy ? query(col, orderBy(opts.direction || 'asc')) : col;
    const unsub = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      onUpdate(items);
    });
    return unsub;
  } catch (err) {
    console.error('listenToCollection error', err);
    return () => {};
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    const dref = doc(db, collectionName, id);
    await deleteDoc(dref);
    return true;
  } catch (err) {
    console.error('deleteDocument error', err);
    return false;
  }
};

export const updateDocument = async (collectionName, id, data) => {
  try {
    const dref = doc(db, collectionName, id);
    await updateDoc(dref, data);
    return true;
  } catch (err) {
    console.error('updateDocument error', err);
    return false;
  }
};

export const setDocument = async (collectionName, id, data) => {
  try {
    const dref = doc(db, collectionName, id);
    await setDoc(dref, data, { merge: true });
    return true;
  } catch (err) {
    console.error('setDocument error', err);
    return false;
  }
};

export const listenToDocument = (collectionName, id, onUpdate) => {
  try {
    const dref = doc(db, collectionName, id);
    const unsub = onSnapshot(dref, (snap) => {
      if (!snap.exists()) {
        onUpdate(null);
        return;
      }
      onUpdate({ id: snap.id, ...snap.data() });
    });
    return unsub;
  } catch (err) {
    console.error('listenToDocument error', err);
    return () => {};
  }
};

export const purgeOldDocuments = async (collectionName, olderThanMs) => {
  try {
    const cutoff = Date.now() - olderThanMs;
    const col = collection(db, collectionName);
    const q = query(col, where('createdAt', '<', cutoff));
    const snap = await getDocs(q);
    const deletes = [];
    snap.forEach((d) => deletes.push(deleteDoc(doc(db, collectionName, d.id))));
    await Promise.all(deletes);
    return deletes.length;
  } catch (err) {
    console.error('purgeOldDocuments error', err);
    return 0;
  }
};

export default db;
