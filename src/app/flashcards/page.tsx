'use client';

//Next.js and React.js 
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import {useRouter} from 'next/navigation';

//Firebase
import { query, collection, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

//Components
import NavBar from '../components/NavBar';
import AddFlashcardModal from '../components/AddFlashcards';
import ReviewModal from '../components/ReviewDeck';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const FlashcardsPage = () => {
  const router = useRouter();
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const searchParams = useSearchParams();
  const addDeckID = searchParams ? searchParams.get('deckId') : null; // For getting the ID of the deck from the passed url
  const [flashcardsArray, setFlashcardsArray] = useState<{ [key: string]: any }[]>([]); // Placing the flashcards in an array
  const [addCardModalState, setAddCardModalState] = useState(false); // For showing the modal or not
  const [deckName, setDeckName] = useState(''); // For the deckname in the display on top

  //For Deck Review
  const [reviewModalState, setReviewModalState] = useState(false);
  const [deckIDToReview, setDeckIDToReview] = useState('');

    // Function to handle deck selection and open the modal
    const handleReview = (deckId: string) => {
      setDeckIDToReview(deckId);
      setReviewModalState(true);
    };

    // Function to handle choosing Cramming
    const handleCramming = () => {
      router.push(`/flashcards-cramming?deckId=${deckIDToReview}`);
      setReviewModalState(false);
    };

    // Function to handle choosing Reviewing
    const handleReviewing = () => {
      router.push(`/flashcards-reviewing?deckId=${deckIDToReview}`);
      setReviewModalState(false);
    };

  useEffect(() => {
    const fetchFlashcards = async () => {
      if (addDeckID) {
        const q = query(
          collection(db, 'flashcards'),
          where('deckID', '==', addDeckID)
        );
        const querySnapshot = await getDocs(q);
        const flashcardsData = querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setFlashcardsArray(flashcardsData);
      }
    };
    fetchFlashcards();

    // Fetch deck name
    const fetchDeckName = async () => {
      if (addDeckID) {
        const deckSnapshot = await getDoc(doc(db, 'decks', addDeckID));
        const deckData = deckSnapshot.data();
        if (deckData) {
          setDeckName(deckData.deckName);
        }
      }
    };
    fetchDeckName();
  }, [session]);

  console.log('flashcardsArray:', flashcardsArray);

    return (
      <div className="flex h-screen">
      <NavBar userEmail={session?.data?.user?.email} />
      <div className="flex-grow bg-gray-100 p-8">
        <header className="bg-indigo-600 text-white py-6 px-8 flex justify-between items-center">
          <div>
            <button
              onClick={() => router.push('/flashcard-decks')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Back to Decks
            </button>
          </div>
          <h1 className="text-2xl font-semibold text-center">{deckName}</h1>
          <div>
            <button
              onClick={() => addDeckID && handleReview(addDeckID)}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Review Cards
            </button>
          </div>
        </header>

        <div>
        {/* Render the ReviewModal with the appropriate props */}
        {reviewModalState && 
        <ReviewModal open={reviewModalState} onClose={() => setReviewModalState(false)} onCramming={handleCramming} onReviewing={handleReviewing} />}
        </div>

          <button
            className="disabled:opacity-40 flex w-full justify-center rounded-md bg-violet-800 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
            onClick={() => setAddCardModalState(true)}
          >
            Add New Flashcard
          </button>

          <div>
            {addCardModalState && (
              <AddFlashcardModal setAddCardModalState={setAddCardModalState} deckId={addDeckID} />
            )}
          </div>

          {/* Displaying the Flashcards in a card-like format */}
          <div className="mt-4 max-h-96 overflow-y-auto">
            {flashcardsArray.map((flashcard) => (
              <div key={flashcard.id} className="w-full mb-4 border rounded-md overflow-hidden shadow-md">
                <div className="p-4 bg-white">
                  <h3 className="text-lg font-semibold mb-2">{flashcard.cardQuestion}</h3>
                  <p className="text-gray-600">{flashcard.cardAnswer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

export default FlashcardsPage;
