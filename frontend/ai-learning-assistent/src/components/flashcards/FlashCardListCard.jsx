import React from "react";
import { BookOpen } from "lucide-react";
import Button from "../common/Button";

const FlashCardListCard = ({ flashcardSet, onStudy }) => {
  const setTitle =
    flashcardSet.documentId?.title ||
    flashcardSet.documentId?.fileName ||
    "Flashcard Set";
  const createdAt = formatDate(flashcardSet.createdAt);
  const totalCards = flashcardSet.cards?.length || 0;
  const reviewedCards = flashcardSet.cards?.filter(
    (card) => card.reviewCount > 0,
  ).length;
  const progress = totalCards
    ? Math.round((reviewedCards / totalCards) * 100)
    : 0;

  return (
    <div className="group bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-lg transition">
      <div className="flex items-center justify-between mb-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
          <BookOpen size={24} />
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
          {createdAt}
        </span>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">{setTitle}</h3>
        <p className="mt-2 text-sm text-slate-500">
          {totalCards} card{totalCards !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="mb-5 space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-slate-400">
          {reviewedCards}/{totalCards} reviewed
        </p>
      </div>

      <Button
        variant="primary"
        className="w-full"
        onClick={(e) => {
          e.stopPropagation();
          onStudy(flashcardSet.documentId?._id, flashcardSet._id);
        }}
      >
        Study Now
      </Button>
    </div>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default FlashCardListCard;
