  'use client';

  import { useSearchParams } from 'next/navigation';
  import { useSession } from 'next-auth/react';
  import { redirect } from 'next/navigation';
  import { useState, useEffect, useCallback } from 'react';
  import { useRouter } from 'next/navigation';

  import { getDoc, doc } from 'firebase/firestore';
  import { db } from '../firebase';

  import NavBar from '../components/NavBar';
  import FlashcardModal from '../modals/FlashcardModal';
  import ReviewModal from '../modals/ReviewDeck';
  import { deleteFlashcard, fetchFlashcards } from '../services/FlashcardService';
  import { FaEdit, FaTrash } from 'react-icons/fa';
  import { toast } from 'sonner';

  const FlashcardsPage = () => {
    const router = useRouter();
    const session = useSession({
      required: true,
      onUnauthenticated() {
        redirect('/signin');
      },
    });

    const searchParams = useSearchParams();
    const currentDeckID = searchParams ? searchParams.get('deckId') : null;
    const [flashcardsArray, setFlashcardsArray] = useState<{ [key: string]: any }[]>([]);
    const [flashcardModalState, setFlashcardModalState] = useState(false);
    const [currentFlashcard, setCurrentFlashcard] = useState<any | null>(null);
    const [deckName, setDeckName] = useState('');
    const [isGlobal, setIsGlobal] = useState(true);

    const [reviewModalState, setReviewModalState] = useState(false);
    const [deckIDToReview, setDeckIDToReview] = useState('');

    const handleReview = (deckId: string) => {
      setDeckIDToReview(deckId);
      setReviewModalState(true);
    };

    const handleCramming = () => {
      router.push(`/flashcards-cramming?deckId=${deckIDToReview}`);
      setReviewModalState(false);
    };

    const handleReviewing = () => {
      router.push(`/flashcards-reviewing?deckId=${deckIDToReview}`);
      setReviewModalState(false);
    };

    const getFlashcards = useCallback(async () => {
      if (currentDeckID) {
        try {
          const flashcards = await fetchFlashcards(currentDeckID);
          setFlashcardsArray(flashcards);
        } catch (error) {
          console.error('Error fetching flashcards:', error);
          toast.error('Error Fetching Flashcards');
        }
      }
    }, [currentDeckID]);

    useEffect(() => {
      getFlashcards();

      const fetchDeckName = async () => {
        if (currentDeckID) {
          const deckSnapshot = await getDoc(doc(db, 'decks', currentDeckID));
          const deckData = deckSnapshot.data();
          if (deckData) {
            setDeckName(deckData.deckName);
            setIsGlobal(deckData.global === true);
          }
        }
      };
      fetchDeckName();
    }, [session, currentDeckID, getFlashcards]);

    const handleAddFlashcard = () => {
      setCurrentFlashcard(null);
      setFlashcardModalState(true);
    };

    const handleEditFlashcard = (flashcard: any) => {
      setCurrentFlashcard(flashcard);
      setFlashcardModalState(true);
    };

    const handleDeleteFlashcard = async (flashcardId: string) => {
      const confirmation = window.confirm('Are you sure you want to delete this flashcard?');
      if (confirmation) {
        try {
          await deleteFlashcard(flashcardId, currentDeckID);
          setFlashcardsArray((prevFlashcards) => prevFlashcards.filter((flashcard) => flashcard.id !== flashcardId));
          console.log('Flashcard deleted successfully');
        } catch (error) {
          console.error('Error deleting flashcard:', error);
        }
      }
    };

    const handleModalClose = () => {
      setFlashcardModalState(false);
      getFlashcards(); // Refresh flashcards after closing the modal
    };

    const backButton = () => (
      <button
        onClick={() => router.push('/flashcard-decks')}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Back to Decks
      </button>
    );

    const headerText = () => (
      <h1 className="text-2xl font-semibold text-center">{deckName}</h1>
    );

    const reviewButton = () => (
      <button
        onClick={() => currentDeckID && handleReview(currentDeckID)}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Review Cards
      </button>
    );

    return (
      <div className="flex h-screen">
        <NavBar />
        <div className="flex-grow overflow-y-auto bg-gray-100 p-8">
          <header className="hidden md:flex justify-between items-center text-white py-6 px-8 bg-[#142059]">
            {backButton()}
            {headerText()}
            {reviewButton()}
          </header>

          <header className="flex md:hidden flex-col justify-between items-stretch text-white py-6 px-8 bg-[#142059]">
            <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-center items-center mb-4">
              {backButton()}
              {reviewButton()}
            </div>
            {headerText()}
          </header>

          <div>
            {reviewModalState && (
              <ReviewModal
                open={reviewModalState}
                onClose={() => setReviewModalState(false)}
                onCramming={handleCramming}
                onReviewing={handleReviewing}
              />
            )}
          </div>

          {((isGlobal && session?.data?.snapshot?.admin)
            || !isGlobal)
            && <button
              className="disabled:opacity-40 flex w-full justify-center rounded-md bg-blue-500 mt-3 px-3 py-1.5 text-sm font-semibold leading-6 text-white hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
              onClick={handleAddFlashcard}
            >
              Add New Flashcard
            </button>
          }

          <div>
            {flashcardModalState && (
              <FlashcardModal
                setModalState={handleModalClose} // Use handleModalClose to refresh flashcards after closing the modal
                initialFlashcard={currentFlashcard}
                cardID={currentFlashcard?.id || null}
                reviewID={currentFlashcard?.reviewID || null}
                deckId={currentDeckID}
              />
            )}
          </div>

          <div className="mt-4">
            {flashcardsArray.length === 0 ? (
              <p className="text-center text-gray-600 mt-6 py-20">There are No Flashcards in this Deck</p>
            ) : (
              flashcardsArray.map((flashcard) => (
                <div key={flashcard.id} className="w-full mb-4 border rounded-md overflow-hidden shadow-md">
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-semibold mb-2">{flashcard.cardQuestion}</h3>
                    <p className="text-gray-600">{flashcard.cardAnswer}</p>
                    {((isGlobal && session?.data?.snapshot?.admin) || !isGlobal) && <div className="flex justify-end mt-2">
                      <button
                        className="text-gray-500 hover:text-gray-800"
                        onClick={() => handleEditFlashcard(flashcard)}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="ml-5 text-gray-500 hover:text-gray-800"
                        onClick={() => handleDeleteFlashcard(flashcard.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  export default FlashcardsPage;
