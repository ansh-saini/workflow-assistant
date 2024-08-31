import React from 'react';

import { Avatar, AvatarImage } from '../ui/avatar';

import AssistantImage from '~/images/assistant-image.webp';

export default function ChatTopbar() {
  return (
    <div className='w-full h-20 flex p-4 justify-between items-center border-b'>
      <div className='flex items-center gap-2'>
        <Avatar className='flex justify-center items-center'>
          <AvatarImage
            src={AssistantImage.src}
            alt='WorkFlow'
            width={6}
            height={6}
            className='w-10 h-10'
          />
        </Avatar>
        <div className='flex flex-col'>
          <span className='font-medium'>WorkFlow</span>
          <span className='text-xs'>Active</span>
        </div>
      </div>

      {/* <div>
        <p className='text-slate-500'>You are currently logged in as</p>
      </div> */}
    </div>
  );
}
