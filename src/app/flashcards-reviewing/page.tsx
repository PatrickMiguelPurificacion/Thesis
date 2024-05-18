'use client';

import { query, collection, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { useSession } from "next-auth/react";
import { redirect, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../firebase";
import NavBar from "../components/NavBar";

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

    const [flashcardsArray, setFlashcardsArray] = useState<{
      id: string;
      cardQuestion: any;
      cardAnswer: any; // Added cardAnswer to the state
      lastReviewTime: Date;
      interval: number;
      easeFactor: number;
    }[]>([]);    
    const [deckName, setDeckName] = useState('');
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false); // State to control whether to show the answer or not

    useEffect(() => {
        const fetchFlashcards = async () => {
            if (cramDeckID) {
                const q = query(
                    collection(db, 'flashcards'),
                    where('deckID', '==', cramDeckID)
                );
                const querySnapshot = await getDocs(q);
                const flashcardsData = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  cardQuestion: doc.data().cardQuestion,
                  cardAnswer: doc.data().cardAnswer, // Fetch cardAnswer from Firestore
                  lastReviewTime: new Date(),
                  interval: 1,
                  easeFactor: 2.5
                }));
                setFlashcardsArray(flashcardsData);
            }
        };
        fetchFlashcards();

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

    useEffect(() => {
        // Set a timer to reveal the answer after 30 seconds
        const revealAnswerTimer = setTimeout(() => {
            setShowAnswer(true);
        }, 30000); // 30 seconds

        // Clear the timer when the component unmounts or when the flashcard changes
        return () => clearTimeout(revealAnswerTimer);
    }, [currentCardIndex]);

    const handleRateDifficulty = async (difficulty: string) => {
        const flashcard = flashcardsArray[currentCardIndex];
        let easeFactor = flashcard.easeFactor;
        let interval = flashcard.interval;
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
        const nextReviewTime = new Date(Date.now() + interval * 24 * 3600 * 1000); // Convert interval to milliseconds
        await updateDoc(doc(db, 'flashcards', flashcard.id), { interval, easeFactor, lastReviewTime: nextReviewTime });
        handleNextCard();
    };

    const handleNextCard = () => {
        setShowAnswer(false); // Reset showAnswer state when moving to the next flashcard
        setCurrentCardIndex((prevIndex) => Math.min(prevIndex + 1, flashcardsArray.length - 1));
    };

    const handlePrevCard = () => {
        setShowAnswer(false); // Reset showAnswer state when moving to the previous flashcard
        setCurrentCardIndex((prevIndex) => Math.max(prevIndex - 1, 0));
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
                    {/* Display flashcard question */}
                    <div className="flashcard mb-4">
                        <h3 className="font-semibold">{flashcardsArray[currentCardIndex]?.cardQuestion}</h3>
                        {showAnswer && (
                        <p className="text-gray-600">{flashcardsArray[currentCardIndex]?.cardAnswer}</p>
                        )}
                    </div>
                    {/* Buttons for rating difficulty */}
                    <div className="flex justify-center">
                        <button onClick={() => handleRateDifficulty('easy')} className="difficulty-btn bg-green-500 hover:bg-green-600 mr-2">Easy</button>
                        <button onClick={() => handleRateDifficulty('good')} className="difficulty-btn bg-blue-500 hover:bg-blue-600 mr-2">Good</button>
                        <button onClick={() => handleRateDifficulty('hard')} className="difficulty-btn bg-yellow-500 hover:bg-yellow-600 mr-2">Hard</button>
                        <button onClick={() => handleRateDifficulty('again')} className="difficulty-btn bg-red-500 hover:bg-red-600">Again</button>
                    </div>
                    </div>
                </div>
                </div>
        </div>
        </div>
    );
};

export default ReviewingPage;
