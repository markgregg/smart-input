import type { Story } from '@ladle/react';
import { SmartInput, Block, Editor } from '@smart-input/core';
import { TypeaheadLookup } from './TypeaheadLookup';
import { LookupFn, LookupMatch } from './utils/typeaheadLookup';
import { useState } from 'react';

// Sample data for lookups
const users = [
  'Alice Johnson',
  'Bob Smith',
  'Charlie Brown',
  'Diana Prince',
  'Eve Anderson',
];
const tags = ['#important', '#urgent', '#followup', '#review', '#done'];
const mentions = ['@john', '@sarah', '@mike', '@emma', '@alex'];

// Simple lookup function for users
const userLookup: LookupFn = {
  category: 'Users',
  func: async (query: string): Promise<LookupMatch[]> => {
    return users
      .filter((user) => user.toLowerCase().includes(query.toLowerCase()))
      .map((user) => ({
        text: user,
        score: 1,
      }));
  },
};

// Simple lookup function for tags
const tagLookup: LookupFn = {
  category: 'Tags',
  func: async (query: string): Promise<LookupMatch[]> => {
    return tags
      .filter((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      .map((tag) => ({
        text: tag,
        score: 1,
      }));
  },
};

// Simple lookup function for mentions
const mentionLookup: LookupFn = {
  category: 'Mentions',
  func: async (query: string): Promise<LookupMatch[]> => {
    return mentions
      .filter((mention) => mention.toLowerCase().includes(query.toLowerCase()))
      .map((mention) => ({
        text: mention,
        score: 1,
      }));
  },
};

export const BasicTypeahead: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Type to see suggestions (min 2 characters)
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Start typing to see suggestions..." />
        <TypeaheadLookup lookups={[userLookup]} minSearchLength={2} />
      </SmartInput>
    </div>
  );
};

BasicTypeahead.meta = {
  description: 'Basic typeahead with user lookup',
};

export const WithCategories: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Type to search users, tags, or mentions (min 2 characters)
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Try typing names, #tags, or @mentions..." />
        <TypeaheadLookup
          lookups={[userLookup, tagLookup, mentionLookup]}
          minSearchLength={2}
          showCategory={true}
        />
      </SmartInput>
    </div>
  );
};

WithCategories.meta = {
  description: 'Typeahead with multiple lookups and categories',
};

export const AutoInsert: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Type @ followed by a name - when there&apos;s only one match, it
        auto-inserts
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Try typing @j or @s..." />
        <TypeaheadLookup
          lookups={[mentionLookup]}
          minSearchLength={1}
          autoInsert={true}
          wordsToCheck={1}
        />
      </SmartInput>
    </div>
  );
};

AutoInsert.meta = {
  description: 'Typeahead with auto-insert for single matches',
};

export const WithHighlight: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Matching text is highlighted in suggestions
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Start typing..." />
        <TypeaheadLookup
          lookups={[userLookup]}
          minSearchLength={2}
          highlightMatch={true}
          showScore={true}
        />
      </SmartInput>
    </div>
  );
};

WithHighlight.meta = {
  description: 'Typeahead with highlighted matches and scores',
};

export const CustomStyling: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Typeahead with custom max height and width
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Start typing..." />
        <TypeaheadLookup
          lookups={[userLookup, tagLookup]}
          minSearchLength={1}
          maxHeight={150}
          maxWidth={300}
          showCategory={true}
        />
      </SmartInput>
    </div>
  );
};

CustomStyling.meta = {
  description: 'Typeahead with custom dimensions',
};

export const WithCallback: Story = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selected, setSelected] = useState<string>('');

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <p style={{ marginBottom: '10px', color: '#666' }}>
        Selected: <strong>{selected || 'None'}</strong>
      </p>
      <SmartInput blocks={blocks} onBlocksChange={setBlocks}>
        <Editor placeholder="Select a suggestion to see callback..." />
        <TypeaheadLookup
          lookups={[userLookup, tagLookup]}
          minSearchLength={2}
          showCategory={true}
          onSelect={(result) => setSelected(result.text)}
        />
      </SmartInput>
    </div>
  );
};

WithCallback.meta = {
  description: 'Typeahead with selection callback',
};
