import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '../store/useAppStore';
import { Send, Plus, Mic, Image as ImageIcon, CheckCircle2, BarChart2, X, Info, BadgeCheck, ShieldCheck } from 'lucide-react';
import { cn, getArabicDayName } from '../lib/utils';

export function ChatScreen() {
  const { messages, user, players, polls, activeBookingId, sendMessage, voteInPoll, createPoll, setViewingPlayerId } = useAppStore();
  const [input, setInput] = useState('');
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '']);
  const scrollRef = useRef<HTMLDivElement>(null);

  const filteredMessages = messages.filter(m => m.bookingId === activeBookingId);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  const handleSendImage = () => {
    const urls = [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1431324155629-1a6eda1db46a?w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518005020250-ecc405233157?w=800&auto=format&fit=crop'
    ];
    sendMessage(urls[Math.floor(Math.random() * urls.length)], 'image');
  };

  const handleSendVoice = () => {
    sendMessage('0:14', 'voice');
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim() !== '');
    if (pollQuestion.trim() && validOptions.length >= 2) {
      createPoll(pollQuestion, validOptions);
      setPollQuestion('');
      setPollOptions(['', '']);
      setShowPollCreator(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)]">
      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth"
      >
        <div className="flex justify-center mb-4">
          <span className="text-[10px] text-white/20 bg-white/5 py-1 px-3 rounded-full font-arabic">
            {getArabicDayName(new Date().toISOString().split('T')[0])}
          </span>
        </div>

        {filteredMessages.map((msg) => {
          const sender = players.find(p => p.id === msg.senderId);
          const isMe = msg.senderId === user?.id;

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex flex-col max-w-[85%]",
                isMe ? "bg-brand text-background self-start rounded-2xl rounded-tr-none shadow-lg shadow-brand/10" : "bg-card text-white self-end rounded-2xl rounded-tl-none",
                msg.type === 'image' ? "p-1.5" : "p-4"
              )}
            >
              {!isMe && (
                <div 
                  onClick={() => setViewingPlayerId(msg.senderId)}
                  className="cursor-pointer active:opacity-60 transition-opacity"
                >
                  <span className={cn(
                    "text-xs font-bold font-arabic mb-1 flex items-center gap-1",
                    msg.type === 'image' ? "px-2.5 pt-1.5" : "",
                    sender?.isAdmin ? "text-brand" : "text-brand-light"
                  )}>
                    {sender?.name}
                    {sender?.isVerified && <BadgeCheck size={12} className="text-brand" />}
                    {sender?.isSuperAdmin ? (
                      <ShieldCheck size={12} className="text-brand" title="مشرف أساسي" />
                    ) : sender?.isAdmin ? (
                      <ShieldCheck size={12} className="text-blue-400" title="مشرف مجموعة" />
                    ) : null}
                  </span>
                </div>
              )}

              {msg.type === 'text' && <p className="text-sm font-arabic leading-relaxed">{msg.content}</p>}
              
              {msg.type === 'image' && (
                <div className="rounded-xl overflow-hidden">
                  <img src={msg.content} className="w-full h-auto max-h-60 object-cover" alt="ارسل صورة" />
                </div>
              )}

              {msg.type === 'voice' && (
                <div className="flex items-center gap-4 py-1">
                   <div className={cn(
                     "w-10 h-10 rounded-full flex items-center justify-center",
                     isMe ? "bg-background/20 text-background" : "bg-brand text-background"
                   )}>
                      <Mic size={16} />
                   </div>
                   <div className="flex-1 flex items-end gap-1 px-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className={cn("w-1 rounded-full", isMe ? "bg-background/30" : "bg-brand/30")} style={{ height: `${Math.random() * 20 + 5}px` }} />
                      ))}
                   </div>
                   <span className={cn("text-[10px] font-mono", isMe ? "text-background/40" : "text-white/40")}>{msg.content}</span>
                </div>
              )}

              {msg.type === 'poll' && (
                <div className="bg-background/10 rounded-xl p-3 border border-white/5">
                   <div className="flex items-center gap-2 text-xs font-bold font-arabic mb-2">
                     <BarChart2 size={14} className="text-brand" />
                     <span>تصويت: {msg.content}</span>
                   </div>
                   {(() => {
                     const poll = polls.find(p => p.id === msg.pollId);
                     if (!poll) return <span className="text-[10px] opacity-40">جاري تحميل التصويت...</span>;
                     return <ChatPollItem poll={poll} onVote={(id) => voteInPoll(poll.id, id)} user={user} players={players} />;
                   })()}
                </div>
              )}

              <div className={cn(
                "text-[9px] mt-2 font-mono opacity-40",
                msg.type === 'image' ? "px-2 pb-1.5" : "",
                isMe ? "text-right" : "text-left"
              )}>
                {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </motion.div>
          );
        })}

        {/* Removed redundant poll mapping */}
      </div>

      {/* Poll Creator Modal */}
      {showPollCreator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowPollCreator(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card w-full max-w-sm rounded-3xl p-6 border border-white/5 shadow-2xl"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold font-arabic text-lg text-brand">إنشاء تصويت جديد</h3>
              <button onClick={() => setShowPollCreator(false)} className="text-white/20 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] text-white/40 font-arabic mb-1 mr-2">سؤال التصويت</label>
                <input 
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  placeholder="مثال: من حاضر لمباراة اليوم؟"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-sm font-arabic outline-none focus:border-brand/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] text-white/40 font-arabic mb-1 mr-2">الخيارات</label>
                {pollOptions.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...pollOptions];
                        newOpts[i] = e.target.value;
                        setPollOptions(newOpts);
                      }}
                      placeholder={`خيار ${i + 1}`}
                      className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3 text-sm font-arabic outline-none focus:border-brand/50 transition-all"
                    />
                    {pollOptions.length > 2 && (
                      <button 
                        onClick={() => setPollOptions(pollOptions.filter((_, idx) => idx !== i))}
                        className="text-danger/40 hover:text-danger px-2"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                
                <button 
                  onClick={() => setPollOptions([...pollOptions, ''])}
                  className="text-[10px] text-brand font-bold font-arabic mt-2 px-2"
                >
                  + إضافة خيار
                </button>
              </div>

              <button 
                onClick={handleCreatePoll}
                className="w-full py-4 bg-brand text-background rounded-2xl font-black font-arabic shadow-xl shadow-brand/20 active:scale-[0.98] transition-all"
              >
                إنشاء وإرسال
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 bg-background border-t border-white/5 safe-paddding-bottom">
        <div className="flex items-center gap-3 bg-card rounded-3xl p-1.5 border border-white/5 ring-1 ring-white/5">
          <button 
            onClick={() => setShowPollCreator(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full text-brand/60 hover:text-brand transition-colors bg-brand/5"
          >
            <Plus size={20} />
          </button>
          
          <button 
            onClick={handleSendImage}
            className="flex items-center justify-center w-10 h-10 rounded-full text-white/40 hover:text-white transition-colors"
          >
            <ImageIcon size={20} />
          </button>
          
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالة..."
            className="flex-1 bg-transparent border-none outline-none text-sm font-arabic py-2 px-2 placeholder:text-white/20"
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          
          <div className="flex items-center gap-1">
            <button 
              onClick={handleSendVoice}
              className="flex items-center justify-center w-10 h-10 rounded-full text-brand/60 hover:text-brand transition-colors"
            >
              <Mic size={20} />
            </button>
            <button 
              onClick={handleSend}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-brand text-background shadow-lg shadow-brand/20 active:scale-95 transition-transform"
            >
              <Send size={20} className="mr-0.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPollItem({ poll, onVote, user, players }: { poll: any, onVote: (id: string) => void, user: any, players: any[] }) {
  const totalVotes = poll.options.reduce((sum: number, o: any) => sum + o.votes.length, 0);
  const [expandedOptions, setExpandedOptions] = useState<Record<string, boolean>>({});

  const toggleExpanded = (id: string) => {
    setExpandedOptions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3">
      {poll.options.map((opt: any) => {
        const isVoted = opt.votes.includes(user?.id);
        const percent = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
        const voters = players.filter(p => opt.votes.includes(p.id));
        const isExpanded = expandedOptions[opt.id];

        return (
          <div key={opt.id} className="space-y-1.5">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onVote(opt.id);
              }}
              className={cn(
                "w-full text-right p-3 rounded-xl border transition-all relative overflow-hidden group",
                isVoted ? "border-brand bg-brand/10" : "border-white/10 bg-white/5 hover:border-brand/20"
              )}
            >
              <motion.div 
                initial={false}
                animate={{ width: `${percent}%` }}
                className="absolute inset-y-0 right-0 bg-brand/20 transition-all opacity-50" 
              />
              
              <div className="relative flex justify-between items-center z-10">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                    isVoted ? "border-brand bg-brand text-background" : "border-white/20"
                  )}>
                    {isVoted && <CheckCircle2 size={10} />}
                  </div>
                  <span className="text-[11px] font-bold font-arabic">{opt.text}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-arabic text-white/40">{opt.votes.length} صوت</span>
                  <span className="text-[10px] font-mono font-bold text-brand">{percent}%</span>
                </div>
              </div>
            </button>
            
            {voters.length > 0 && (
              <div className="space-y-1">
                <button 
                  onClick={() => toggleExpanded(opt.id)}
                  className="text-[9px] text-white/20 font-arabic px-2 hover:text-white transition-colors"
                >
                  {isExpanded ? 'إخفاء المصوتين' : 'عرض المصوتين...'}
                </button>
                {isExpanded && (
                  <div className="flex flex-wrap gap-1 px-1">
                    {voters.map(v => (
                      <span key={v.id} className="text-[8px] font-arabic text-white/30 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                        {v.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  );
}
