import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
// import React from 'react';
import { FiSettings } from 'react-icons/fi';

function App() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [gptModel, setGptModel] = useState('gpt-3.5-turbo');
  const inputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    // Generate a unique client ID when the component mounts
    setClientId(Math.random().toString(36).substring(7));
    
    // Load API key from local storage
    const storedApiKey = localStorage.getItem('openaiApiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }

    // Load GPT model from local storage
    const storedGptModel = localStorage.getItem('gptModel');
    if (storedGptModel) {
      setGptModel(storedGptModel);
    }
  }, []);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isLoading) {
      inputRef.current?.focus();
    }
  }, [isLoading]);

  const saveSettings = () => {
    localStorage.setItem('openaiApiKey', apiKey);
    localStorage.setItem('gptModel', gptModel);
    setShowSettings(false);
  };

  const sendMessage = async () => {
    if (input.trim() === '' || isLoading) return;

    setIsLoading(true);
    try {
      setMessages(prevMessages => [...prevMessages, `You: ${input}`]);
      setInput('');

      const response = await axios.post(`${import.meta.env.VITE_SERVER_ADDRESS}/chat/${clientId}`, {
        message: input,
        apiKey: apiKey,
        model: gptModel
      });

      setMessages(prevMessages => [...prevMessages, `AI: ${response.data}`]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prevMessages => [...prevMessages, 'Error: Failed to get response']);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-blue-500 text-white p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          Finai
        </h1>
        <div className="flex items-center">
          {/* <p className="text-lg italic mr-4">Your AI-powered financial analyst</p> */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            <FiSettings /> 
          </button>
        </div>
      </div>
      
      {showSettings && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Settings</h2>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              OpenAI API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
              placeholder="Enter OpenAI API Key"
            />
            <label htmlFor="gptModel" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
              GPT Model
            </label>
            <select
              id="gptModel"
              value={gptModel}
              onChange={(e) => setGptModel(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            >
              <option value="gpt-3.5-turbo">GPT-3.5-Turbo</option>
              <option value="gpt-4o">GPT-4o</option>
            </select>
            <div className="flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="mr-2 bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.startsWith('You:') ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-2 rounded-lg ${
              msg.startsWith('You:') ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'
            }`}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                {msg.replace(/^You: |^AI: /, '')}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="bg-white p-4 flex">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <button 
          onClick={sendMessage}
          disabled={isLoading}
          className={`ml-2 text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            isLoading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isLoading ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default App;