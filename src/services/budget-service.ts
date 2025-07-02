import { db } from '@/lib/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import type { FirebaseError } from 'firebase/app';

const budgetDocRef = () => {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  // This points to a specific document "trip" in a "settings" collection
  return doc(db, "settings", "trip");
}

export function subscribeToBudget(callback: (budget: number) => void, onError: (error: FirebaseError) => void) {
  if (!db) {
    console.warn("Firestore is not initialized, cannot subscribe to budget.");
    return () => {}; // Return an empty unsubscribe function
  }
  
  const unsubscribe = onSnapshot(budgetDocRef(), (docSnap) => {
    if (docSnap.exists()) {
      // If the document exists, pass the totalBudget to the callback
      callback(docSnap.data().totalBudget || 0);
    } else {
      // If the document doesn't exist, create it with a default value.
      // This is useful for the first time the app is run.
      const defaultBudget = 100000;
      console.log("Budget document not found, creating with default value:", defaultBudget);
      updateBudget(defaultBudget);
      callback(defaultBudget);
    }
  }, (error) => {
    console.error("Error fetching budget: ", error);
    onError(error as FirebaseError);
  });

  return unsubscribe;
}

export async function updateBudget(newBudget: number): Promise<void> {
  if (!db) {
    throw new Error("Firestore is not initialized.");
  }
  try {
    // Using setDoc with merge: true will create the document if it doesn't exist,
    // or update the totalBudget field if it does.
    await setDoc(budgetDocRef(), { totalBudget: newBudget }, { merge: true });
  } catch (e) {
    console.error("Error updating budget: ", e);
    throw new Error("Could not update budget.");
  }
}
