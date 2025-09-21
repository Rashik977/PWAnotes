// app/components/NotesApp.tsx
"use client";
import { useState, useEffect } from "react";
import { Note } from "@/app/lib/types";
import { StorageManager } from "@/app/lib/storage";
import { sendPushToAllDevices } from "@/app/actions/push-actions";
import { useOnlineStatus } from "@/app/hooks/useOnlineStatus";
import { usePushNotifications } from "@/app/hooks/usePushNotifications";

import WeatherWidget from "./WeatherWidget";
import NoteItem from "./NoteItem";
import InstallBanner from "./InstallBanner";
import PushNotifications from "./PushNotifications";

export default function NotesApp() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [input, setInput] = useState("");
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const isOnline = useOnlineStatus();
  const { isSubscribed, showLocalNotification } = usePushNotifications();

  useEffect(() => {
    // Load notes on mount
    const savedNotes = StorageManager.getNotes();
    setNotes(savedNotes);
  }, []);

  const addNote = async () => {
    if (!input.trim()) return;

    const newNote = StorageManager.addNote(input.trim());
    setNotes(StorageManager.getNotes());
    setInput("");

    // Send push notification to all devices
    if (isSubscribed) {
      try {
        await sendPushToAllDevices({
          title: "New Note Added 📝",
          body: input.trim(),
          data: { noteId: newNote.id, action: "note_added" },
        });
      } catch (error) {
        console.error("Failed to send push notification:", error);
      }
    }

    // Show local notification
    await showLocalNotification("Note Saved", {
      body: input.trim(),
      tag: "note-saved",
    });
  };

  const deleteNote = async (id: number) => {
    StorageManager.deleteNote(id);
    setNotes(StorageManager.getNotes());

    await showLocalNotification("Note Deleted", {
      body: "Note has been removed",
      tag: "note-deleted",
    });
  };

  const editNote = (note: Note) => {
    setEditingNote(note);
    setInput(note.text);
  };

  const saveEdit = async () => {
    if (!editingNote || !input.trim()) return;

    StorageManager.updateNote(editingNote.id, { text: input.trim() });
    setNotes(StorageManager.getNotes());
    setInput("");
    setEditingNote(null);

    await showLocalNotification("Note Updated", {
      body: "Your note has been updated",
      tag: "note-updated",
    });
  };

  const cancelEdit = () => {
    setEditingNote(null);
    setInput("");
  };

  const shareNote = async (note: Note) => {
    try {
      // Copy to clipboard as fallback
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(note.text);
        await showLocalNotification("Note Copied", {
          body: "Note text copied to clipboard",
          tag: "note-copied",
        });
      }
    } catch (error) {
      console.error("Share failed:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (editingNote) {
        saveEdit();
      } else {
        addNote();
      }
    }
  };

  const clearAllNotes = async () => {
    if (notes.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to delete all ${notes.length} notes? This action cannot be undone.`
    );
    if (!confirmed) return;

    StorageManager.clearAll();
    setNotes([]);

    await showLocalNotification("All Notes Cleared", {
      body: "All notes have been deleted",
      tag: "notes-cleared",
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="flex items-center justify-center p-4">
        <main className="w-full max-w-2xl space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">📝 PWA Notes</h1>
            <p className="text-gray-400 text-sm">
              Powerful offline note-taking with cross-device sync
            </p>
          </div>

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-4 text-xs">
            <span
              className={`px-3 py-1 rounded-full ${
                isOnline ? "bg-green-600" : "bg-red-600"
              }`}
            >
              {isOnline ? "🟢 Online" : "🔴 Offline"}
            </span>
            <span className="text-gray-400">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </span>
          </div>

          {/* Weather widget for offline demo */}
          <WeatherWidget />

          {/* Push notifications setup */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="text-sm font-semibold mb-3">🔔 Notifications</h3>
            <PushNotifications />
          </div>

          {/* Note input */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">
                  {editingNote ? "✏️ Edit Note" : "✨ Add New Note"}
                </h3>
                {editingNote && (
                  <span className="text-xs text-yellow-400 bg-yellow-900/20 px-2 py-1 rounded">
                    Editing
                  </span>
                )}
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={
                  editingNote
                    ? "Edit your note..."
                    : "Write a note... (Press Enter to save, Shift+Enter for new line)"
                }
                rows={3}
              />

              <div className="flex gap-2 justify-end">
                {editingNote ? (
                  <>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdit}
                      disabled={!input.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      💾 Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={addNote}
                    disabled={!input.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Add new note (or press Enter)"
                  >
                    ➕ Add Note
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Notes list */}
          {notes.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-300">
                  Your Notes
                </h2>
                <button
                  onClick={clearAllNotes}
                  className="text-xs px-3 py-1 border border-red-600 text-red-400 rounded-md hover:bg-red-900/20 transition-colors"
                  title="Delete all notes"
                >
                  🗑️ Clear All
                </button>
              </div>

              <ul className="space-y-3">
                {notes
                  .sort((a, b) => b.updatedAt - a.updatedAt)
                  .map((note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      onDelete={deleteNote}
                      onShare={shareNote}
                      onEdit={editNote}
                    />
                  ))}
              </ul>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">No notes yet</h3>
              <p className="text-sm">
                Start by writing your first note above.
                {!isOnline && " Your notes work offline!"}
              </p>
            </div>
          )}

          {/* Quick stats */}
          {notes.length > 0 && (
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-2">📊 Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-400">
                    {notes.length}
                  </div>
                  <div className="text-gray-400">Total Notes</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">
                    {notes.reduce((total, note) => total + note.text.length, 0)}
                  </div>
                  <div className="text-gray-400">Characters</div>
                </div>
              </div>
            </div>
          )}

          {/* Footer info */}
          <div className="text-center text-xs text-gray-500 py-4 border-t border-gray-800">
            <p className="mb-2">
              PWA Notes - Works offline • Cross-device notifications
            </p>
            {!isOnline && (
              <p className="text-yellow-400">
                🔄 Running offline - your notes are saved locally
              </p>
            )}
            <div className="mt-2 flex justify-center items-center gap-4 text-xs">
              <span>Built with Next.js & TypeScript</span>
              <span>•</span>
              <span>Open Source</span>
            </div>
          </div>
        </main>
      </div>

      {/* Install banner */}
      <InstallBanner />
    </div>
  );
}
