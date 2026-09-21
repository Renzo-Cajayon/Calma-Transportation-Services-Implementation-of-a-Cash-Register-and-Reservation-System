import { useState } from 'react';

export default function LiveChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'support', text: 'Hello! I am your Calma Transportation AI Assistant. How can I help you with your car rental today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessageText = input;
    const userMsg = { sender: 'user', text: userMessageText };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Kumokonekta ito sa iyong backend API kung saan pinoproseso ng AI ang tanong
      const response = await fetch('http://localhost:5000/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, { sender: 'support', text: data.reply }]);
      } else {
        setMessages(prev => [...prev, { sender: 'support', text: 'Paumanhin, nagkaproblema sa pagkuha ng sagot mula sa AI.' }]);
      }
    } catch (err) {
      console.error("AI Chat Error:", err);
      setMessages(prev => [...prev, { sender: 'support', text: 'Pasensya na, hindi ako makakonekta sa server sa ngayon.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '25px', right: '25px', zIndex: 1060 }}>
      {/* Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="btn btn-lg rounded-circle shadow-lg d-flex align-items-center justify-content-center text-white"
          style={{ width: '60px', height: '60px', backgroundColor: '#0f172a', border: '2px solid #38bdf8' }}
          title="Chat with AI Support"
        >
          <i className="fa fa-robot" style={{ fontSize: '1.4rem' }}></i>
        </button>
      )}

      {/* Chat Window Box */}
      {isOpen && (
        <div className="card shadow-lg border-0" style={{ width: '340px', height: '450px', borderRadius: '15px', overflow: 'hidden' }}>
          
          {/* Header */}
          <div className="card-header text-white d-flex justify-content-between align-items-center py-3" style={{ backgroundColor: '#0f172a' }}>
            <div className="d-flex align-items-center">
              <span className="badge badge-success rounded-circle p-1 mr-2" style={{ width: '10px', height: '10px' }}></span>
              <span className="font-weight-bold" style={{ fontSize: '0.95rem' }}>Calma AI Assistant</span>
            </div>
            <button 
              type="button" 
              className="btn btn-sm text-white p-0 border-0 bg-transparent" 
              onClick={() => setIsOpen(false)}
              style={{ fontSize: '1.3rem' }}
            >
              &times;
            </button>
          </div>

          {/* Messages Body */}
          <div className="card-body bg-light p-3 d-flex flex-column" style={{ overflowY: 'auto', flex: 1, gap: '10px' }}>
            {messages.map((m, index) => (
              <div 
                key={index} 
                className={`p-2 rounded shadow-sm small ${m.sender === 'user' ? 'ml-auto bg-primary text-white' : 'mr-auto bg-white text-dark'}`}
                style={{ maxWidth: '80%', borderRadius: '10px', wordBreak: 'break-word' }}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="mr-auto bg-white p-2 rounded shadow-sm small text-muted font-italic">
                AI is typing...
              </div>
            )}
          </div>

          {/* Input Footer */}
          <div className="card-footer bg-white border-top p-2">
            <form onSubmit={handleSend} className="input-group">
              <input
                type="text"
                className="form-control form-control-sm border-0 bg-light"
                placeholder="Ask about cars, rentals..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
              />
              <div className="input-group-append">
                <button className="btn btn-sm text-white px-3" type="submit" style={{ backgroundColor: '#0f172a', border: 'none' }} disabled={loading}>
                  <i className="fa fa-paper-plane"></i>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
}