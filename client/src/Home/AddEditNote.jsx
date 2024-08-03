import React, { useState, useEffect } from 'react';
import TagInput from '../input/TagInput';
import { MdClose } from 'react-icons/md';
import axiosInstance from '../utils/axiosInstance';

const AddEditNote = ({ noteData, type, getAllNotes, onClose,showToastMessage }) => {
  const [title, setTitle] = useState(noteData?.title || "");
  const [content, setContent] = useState(noteData?.content || "");
  const [tags, setTags] = useState(noteData?.tags || []);
  const [error, setError] = useState("");

  useEffect(() => {
    if (noteData) {
      setTitle(noteData.title || "");
      setContent(noteData.content || "");
      setTags(noteData.tags || []);
    }
  }, [noteData]);


  // Add Notes
  const addNewNote = async () => {
    try {
      const response = await axiosInstance.post("/add-note", {
        title,
        content,
        tags,
      });

      if (response.data?.note) {
        showToastMessage("Note Added Successfully");
        getAllNotes(); // Refresh the notes list
        onClose(); // Close the modal or form
      }
    } catch (error) {
      setError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
    }
  };

  // Edit Notes
  const editNote = async () => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(`/edit-note/${noteId}`, {
        title,
        content,
        tags,
      });

      if (response.data?.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes(); // Refresh the notes list
        onClose(); // Close the modal or form
      }
    } catch (error) {
      setError(error.response?.data?.message || "An unexpected error occurred. Please try again.");
    }
  };

  const handleAddNote = () => {
    if (!title) {
      setError("Please enter the title");
      return;
    }
    if (!content) {
      setError("Please enter the content");
      return;
    }
    setError("");

    if (type === "edit") {
      editNote();
    } else {
      addNewNote();
    }
  }


  
  return (
    <div className='relative'>
      <button
        className='w-10 h-10 rounded-full items-center justify-center absolute -top-3 -right-3'
        onClick={onClose} 
      >
        <MdClose className='text-2xl text-slate-400 hover:text-blue-700' /> 
      </button>

      <div className='flex flex-col gap-2'> 
        <label className='input-label'>TITLE</label>
        <input
          type='text'
          className='text-2xl text-slate-950 outline-none'
          placeholder='Go to Gym At 6'
          value={title}
          onChange={({ target }) => setTitle(target.value)}
        /> 
      </div>
      <div className='flex flex-col gap-2 mt-4'> 
        <label className='input-label'>CONTENT</label>
        <textarea
          className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
          placeholder='Content'
          rows={10}
          value={content}
          onChange={({ target }) => setContent(target.value)}
        />
      </div>
      <div className='mt-3'>
        <label className='input-label'>TAGS</label>
        <TagInput tags={tags} setTags={setTags} />
      </div>

      {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}

      <button className='btn-primary font-medium mt-5 p-3' onClick={handleAddNote}>
        {type === "edit" ? "Update" : "Add"}
      </button> 
    </div>
  );
}

export default AddEditNote;
