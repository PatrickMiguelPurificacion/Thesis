import { addDoc, collection } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'
import { db } from '../firebase';
import { toast } from 'sonner';

const AddNotebookModal = (props: { setAddNotebookModalState: (arg0: boolean) => void }) => {
  
  const [newNotebook, setNotebook] = useState({notebookName: '', notesNum:0, userID:''});
  
  const { data: session, status } = useSession();
  
  const addNotebook = async () => {

    //Add user details to Firestore
    try{ 
      await addDoc(collection(db, 'notebooks'), {
        notebookName: newNotebook.notebookName.trim(),
        notesNum: newNotebook.notesNum,
        userID: session?.user?.email,
      });

      props.setAddNotebookModalState(false);

    } catch (error:any) {
      console.error('Error creating notebook:', error.message);
      // Handle error
      toast.error('Error creating Notebook');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
       <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Notebook Name
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="username" 
            type="text" 
            onChange={(e) => setNotebook({...newNotebook, notebookName: e.target.value})}
            placeholder="Name of Your Notebook" required/>
        </div>
          
        <div className="flex justify-between">
          <button onClick={() => props.setAddNotebookModalState(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancel
          </button>
          <button onClick={async () => {await addNotebook(); toast.success('Notebook Created Successfully!');}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Create
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddNotebookModal;
