"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import NavBar from '../components/NavBar';
import { toast } from 'sonner';
import { Highlighter, createHighlight, fetchHighlights, deleteHighlight } from '../services/HighlightService';
import { redirect } from 'next/navigation';

const topics = [
  'Introduction',
  'Foundations of Cryptology',
  'Cipher Methods',
  'Cryptographic Algorithms',
  'Cryptographic Tools',
  'Protocols for Secure Communications',
  'Attacks on Cryptosystems',
  'Chapter Summary'
];

const highlightColors = ['yellow', '#ff5733', 'lightblue', 'lightgreen', 'pink'];

export default function Learn() {
  const { data: session, status } = useSession({
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

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserHighlights(session.user.email);
    }
  }, [session]);

  // Fetch the highlights of the user
  const fetchUserHighlights = async (userID: string) => {
    try {
      const fetchedHighlights = await fetchHighlights(userID);
      setHighlights(fetchedHighlights);

      // Filter highlights based on the selected topic
      filterHighlights(selectedTopic, fetchedHighlights);

      return fetchedHighlights;

    } catch (error) {
      console.error('Error fetching highlights:', error);
      toast.error('Failed to fetch highlights');
    }
  };

  // Handle topic selection and load the chapter contents
  const handleTopicSelection = async (topic: string) => {
    setSelectedTopic(topic);
    const contents = await loadChapterContents(topic);
    setChapterContents(contents);

    // Filter highlights based on the selected topic
    filterHighlights(topic, highlights);
  };

  // Load chapter contents and optionally apply updated highlights
  const loadChapterContents = async (topic: string, updatedHighlights?: Highlighter[]) => {
    try {
      const response = await fetch(`/api/getContent?topic=${encodeURIComponent(topic)}`);
      if (response.ok) {
        const contents = await response.text();

        // Use the provided highlights or filter the current highlights for the topic
        const filtered = updatedHighlights ?? highlights.filter(highlight => highlight.topic === topic);
        return formatContent(contents, filtered);

      } else {
        toast.error('Failed to load chapter contents');
        return '';
      }
    } catch (error) {
      console.error('Error loading chapter contents:', error);
      toast.error('Failed to load chapter contents');
      return '';
    }
  };

  // Format the chapter content and apply highlights
const formatContent = (content: string, highlights: Highlighter[]) => {
  // Replace single newlines with <br> and double newlines with <br><br>
  const paragraphs = content.split('\n\n').map(paragraph => {
    // Replace single newlines with <br> and preserve multiple spaces
    const lines = paragraph.split('\n').map(line => line.replace(/ {2}/g, '&nbsp;&nbsp;')).join('<br>');
    return `<p>${lines}</p>`;
  }).join('<br><br>');
  
  return highlightContents(paragraphs, highlights);
  };

  // Handle text selection and show color picker for highlighting
  const handleHighlightAndNote = () => {
    const selection = window.getSelection();
    if (selection) {
      const selectedText = selection.toString().trim();
      if (selectedText) {
        // Set the selected text details
        setSelectionDetails({ selection, text: selectedText });

        // Show the color picker for highlighting
        setShowColorPicker(true);
      }
    }
  };

  // Apply the selected highlight color to the selected text
  const applyHighlight = async (color: string) => {
    const { text } = selectionDetails;
    try {
      // Create a new highlight object
      const newHighlight: Highlighter = {
        highlightedText: text,
        color,
        topic: selectedTopic,
        userID: session?.user?.email || ''
      };

      // Save the new highlight to the database
      await createHighlight(newHighlight);
      toast.success('Highlight added successfully');

      // Refresh the highlights after saving
      fetchUserHighlights(newHighlight.userID);

      // Hide the color picker
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error saving highlight:', error);
      toast.error('Failed to save highlight');
    }
  };

  // Handle highlight deletion with confirmation
  const handleDeleteHighlight = async (highlightID: string) => {
    const confirmDeletion = window.confirm('Are you sure you want to delete this highlight?');
    if (confirmDeletion) {
      try {
        // Delete the highlight from the database
        await deleteHighlight(highlightID);
        toast.success('Highlight deleted successfully');

        // Fetch updated highlights after deletion
        const updatedHighlights = await fetchUserHighlights(session?.user?.email || '');

        // Reload the chapter contents with the updated highlights list
        setChapterContents(await loadChapterContents(selectedTopic, updatedHighlights));
      } catch (error) {
        console.error('Error deleting highlight:', error);
        toast.error('Failed to delete highlight');
      }
    }
  };

  // Filter highlights for the selected topic
  const filterHighlights = async (topic: string, allHighlights: Highlighter[]) => {
    // Filter highlights based on the selected topic
    const filtered = allHighlights.filter((highlight) => highlight.topic === topic);
    setFilteredHighlights(filtered);

    // Update chapter contents to include highlights
    if (selectedTopic === topic) {
      const contents = await loadChapterContents(topic);
      setChapterContents(highlightContents(contents, filtered));
    }
  };

  // Function to escape special characters in the highlighted text
const escapeRegExp = (string: string) => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Function to apply highlights to the chapter contents
const highlightContents = (contents: string, highlights: Highlighter[]) => {
  highlights.forEach(highlight => {
    // Escape special characters in the highlighted text to ensure proper regex matching
    const escapedHighlight = escapeRegExp(highlight.highlightedText);

    // Create a regex to find the exact match of the highlighted text (case insensitive)
    const regex = new RegExp(`(${escapedHighlight})`, 'gi');

    // Replace the matched text with a span containing the background color for highlighting
    contents = contents.replace(regex, `<span style="background-color: ${highlight.color};">$1</span>`);
  });

  // Return the content with applied highlights
  return contents;
};



  return (
    <div className="flex h-screen bg-gray-100">
      <NavBar/>

      <div className="flex-grow p-8">
        <header className="text-white py-6 px-8" style={{ backgroundColor: '#142059' }}>
          <h1 className="text-2xl font-semibold text-center">Cryptography</h1>
        </header>

        <div className="flex">
          <div className="w-1/3 pr-4 border-r border-gray-300">
            <div className="mt-4 max-h-96 overflow-y-auto">
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

          <div className="w-2/3 pl-4 max-h-96 overflow-y-auto">
            {selectedTopic ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold mt-4">{selectedTopic}</h2>
                </div>
                <div
                  id="chapter-content"
                  className="mt-4 bg-white p-4 border rounded-md"
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
              </>
            ) : (
              <div className="text-center text-gray-500 mt-4">
                <p>Please choose a topic to learn</p>
              </div>
            )}
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
                className="mt-4 px-4 py-2 bg-gray-300 rounded-md"
                onClick={() => setShowColorPicker(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
