import { AnimatePresence, motion } from 'framer-motion';
import {
  FileImage,
  Mic,
  Paperclip,
  PlusCircle,
  SendHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import React, { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button, buttonVariants } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Textarea } from '../ui/textarea';

interface ChatBottombarProps {
  isMobile: boolean;
  handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const BottombarIcons = [{ icon: FileImage }, { icon: Paperclip }];

export default function ChatBottombar({
  handleSubmit,
  isMobile,
  ...props
}: ChatBottombarProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    props.handleInputChange(event);
    setMessage(event.target.value);
  };

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    if (message.trim()) {
      handleSubmit(e);
      setMessage('');

      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // if (event.key === 'Enter' && !event.shiftKey) {
    //   event.preventDefault();
    //   handleSend();
    // }

    if (event.key === 'Enter' && event.shiftKey) {
      event.preventDefault();
      setMessage((prev) => prev + '\n');
    }
  };

  return (
    <div className='p-2 flex justify-between w-full items-center gap-2'>
      <div className='flex'>
        <Popover>
          <PopoverTrigger asChild>
            <Link
              href='#'
              className={cn(
                buttonVariants({ variant: 'ghost', size: 'icon' }),
                'h-9 w-9',
                'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
              )}
            >
              <PlusCircle size={20} className='text-muted-foreground' />
            </Link>
          </PopoverTrigger>
          <PopoverContent side='top' className='w-full p-2'>
            {message.trim() || isMobile ? (
              <div className='flex gap-2'>
                <Link
                  href='#'
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'icon' }),
                    'h-9 w-9',
                    'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                  )}
                >
                  <Mic size={20} className='text-muted-foreground' />
                </Link>
                {BottombarIcons.map((icon, index) => (
                  <Link
                    key={index}
                    href='#'
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' }),
                      'h-9 w-9',
                      'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                    )}
                  >
                    <icon.icon size={20} className='text-muted-foreground' />
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                href='#'
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'h-9 w-9',
                  'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                )}
              >
                <Mic size={20} className='text-muted-foreground' />
              </Link>
            )}
          </PopoverContent>
        </Popover>
        {!message.trim() && !isMobile && (
          <div className='flex'>
            {BottombarIcons.map((icon, index) => (
              <Link
                key={index}
                href='#'
                className={cn(
                  buttonVariants({ variant: 'ghost', size: 'icon' }),
                  'h-9 w-9',
                  'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-white'
                )}
              >
                <icon.icon size={20} className='text-muted-foreground' />
              </Link>
            ))}
          </div>
        )}
      </div>

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
            placeholder='Aa'
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
          >
            <SendHorizontal size={20} className='text-muted-foreground' />
          </Button>
        )}
      </AnimatePresence>
    </div>
  );
}
