import { db } from '@/lib/firebase';
import { collection, addDoc, query, onSnapshot, orderBy } from 'firebase/firestore';
import type { Expense } from '@/lib/types';
import type { FirebaseError } from 'firebase/app';

// The data sent to Firestore will not include the ID, as Firestore generates it.
type ExpenseData = Omit<Expense, 'id'>;

export async function addExpenseToDb(expenseData: ExpenseData): Promise<string> {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  try {
    const docRef = await addDoc(collection(db, "expenses"), expenseData);
    return docRef.id;
  } catch (e) {
    console.error("Error adding document: ", e);
    throw new Error("Could not add expense.");
  }
}

// This function will set up a real-time listener.
// It takes a callback function to update the React state.
export function subscribeToExpenses(callback: (expenses: Expense[]) => void, onError: (error: FirebaseError) => void) {
  if (!db) {
    console.warn("Firestore is not initialized, cannot subscribe to expenses.");
    return () => {}; // Return an empty unsubscribe function
  }
  
  const q = query(collection(db, "expenses"), orderBy("date", "desc"));
  
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as Expense);
    });
    callback(expenses);
  }, (error) => {
    console.error("Error fetching expenses: ", error);
    onError(error as FirebaseError);
  });

  return unsubscribe; // Return the unsubscribe function to be called on component unmount
}
