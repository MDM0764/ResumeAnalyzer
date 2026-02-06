import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([]);
  
  // Load saved messages from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('chat_messages');
      if (saved) setMessages(JSON.parse(saved));
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  }, []);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('chat_messages', JSON.stringify(messages));
    } catch (err) {
      console.error('Failed to save messages', err);
    }
  }, [messages]);
  // Simple placeholder AI response - replace with real API call
  const fakeAIResponse = async (text) => {
    return new Promise((res) => setTimeout(() => res(`AI: I received "${text}"`), 600));
  };

  const newMsg = async (e) => {
    e.preventDefault();
    const text = inputMsg.trim();
    if (!text) return;

    const newMessages = [...messages, { sender: "user", text }];
    setMessages(newMessages);
    setInputMsg("");
    console.log("Sending message:", text);

    // Simulate AI response (replace with API call)
    const response = await fakeAIResponse(text);
    setMessages((prev) => [...prev, { sender: "bot", text: response }]);
  };
  return (
    <div>
      <h1>Chat with Resume Analyzer</h1>
      {analysis ? (
        <div>
          <h2>Analysis Result</h2>
          <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(analysis, null, 2)}</pre>
          <p>Use the UI below to chat with the analysis (placeholder).</p>
        </div>
      ) : (
        <div>
          <p>No analysis data available.</p>
          <button onClick={() => navigate('/')}>Back to Upload</button>
        </div>
      )}

      <div style={{ marginTop: 20 }}>
        <h3>Chat</h3>
        <div>
          {/* Placeholder chat UI - replace with real chat implementation */}
          <p>(Chat UI goes here)</p>
          <form onSubmit={newMsg}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMsg}
              onChange={e => setInputMsg(e.currentTarget.value)}
            />
            <button type="submit">Send</button>
            <button type="button" onClick={() => { setMessages([]); localStorage.removeItem('chat_messages'); }}>Clear</button>
          </form>

          <div style={{ marginTop: 12 }}>
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              <div>
                {messages.map((m, i) => (
                  <div key={i} style={{ padding: 8, background: m.sender === 'user' ? '#e6f7ff' : '#f0f0f0', marginBottom: 6, borderRadius: 6 }}>
                    <strong>{m.sender === 'user' ? 'You' : 'Bot'}:</strong> {m.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
