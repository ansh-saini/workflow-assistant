'use client';

import { useChat } from 'ai/react';

import { ChatList } from '@/app/assistant/components/chat/chat-list';
import ChatTopbar from '@/app/assistant/components/chat/chat-topbar';

export default function Page() {
  const { messages, handleInputChange, handleSubmit } = useChat({
    api: '/api/assistant',
    maxToolRoundtrips: 5,

    async onToolCall({ toolCall }) {
      console.log('client-side tool call', toolCall);
    },
  });

  return (
    <main className='flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4'>
      <pre className='text-xs absolute left-0 bottom-0 size-[400px] overflow-scroll bg-[#f5fcfd] border border-black/50'>
        {JSON.stringify(messages, null, 2)}
      </pre>
      <div className='z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex'>
        <div className='flex flex-col justify-between w-full h-full'>
          <ChatTopbar />

          <ChatList
            messages={messages.filter((x) => Boolean(x.content))}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
          />
        </div>
      </div>
    </main>
  );
}
