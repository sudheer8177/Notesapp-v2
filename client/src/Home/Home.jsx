import React, { useEffect, useState } from 'react';
import Navbar from '../Navbar/Navbar';
import NoteCard from '../Cards/NoteCard';
import { MdAdd } from 'react-icons/md';
import AddEditNote from './AddEditNote';
import Modal from 'react-modal'
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import moment from "moment"
import Toast from '../ToastMessage/Toast';
import EmptyCard from '../EmptyCard/EmptyCard';
import Addnote from "../Images/add.svg"
import NoDataImg from "../Images/Searchimg.svg"

const Home = () => {
   const [openAddEditModal,setOpenEditModal]=useState({
    isShown :false,
    type:'add',
    data:null,
   });

   const [showToastMsg,setShowToastMsg]= useState({
     isShown:false,
     type:"add",
     data:null,
   })


  

 //show toast msg
   const showToastMessage =( message, type)=>{
    setShowToastMsg({
        isShown:true,
        message,
        type,
    })
   }
 // hide toast msg
   const handleCloseToast =( message, type)=>{
    setShowToastMsg({
        isShown:false,
        message,
        type,
    })
   }


   const [allNotes ,setAllNotes]=useState([]);
   const [userInfo,setUserInfo]=useState(null);
   const [isSearch, setIsSearch]=useState("");

   const navigate = useNavigate();

   const handleEdit=(noteDetails)=>{

    setOpenEditModal({isShown:true,data:noteDetails,type:"edit"})

   }

   const getUserInfo = async ()=>{
    try{
        const response=await axiosInstance.get("/get-user");
        if (response.data && response.data.user){
            setUserInfo(response.data.user)
        }
    } catch(error){
        if(error.response.status === 401){
            localStorage.clear();
            navigate("/login");
        }
    }
   }

   // Get all the Notes

   const getAllNotes= async ()=>{
    try{
        const response= await axiosInstance.get("/get-all-notes");

        if(response.data && response.data.notes){
            setAllNotes(response.data.notes)
        }
    }catch(error){
        console.log("An unexpected error occurred . please try again later")
    }
   }
   
   const deleteNote = async(data)=>{
     const noteId=data._id;
    try {
        const response = await axiosInstance.delete(`/delete-note/${noteId}`);
  
        if (response.data && !response.data.error) {
          showToastMessage("Note Deleted Successfully",'delete');
          getAllNotes(); // Refresh the notes list
        }
      } catch (error) {
        if(error.response && error.response.data && error.response.data.message){
            console.log("An unexpected error occurred . please try again later")
        }
      }

   }
const onSearchNote = async (query) => {
  try {
    const response = await axiosInstance.get("/search-notes", {
      params: { query },
    });
    if (response.data && response.data.notes) {
      setIsSearch(true);
      setAllNotes(response.data.notes);
    } else {
      setIsSearch(false); 
      setAllNotes([]); 
    }
  } catch (error) {
    console.error("Error searching notes:", error);
    // Optionally, you can set an error state or show a toast message to inform the user
  }
};

   const handleClearSearch =()=>{
    setIsSearch(false);
    getAllNotes();
   }


   const updateIsPinned = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.put(`/update-note-pinned/${noteId}`, {
        isPinned: !noteData.isPinned
      });
  
      if (response.data?.note) {
        showToastMessage("Note Updated Successfully");
        getAllNotes(); // Refresh the notes list
      }
    } catch (error) {
      console.log("An error occurred while updating the note's pinned status:", error);
    }
  };
  
   useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {    
    };
   }, []);


   return (
    <div>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}/>
      <div className="Container mx-auto">
        {allNotes.length > 0 ? (
          <div className="grid grid-cols-3 gap-6 mt-8">
            {allNotes.map((item) => (
              <NoteCard
                key={item._id}
                title={item.title}
                date={moment(item.createdOn).format('Do MMM YYYY')}
                content={item.content}
                tags={item.tags}
                isPinned={item.isPinned}
                onEdit={() => handleEdit(item)}
                onDelete={() => deleteNote(item)}
                onPinNote={() => updateIsPinned(item)}
              />
            ))}
          </div>
        ) : (
          <EmptyCard  
  imgSrc={isSearch ? NoDataImg : Addnote} 
  message={isSearch 
    ? "Oops! No notes found matching your search." 
    : "Start creating your first note! Click the 'Add' button to jot down your thoughts, ideas, and reminders. Let's get started!"
  }
/>

        )}
      </div>
      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenEditModal({ isShown: true, type: 'add', data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => setOpenEditModal({ isShown: false })}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll-hidden"
      >
        <AddEditNote
          type={openAddEditModal.type}
          noteData={openAddEditModal.data}
          onClose={() => {
            setOpenEditModal({ isShown: false, type: 'add', data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>

      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </div>
  );
};

export default Home;