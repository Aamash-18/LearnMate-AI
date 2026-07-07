import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import flashcardService from "../../services/flashcardService";
import Spinner from "../../components/common/Spinner";
import FlashCardListCard from "../../components/flashcards/FlashCardListCard";

const FlashCardListPage = () => {
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcardSets();
  }, []);

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response = await flashcardService.getAllFlashcardSets();
      setFlashcardSets(response.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to load flashcard sets");
      console.error("Error fetching flashcard sets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudyNow = (documentId, setId) => {
    if (!documentId) {
      toast.error("Unable to open flashcard set");
      return;
    }
    navigate(`/documents/${documentId}/flashcards?set=${setId}`);
  };

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            All Flashcard Sets
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review all generated flashcards across your documents.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-white border border-slate-200 p-10 shadow-sm">
          <Spinner />
        </div>
      ) : flashcardSets.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 shadow-sm">
          <p className="text-lg font-medium">
            No flashcard sets available yet.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Generate flashcards from a document to begin studying.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {flashcardSets.map((set) => (
            <FlashCardListCard
              key={set._id}
              flashcardSet={set}
              onStudy={handleStudyNow}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashCardListPage;
