import { useState } from 'react';
import ChatInputApp from './chat/ChatInputApp';
import FilterSentenceApp from './filter/FilterSentenceApp';
import MentionTaggingApp from './mention/MentionTaggingApp';
import './App.css';

type Tab = 'chat' | 'filter' | 'mention';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h1>Smart Input Examples</h1>
        <p>Explore different smart input features in one place</p>
      </div>

      <div className="tabs">
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          Chat Input
        </button>
        <button
          className={`tab-button ${activeTab === 'filter' ? 'active' : ''}`}
          onClick={() => setActiveTab('filter')}
        >
          Filter Sentence
        </button>
        <button
          className={`tab-button ${activeTab === 'mention' ? 'active' : ''}`}
          onClick={() => setActiveTab('mention')}
        >
          Mention & Tagging
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'chat' && <ChatInputApp />}
        {activeTab === 'filter' && <FilterSentenceApp />}
        {activeTab === 'mention' && <MentionTaggingApp />}
      </div>
    </div>
  );
}

export default App;
