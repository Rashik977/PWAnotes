// app/components/NoteItem.tsx
"use client";
import { Note } from "@/app/lib/types";

interface NoteItemProps {
  note: Note;
  onDelete: (id: number) => void;
  onShare?: (note: Note) => void;
  onEdit?: (note: Note) => void;
}

export default function NoteItem({
  note,
  onDelete,
  onShare,
  onEdit,
}: NoteItemProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (!onShare) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "PWA Notes",
          text: note.text,
        });
      } catch (err) {
        console.error("Share failed:", err);
        // Fallback to custom share handler
        onShare(note);
      }
    } else {
      onShare(note);
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this note?")) {
      onDelete(note.id);
    }
  };

  return (
    <li className="bg-gray-800 rounded-lg p-4 shadow-sm hover:bg-gray-750 transition-colors">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="whitespace-pre-wrap text-white break-words">
            {note.text}
          </div>

          {note.image && (
            <div className="mt-3">
              <img
                src={note.image}
                alt="Note attachment"
                className="max-w-full h-auto rounded-md"
                style={{ maxHeight: "200px" }}
              />
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
            <span>Created: {formatDate(note.createdAt)}</span>

            {note.updatedAt !== note.createdAt && (
              <span>Updated: {formatDate(note.updatedAt)}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-shrink-0">
          {onShare && (
            <button
              onClick={handleShare}
              className="text-xs px-3 py-1 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              title="Share note"
            >
              📤 Share
            </button>
          )}

          {onEdit && (
            <button
              onClick={() => onEdit(note)}
              className="text-xs px-3 py-1 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              title="Edit note"
            >
              ✏️ Edit
            </button>
          )}

          <button
            onClick={handleDelete}
            className="text-xs px-3 py-1 border border-red-600 rounded-md text-red-400 hover:bg-red-900 transition-colors"
            title="Delete note"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </li>
  );
}
