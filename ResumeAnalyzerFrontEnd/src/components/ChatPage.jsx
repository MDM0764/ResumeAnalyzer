import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";


const ChatPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([]);

  // placeholder prompts that user can click to send as messages
  const placeholderPrompts = [
    "Prepare for an interview based on the resume and job Description",
    "Summarize key strengths from the resume"
  ];

  const [suggestions, setSuggestions] = useState("");
    const [keyWords, setKeyWords] = useState("");
    const [honestReview, setHonestReview] = useState("");
    const [showDashboard, setShowDashboard] = useState(false);

    // initialise suggestion/keywords/review from navigation state or props
    useEffect(() => {
      const src = analysis || props;
      if (src && typeof src === 'object') {
        const hasData = src.Suggestions || src.KeyWords || src.HonestReview;
        if (hasData) {
          setSuggestions(src.Suggestions || "");
          setKeyWords(src.KeyWords || "");
          setHonestReview(src.HonestReview || "");
          setShowDashboard(true);
        }
      }
    // depend on navigation analysis and common prop fields to avoid setting on every render
    }, [analysis, props.Suggestions, props.KeyWords, props.HonestReview]);
  
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
    const response = {
    "data": "I'm ready to assist. However, it appears that you haven't shared a resume with me yet. Please go ahead and share the resume you'd like me to summarize, or let me know if there's anything else I can help you with!",
    "status": 200}
    // await axios.post("http://localhost:8080/v1/chat",  {message:text })
    console.log("Received response:", response);
    // Use only the response text rather than the full Axios response object
    setMessages((prev) => [...prev, { sender: "bot", text: response.data }]);
  };
  return (
    <div>
       <div style={{ marginTop: 10 }}>
          <button onClick={() => setShowDashboard(prev => !prev)}>
            {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
          </button>
        </div>
      {analysis ? (
        <div>
         {showDashboard && (
					<div style={{ marginTop: 20, border: "1px solid #ddd", padding: 16, borderRadius: 6 }}>
						<h2>Analysis Dashboard</h2>
						
						<div style={{ marginTop: 8 }}>
							<strong>Key Words:</strong>
							<p>{keyWords || "(no keywords)"}</p>
						</div>
						<div style={{ marginTop: 8 }}>
							<strong>Honest Review:</strong>
							<p style={{ whiteSpace: "pre-wrap" }}>{honestReview || "(no review)"}</p>
						</div>
						<div style={{ marginTop: 8 }}>
							<strong>Suggestions:</strong>
							<p style={{ whiteSpace: "pre-wrap" }}>{suggestions || "(no suggestions)"}</p>
						</div>
            
					</div>
          
				)}
        </div>
      ) : (
        <div>
          <p>No analysis data available.</p>
          <button onClick={() => navigate('/')}>Back to Upload</button>
        </div>
      )}
      <h1>Chat with Resume Analyzer</h1>
      <div style={{ marginTop: 20 }}>
       
        <div>
          
          {/* Placeholder chat UI - replace with real chat implementation */}
          <div style={{ marginTop: 12 }}>
            {messages.length === 0 ? (
              <p>No messages yet.</p>
            ) : (
              <div>
                {messages.map((m, i) => (
                  <div key={i} style={{ padding: 8, background: m.sender === 'user' ? '#e6f7ff' : '#f0f0f0', marginBottom: 6, borderRadius: 6 }}>
                    {m.text}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ marginBottom: 12 }}>
            {placeholderPrompts.map((p, i) => (
              <button
                key={i}
                style={{ marginRight: 8, padding: '6px 10px', cursor: 'pointer' }}
                onClick={() => setInputMsg(p)}
              >
                {p}
              </button>
            ))}
          </div>
           <form onSubmit={newMsg}>
            <input
              type="text"
              placeholder="Type your message..."
              value={inputMsg}
              onChange={e => setInputMsg(e.currentTarget.value)}
            />
            <button className="btn btn-primary" type="submit">Send</button>
            <button type="button" onClick={() => { setMessages([]); localStorage.removeItem('chat_messages'); }}>Clear</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
