import { FaEdit, FaTrash } from "react-icons/fa";

export default function Deck({
  deck,
  handleDelete,
  handleEditDeck,
  handleReview,
  isAdmin,
}: any) {
  return (
    <div
      key={deck.id}
      className="w-full relative"
    >
      <div
        className="w-full h-full rounded py-16 text-gray-700 relative flex flex-col justify-between"
        style={{ backgroundColor: deck.deckColor }}
      >

      <div className="mt-auto">
        <div className="w-full text-sm text-white bg-opacity-70 bg-gray-800 px-4 pt-2 mt-4 flex items-center justify-between">
          <button
            onClick={() => handleDelete(deck.id)}
            className={`text-white hover:bg-gray-800 py-2 px-2 rounded-md ${(deck.global && isAdmin) || (!deck.global) ? '' : 'opacity-0 pointer-events-none'}`}
          >
            <FaTrash />
          </button>
          <button
            onClick={() => handleEditDeck(deck)}
            className={`text-white hover:bg-gray-800 py-2 px-2 rounded-md ml-auto ${(deck.global && isAdmin) || (!deck.global) ? '' : 'opacity-0 pointer-events-none'}`}
          >
            <FaEdit />
          </button>
        </div>
        <button
          onClick={() => handleReview(deck.id)}
          className="w-full text-sm text-white bg-opacity-70 bg-gray-800 hover:bg-gray-800 py-2 px-4 mb-6 flex flex-col items-center"
        >
          <p className="text-center text-base text-white">{deck.deckName}</p>
          <p className="text-center text-xs text-white mt-1 pb-4">Number of Cards: {deck.cardNum}</p>
        </button>
      </div>
      </div>
    </div>
  );
}