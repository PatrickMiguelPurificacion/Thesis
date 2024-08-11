import { addDoc, collection, deleteDoc, doc, setDoc, getDocs, query, where, writeBatch, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Notebook {
  notebookName: string;
  notesNum: number;
  userID: string;
  topic?: string;
}

export const fetchNotebooks = async (userEmail: string) => {
  const q = query(collection(db, 'notebooks'), where('userID', '==', userEmail));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
};

export const createLearnNotebookIfDoesntExist = async (userID: string, topic: string, notebook: Notebook): Promise<string> => {
  const d = await getDocs(query(
    collection(db, "notebooks"),
    where("userID", "==", userID),
    where("topic", "==", topic),
  ));

  if (d.docs.length === 0) return await addNotebook(notebook);
  return d.docs[0].id;
}

export const addNotebook = async (notebook: Notebook): Promise<string> => {
  try{
    const newdoc = await addDoc(collection(db, 'notebooks'), notebook);
    return newdoc.id;
  } catch (error) {
    console.error('Error creating notebook:', error);
    throw error;
  }
};

export const updateNotebook = async (notebookID: string, notebook: Notebook) => {
  try{
  await setDoc(doc(db, 'notebooks', notebookID), notebook);
  } catch (error) {
    console.error('Error updating notebook:', error);
    throw error;
  }
};

export const deleteNotebook = async (notebookID: string) => {
  try {
    //Start a batch to ensure that all deletions happen successfully, or none do for data integrity
    const batch = writeBatch(db);

    //Fetch all notes associated with the notebook
    const notesQuery = query(collection(db, 'notes'), where('notebookID', '==', notebookID));
    const notesSnapshot = await getDocs(notesQuery);

    //Delete each note in the batch
    notesSnapshot.forEach((noteDoc) => {
      batch.delete(doc(db, 'notes', noteDoc.id));
    });

    //Delete the notebook in the batch
    batch.delete(doc(db, 'notebooks', notebookID));

    //Commit the batch
    await batch.commit();

  } catch (error) {
    console.error('Error deleting notebook and its notes:', error);
    throw error;
  }
};
