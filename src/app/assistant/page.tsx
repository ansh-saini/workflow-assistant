'use client';

import { useChat } from 'ai/react';

import { ChatList } from '@/app/assistant/components/chat/chat-list';
import ChatTopbar from '@/app/assistant/components/chat/chat-topbar';

export default function Page() {
  const { messages, handleInputChange, handleSubmit } = useChat({
    api: '/api/assistant',
    maxToolRoundtrips: 5,
    initialMessages: [
      {
        id: '0',
        role: 'system',
        content: `The user's name is Namita.`,
      },
      {
        id: '1',
        role: 'system',
        content: `Don't use markdown in your messages. Just use properly formatted plain text.`,
      },
      {
        id: '2',
        role: 'assistant',
        content: `Hello! I'm WorkFlow! 🌟 Hope you're having a fantastic day! 😊 How can I assist you today?

You can ask me things like:

📅 What's my schedule for today?
📆 When's my next meeting?
🤝 When is Reena available for a meeting?

👥 How many employees do we have?
🌴 Who's on leave today?

And guess what? I can also schedule meetings for you! 🗓️`,
      },
    ],

    async onToolCall({ toolCall }) {
      console.log('client-side tool call', toolCall);
    },
  });

  return (
    <>
      <div
        className='bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3'
        role='alert'
      >
        {/* <p className='font-bold'>Note</p> */}
        <p className='text-sm font-bold'>
          I have pre-authorized a Google account for the purpose of this demo.
          It has calendar events, tasks, and contacts, so you can experience the
          full power of the assistant.
        </p>
      </div>

      <main className='flex h-[calc(100dvh)] flex-col items-center justify-center p-4 md:px-24 py-32 gap-4 pt-10'>
        <pre className='text-xs absolute left-0 bottom-0 size-[400px] overflow-scroll bg-[#f5fcfd] border border-black/50'>
          {JSON.stringify(messages, null, 2)}
        </pre>
        <div className='z-10 border rounded-lg max-w-5xl w-full h-full text-sm lg:flex'>
          <div className='flex flex-col justify-between w-full h-full'>
            <ChatTopbar />

            <ChatList
              messages={messages.filter(
                (x) => x.role !== 'system' && Boolean(x.content)
              )}
              handleSubmit={handleSubmit}
              handleInputChange={handleInputChange}
            />
          </div>
        </div>
      </main>
    </>
  );
}
