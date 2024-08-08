import { addDoc, collection, getDocs, query, where, deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export interface Highlighter {
  highlightedText: string;
  color: string;
  userID: string;
  topic: string;
  id?: string; // Optional if you need to track document IDs from Firestore
}

export const getHighlight = async (highlightID: string) => {
  const d = await getDoc(doc(db, "highlights", highlightID));
  return {...d.data(), id: d.id};
}

export const fetchHighlights = async (userID: string) => {
  const q = query(collection(db, 'highlights'), where('userID', '==', userID));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as unknown as Highlighter[];
};

export const createHighlight = async (highlight: Highlighter) => {
  try {
    const docRef = await addDoc(collection(db, 'highlights'), highlight);
    return docRef.id;
  } catch (error) {
    console.error('Error creating highlight:', error);
    throw error;
  }
};

export const deleteHighlight = async (highlightID: string) => {
  try {
    const highlightDocRef = doc(db, 'highlights', highlightID);
    await deleteDoc(highlightDocRef);
  } catch (error) {
    console.error('Error deleting highlight:', error);
    throw error;
  }
};
