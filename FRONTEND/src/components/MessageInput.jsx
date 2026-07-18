import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, X, Image, File, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from './EmojiPicker';

const MessageInput = ({ onSendMessage, onTyping, onStopTyping, replyingTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [rows, setRows] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState('');
  const [fileType, setFileType] = useState(''); // 'image' or 'file'
  const [isUploading, setIsUploading] = useState(false);

  const textareaRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  const attachmentMenuRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Close attachment dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target)) {
        setShowAttachmentMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Keystroke typing notification triggers
    if (onTyping && onStopTyping) {
      if (!isTypingRef.current && value.trim().length > 0) {
        isTypingRef.current = true;
        onTyping();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        isTypingRef.current = false;
        onStopTyping();
      }, 2000);
    }

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = newHeight + 'px';
      setRows(Math.ceil(newHeight / 24));
    }
  };

  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFileType(type);
    setShowAttachmentMenu(false);

    if (type === 'image') {
      const preview = URL.createObjectURL(file);
      setFilePreviewUrl(preview);
    } else {
      setFilePreviewUrl(''); // No image preview for general document files
    }
  };

  const handleRemoveFile = () => {
    if (filePreviewUrl) {
      URL.revokeObjectURL(filePreviewUrl);
    }
    setSelectedFile(null);
    setFileType('');
    setFilePreviewUrl('');
  };

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return;

    if (onStopTyping) {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      isTypingRef.current = false;
      onStopTyping();
    }

    let attachmentPayload = null;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/messages/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.success) {
          attachmentPayload = data.file;
        } else {
          alert(data.message || 'File upload failed');
          setIsUploading(false);
          return;
        }
      } catch (err) {
        console.error('File upload connection error:', err);
        alert('File upload failed due to connection error');
        setIsUploading(false);
        return;
      }
    }

    onSendMessage(message, attachmentPayload, replyingTo ? (replyingTo._id || replyingTo.id) : null);
    if (onCancelReply) onCancelReply();
    
    // Reset layout inputs
    setMessage('');
    handleRemoveFile();
    setIsUploading(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setRows(1);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700 relative"
    >
      {/* Replying Preview Container */}
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2.5 p-2 bg-gray-50 dark:bg-gray-700/50 border-l-4 border-primary flex items-center justify-between gap-3 text-xs select-none relative overflow-hidden rounded-r-lg"
          >
            <div className="min-w-0 flex-1 text-left">
              <p className="font-semibold text-primary mb-0.5 truncate text-[11px]">
                Replying to {replyingTo.sender === 'You' || replyingTo.isOwn ? 'Yourself' : replyingTo.sender}
              </p>
              <p className="text-gray-550 dark:text-gray-300 truncate">
                {replyingTo.messageType === 'image' ? '📷 Image' : replyingTo.messageType === 'file' ? `📄 ${replyingTo.fileName || 'Document'}` : replyingTo.content}
              </p>
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 rounded-full transition-colors flex-shrink-0"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker Box */}
      <AnimatePresence>
        {showEmojiPicker && (
          <EmojiPicker onEmojiSelect={handleEmojiSelect} />
        )}
      </AnimatePresence>

      {/* Upload Preview Container */}
      <AnimatePresence>
        {selectedFile && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 flex items-center justify-between gap-4 max-w-sm relative overflow-hidden"
          >
            {isUploading && (
              <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 z-10 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={24} />
              </div>
            )}
            <div className="flex items-center gap-3 min-w-0">
              {fileType === 'image' && filePreviewUrl ? (
                <img
                  src={filePreviewUrl}
                  alt="Preview"
                  className="w-14 h-14 rounded-lg object-cover border border-gray-200 dark:border-gray-600"
                />
              ) : (
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-primary text-xl select-none">
                  📄
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              disabled={isUploading}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-end gap-3 relative">
        {/* Emoji Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <Smile size={20} className={showEmojiPicker ? 'text-primary' : 'text-gray-700 dark:text-gray-300'} />
        </motion.button>

        {/* Input Text Area */}
        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-3xl px-4 py-2 flex items-center">
          <textarea
            id="chat-message-input"
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={selectedFile ? "Add a caption..." : "Type a message..."}
            className="flex-1 bg-transparent outline-none resize-none text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 text-sm max-h-28"
            rows={1}
            style={{ maxHeight: '120px' }}
          />

          {/* Paperclip Button */}
          <div className="relative" ref={attachmentMenuRef}>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="flex-shrink-0 ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
            >
              <Paperclip size={18} className={showAttachmentMenu ? 'text-primary' : 'text-gray-700 dark:text-gray-300'} />
            </motion.button>

            {/* Hidden file input elements */}
            <input
              type="file"
              ref={imageInputRef}
              onChange={(e) => handleFileChange(e, 'image')}
              accept="image/jpeg,image/png,image/webp,image/jpg"
              className="hidden"
            />
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileChange(e, 'file')}
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
              className="hidden"
            />

            {/* Dropdown Options */}
            <AnimatePresence>
              {showAttachmentMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute bottom-12 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl py-2 z-50 w-44 flex flex-col gap-1 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => {
                      imageInputRef.current?.click();
                      setShowAttachmentMenu(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2.5 transition-colors"
                  >
                    <Image size={16} className="text-blue-500" /> Photo & Video
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowAttachmentMenu(false);
                    }}
                    className="w-full px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-left text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2.5 transition-colors"
                  >
                    <File size={16} className="text-purple-500" /> Document
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Send Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSend}
          disabled={(!message.trim() && !selectedFile) || isUploading}
          className="flex-shrink-0 p-2 bg-primary text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md"
        >
          <Send size={18} />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MessageInput;
