import { addDoc, collection, deleteDoc, doc, getDocs, increment, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface Note {
  noteTitle: string;
  noteContent: string;
  notebookID?: string | null;
  userID: string;
}

export const fetchNotes = async (selectedNotebookId: string) => {
  const q = query(collection(db, 'notes'), where('notebookID', '==', selectedNotebookId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const createNote = async (note: Note, notebookId: string | null) => {
  try {
    const noteRef = await addDoc(collection(db, 'notes'), note);
    
    if (notebookId) {
      const notebookRef = doc(db, 'notebooks', notebookId);
      await updateDoc(notebookRef, { notesNum: increment(1) }); // Increases the number of notes from the notebook when added
    }

    return noteRef.id;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
};

export const updateNote = async (noteId: string, note: Note) => {
  try {
    await setDoc(doc(db, 'notes', noteId), note);
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

export async function deleteNote(noteId: string, notebookID: string | null) {
  try {
    const noteRef = doc(db, 'notes', noteId);
    await deleteDoc(noteRef);

    if (notebookID) {
      const notebookRef = doc(db, 'notebooks', notebookID);
      await updateDoc(notebookRef, { notesNum: increment(-1) }); // Decreases the number of notes from the notebook when deleted
    }

  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
}
}
