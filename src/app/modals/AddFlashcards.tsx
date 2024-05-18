import { addDoc, collection, doc, increment, updateDoc } from 'firebase/firestore';
import { useSession } from 'next-auth/react';
import React, { useState } from 'react'
import { db } from '../firebase';
import { toast } from 'sonner';

interface Props {
  setAddCardModalState: (arg0: boolean) => void;
  deckId: string | null; // Make deckId prop accept string or null
}

const AddFlashcardModal = ({ setAddCardModalState, deckId }: Props) => {
  
  const [newFlashcard, setFlashcard] = useState({cardQuestion:'', cardAnswer:'', deckID: deckId, userID:''});
  
  const { data: session} = useSession();
  
  const addFlashcard = async () => {
    try {
      // Add flashcard to Firestore
      const flashcardRef = await addDoc(collection(db, 'flashcards'), {
        cardQuestion: newFlashcard.cardQuestion.trim(),
        cardAnswer: newFlashcard.cardAnswer.trim(),
        deckID: newFlashcard.deckID,
        userID: session?.user?.email,
        lastReviewTime: new Date(), //Initial value for lastReviewTime
        interval: 1, //Initial value for interval
        easeFactor: 2.5, //Initial value for easeFactor
      });
  
      // Check if deckId is not null before updating cardNum
      if (deckId) {
        // Update cardNum in the corresponding deck document
        const deckRef = doc(db, 'decks', deckId); // Reference to the deck document
        await updateDoc(deckRef, {
          cardNum: increment(1), // Increment cardNum by 1
        });
      }
  
      setAddCardModalState(false);
      toast.success('Flashcard Created Successfully!');
      
    } catch (error: any) {
      console.error('Error creating flashcard:', error.message);
      toast.error('Error creating Flashcard');
    }
  };
  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
       <div className="relative bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-xl">
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Flashcard Question
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="question" 
            type="text" 
            onChange={(e) => setFlashcard({...newFlashcard, cardQuestion: e.target.value})}
            placeholder="Your Flashcard's Question" required/>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Flashcard Answer
          </label>
          <input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="answer" 
            type="text" 
            onChange={(e) => setFlashcard({...newFlashcard, cardAnswer: e.target.value})}
            placeholder="Your Flashcard's Answer" required/>
        </div>

        <div className="flex justify-between">
          <button onClick={() => setAddCardModalState(false)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Cancel
          </button>
          <button onClick={async () => {await addFlashcard(); toast.success('Flashcard Created Successfully!');}} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            Create
          </button>
        </div>

      </div>
    </div>
  )
}

export default AddFlashcardModal;
