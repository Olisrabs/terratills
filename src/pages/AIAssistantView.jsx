import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export default function AIAssistantView() {
  const { navigate, apiFetch, showToast, currentUser } = useApp();

  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'ai',
      text: `Hello ${currentUser?.displayName || currentUser?.name || 'Farmer'}! I am your TerraTills AI Agricultural Assistant. I can help you search real farmland leases, calculate tractor machinery rental rates, estimate harvesting crew sizes, or guide your crop production across Nigeria.\n\n*Note: All data and pricing estimates are grounded strictly in real marketplace inventory. I cannot approve certifications or initiate financial transfers.*`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [loading, setLoading] = useState(false);

  const suggestedPrompts = [
    'I need 20 hectares of fertile farmland in Oyo State with river irrigation',
    'How much does renting a 75HP tractor cost in Kaduna for 4 days?',
    'Find a yam harvesting crew in Benue State for 10 hectares',
    'Recommend greenhouse training courses with certified practicals'
  ];

  const handleSendPrompt = async (textToSend) => {
    const q = textToSend || prompt;
    if (!q.trim() || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await apiFetch('/api/assistant/query', {
        method: 'POST',
        body: JSON.stringify({ prompt: q.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI query failed');

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: data.message,
        extracted: data.extracted,
        priceEstimate: data.priceEstimate,
        suggestedListings: data.suggestedListings || [],
        disclaimer: data.disclaimer,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `init_${Date.now()}`,
        sender: 'ai',
        text: 'Started a fresh agricultural advisory session. How can I assist your farming operations today?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 md:px-6 h-[calc(100vh-120px)] flex flex-col pb-16">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl">🤖</span>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">AI Agricultural Assistant</h1>
          </div>
          <p className="text-xs text-slate-500">
            Grounded intelligence querying active platform listings & verified agronomic medians.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="text-xs font-bold text-forest hover:underline bg-forest-50 px-3 py-1.5 rounded-full"
        >
          New Session ↺
        </button>
      </div>

      {/* Suggested Prompts Pill Bar */}
      <div className="py-2.5 flex space-x-2 overflow-x-auto no-scrollbar">
        {suggestedPrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendPrompt(sp)}
            className="text-[11px] font-semibold bg-white border border-slate-200 hover:border-emerald-300 text-slate-700 px-3 py-1.5 rounded-full whitespace-nowrap shadow-xs transition shrink-0"
          >
            💡 {sp}
          </button>
        ))}
      </div>

      {/* Messages Thread Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-card overflow-y-auto no-scrollbar p-5 space-y-4 my-2">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div key={msg.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      
              <div
                className={`max-w-2xl p-4 rounded-3xl text-xs space-y-3 ${
                  isUser
                    ? 'bg-forest text-white rounded-tr-none'
                    : 'bg-slate-50/80 border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-line font-medium">{msg.text}</div>

                {/* Grounded Price Estimate Card if Present */}
                {msg.priceEstimate && (
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-forest block">
                      Grounded Market Guidance (Actual Database Records):
                    </span>
                    <p className="font-extrabold text-sm text-forest">
                      Average: ₦{msg.priceEstimate.average.toLocaleString()} / {msg.priceEstimate.unit}
                    </p>
                    <p className="text-[10px] text-slate-600">Active Rate Range: {msg.priceEstimate.range}</p>
                    <p className="text-[9px] text-slate-500 italic mt-1">{msg.priceEstimate.assumptions}</p>
                  </div>
                )}

                {/* Grounded Real Listings Cards */}
                {msg.suggestedListings && msg.suggestedListings.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Real Marketplace Listings Found:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.suggestedListings.map((l) => (
                        <div
                          key={l.id}
                          onClick={() => navigate(`/dashboard/listings/${l.id}`)}
                          className="bg-white p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer flex space-x-2.5 shadow-xs"
                        >
                          <img src={l.cover_image} alt={l.title} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate leading-snug">{l.title}</h4>
                            <p className="text-[10px] text-slate-400 truncate">📍 {l.location}</p>
                            <span className="text-forest font-bold text-[11px] block mt-0.5">
                              ₦{l.price.toLocaleString()} / {l.pricing_unit}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compliance Disclaimer (Rule 11) */}
                {msg.disclaimer && (
                  <p className="text-[9px] text-slate-400 italic pt-1 border-t border-slate-200">
                    🛡️ {msg.disclaimer}
                  </p>
                )}

                <span className={`text-[9px] block text-right mt-1 ${isUser ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl text-xs flex items-center space-x-2 text-slate-500">
              <span className="w-2 h-2 rounded-full bg-forest animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-forest animate-bounce delay-100"></span>
              <span className="w-2 h-2 rounded-full bg-forest animate-bounce delay-200"></span>
              <span>Querying verified platform inventory...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Composer */}
      <form onSubmit={(e) => { e.preventDefault(); handleSendPrompt(); }} className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for farmland, machinery hire rates, planting labour, or greenhouse guidance..."
          className="flex-1 bg-white border border-slate-200 text-xs rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-forest shadow-xs text-slate-800"
        />
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          className="bg-forest hover:bg-forest-700 disabled:opacity-40 text-white text-xs font-bold px-6 py-3 rounded-full transition shadow-xs whitespace-nowrap"
        >
          Send Query
        </button>
      </form>
    </div>
  );
}

