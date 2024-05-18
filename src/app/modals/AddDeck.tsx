import { addDoc, collection } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'
import { db } from '../firebase';
import { toast } from 'sonner';

const Modal = (props: { setModalState: (arg0: boolean) => void }) => {
  
  const [selectedColor, setSelectedColor] = useState(""); //State to store selected color
  const [newDeck, setDeck] = useState({deckName: '', deckColor:'', cardNum:0, userID:''});
  
  function colorSelected(element: { value: string }) {
    setSelectedColor(element.value); //Update selected color state
  }

  const { data: session, status } = useSession();
  
  const addDeck = async () => {

    //Add user details to Firestore
    try{ 
      await addDoc(collection(db, 'decks'), {
        deckName: newDeck.deckName.trim(),
        deckColor: newDeck.deckColor.trim(),
        cardNum: newDeck.cardNum,
        userID: session?.user?.email,
      });

      props.setModalState(false);

    } catch (error:any) {
      console.error('Error creating deck:', error.message);
      // Handle error
      toast.error('Error creating Deck');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
       <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Deck Name
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="username" 
            type="text" 
            onChange={(e) => setDeck({...newDeck, deckName: e.target.value})}
            placeholder="Name of Your Deck" required/>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Pick a Color
          </label>
          <input className="shadow appearance-none rounded w-full" 
            id="password" 
            type="color"
            value={selectedColor}
            onChange={async (e) => {await colorSelected(e.target); setDeck({...newDeck, deckColor: e.target.value})}}/>
        </div>
          
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Sample Deck
          </label>      
        </div>
        <div className="block text-sm mb-2"
          style={{ backgroundColor: selectedColor, padding: '1rem', borderRadius: '0.5rem', textAlign:'center' }}>
          Your Custom Colored Deck
        </div><br/>

        <div className="flex justify-between">
          <button onClick={() => props.setModalState(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancel
          </button>
          <button onClick={async () => {await addDeck(); toast.success('Deck Created Successfully!');}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Create
          </button>
        </div>

      </div>
    </div>
  )
}

export default Modal;
