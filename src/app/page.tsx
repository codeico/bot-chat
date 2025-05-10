'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function HomePage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string; image?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const data = await response.json();
      const assistantReply = {
        role: 'assistant',
        content: data.reply,
        image: data.image || null,
      };
      setMessages((prev) => [...prev, assistantReply]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
      <div className="title flex items-start gap-3">
  <Image
    src="/avatar-waifu.png"
    alt="Mikasa"
    width={40}
    height={40}
    className="avatar"
  />
  <div className="block">
    <div className="block font-semibold text-lg">Mikasa</div>
    <div
  className="block"
  style={{
    fontSize: '12px',
    fontWeight: '400',
    color: '#22c55e', // Tailwind green-500
    marginTop: '2px',
  }}
>
  {isTyping ? 'Mengetik...' : 'Online'}
</div>


  </div>
</div>



        <div className="messages" ref={messagesContainerRef}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.role === 'user' ? 'user-message' : 'assistant-message'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-start gap-2">
                  <Image src="/avatar-waifu.png" width={30} height={30} alt="Mikasa" className="avatar" />
                  <div>
                    <div className="message-text">{msg.content}</div>
                    {msg.image && (
                      <div className="message-image mt-2">
                        <Image src={msg.image} alt="Mikasa Image" width={400} height={400} />
                      </div>
                    )}
                  </div>
                </div>
              )}
              {msg.role === 'user' && <div className="message-text">{msg.content}</div>}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-2">
              <Image src="/avatar-waifu.png" width={30} height={30} alt="Mikasa" className="avatar" />
              <div className="message-text italic text-gray-500">sedang mengetik...</div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="input-form">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pesan..."
            className="input-field"
            disabled={loading}
          />
          <button type="submit" className="send-button" disabled={loading || !input}>
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
}
