import React, { useState } from 'react';
import Profileinfo from '../Cards/Profileinfo';
import { useNavigate } from 'react-router-dom';
import Searchbar from '../Searchbar/Searchbar';

const Navbar = ({userInfo,onSearchNote,handleClearSearch}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const onLogout = () => {
        localStorage.clear();
        navigate("/login");
    }

    const handleSearch = () => {
        // Handle the search action here
        if(searchQuery){
            onSearchNote(searchQuery)
        }
    }

    const onClearSearch = () => {
        setSearchQuery("");
        handleClearSearch();
    }

    return (
        <div className='bg-white flex items-center justify-between px-6 py-4 drop-shadow'>
            <h1 className='text-2xl font-large font-bold text-black py-4'>Notes</h1>
            <Searchbar
                value={searchQuery}
                onChange={(event) => {
                    setSearchQuery(event.target.value);
                }}
                handleSearch={handleSearch}
                onClearSearch={onClearSearch}
            />
            <Profileinfo userInfo={userInfo}onLogout={onLogout} />
        </div>
    );
}

export default Navbar;
