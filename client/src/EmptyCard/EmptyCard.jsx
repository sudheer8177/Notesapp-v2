import React from 'react';

const EmptyCard = ({imgSrc,message}) => {
    return (
        <div className='flex flex-col items-center justify-start mt-20'>
            <img src={imgSrc} alt='No Notes' className='w-60 opacity-25' />
            <p className='w-1/3 text-sm font-medium text-slate-400 text-center leading-7 mt-2 '>
              {message}
            </p>
        </div>
    );
}

export default EmptyCard;
