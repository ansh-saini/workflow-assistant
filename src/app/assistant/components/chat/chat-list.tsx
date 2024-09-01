import type { Message } from '@ai-sdk/react';
import { AnimatePresence, motion } from 'framer-motion';
import Markdown from 'markdown-to-jsx';
import React, { useRef } from 'react';

import { cn } from '@/lib/utils';

import ChatBottombar from './chat-bottombar';

interface ChatListProps {
  messages?: Message[];
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export function ChatList({ messages, handleSubmit, ...props }: ChatListProps) {
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className='w-full overflow-y-auto overflow-x-hidden h-full flex flex-col'>
      <div
        ref={messagesContainerRef}
        className='w-full overflow-y-auto overflow-x-hidden h-full flex flex-col'
      >
        <AnimatePresence>
          {messages?.map((message, index) => (
            <motion.div
              key={index}
              layout
              initial={{ opacity: 0, scale: 1, y: 50, x: 0 }}
              animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, scale: 1, y: 1, x: 0 }}
              transition={{
                opacity: { duration: 0.1 },
                layout: {
                  type: 'spring',
                  bounce: 0.3,
                  duration: messages.indexOf(message) * 0.05 + 0.2,
                },
              }}
              style={{
                originX: 0.5,
                originY: 0.5,
              }}
              className={cn(
                'flex flex-col gap-2 p-4 whitespace-pre-wrap',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              <div className='flex gap-3 items-center'>
                {/* {message.name === selectedUser.name && (
                  <Avatar className='flex justify-center items-center'>
                    <AvatarImage
                      src={message.}
                      alt={message.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )} */}
                <div className='bg-accent p-3 rounded-md max-w-xs'>
                  <Markdown
                    options={{
                      overrides: {
                        h1: {
                          component: 'h1',
                          props: {
                            className: 'font-bold mt-4 text-2xl',
                          },
                        },
                        h2: {
                          component: 'h2',
                          props: {
                            className: 'font-semibold text-xl mt-3',
                          },
                        },
                        h3: {
                          component: 'h3',
                          props: {
                            className: 'font-semibold text-lg mt-2 mb-0.5',
                          },
                        },
                        h4: {
                          component: 'h4',
                          props: {
                            className: 'font-semibold text-md mt-1',
                          },
                        },
                        h5: {
                          component: 'h5',
                          props: {
                            className: 'font-bold mt-1',
                          },
                        },
                        h6: {
                          component: 'h6',
                          props: {
                            className: 'font-semibold mt-1',
                          },
                        },
                        body: {
                          component: 'p',
                          props: {
                            className: 'mt-1',
                          },
                        },
                        strong: {
                          component: 'strong',
                          props: {
                            className: 'font-semibold mt-1 inline',
                          },
                        },
                        li: {
                          component: 'li',
                          props: {
                            className: 'mt-1',
                          },
                        },
                        ul: {
                          component: 'ul',
                          props: {
                            style: {
                              listStyleType: 'disc',
                            },
                            className: 'mb-1.5 ps-5',
                          },
                        },
                        ol: {
                          component: 'ul',
                          props: {
                            style: {
                              listStyleType: 'decimal',
                            },
                            className: 'mb-1.5 ps-5',
                          },
                        },
                        p: {
                          component: 'p',
                          props: {
                            className: 'mt-0.5',
                          },
                        },
                        span: {
                          component: 'span',
                          props: {
                            className: 'mt-0.25',
                          },
                        },
                        a: {
                          component: 'a',
                          props: {
                            className: 'text-blue-600 hover:underline',
                          },
                        },
                      },
                    }}
                  >
                    {message.content}
                  </Markdown>
                </div>
                {/* {message.name !== selectedUser.name && (
                  <Avatar className='flex justify-center items-center'>
                    <AvatarImage
                      src={message.avatar}
                      alt={message.name}
                      width={6}
                      height={6}
                    />
                  </Avatar>
                )} */}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <ChatBottombar
        handleSubmit={handleSubmit}
        handleInputChange={props.handleInputChange}
      />
    </div>
  );
}
