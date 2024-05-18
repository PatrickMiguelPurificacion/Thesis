'use client';

//Next.js and React
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

//Components
import NavBar from '../components/NavBar';

//Modals
import AddNotebookModal from '../modals/AddNotebook';
import EditNotebookModal from '../modals/EditNotebook';
import AddNoteModal from '../modals/AddNotes';

//Firebase
import { getDocs, collection, query, where, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';

//Notifications
import { toast } from 'sonner';
import EditNoteModal from '../modals/EditNotes';

export default function Notebook() {
  //Ensures user is in session
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const router = useRouter();

  //Adding Notebook
  const [notebooksArray, setNotebooksArray] = useState<{ [key: string]: any }[]>([]); //Stores notebooks retrieved from database
  const [addNotebookModalState, setAddNotebookModalState] = useState(false);
  const [selectedNotebookId, setSelectedNotebookId] = useState('');

  useEffect(() => {
    const getNotebooks = async () => {
      if (session.data?.user?.email) {
        const q = query(collection(db, 'notebooks'), where('userID', '==', session.data?.user?.email));
        const querySnapshot = await getDocs(q);
        const notebooks = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setNotebooksArray(notebooks);
      }
    };
    getNotebooks();
  }, [session]);

  // Function to handle notebook selection and view notes inside
  const handleViewNotes = (notebookId: string) => {
    setSelectedNotebookId(notebookId);
  };

  //Editing Notebook
  const [editNotebookID, setEditNotebookID] = useState(''); //Holds ID of notebook being edited
  const [editModalState, setEditModalState] = useState(false); // State to manage edit modal visibility

  //Holds the details of the notebook being edited
  const [editNotebookDetails, setEditNotebookDetails] = useState<{ notebookName: string; notesNum: number; userID: string }>({
    //Prepares the notebook details to hold the new details
    notebookName: '',
    notesNum: 0,
    userID: '',
  });

  //Sets the details needed to be passed to the Edit Notebook modal
  const handleEdit = (notebookId: string) => {
    const notebook = notebooksArray.find((notebook) => notebook.id === notebookId); //Finds the notebook with the same notebookID passed
    if (notebook) {
      const { notebookName, notesNum, userID } = notebook; //Places the existing notebook's details in notebook
      setEditNotebookDetails({ notebookName, notesNum, userID }); // Passes the details of notebook being edited
      setEditModalState(true); //Displayes Edit AddNotebookModal
      setEditNotebookID(notebookId); //Sets ID of notebook to be edited
    } else {
      console.error('Error: Notebook not found');
    }
  };

  //Function for Deleting the Document based on the notebookID
  const handleDelete = async (notebookId: string) => {
    const confirmation = window.confirm('Are you sure you want to delete this notebook?');
    if (confirmation) {
      try {
        await deleteDoc(doc(db, 'notebooks', notebookId));
        setNotebooksArray(notebooksArray.filter((notebook) => notebook.id !== notebookId));
        toast.success('Notebook Deleted Successfully!');
      } catch (error) {
        console.error('Error deleting notebook:', error);
        toast.error('Error deleting Notebook');
      }
    }
  };




  //For Notes
  const [addNoteModalState, setAddNoteModalState] = useState(false);
  const [notesArray, setNotesArray] = useState<{ [key: string]: any }[]>([]); // Placing the notes in an array

  //Gets the Note Data from the Database and stores them in an array
  useEffect(() => {
    const fetchNotes = async () => {
      if (selectedNotebookId) {
        const q = query(collection(db, 'notes'), where('notebookID', '==', selectedNotebookId));
        const querySnapshot = await getDocs(q);
        const notesData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setNotesArray(notesData);
      }
    };
    fetchNotes();
  }, [selectedNotebookId]);

  //Editing Notebook
  const [editNoteID, setEditNoteID] = useState(''); //Holds ID of note being edited
  const [editNoteModalState, setEditNoteModalState] = useState(false); // State to manage note edit modal visibility

  //Holds the details of the note being edited
  const [editNoteDetails, setEditNoteDetails] = useState<{ noteTitle: string; noteContent: string; notebookID: string, userID: string }>({
    //Prepares the notebook details to hold the new details
    noteTitle: '',
    noteContent: '',
    notebookID: '',
    userID: '',
  });

  //Sets the details needed to be passed to the Edit Notebook modal
  const handleNoteEdit = (noteId: string) => {
    const note = notesArray.find((note) => note.id === noteId); //Finds the note with the same noteID passed
    if (note) {
      const { noteTitle, noteContent, notebookID, userID } = note; //Places the existing note's details in note variable
      setEditNoteDetails({ noteTitle, noteContent, notebookID, userID }); // Passes the details of note being edited
      setEditNoteModalState(true); //Displayes EditNoteModal
      setEditNoteID(noteId); //Sets ID of note to be edited
    } else {
      console.error('Error: Note not found');
    }
  };

  //Function for Deleting the Document based on the noteID
  const handleNoteDelete = async (noteId: string) => {
    const confirmation = window.confirm('Are you sure you want to delete this note?');
    if (confirmation) {
      try {
        const noteDocRef = doc(db, 'notes', noteId);
        const noteDoc = await getDoc(noteDocRef);
        
        if (!noteDoc.exists()) {
          toast.error('Note not found');
          return;
        }
  
        const notebookId = noteDoc.data().notebookID;
        const notebookDocRef = doc(db, 'notebooks', notebookId);
  
        await runTransaction(db, async (transaction) => {
          const notebookDoc = await transaction.get(notebookDocRef);
  
          if (!notebookDoc.exists()) {
            throw new Error('Notebook does not exist!');
          }
  
          const newNotesNum = notebookDoc.data().notesNum - 1;
          transaction.update(notebookDocRef, { notesNum: newNotesNum });
          transaction.delete(noteDocRef);
        });
  
        setNotesArray(notesArray.filter((note) => note.id !== noteId));
        toast.success('Note Deleted Successfully!');
      } catch (error) {
        console.error('Error deleting note:', error);
        toast.error('Error deleting Note');
      }
    }
  };
  


  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar userEmail={session?.data?.user?.email} />

      <div className="flex-grow p-8">
        <header className="text-white py-6 px-8" style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold text-center">Notebooks</h1>
        </header>

        {/* This is for the Notebook Section of the Page */}
        <div className="flex">
          <div className="w-1/3 pr-4 border-r border-gray-300">
            <div className="mt-4">
              {notebooksArray.map((notebook) => (
                <div key={notebook.id} className="mb-4">
                  <div
                    className={`cursor-pointer p-4 ${
                      selectedNotebookId === notebook.id ? 'bg-blue-200' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleViewNotes(notebook.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-lg font-semibold">{notebook.notebookName}</p>
                      <div className="space-x-2">
                        <button onClick={() => handleEdit(notebook.id)} className="text-gray-500 hover:text-gray-800">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleDelete(notebook.id)} className="text-gray-500 hover:text-gray-800">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">Count: {notebook.notesNum}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-auto">
              <button
                className="disabled:opacity-40 w-full justify-center rounded-md px-3 py-1.5 text-sm font-semibold leading-6 text-white bg-blue-500 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                onClick={() => setAddNotebookModalState(true)}
              >
                Add New Notebook
              </button>
              {addNotebookModalState && <AddNotebookModal setAddNotebookModalState={setAddNotebookModalState} />}
            </div>
          </div>

          {/* This is for the Notes Section of the Page */}
          <div className="w-2/3 pl-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Notes</h2>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => setAddNoteModalState(true)}
              >
                Add New Note
              </button>
            </div>
            {/* Render Notes section here based on selectedNotebookId */}
            {addNoteModalState && (
              <AddNoteModal setAddNoteModalState={setAddNoteModalState} notebookId={selectedNotebookId} />
            )}

            {/* Displaying the Notes on one side of the screen */}
            <div className="mt-4 max-h-96 overflow-y-auto">
              {notesArray.map((note) => (
                <div key={note.id} className="w-full mb-4 border rounded-md overflow-hidden shadow-md">
                  <div className="p-4 bg-yellow-200">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold mb-2">{note.noteTitle}</h3>
                      <div className="space-x-2">
                        <button onClick={() => handleNoteEdit(note.id)} className="text-gray-500 hover:text-gray-800">
                          <FaEdit />
                        </button>
                        <button onClick={() => handleNoteDelete(note.id)} className="text-gray-500 hover:text-gray-800">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">{note.noteContent}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {editModalState && (
          <EditNotebookModal
            setEditModalState={setEditModalState}
            notebookDetails={editNotebookDetails}
            notebookID={editNotebookID}
          />
        )}

        {editNoteModalState && (
          <EditNoteModal
            setEditNoteModalState={setEditNoteModalState}
            noteDetails={editNoteDetails}
            noteID={editNoteID}
          />
        )}
      </div>
    </div>
  );
}

Notebook.requireAuth = true;
