import React, { useState, useEffect } from 'react';
import { Realtime } from 'ably'

// Replace with your Ably API key
const ably = new Realtime('6IU7TA.IELGww:d-oIjlDQosW33FkgLwAe7e8CMxs-U6-KlT7jfbaflRg');

const channel = ably.channels.get('chat');

function AblyTestPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const handleMessage = (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    channel.subscribe('message', handleMessage);

    return () => {
      channel.unsubscribe('message', handleMessage);
    };
  }, []);

  const sendMessage = async () => {
    if (input.trim() === '') return;
    await channel.publish('message', { text: input });
    setInput('');
  };

  return (
    <div className="App">
      <h1>Ably Chat App</h1>
      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            {msg.data.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') sendMessage();
        }}
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}

export default AblyTestPage;
