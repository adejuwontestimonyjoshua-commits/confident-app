import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const App = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [showKeyInput, setShowKeyInput] = useState(true);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        if (!apiKey.trim()) {
            alert('Please enter your Claude API key first');
            return;
        }

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'claude-3-haiku-20240307',
                    max_tokens: 300,
                    messages: [
                        {
                            role: 'user',
                            content: `You are a confident, direct executive coach. Give clear, actionable advice with zero fluff. Be bold, decisive, and slightly blunt. Keep responses under 150 words.
                            
                            User: ${input}`
                        }
                    ]
                })
            });

            const data = await response.json();
            
            if (response.status === 401) {
                setMessages(prev => [...prev, { role: 'assistant', content: '❌ Invalid API key. Please check and re-enter.' }]);
            } else if (data.content && data.content[0]) {
                const aiText = data.content[0].text;
                setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Error: ' + (data.error?.message || 'Unknown error') }]);
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Network error. Check your connection.' }]);
        }
        setLoading(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    if (showKeyInput) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
                    <h1 className="text-3xl font-bold text-white mb-2">⚡ Confident HQ</h1>
                    <p className="text-gray-400 mb-6">Enter your Claude API key to start</p>
                    <input
                        type="password"
                        placeholder="Paste your Claude API key here"
                        className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none mb-4"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                    <button
                        onClick={() => setShowKeyInput(false)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition"
                    >
                        Launch App →
                    </button>
                    <p className="text-xs text-gray-500 mt-4 text-center">
                        Get your key at <a href="https://console.anthropic.com" target="_blank" className="text-blue-400 underline">console.anthropic.com</a>
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-white">⚡ Confident HQ</h1>
                <button
                    onClick={() => setShowKeyInput(true)}
                    className="text-xs text-gray-400 hover:text-white px-3 py-1 bg-gray-700 rounded"
                >
                    Change Key
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-3xl mx-auto w-full">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-5xl mb-4">💪</p>
                        <p className="text-lg">Ask me anything. Get a confident answer.</p>
                        <p className="text-sm text-gray-600">No fluff. Just direct advice.</p>
                    </div>
                )}
                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-200 border border-gray-700'}`}>
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 text-gray-200 p-4 rounded-2xl border border-gray-700">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div className="bg-gray-800 border-t border-gray-700 p-4">
                <div className="max-w-3xl mx-auto flex gap-3">
                    <textarea
                        rows="1"
                        placeholder="Type your question..."
                        className="flex-1 p-3 rounded-xl bg-gray-700 text-white border border-gray-600 focus:border-blue-500 outline-none resize-none"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-bold px-6 rounded-xl transition"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default App;
