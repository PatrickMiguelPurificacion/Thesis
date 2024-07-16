'use client';

import { doc, getDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { FaAngleLeft, FaAngleRight, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { db } from "../firebase";
import { fetchFlashcards } from "../services/FlashcardService";

const CrammingPage = () => (
  <Suspense>
    <CrammingPageActual />
  </Suspense>
);

const CrammingPageActual = () => {
  const router = useRouter();
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const searchParams = useSearchParams();
  const cramDeckID = searchParams ? searchParams.get('deckId') : null;

  const [flashcardsArray, setFlashcardsArray] = useState<any[]>([]);
  const [deckName, setDeckName] = useState('');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [answerShown, setAnswerShown] = useState(false);

  useEffect(() => {
    const getFlashcards = async () => {
      if (cramDeckID) {
        try {
          const flashcards = await fetchFlashcards(cramDeckID);
          setFlashcardsArray(flashcards);
        } catch (error) {
          console.error('Error fetching flashcards:', error);
          toast.error('Error Fetching Flashcards');
        }
      }
    };

    const fetchDeckName = async () => {
      if (cramDeckID) {
        const deckSnapshot = await getDoc(doc(db, 'decks', cramDeckID));
        const deckData = deckSnapshot.data();
        if (deckData) {
          setDeckName(deckData.deckName);
        }
      }
    };

    getFlashcards();
    fetchDeckName();
  }, [session, cramDeckID]);

  const toggleAnswer = () => {
    setAnswerShown(!answerShown);
  };

  const handleNextCard = () => {
    setCurrentCardIndex(prevIndex => Math.min(prevIndex + 1, flashcardsArray.length - 1));
    setAnswerShown(false);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex(prevIndex => Math.max(prevIndex - 1, 0));
    setAnswerShown(false);
  };

  const handleStopReviewing = () => {
    router.push(`/flashcards?deckId=${cramDeckID}`);
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-blue-100 flex-grow overflow-y-auto overflow-x-auto p-4 md:p-8">
      
      <div className="max-w-4xl w-full bg-blue-500 text-white rounded-lg shadow-lg p-6 flex-1 mt-6 mb-6 relative">
        <header className="text-center mb-4">
          <h1 className="text-2xl font-semibold mt-6 py-6 mb-6">Cramming {deckName}</h1>
          <button onClick={handleStopReviewing} className="absolute top-2 right-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded">
            <FaTimes size={20} />
          </button>
        </header>

        <div className="flex justify-between mt-6 py-6">
          <button onClick={handlePrevCard} disabled={currentCardIndex === 0} className="btn hover:bg-blue-600 hover:text-white"><FaAngleLeft size={40} /></button>
          <div className="flashcard mb-4 mt-6 py-4">
            <h3 className="font-semibold text-lg text-center mx-6">{flashcardsArray[currentCardIndex]?.cardQuestion}</h3>
            {answerShown && <p className="font-bold text-xl text-center mt-4 mx-6">{flashcardsArray[currentCardIndex]?.cardAnswer}</p>}
          </div>
          <button onClick={handleNextCard} disabled={currentCardIndex === flashcardsArray.length - 1} className="btn hover:bg-blue-600 hover:text-white"><FaAngleRight size={40} /></button>
        </div>

        <div className="flex justify-center mb-6">
          <button onClick={toggleAnswer} className="bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded mt-4">
            {answerShown ? 'Hide Answer' : 'Show Answer'}
          </button>
        </div>
      </div>

    </div>
  );
};

export default CrammingPage;
