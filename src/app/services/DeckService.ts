import { addDoc, collection, deleteDoc, doc, setDoc, getDocs, query, where, writeBatch, or } from 'firebase/firestore';
import { db } from '../firebase';

interface Deck {
  deckName: string;
  cardNum: number;
  deckColor: string;
  userID: string;
  global: boolean;
}

export const fetchDecks = async (userEmail: string | null) => {
  const q = query(collection(db, 'decks'), or(
    where('userID', '==', userEmail),
    where('global', '==', true),
  ));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const addDeck = async (deck: Deck) => {
  try{
  await addDoc(collection(db, 'decks'), deck);
  } catch (error) {
    console.error('Error creating deck:', error);
    throw error;
  }
};

export const updateDeck = async (deckID: string, deck: Deck) => {
  try{
  await setDoc(doc(db, 'decks', deckID), deck);
  } catch (error) {
    console.error('Error updating deck:', error);
    throw error;
  }
};

export const deleteDeck = async (deckID: string) => {
  try {
    // Initialize a batch
    const batch = writeBatch(db);

    // Query flashcards collection for flashcards with the given deckID
    const flashcardsQuery = query(collection(db, 'flashcards'), where('deckID', '==', deckID));
    const flashcardsSnapshot = await getDocs(flashcardsQuery);

    // Add delete operations for each flashcard to the batch
    flashcardsSnapshot.forEach((cardDoc) => {
      batch.delete(doc(db, 'flashcards', cardDoc.id))
    });

    // Add delete operation for the deck to the batch
    batch.delete(doc(db, 'decks', deckID));

    // Commit the batch
    await batch.commit();
  } catch (error) {
    console.error('Error deleting deck and its flashcards:', error);
    throw error;
  }
};
