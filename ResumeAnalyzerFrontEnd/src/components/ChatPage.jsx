import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";


const ChatPage = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const analysis = location.state?.analysis;
  const [inputMsg, setInputMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // placeholder prompts that user can click to send as messages
  const [placeholderPrompts, setPlaceholderPrompts] = useState([
    "Prepare for an interview based on the resume and job Description",
    "Summarize key strengths from the resume"
  ]);

  const [suggestions, setSuggestions] = useState("");
  const [honestReview, setHonestReview] = useState("");
  const [showDashboard, setShowDashboard] = useState(false);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  
  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${theme}`);
    document.body.classList.remove('theme-light', 'theme-dark');
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  const themeStyles = theme === "dark"
    ? { background: "#43454a", color: "#eee" ,  muted: "#888"}
    : { background: "#fff", color: "#111", muted: "#666" };

    
  // Initialize suggestion/keywords/review from navigation state or props
  useEffect(() => {
    // Check both analysis (from navigation) and direct props
    const dataSource = analysis || props;
    
    if (dataSource && typeof dataSource === 'object') {
      setSuggestions(dataSource.Suggestions || dataSource.suggestions || "");
      setHonestReview(dataSource.HonestReview || dataSource.honestReview || "");
      setShowDashboard(!!(dataSource.Suggestions || dataSource.HonestReview));
    }
  }, [analysis, props]);

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

  // AI response handler
  const sendMessageToAI = async (text) => {
    try {
      // Uncomment when backend is ready
      const response = await axios.post("http://localhost:8080/v1/chat", { message: text });
      return response;
      
      // Simulated response for now
      // await new Promise(resolve => setTimeout(resolve, 600));
      // return {
      //   data: "I'm ready to assist. However, it appears that you haven't shared a resume with me yet. Please go ahead and share the resume you'd like me to summarize, or let me know if there's anything else I can help you with!"
      // };
    } catch (error) {
      console.error("Error sending message:", error);
      return { data: "Sorry, I encountered an error. Please try again." };
    }
  };

  const newMsg = async (e) => {
    e.preventDefault();
    const text = inputMsg.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage = { sender: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInputMsg("");
    setIsLoading(true);

    try {
      // Get AI response
      const response = await sendMessageToAI(text);
      
      // Add bot message
      setMessages(prev => [...prev, { sender: "bot", text: response.data }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "bot", text: "Sorry, something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePromptClick = (prompt) => {
    setInputMsg(prompt);
    // Remove the clicked prompt
    setPlaceholderPrompts((prev) => prev.filter((_, idx) => idx !== placeholderPrompts.indexOf(prompt)));
  };

  const clearChat = () => {
    if (window.confirm("Clear all messages?")) {
      setMessages([]);
      localStorage.removeItem('chat_messages');
    }
  };

  return (
    <div style={themeStyles} className="min-vh-100">
      <div className="container py-3">
        {/* Header Controls */}
        <div className="d-flex justify-content-center align-items-center mb-3">
          <div className="d-flex align-items-center gap-2">
            <button 
              className="btn btn-outline-secondary me-2"
              onClick={() => setShowDashboard(prev => !prev)}
            >
              {showDashboard ? 'Hide Dashboard' : 'Show Dashboard'}
            </button>
            <h1>Resume Analyzer</h1>
            <i className="bi bi-moon border rounded-circle p-2"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </i>
          </div>
         
        </div>

        {/* Dashboard */}
        {showDashboard && (
          <div className="card mb-4" style={themeStyles}>
            <div className="card-body">
              <h2 className="card-title h2">Analysis Dashboard</h2>
              <div className="row">               
                <div className="col-md-6">
                  <h5 className="card-subtitle mb-2">Honest Review</h5>
                  <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                    {honestReview || "No review available"}
                  </p>
                </div>
                <div className="col-md-6">
                  <h5 className="card-subtitle mb-2">Suggestions</h5>
                  <p className="card-text" style={{ whiteSpace: "pre-wrap" }}>
                    {suggestions || "No suggestions available"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Interface */}
        <h1 className="h3 mb-4">Chat with Resume Analyzer</h1>
        
        <div className="card border-0"  style={themeStyles}>
          {/* Messages Area */}
          <div className="card-body" style={{ height: "50vh", overflowY: "auto" }}>
            {messages.length === 0 ? (
              <p className="text-center mt-4" style={themeStyles}>How can I help you today?</p>
            ) : (
              <div className="d-flex flex-column">
                {messages.map((m, i) => (
                  <div 
                    key={i} 
                    className={`mb-2 ${m.sender === 'user' ? 'text-end' : 'text-start'}`}
                  >
                    <span 
                      className={`d-inline-block p-2 rounded-3 ${
                        m.sender === 'user' 
                          ? 'bg-primary text-white' 
                          : 'bg-light text-dark'
                      }`}
                      style={{ maxWidth: '80%' }}
                    >
                      {m.text}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-start">
                    <span className="d-inline-block p-2 rounded-3 bg-light">
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                      AI is thinking...
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="card-footer border-0" style={themeStyles}>
            {/* Prompts */}
            {placeholderPrompts.length > 0 && (
              <div className="d-flex flex-wrap gap-2 mb-2" style={themeStyles}>
                {placeholderPrompts.map((p, i) => (
                  <span
                    key={i}
                    className="badge p-2"
                    style={{ cursor: 'pointer', ...themeStyles }}
                    onClick={() => handlePromptClick(p)}
                  >
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Message Input */}
            <form onSubmit={newMsg} style={themeStyles}>
              <div className="input-group" style={themeStyles}>
                <textarea  style={themeStyles}
                  className="form-control"
                  rows="2"
                  placeholder="Type your message..."
                  value={inputMsg}
                  onChange={e => setInputMsg(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      newMsg(e);
                    }
                  }}
                />
                <button 
                  className="btn btn-primary" 
                  type="submit" 
                  disabled={isLoading || !inputMsg.trim()}
                >
                  Send
                </button>
                
              </div>
              <small style={themeStyles}>Press Enter to send, Shift+Enter for new line</small>
            </form>

            {/* Reset Button */}
            <div className="mt-2">
              <button className="btn btn-sm btn-secondary" onClick={() =>{   axios.post("http://localhost:8080/v1/clear", { }); navigate('/')}}>
                ← Back to Upload
              </button>
               {messages.length > 0 && (
            <button className="btn btn-outline-danger btn-sm" onClick={clearChat}>
              Clear Chat
            </button>
          )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ChatPage;
