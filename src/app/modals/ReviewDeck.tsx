import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  onCramming: () => void;
  onReviewing: () => void;
}

const ReviewModal: React.FC<ModalProps> = ({ open, onClose, onCramming, onReviewing }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
      <div className="bg-white p-10 rounded-lg relative">
        <button className="absolute top-0 right-0 m-2 p-2 rounded-full hover:bg-gray-200" onClick={onClose}>
          X
        </button>
        <h2 className="text-lg font-semibold mb-4">Choose an Option</h2>
        <div className="flex justify-center">
          <button
            className="mr-6 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              onCramming();
              onClose();
            }}
          >
            Cramming
          </button>
          <button
            className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => {
              onReviewing();
              onClose();
            }}
          >
            Repetition
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
