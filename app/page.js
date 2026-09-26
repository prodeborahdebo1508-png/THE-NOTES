'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Plus, Search, Trash2, Tag, Heart } from 'lucide-react';

const SUPABASE_URL = 'https://tptxwvggixjnvcqoxgmu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwdHh3dmdnaXhqbnZjcW94Z211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0NTE1MjYsImV4cCI6MjEwNjAyNzUyNn0.f04IFwag5I4mwljFDP2qBAOHNW2uMuxMm4MzumzfL4g';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function NotesApp() {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setNotes(data);
      if (data.length > 0 && !activeNote) {
        setActiveNote(data[0]);
      }
    }
  }

  async function createNewNote() {
    const newNoteTemplate = {
      title: 'Neue Notiz 🎀',
      content: [{ id: Date.now().toString(), type: 'text', value: '' }],
      tags: ['Alltag'],
    };

    const { data, error } = await supabase
      .from('notes')
      .insert([newNoteTemplate])
      .select();

    if (!error && data) {
      setNotes([data[0], ...notes]);
      setActiveNote(data[0]);
    }
  }

  async function saveActiveNote(updatedFields) {
    if (!activeNote) return;

    const updatedNote = { ...activeNote, ...updatedFields };
    setActiveNote(updatedNote);

    setNotes((prevNotes) =>
      prevNotes.map((n) => (n.id === updatedNote.id ? updatedNote : n))
    );

    await supabase
      .from('notes')
      .update({
        title: updatedNote.title,
        content: updatedNote.content,
        tags: updatedNote.tags,
      })
      .eq('id', updatedNote.id);
  }

  async function deleteActiveNote() {
    if (!activeNote) return;

    await supabase.from('notes').delete().eq('id', activeNote.id);
    const remainingNotes = notes.filter((n) => n.id !== activeNote.id);
    setNotes(remainingNotes);
    setActiveNote(remainingNotes.length > 0 ? remainingNotes[0] : null);
  }

  function updateBlock(index, key, val) {
    const newBlocks = [...(activeNote.content || [])];
    newBlocks[index] = { ...newBlocks[index], [key]: val };
    saveActiveNote({ content: newBlocks });
  }

  function addBlock(type = 'text') {
    const newBlock = { id: Date.now().toString(), type, value: '' };
    const newBlocks = [...(activeNote.content || []), newBlock];
    saveActiveNote({ content: newBlocks });
  }

  function removeBlock(index) {
    const newBlocks = activeNote.content.filter((_, i) => i !== index);
    saveActiveNote({ content: newBlocks });
  }

  function handleAddTag(e) {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      const currentTags = activeNote.tags || [];
      if (!currentTags.includes(tagInput.trim())) {
        saveActiveNote({ tags: [...currentTags, tagInput.trim()] });
      }
      setTagInput('');
    }
  }

  function removeTag(tagToRemove) {
    const updatedTags = (activeNote.tags || []).filter((t) => t !== tagToRemove);
    saveActiveNote({ tags: updatedTags });
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (note.tags && note.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesSearch;
  });

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">
            <Heart size={20} color="#ec4899" fill="#fbcfe8" />
            Notizen
          </div>
        </div>

        <input
          type="text"
          className="search-input"
          placeholder="Suchen nach Titel oder Tag..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <button className="btn-primary" onClick={createNewNote}>
          <Plus size={18} /> Neue Notiz
        </button>

        <div className="notes-list">
          {filteredNotes.map((note) => (
            <div
              key={note.id}
              className={`note-card ${activeNote?.id === note.id ? 'active' : ''}`}
              onClick={() => setActiveNote(note)}
            >
              <div className="note-card-title">{note.title || 'Unbenannt'}</div>
              <div className="note-card-date">
                {new Date(note.updated_at).toLocaleDateString('de-DE')}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main-content">
        {activeNote ? (
          <>
            <div className="editor-header">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <input
                  type="text"
                  className="title-input"
                  value={activeNote.title}
                  onChange={(e) => saveActiveNote({ title: e.target.value })}
                  placeholder="Titel der Notiz..."
                />
                <button
                  onClick={deleteActiveNote}
                  style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}
                  title="Notiz löschen"
                >
                  <Trash2 size={20} />
                </button>
              </div>

              <div className="tags-bar">
                <Tag size={16} color="#db2777" />
                {(activeNote.tags || []).map((tag, idx) => (
                  <span key={idx} className="tag-badge">
                    #{tag}
                    <button
                      onClick={() => removeTag(tag)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#db2777' }}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  className="tag-input"
                  placeholder="+ Tag hinzufügen"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                />
              </div>
            </div>

            <div className="blocks-container">
              {(activeNote.content || []).map((block, index) => (
                <div key={block.id || index} className="block-row">
                  <select
                    className="block-select"
                    value={block.type}
                    onChange={(e) => updateBlock(index, 'type', e.target.value)}
                  >
                    <option value="text">Text</option>
                    <option value="heading">Überschrift</option>
                    <option value="bullet">Aufzählung</option>
                  </select>

                  <input
                    type="text"
                    className={`block-input ${block.type}`}
                    value={block.value || ''}
                    placeholder={
                      block.type === 'heading'
                        ? 'Überschrift...'
                        : block.type === 'bullet'
                        ? '• Listenpunkt...'
                        : 'Text eingeben...'
                    }
                    onChange={(e) => updateBlock(index, 'value', e.target.value)}
                  />

                  <button className="btn-delete-block" onClick={() => removeBlock(index)}>
                    ×
                  </button>
                </div>
              ))}

              <button className="btn-add-block" onClick={() => addBlock('text')}>
                + Block hinzufügen
              </button>
            </div>
          </>
        ) : (
          <div style={{ margin: 'auto', color: '#9ca3af' }}>Keine Notiz ausgewählt</div>
        )}
      </main>
    </div>
  );
}
