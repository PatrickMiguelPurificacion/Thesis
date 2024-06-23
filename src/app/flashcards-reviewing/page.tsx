'use client';

import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { db } from "../firebase";
import NavBar from "../components/NavBar";
import { fetchReviewFlashcards, updateFlashcard } from "../services/FlashcardService";
import { getDoc, doc } from "firebase/firestore";

const ReviewingPage = () => {
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
          const flashcards = await fetchReviewFlashcards(cramDeckID);
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

  useEffect(() => {
    const revealAnswerTimer = setTimeout(() => {
      setShowAnswer(true);
    }, 30000); // 30 seconds

    return () => clearTimeout(revealAnswerTimer);
  }, [currentCardIndex]);

  const handleRateDifficulty = async (difficulty: string) => {
    const flashcard = flashcardsArray[currentCardIndex];
    let { easeFactor, interval } = flashcard;

    switch (difficulty) {
      case 'easy':
        easeFactor = Math.max(1.3, easeFactor + 0.2);
        interval *= easeFactor;
        break;
      case 'good':
        interval *= easeFactor;
        break;
      case 'hard':
        easeFactor = Math.max(1.3, easeFactor - 0.2);
        interval *= easeFactor;
        break;
      case 'again':
        interval = 1;
        break;
      default:
        break;
    }

    const now = new Date();
    const intervalInMilliseconds = interval * 24 * 3600 * 1000;
    const nextReviewTime = new Date(now.getTime() + intervalInMilliseconds);

    const updatedFlashcard = {
      ...flashcard,
      lastReviewTime: now,
      nextReviewTime,
      interval,
      easeFactor,
    };

    try {
      await updateFlashcard(flashcard.id, updatedFlashcard);
      toast.success('Review updated successfully!');
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error('Error updating review');
    }

    handleNextCard();
  };

  const handleNextCard = () => {
    setShowAnswer(false);
    setCurrentCardIndex(prevIndex => Math.min(prevIndex + 1, flashcardsArray.length - 1));
  };

  return (
    <div className="flex h-screen">
      <NavBar userEmail={session?.data?.user?.email} />
      <div className="flex-grow bg-gray-100 p-8">
        <header className="bg-indigo-600 text-white py-6 px-8">
          <h1 className="text-2xl font-semibold text-center">Reviewing {deckName}</h1>
        </header>

        <div className="flex justify-center items-center">
          <div className="flex flex-wrap mt-4">
            <div className="max-w-xl w-full bg-white rounded-lg shadow-lg p-6">
              {flashcardsArray.length === 0 ? (
                <p className="text-center text-gray-600">There are No Scheduled Reviews Today</p>
              ) : (
                <>
                  <div className="flashcard mb-4">
                    <h3 className="font-semibold">{flashcardsArray[currentCardIndex]?.cardQuestion}</h3>
                    {showAnswer && (
                      <p className="text-gray-600">{flashcardsArray[currentCardIndex]?.cardAnswer}</p>
                    )}
                  </div>
                  <div className="flex justify-center">
                    <button onClick={() => handleRateDifficulty('easy')} className="difficulty-btn bg-green-500 hover:bg-green-600 mr-2">Easy</button>
                    <button onClick={() => handleRateDifficulty('good')} className="difficulty-btn bg-blue-500 hover:bg-blue-600 mr-2">Good</button>
                    <button onClick={() => handleRateDifficulty('hard')} className="difficulty-btn bg-yellow-500 hover:bg-yellow-600 mr-2">Hard</button>
                    <button onClick={() => handleRateDifficulty('again')} className="difficulty-btn bg-red-500 hover:bg-red-600">Again</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewingPage;
