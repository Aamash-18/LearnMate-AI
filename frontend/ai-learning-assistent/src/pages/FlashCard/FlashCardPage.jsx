import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Star, ChevronRight, ChevronLeft } from "lucide-react";
import flashcardService from "../../services/flashcardService";
import Spinner from "../../components/common/Spinner";
import Button from "../../components/common/Button";

const FlashCardPage = () => {
  const { id: documentId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setId = searchParams.get("set");

  const [loading, setLoading] = useState(true);
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingStar, setIsTogglingStar] = useState(false);

  useEffect(() => {
    fetchFlashcardSets();
  }, [documentId, setId]);

  const fetchFlashcardSets = async () => {
    setLoading(true);
    try {
      const response =
        await flashcardService.getFlashcardsForDocument(documentId);
      const sets = response.data || [];
      setFlashcardSets(sets);
      const selected = setId ? sets.find((set) => set._id === setId) : sets[0];
      setSelectedSet(selected || null);
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (error) {
      toast.error(error.message || "Failed to load flashcards");
      console.error("Error fetching flashcards:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSet = async () => {
    if (!selectedSet) return;
    setIsDeleting(true);
    try {
      await flashcardService.deleteFlashcardSet(selectedSet._id);
      toast.success("Flashcard set deleted successfully.");
      navigate("/flashcards");
    } catch (error) {
      toast.error(error.message || "Failed to delete flashcard set");
      console.error("Error deleting flashcard set:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFlip = async () => {
    const willFlipTo = !isFlipped;
    setIsFlipped(willFlipTo);
    const current = selectedSet?.cards[currentCardIndex];
    if (willFlipTo && current && (current.reviewCount || 0) === 0) {
      await reviewCurrentCard();
    }
  };

  const handleNext = async () => {
    if (!selectedSet || currentCardIndex >= selectedSet.cards.length - 1)
      return;
    const current = selectedSet.cards[currentCardIndex];
    if (!current) return;
    if ((current.reviewCount || 0) === 0) {
      await reviewCurrentCard();
    }
    setCurrentCardIndex((prev) => prev + 1);
    setIsFlipped(false);
  };

  const handlePrev = async () => {
    if (!selectedSet || currentCardIndex <= 0) return;
    const current = selectedSet.cards[currentCardIndex];
    if (!current) return;
    if ((current.reviewCount || 0) === 0) {
      await reviewCurrentCard();
    }
    setCurrentCardIndex((prev) => prev - 1);
    setIsFlipped(false);
  };

  const reviewCurrentCard = async () => {
    const currentCard = selectedSet?.cards[currentCardIndex];
    if (!currentCard) return;
    try {
      const res = await flashcardService.reviewFlashcard(
        currentCard._id,
        currentCardIndex,
      );

      // If API returns the updated card, use it; otherwise increment locally
      const updatedCardFromApi = res?.card || res?.updatedCard || null;
      const updatedCards = selectedSet.cards.map((card, index) => {
        if (index !== currentCardIndex) return card;
        if (updatedCardFromApi) return { ...card, ...updatedCardFromApi };
        return { ...card, reviewCount: (card.reviewCount || 0) + 1 };
      });

      setSelectedSet((prev) => ({ ...prev, cards: updatedCards }));
      setFlashcardSets((prevSets) =>
        prevSets.map((set) =>
          set._id === selectedSet._id ? { ...set, cards: updatedCards } : set,
        ),
      );
    } catch (error) {
      console.error("Error reviewing flashcard:", error);
    }
  };

  const handleToggleStar = async () => {
    if (!selectedSet) return;
    const currentCard = selectedSet.cards[currentCardIndex];
    if (!currentCard) return;
    setIsTogglingStar(true);
    try {
      await flashcardService.toggleStar(currentCard._id);
      const updatedCards = selectedSet.cards.map((card, index) =>
        index === currentCardIndex
          ? { ...card, isStarred: !card.isStarred }
          : card,
      );
      setSelectedSet({ ...selectedSet, cards: updatedCards });
      setFlashcardSets((prevSets) =>
        prevSets.map((set) =>
          set._id === selectedSet._id ? { ...set, cards: updatedCards } : set,
        ),
      );
    } catch (error) {
      toast.error(error.message || "Failed to toggle favorite");
      console.error("Error toggling star:", error);
    } finally {
      setIsTogglingStar(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <Spinner />
      </div>
    );
  }

  if (!selectedSet) {
    return (
      <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={`/documents/${documentId}`}
            className="text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={18} /> Back to Document
          </Link>
          <Button variant="secondary" onClick={() => navigate("/flashcards")}>
            All Flashcards
          </Button>
        </div>
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center text-slate-500 shadow-sm">
          <p className="text-lg font-semibold">
            No flashcards found for this document.
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Generate a flashcard set from the document first.
          </p>
        </div>
      </div>
    );
  }

  const currentCard = selectedSet.cards[currentCardIndex];
  const totalCards = selectedSet.cards.length;
  const completedCount = selectedSet.cards.filter(
    (card) => card.reviewCount > 0,
  ).length;
  const progress = totalCards
    ? Math.round((completedCount / totalCards) * 100)
    : 0;

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            to={`/documents/${documentId}`}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700"
          >
            <ArrowLeft size={16} /> Back to Document
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Flashcards</h1>
          <p className="mt-2 text-sm text-slate-500">
            Study the flashcard set for this document.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/flashcards")}>
            All Flashcards
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteSet}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Set"}
          </Button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {selectedSet.documentId?.title || "Flashcard Set"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {totalCards} cards · {progress}% complete
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{completedCount} reviewed</span>
            <span className="h-4 w-px bg-slate-200" />
            <span>{selectedSet.cards.length} total</span>
          </div>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-linear-to-r from-emerald-500 to-teal-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="relative rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={handleToggleStar}
          disabled={isTogglingStar}
          className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition hover:text-yellow-500 disabled:opacity-60"
          title={
            currentCard.isStarred ? "Remove from favorites" : "Add to favorites"
          }
        >
          <Star
            size={18}
            className={
              currentCard.isStarred
                ? "fill-yellow-400 text-yellow-400"
                : "text-slate-400"
            }
          />
        </button>

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-6">
          <div
            className="relative h-64 w-full cursor-pointer select-none overflow-hidden rounded-4xl"
            style={{ perspective: 1500 }}
          >
            <div
              onClick={handleFlip}
              className="relative h-full w-full transition-transform duration-500"
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-linear-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(0deg)",
                }}
              >
                <span className="mb-4 text-sm uppercase tracking-[0.24em] text-emerald-100/90">
                  Question
                </span>
                <p className="text-center text-xl font-semibold leading-snug">
                  {currentCard.question}
                </p>
                <span className="mt-8 text-sm text-emerald-100/80">
                  Click to reveal answer
                </span>
              </div>

              <div
                className="absolute inset-0 flex flex-col items-center justify-center rounded-4xl bg-teal-600 p-6 text-white shadow-xl"
                style={{
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <span className="mb-4 text-sm uppercase tracking-[0.24em] text-teal-100/90">
                  Answer
                </span>
                <p className="text-center text-xl font-semibold leading-snug">
                  {currentCard.answer}
                </p>
                <span className="mt-8 text-sm text-teal-100/80">
                  Click to return to question
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-between gap-4">
            <Button onClick={handlePrev} disabled={currentCardIndex === 0}>
              <div className="flex items-center gap-2">
                <ChevronLeft size={18} /> Previous
              </div>
            </Button>
            <div className="text-center text-sm text-slate-500">
              {currentCardIndex + 1} / {totalCards}
            </div>
            <Button
              onClick={handleNext}
              disabled={currentCardIndex === totalCards - 1}
            >
              <div className="flex items-center gap-2">
                Next <ChevronRight size={18} />
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlashCardPage;
