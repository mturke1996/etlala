import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  DocumentData,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Client, Invoice, Payment, StandaloneDebt, Expense, ExpenseInvoice, DebtParty, Worker } from '../types';

// Generic CRUD operations
export class FirestoreService<T extends { id: string }> {
  constructor(private collectionName: string) {}

  // Get all documents (real-time listener)
  subscribe(callback: (data: T[]) => void, qConstraints: QueryConstraint[] = []) {
    const q = query(collection(db, this.collectionName), ...qConstraints);
    return onSnapshot(q, (snapshot) => {
      const raw = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];
      // Deduplicate by id to handle legacy mismatched IDs
      const deduped = [...new Map(raw.map(item => [item.id, item])).values()];
      callback(deduped);
    });
  }

  // Get all documents (one-time fetch)
  async getAll(qConstraints: QueryConstraint[] = []): Promise<T[]> {
    const q = query(collection(db, this.collectionName), ...qConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  }

  // Get single document
  async getById(id: string): Promise<T | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

  // Add document — uses setDoc with the provided id so Firestore doc ID matches app ID
  async add(data: any): Promise<string> {
    const id = data.id || crypto.randomUUID();
    const docRef = doc(db, this.collectionName, id);
    await setDoc(docRef, { ...data, id } as DocumentData);
    return id;
  }

  // Update document
  async update(id: string, data: Partial<T>): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      await setDoc(docRef, data as DocumentData, { merge: true });
    } else {
      // If doc doesn't exist by key, check if "id" field matches (Legacy ID support)
      const q = query(collection(db, this.collectionName), where('id', '==', id));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        const realRef = doc(db, this.collectionName, querySnap.docs[0].id);
        await setDoc(realRef, data as DocumentData, { merge: true });
      } else {
        // Fallback: create as is (or update if it magically appeared)
        await setDoc(docRef, data as DocumentData, { merge: true });
      }
    }
  }

  // Delete document
  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await deleteDoc(docRef);
    } else {
      // Retry lookup by internal ID
      const q = query(collection(db, this.collectionName), where('id', '==', id));
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        await deleteDoc(doc(db, this.collectionName, querySnap.docs[0].id));
      } else {
        // Try original ID anyway (might be cached local delete)
        await deleteDoc(docRef);
      }
    }
  }
}

// Export instances for each collection
export const clientsService = new FirestoreService<Client>('clients');
export const invoicesService = new FirestoreService<Invoice>('invoices');
export const paymentsService = new FirestoreService<Payment>('payments');
export const expensesService = new FirestoreService<Expense>('expenses');
export const standaloneDebtsService = new FirestoreService<StandaloneDebt>('standalone_debts');
export const debtPartiesService = new FirestoreService<DebtParty>('debt_parties');
export const expenseInvoicesService = new FirestoreService<ExpenseInvoice>('expense_invoices');
export const workersService = new FirestoreService<Worker>('workers');
