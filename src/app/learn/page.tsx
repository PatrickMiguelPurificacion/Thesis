"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import NavBar from '../components/NavBar';
import { toast } from 'sonner';
import { Highlighter, createHighlight, fetchHighlights, deleteHighlight } from '../services/HighlightService';

const topics = [
  'Introduction',
  'Foundations of Cryptology',
  'Terminology',
  'Cipher Methods',
  'Cryptographic Algorithms',
  'Cryptographic Tools',
  'Protocols for Secure Communications',
  'Attacks on Cryptosystems',
  'Selected Readings',
  'Chapter Summary',
  'Review Questions',
  'Exercises',
  'Case Exercises',
  'Endnotes'
];

const highlightColors = ['yellow', '#ff5733', 'lightblue', 'lightgreen', 'pink'];

export default function Learn() {
  const session = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/signin');
    },
  });

  const [selectedTopic, setSelectedTopic] = useState('');
  const [chapterContents, setChapterContents] = useState('');
  const [highlights, setHighlights] = useState<Highlighter[]>([]);
  const [filteredHighlights, setFilteredHighlights] = useState<Highlighter[]>([]);
  const [selectionDetails, setSelectionDetails] = useState<{ selection: Selection | null, text: string }>({ selection: null, text: '' });
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [highlightToDelete, setHighlightToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (session.data?.user?.email) {
      fetchUserHighlights(session.data.user.email);
    }
  }, [session]);

  const fetchUserHighlights = async (userID: string) => {
    try {
      const fetchedHighlights = await fetchHighlights(userID);
      setHighlights(fetchedHighlights);
      filterHighlights(selectedTopic, fetchedHighlights);
    } catch (error) {
      console.error('Error fetching highlights:', error);
      toast.error('Failed to fetch highlights');
    }
  };

  const handleTopicSelection = async (topic: string) => {
    setSelectedTopic(topic);
    const contents = await loadChapterContents(topic);
    setChapterContents(contents);
    filterHighlights(topic, highlights);
  };

  const loadChapterContents = async (topic: string) => {
    let contents = `Contents of ${topic}`;
    const filtered = highlights.filter(highlight => highlight.topic === topic);
    return highlightContents(contents, filtered);
  };

  const handleHighlightAndNote = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString().trim();
      if (selectedText) {
        setSelectionDetails({ selection, text: selectedText });
        setShowColorPicker(true);
      }
    }
  };

  const applyHighlight = async (color: string) => {
    const { text } = selectionDetails;
    try {
      const newHighlight: Highlighter = {
        highlightedText: text,
        color,
        topic: selectedTopic,
        userID: session.data?.user?.email || ''
      };
      await createHighlight(newHighlight);
      toast.success('Highlight added successfully');
      fetchUserHighlights(newHighlight.userID); // Refresh highlights after saving
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error saving highlight:', error);
      toast.error('Failed to save highlight');
    }
  };

  const handleDeleteHighlight = async (highlightID: string) => {
    setHighlightToDelete(highlightID);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteHighlight = async () => {
    if (highlightToDelete) {
      try {
        await deleteHighlight(highlightToDelete);
        toast.success('Highlight deleted successfully');
        fetchUserHighlights(session.data?.user?.email || '');
        setShowDeleteConfirmation(false);
      } catch (error) {
        console.error('Error deleting highlight:', error);
        toast.error('Failed to delete highlight');
      }
    }
  };

  const filterHighlights = (topic: string, allHighlights: Highlighter[]) => {
    const filtered = allHighlights.filter((highlight) => highlight.topic === topic);
    setFilteredHighlights(filtered);

    // Update chapter contents to include highlights
    if (selectedTopic === topic) {
      setChapterContents(loadChapterContentsWithHighlights(`Contents of ${topic}`, filtered));
    }
  };

  const loadChapterContentsWithHighlights = (contents: string, highlights: Highlighter[]) => {
    return highlightContents(contents, highlights);
  };

  const highlightContents = (contents: string, highlights: Highlighter[]) => {
    highlights.forEach(highlight => {
      const regex = new RegExp(`(${highlight.highlightedText})`, 'gi');
      contents = contents.replace(regex, `<span style="background-color: ${highlight.color};">$1</span>`);
    });
    return contents;
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar userEmail={session?.data?.user?.email} />

      <div className="flex-grow p-8">
        <header className="text-white py-6 px-8" style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold text-center">Cryptography</h1>
        </header>

        <div className="flex max-h-96 overflow-y-auto">
          <div className="w-1/3 pr-4 border-r border-gray-300">
            <div className="mt-4">
              {topics.map((topic) => (
                <div key={topic} className="mb-4">
                  <div
                    className={`cursor-pointer p-4 ${
                      selectedTopic === topic ? 'bg-blue-200' : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    onClick={() => handleTopicSelection(topic)}
                  >
                    <p className="text-lg font-semibold">{topic}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-2/3 pl-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{selectedTopic}</h2>
            </div>

            <div
              id="chapter-content"
              className="mt-4 max-h-96 overflow-y-auto bg-white p-4 border rounded-md"
              onMouseUp={handleHighlightAndNote}
              dangerouslySetInnerHTML={{ __html: chapterContents }}
            ></div>

            <div className="mt-4">
              <h3 className="text-lg font-semibold">Highlights</h3>
              <ul>
                {filteredHighlights.map((highlight, index) => (
                  <li key={index} className="mb-2 flex justify-between items-center">
                    <span style={{ backgroundColor: highlight.color }} className="px-1 rounded-md">
                      {highlight.highlightedText}
                    </span>
                    <button
                      className="ml-2 text-red-500"
                      onClick={() => handleDeleteHighlight(highlight.id || '')}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {showColorPicker && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-lg">
              <h3 className="mb-4">Select Highlight Color</h3>
              <div className="flex space-x-4">
                {highlightColors.map((color) => (
                  <div
                    key={color}
                    className={`w-8 h-8 cursor-pointer`}
                    style={{ backgroundColor: color }}
                    onClick={() => applyHighlight(color)}
                  ></div>
                ))}
              </div>
              <button
                className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md"
                onClick={() => setShowColorPicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {showDeleteConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white p-4 rounded-md shadow-lg">
              <h3 className="mb-4">Are you sure you want to delete this highlight?</h3>
              <div className="flex space-x-4">
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-md"
                  onClick={confirmDeleteHighlight}
                >
                  Yes
                </button>
                <button
                  className="px-4 py-2 bg-gray-500 text-white rounded-md"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    );
  }

Learn.requireAuth = true;
