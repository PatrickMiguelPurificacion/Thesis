'use client';

import { query, collection, where, getDocs, getDoc, doc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import NavBar from "../components/NavBar";

const CrammingPage = () => {
    const router = useRouter();
    const session = useSession({
      required: true,
      onUnauthenticated() {
        redirect('/signin');
      },
    });
  
    const searchParams = useSearchParams();
    const cramDeckID = searchParams ? searchParams.get('deckId') : null; // For getting the ID of the deck from the passed url

    const [flashcardsArray, setFlashcardsArray] = useState<{ [key: string]: any }[]>([]); // Placing the flashcards in an array
    const [deckName, setDeckName] = useState(''); // For the deckname in the display on top
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    // Function to handle showing the answer
    const handleShowAnswer = () => {
        setShowAnswer(true);
    };

    // Function to handle moving to the next flashcard
    const handleNextCard = () => {
        setCurrentCardIndex((prevIndex) => Math.min(prevIndex + 1, flashcardsArray.length - 1));
        setShowAnswer(false);
    };

    // Function to handle moving to the previous flashcard
    const handlePrevCard = () => {
        setCurrentCardIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        setShowAnswer(false);
    };

    useEffect(() => {
        const fetchFlashcards = async () => {
          if (cramDeckID) {
            const q = query(
              collection(db, 'flashcards'),
              where('deckID', '==', cramDeckID)
            );
            const querySnapshot = await getDocs(q);
            const flashcardsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setFlashcardsArray(flashcardsData);
          }
        };
        fetchFlashcards();
    
        // Fetch deck name
        const fetchDeckName = async () => {
          if (cramDeckID) {
            const deckSnapshot = await getDoc(doc(db, 'decks', cramDeckID));
            const deckData = deckSnapshot.data();
            if (deckData) {
              setDeckName(deckData.deckName);
            }
          }
        };
        fetchDeckName();
      }, [session]);
    
      console.log('flashcardsArray:', flashcardsArray);

    return(
      <div className="flex h-screen">
      <NavBar userEmail={session?.data?.user?.email} />

      <div className="flex-grow bg-gray-100 p-8">
      <header className="bg-indigo-600 text-white py-6 px-8">
        <h1 className="text-2xl font-semibold text-center">Cramming Page for {deckName}</h1>
      </header>
      
      <div className="flex-grow flex justify-center items-center">
      <div className="flex flex-wrap mt-4">
        <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-6">
          {/* Display flashcard question or answer */}
          <div className="flashcard mb-4">
          <h3 className="font-semibold text-lg">{flashcardsArray[currentCardIndex]?.cardQuestion}</h3> {/* Increased font size */}
          {showAnswer && <p className="text-lg">{flashcardsArray[currentCardIndex]?.cardAnswer}</p>} {/* Increased font size */}
          </div>
      
          {/* Buttons for navigation */}
          <div className="flex justify-between">
            <button onClick={handlePrevCard} disabled={currentCardIndex === 0} className="btn">Back</button>
            <button onClick={handleShowAnswer} className="btn">Show Answer</button>
            <button onClick={handleNextCard} disabled={currentCardIndex === flashcardsArray.length - 1} className="btn">Next</button>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
    );
};

export default CrammingPage;