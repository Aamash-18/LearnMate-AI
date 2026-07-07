import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ArrowLeft, Star, ChevronRight, ChevronLeft } from "lucide-react";
import flashcardService from "../../services/flashcardService";
import aiService from "../../services/aiService";
import Spinner from "../common/Spinner";
import FlashCardListCard from "./FlashCardListCard";

const FlashCardTab = ({ documentId }) => {
  const [loading, setLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [viewingSetId, setViewingSetId] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTogglingStarLoading, setIsTogglingStarLoading] = useState(false);

  useEffect(() => {
    if (!documentId) return;
    fetchSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  const fetchSets = async () => {
    setLoading(true);
    try {
      const resp = await flashcardService.getFlashcardsForDocument(documentId);
      // service may return data directly or wrapped, handle both
      const sets = resp?.data || resp || [];
      setFlashcardSets(Array.isArray(sets) ? sets : []);
    } catch (err) {
      console.error("Failed to fetch flashcards:", err);
      toast.error(err?.message || "Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!documentId) return;
    setIsGenerating(true);
    try {
      await aiService.generateFlashcards(documentId, {});
      toast.success("Flashcards generated successfully!");
      await fetchSets();
    } catch (err) {
      console.error("Generate flashcards error:", err);
      toast.error(err?.message || "Failed to generate flashcards");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSet = (setId) => {
    setViewingSetId(setId);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const handleBackToList = () => {
    setViewingSetId(null);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  const selectedSet = flashcardSets.find((s) => s._id === viewingSetId) || null;
  const currentCard = selectedSet?.cards?.[currentCardIndex] || null;
  const progress = selectedSet?.cards?.length
    ? ((currentCardIndex + 1) / selectedSet.cards.length) * 100
    : 0;

  const handleFlip = () => setIsFlipped((p) => !p);

  const handleNext = async () => {
    if (!selectedSet) return;
    if (currentCardIndex >= selectedSet.cards.length - 1) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, currentCardIndex);
    } catch (err) {
      console.error("review error:", err);
    }
    setCurrentCardIndex((p) => p + 1);
    setIsFlipped(false);
  };

  const handlePrev = async () => {
    if (!selectedSet) return;
    if (currentCardIndex <= 0) return;
    try {
      await flashcardService.reviewFlashcard(currentCard._id, currentCardIndex);
    } catch (err) {
      console.error("review error:", err);
    }
    setCurrentCardIndex((p) => p - 1);
    setIsFlipped(false);
  };

  const handleToggleStar = async (cardId) => {
    if (!selectedSet) return;
    setIsTogglingStarLoading(true);
    try {
      const res = await flashcardService.toggleStar(cardId);
      const isNowStarred = res?.isStarred ?? !currentCard?.isStarred;
      const updated = flashcardSets.map((set) => {
        if (set._id !== selectedSet._id) return set;
        return {
          ...set,
          cards: set.cards.map((c) =>
            c._id === cardId ? { ...c, isStarred: isNowStarred } : c,
          ),
        };
      });
      setFlashcardSets(updated);
      toast.success(
        isNowStarred ? "Added to favorites!" : "Removed from favorites!",
      );
    } catch (err) {
      console.error("toggle star error:", err);
      toast.error(err?.message || "Failed to toggle favorite");
    } finally {
      setIsTogglingStarLoading(false);
    }
  };

  if (loading)
    return (
      <div className="py-8">
        <Spinner />
      </div>
    );

  // No sets view
  if (!flashcardSets || flashcardSets.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mb-6">
          <div className="mx-auto mb-4 w-16 h-16 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
            {/* simple icon */}
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C13.1046 2 14 2.89543 14 4C14 5.10457 13.1046 6 12 6C10.8954 6 10 5.10457 10 4C10 2.89543 10.8954 2 12 2Z"
                fill="#059669"
              />
              <path
                d="M6 10C7.65685 10 9 8.65685 9 7C9 5.34315 7.65685 4 6 4C4.34315 4 3 5.34315 3 7C3 8.65685 4.34315 10 6 10Z"
                fill="#34D399"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold">No Flashcards Yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Generate flashcards from your document to start learning and
            reinforce your knowledge.
          </p>
        </div>
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-600 text-white shadow hover:brightness-95"
          >
            {isGenerating ? "Generating..." : "Generate Flashcards"}
          </button>
        </div>
      </div>
    );
  }

  // If a set is selected for viewing show viewer
  if (viewingSetId && selectedSet) {
    if (!selectedSet.cards || selectedSet.cards.length === 0) {
      return (
        <div className="py-6">
          <button
            onClick={handleBackToList}
            className="text-slate-500 hover:text-slate-700 mb-4 inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Flashcards
          </button>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
            No cards in this set
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBackToList}
              className="text-slate-500 hover:text-slate-700 inline-flex items-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Flashcards
            </button>
            <h2 className="mt-3 text-xl font-semibold text-slate-900">
              {selectedSet.title}
            </h2>
            <p className="text-sm text-slate-500">
              {selectedSet.cards.length} cards
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-4 bg-slate-50 px-3 py-2 rounded-lg">
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">
              {currentCardIndex + 1} / {selectedSet.cards.length}
            </p>
          </div>

          <div className="mt-6 flex items-center justify-center perspective">
            <div className="relative w-full max-w-2xl">
              <button
                type="button"
                onClick={() => handleToggleStar(currentCard._id)}
                disabled={isTogglingStarLoading}
                className="absolute top-4 right-4 z-10 bg-white p-2 rounded-full shadow"
                title={
                  currentCard.isStarred
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Star
                  size={16}
                  className={
                    currentCard.isStarred
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-slate-400"
                  }
                />
              </button>

              <div
                onClick={handleFlip}
                className="w-full h-auto min-h-[200px] md:min-h-[192px] cursor-pointer relative transition-transform duration-500"
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                }}
              >
                <div
                  className="absolute w-full h-full bg-emerald-600 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center shadow-md border border-emerald-700"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-center px-4">
                    <p className="text-xs font-semibold text-emerald-200 uppercase tracking-widest mb-1.5">
                      Question
                    </p>
                    <h3 className="text-base md:text-xl font-bold text-white leading-relaxed break-words whitespace-normal">
                      {currentCard.question}
                    </h3>
                    <p className="text-emerald-200 text-xs mt-3 opacity-90">
                      Click to reveal answer
                    </p>
                  </div>
                </div>
                <div
                  className="absolute w-full h-full bg-teal-600 rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center shadow-md border border-teal-700"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center px-4">
                    <p className="text-xs font-semibold text-teal-200 uppercase tracking-widest mb-1.5">
                      Answer
                    </p>
                    <h3 className="text-base md:text-xl font-bold text-white leading-relaxed break-words whitespace-normal">
                      {currentCard.answer}
                    </h3>
                    <p className="text-teal-200 text-xs mt-3 opacity-90">
                      Click to see question
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 bg-black/20 text-white px-2.5 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
                {currentCardIndex + 1} / {selectedSet.cards.length}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentCardIndex === 0}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg"
            >
              ← Previous
            </button>
            <div className="text-sm text-slate-500">
              Use arrows or click to navigate
            </div>
            <button
              onClick={handleNext}
              disabled={currentCardIndex === selectedSet.cards.length - 1}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // List of sets view
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Your Flashcard Sets</h3>
          <p className="text-sm text-slate-500">
            {flashcardSets.length} set{flashcardSets.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>
        <div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-emerald-600 text-white rounded-full shadow"
          >
            {isGenerating ? "Generating..." : "+ Generate New Set"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flashcardSets.map((set) => (
          <div
            key={set._id}
            onClick={() => handleSelectSet(set._id)}
            className="cursor-pointer"
          >
            <FlashCardListCard
              flashcardSet={set}
              onStudy={() => handleSelectSet(set._id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FlashCardTab;
