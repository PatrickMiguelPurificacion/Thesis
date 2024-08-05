'use client';

import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "../firebase";
import { fetchReviewFlashcards, updateFlashcard } from "../services/FlashcardService";
import { getDoc, doc } from "firebase/firestore";
import { FaTimes } from "react-icons/fa";

const ReviewingPage = () => (
<Suspense>
  <ReviewingPageActual />
</Suspense>
);

const ReviewingPageActual = () => {
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
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const getFlashcards = async () => {
      if (cramDeckID) {
        try {
          const flashcards = await fetchReviewFlashcards(cramDeckID, session?.data?.user?.email!);
          console.log("Flashcards in component:", flashcards);
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


  const handleRateDifficulty = async (difficulty: string) => {
    const flashcard = flashcardsArray[currentCardIndex];

    // Sets default data of easeFactor and interval based on Anki Algorithm
    let easeFactor = flashcard.data[session?.data?.user?.email!] == null
      ? 2.5 : flashcard.data[session?.data?.user?.email!].easeFactor;
    let interval = flashcard.data[session?.data?.user?.email!] == null
      ? 1 : flashcard.data[session?.data?.user?.email!].interval;

    // Handles spaced repetition formula based on Anki
    switch (difficulty) {

        /*
        Ease Bonus = 1.3 (Anki Default)
        Ease Factor = 2.5 (Anki Default)
        Interval = 1 Day (Anki Default)
        */

        case 'easy':
          easeFactor = Math.max(1.3, easeFactor + 0.15);
          interval *= easeFactor * 1.3;
          break;
        case 'good':
          interval *= easeFactor;
          break;
        case 'hard':
          easeFactor = Math.max(1.3, easeFactor - 0.15);
          interval *= 1.2 //hard interval;
          break;
        case 'again':
          interval = 10 / (24 * 60); // 10 minutes converted to days
          easeFactor = Math.max(1.3, easeFactor - 0.2);
          break;
        default:
          break;
      }

    // Apply fuzz factor
    const fuzzPercentage = 0.05; // 5% fuzz
    const fuzz = (Math.random() * 2 - 1) * fuzzPercentage * interval; // Random value between -5% and +5% of interval
    interval += fuzz;

    const now = new Date();

    // Converts interval to milliseconds
    const intervalInMilliseconds = interval * 24 * 3600 * 1000;

    // Calculates next Review Time by adding time now and the milliseconds of the new interval
    const nextReviewTime = new Date(now.getTime() + intervalInMilliseconds);

    // Updates review time in Flashcard
    const updatedFlashcard = { ...flashcard };
    updatedFlashcard.data[session?.data?.user?.email!] = {
      lastReviewTime: now,
      nextReviewTime,
      interval,
      easeFactor,
    };

    try {
      await updateFlashcard(flashcard.id, updatedFlashcard);
      console.log("Review Updated on Flashcard: ", flashcard.id);
      toast.success('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Error updating review');
    }

    handleNextCard(); // Goes to the next card to review
  };

  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex(prevIndex => Math.min(prevIndex + 1, flashcardsArray.length - 1));
  };

  const handleShowAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  const handleStopReviewing = () => {
    router.push(`/flashcards?deckId=${cramDeckID}`);  
  };

  return (
    <div className="flex flex-col h-screen justify-center items-center bg-blue-100 p-4 md:p-8 flex-grow overflow-y-auto">
      <div className="max-w-4xl w-full bg-blue-500 text-white rounded-lg shadow-lg p-6 flex-1 mt-6 mb-6 relative">
        <header className="text-center mb-4">
          <h1 className="text-2xl font-semibold mt-6 py-6 mb-6">Reviewing {deckName}</h1>
          <button onClick={handleStopReviewing} className="absolute top-2 right-2 bg-blue-700 hover:bg-blue-600 text-white px-4 py-2 rounded">
            <FaTimes size={20} />
          </button>
        </header>

        <div className="flex justify-center items-center w-full mt-4 py-6">
          {flashcardsArray.length === 0 ? (
            <p className="text-center text-gray-600">There are No Scheduled Reviews Today</p>
          ) : (
            <div className="flashcard mb-4 mt-6 py-4 text-center">
              <h3 className="font-semibold text-lg mx-6">{flashcardsArray[currentCardIndex]?.cardQuestion}</h3>
              {showAnswer && (
                <p className="font-bold text-xl text-white mt-5 mx-6">{flashcardsArray[currentCardIndex]?.cardAnswer}</p>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row justify-center py-6 mt-6 space-y-4 md:space-y-0 md:space-x-4">
          <button onClick={() => handleRateDifficulty('easy')} className="difficulty-btn bg-green-500 hover:bg-green-600 py-2 px-4 rounded">Easy</button>
          <button onClick={() => handleRateDifficulty('good')} className="difficulty-btn bg-yellow-500 hover:bg-yellow-600 py-2 px-4 rounded">Good</button>
          <button onClick={() => handleRateDifficulty('hard')} className="difficulty-btn bg-red-500 hover:bg-red-600 py-2 px-4 rounded">Hard</button>
          <button onClick={() => handleRateDifficulty('again')} className="difficulty-btn bg-purple-500 hover:bg-purple-600 py-2 px-4 rounded">Again</button>
          <button onClick={handleShowAnswer} className="show-answer-btn bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded">
            {showAnswer ? 'Hide Answer' : 'Show Answer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewingPage;
