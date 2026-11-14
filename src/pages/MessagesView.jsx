import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingView, EmptyView, ErrorView } from '../components/StateViews';

export default function MessagesView() {
  const { routeParams, navigate, apiFetch, showToast, currentUser } = useApp();
  const selectedConvId = routeParams.conversationId;

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch('/api/messages');
      if (!res.ok) throw new Error('Failed to load conversations');
      const data = await res.json();
      setConversations(data);

      if (selectedConvId) {
        loadConversation(selectedConvId);
      } else if (data.length > 0 && window.innerWidth >= 768) {
        loadConversation(data[0].id);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id) => {
    try {
      const res = await apiFetch(`/api/messages/${id}`);
      if (!res.ok) throw new Error('Failed to load conversation');
      const data = await res.json();
      setActiveConv(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [currentUser]);

  useEffect(() => {
    if (selectedConvId) {
      loadConversation(selectedConvId);
    }
  }, [selectedConvId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv) return;
    setSending(true);
    try {
      const res = await apiFetch(`/api/messages/${activeConv.id}/send`, {
        method: 'POST',
        body: JSON.stringify({ text: messageText.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send message');

      setActiveConv((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), data.message]
      }));
      setMessageText('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <LoadingView message="Loading encrypted messages inbox..." />;
  if (error) return <ErrorView error={error} onRetry={fetchConversations} />;

  const filteredConvs = conversations.filter(
    (c) =>
      c.listing_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-4 px-4 md:px-6 h-[calc(100vh-120px)] flex flex-col pb-16">
      
      <div className="mb-3">
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Messages & Inquiries</h1>
        <p className="text-xs text-slate-500">
          Direct communication with service providers and customers across Nigeria.
        </p>
      </div>

      {/* Split Pane Architecture */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Left Pane: Conversation List */}
        <div className={`w-full md:w-80 border-r border-slate-100 flex flex-col ${
          activeConv && selectedConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search bar */}
          <div className="p-3 border-b border-slate-100">
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-xs rounded-full px-3 py-2 text-slate-700"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-100">
            {filteredConvs.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No conversations found.</p>
            ) : (
              filteredConvs.map((conv) => {
                const isSelected = activeConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      navigate(`/dashboard/messages/${conv.id}`);
                      loadConversation(conv.id);
                    }}
                    className={`p-3.5 hover:bg-slate-50 cursor-pointer transition flex items-start space-x-3 ${
                      isSelected ? 'bg-forest-50/70 border-l-4 border-forest' : ''
                    }`}
                  >
                    <img
                      src={conv.otherParticipant?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {conv.otherParticipant?.name}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>
                      <p className="text-[11px] font-semibold text-forest truncate">{conv.listing_title}</p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Pane: Conversation Active Chat */}
        <div className={`flex-1 flex flex-col bg-slate-50/40 ${
          !activeConv && !selectedConvId ? 'hidden md:flex' : 'flex'
        }`}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 px-5 bg-white border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate('/dashboard/messages')}
                    className="md:hidden text-slate-400 hover:text-slate-800 text-xs font-bold mr-1"
                  >
                    ←
                  </button>
                  <img
                    src={activeConv.otherParticipant?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
                    alt="Participant"
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{activeConv.otherParticipant?.name}</h3>
                    <p className="text-[10px] text-emerald-700 font-semibold">{activeConv.otherParticipant?.badge || 'Verified Member'}</p>
                  </div>
                </div>

                {activeConv.booking_id && (
                  <button
                    onClick={() => navigate(`/dashboard/bookings/${activeConv.booking_id}`)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-forest text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 transition"
                  >
                    View Booking Record →
                  </button>
                )}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto no-scrollbar space-y-3">
                {activeConv.messages?.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      
                      <div className={`max-w-xs md:max-w-md p-3.5 rounded-2xl text-xs ${
                        isMe ? 'bg-forest text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                      }`}>
                        <p className="leading-relaxed">{msg.text}</p>
                        <span className={`text-[9px] block text-right mt-1.5 ${isMe ? 'text-emerald-200' : 'text-slate-400'}`}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Composer */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message to this participant..."
                  className="flex-1 bg-slate-50 border border-slate-200 text-xs rounded-full px-4 py-2.5 focus:ring-2 focus:ring-forest"
                />
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="bg-forest hover:bg-forest-700 disabled:opacity-40 text-white text-xs font-bold px-5 py-2.5 rounded-full transition shadow-xs"
                >
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-400 text-xs">
              Select a conversation from the left pane to view messages.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

