import { AnimatePresence, motion } from 'framer-motion';
import { SendHorizontal } from 'lucide-react';
import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';

interface ChatBottombarProps {
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export default function ChatBottombar({
  handleSubmit,
  ...props
}: ChatBottombarProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.handleInputChange(event);
    setMessage(event.target.value);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (message.trim()) {
      handleSubmit(e);
      setMessage('');

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      (document.getElementById('send-button') as HTMLButtonElement)?.click();
    }

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + '\n');
    }
  };

  return (
    <div className='p-2 flex justify-between w-full items-center gap-2'>
      <AnimatePresence initial={false}>
        <motion.form
          id='chat-form'
          onSubmit={handleSend}
          key='input'
          className='w-full relative'
          layout
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{
            opacity: { duration: 0.05 },
            layout: {
              type: 'spring',
              bounce: 0.15,
            },
          }}
        >
          <Textarea
            autoComplete='off'
            value={message}
            ref={inputRef}
            onKeyDown={handleKeyPress}
            onChange={handleInputChange}
            name='message'
            placeholder='Type your message...'
            className=' w-full border rounded-full flex items-center h-9 resize-none overflow-hidden bg-background'
          ></Textarea>
        </motion.form>

        {message.trim() && (
          <Button
            variant='ghost'
            size='icon'
            className={cn(
              'h-9 w-9',
              'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white shrink-0'
            )}
            type='submit'
            form='chat-form'
            id='send-button'
          >
            <SendHorizontal size={20} className='text-muted-foreground' />
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
}
