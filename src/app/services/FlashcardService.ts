import { Timestamp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

interface Flashcard {
  cardQuestion: string;
  cardAnswer: string;
  deckID: string | null;
  userID: string;
  lastReviewTime: Date;
  nextReviewTime: Date;
  interval: number;
  easeFactor: number;
}

export const fetchFlashcards = async (deckId: string) => {
  const q = query(collection(db, 'flashcards'), where('deckID', '==', deckId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const fetchReviewFlashcards = async (deckId: string) => {
  // Get the current date and set to the beginning of the day
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to the beginning of the day

  //Get the date yesterday
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayTimestamp = Timestamp.fromDate(yesterday);

  //Get the date tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomTimestamp = Timestamp.fromDate(tomorrow);

  //Filter the Flashcards to show only those being Reviewed Today and the ones from previous dates
  const flashcardsQuery = query(
    collection(db, 'flashcards'),
    where('deckID', '==', deckId),
    where('nextReviewTime', '<', tomTimestamp) //Makes sure that the cards shown are those scheduled for today and the late reviews
  );

  const flashcardsSnapshot = await getDocs(flashcardsQuery);
  const flashcards = flashcardsSnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));

  console.log("Fetched flashcards:", flashcards);

  return flashcards;
};



export const createFlashcard = async (flashcard: Flashcard, deckId: string | null) => {
  try {
    const flashcardRef = await addDoc(collection(db, 'flashcards'), flashcard);
    
    if (deckId) {
      const deckRef = doc(db, 'decks', deckId);
      await updateDoc(deckRef, { cardNum: increment(1) }); // Increases the number of flashcards from the notebook when added
    }

    return flashcardRef.id;
  } catch (error) {
    console.error('Error creating flashcard:', error);
    throw error;
  }
};

export const updateFlashcard = async (flashcardId: string, flashcard: Flashcard) => {
  try {
    await setDoc(doc(db, 'flashcards', flashcardId), flashcard);
  } catch (error) {
    console.error('Error updating flashcard:', error);
    throw error;
  }
};


export async function deleteFlashcard(flashcardId: string, deckId: string | null) {
  try {
    const flashcardRef = doc(db, 'flashcards', flashcardId);
    await deleteDoc(flashcardRef);

    if (deckId) {
      const deckRef = doc(db, 'decks', deckId);
      await updateDoc(deckRef, { cardNum: increment(-1) }); // Decreases the number of flashcards from the deck when deleted
    }
    
  } catch (error) {
    console.error('Error deleting flashcard:', error);
    throw error;
}
}