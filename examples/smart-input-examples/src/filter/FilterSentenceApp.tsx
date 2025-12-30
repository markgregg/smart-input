import { useState, useRef } from 'react';
import {
  SmartInput,
  SmartInputApi,
  Editor,
  ErrorBoundary,
  BlockType,
  Block,
} from '@smart-input/core';
import { TypeaheadLookup } from '@smart-input/typeahead';
import { CommitNotifier } from '@smart-input/commitnotifier';
import {
  ReactBlocksManager,
  ReactBlockComponent,
} from '@smart-input/reactblocks';
import FilterPill from './FilterPill';

interface Field {
  name: string;
  type: string;
  operators: string[];
  values: string[];
}

// Sample data
const fields: Field[] = [
  {
    name: 'Status',
    type: 'select',
    operators: ['is', 'is not'],
    values: ['Active', 'Inactive', 'Pending'],
  },
  {
    name: 'Priority',
    type: 'select',
    operators: ['is', 'is not', '>', '<'],
    values: ['Low', 'Medium', 'High', 'Critical'],
  },
  {
    name: 'Assignee',
    type: 'text',
    operators: ['is', 'is not', 'contains'],
    values: ['John', 'Jane', 'Bob'],
  },
];

function FilterSentenceApp() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [reactBlocks, setReactBlocks] = useState<ReactBlockComponent[]>([]);
  const [currentStep, setCurrentStep] = useState<
    'field' | 'operator' | 'value'
  >('field');
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
  const [selectedValue, setSelectedValue] = useState<string | null>(null);
  const [currentFilterBlocks, setCurrentFilterBlocks] = useState<string[]>([]);
  const apiRef = useRef<SmartInputApi>(null);
  const blockCounterRef = useRef(0);

  const removePill = (pillId: string) => {
    /* Beware of having stale state if you reference a function on a react block that isn't updated*/
    setReactBlocks((blks) => blks.filter((rb) => rb.blockId !== pillId));
    setBlocks((blks) =>
      blks.filter((block) => !('id' in block) || block.id !== pillId),
    );
    apiRef.current?.apply((api) => {
      api.setBlocks(
        api
          .getBlocks()
          .filter((block) => !('id' in block) || block.id !== pillId),
      );
    });
  };

  // Lookup function for filter components
  const filterLookup = async (query: string) => {
    if (currentStep === 'field') {
      return fields
        .filter((field) =>
          field.name.toLowerCase().includes(query.toLowerCase()),
        )
        .map((field) => ({
          text: field.name,
          score: field.name.toLowerCase().startsWith(query.toLowerCase())
            ? 0
            : 1,
        }));
    } else if (currentStep === 'operator') {
      if (!selectedField) return [];
      return selectedField.operators
        .filter((op) => op.toLowerCase().includes(query.toLowerCase()))
        .map((op) => ({
          text: op,
          score: op.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1,
        }));
    } else if (currentStep === 'value') {
      if (!selectedField) return [];
      return selectedField.values
        .filter((val) => val.toLowerCase().includes(query.toLowerCase()))
        .map((val) => ({
          text: val,
          score: val.toLowerCase().startsWith(query.toLowerCase()) ? 0 : 1,
        }));
    }
    return [];
  };

  // Handle selection
  const handleSelect = (item: any) => {
    if (currentStep === 'field') {
      const field = fields.find((f) => f.name === item.text);
      if (!field) return;
      setSelectedField(field);
      const blockId = `field-${Date.now()}-${blockCounterRef.current++}`;
      const newBlock: Block = {
        id: blockId,
        type: BlockType.Styled,
        text: field.name,
        style: { fontStyle: 'italic' },
      };
      const updatedBlocks: Block[] = [
        ...blocks,
        newBlock,
        { type: BlockType.Text, text: ' ' },
      ];
      setBlocks(updatedBlocks);
      apiRef.current?.apply((api) => {
        api.setBlocks(updatedBlocks);
      });
      setTimeout(
        () => apiRef.current?.setCursorPosition(apiRef.current.getTextLength()),
        0,
      );
      setCurrentFilterBlocks((prev) => [...prev, blockId]);
      setCurrentStep('operator');
    } else if (currentStep === 'operator') {
      setSelectedOperator(item.text);
      const blockId = `operator-${Date.now()}-${blockCounterRef.current++}`;
      const newBlock: Block = {
        id: blockId,
        type: BlockType.Styled,
        text: item.text,
        style: { fontStyle: 'italic' },
      };
      const updatedBlocks: Block[] = [
        ...blocks,
        newBlock,
        { type: BlockType.Text, text: ' ' },
      ];
      setBlocks(updatedBlocks);
      apiRef.current?.apply((api) => {
        api.setBlocks(updatedBlocks);
      });
      setTimeout(
        () => apiRef.current?.setCursorPosition(apiRef.current.getTextLength()),
        0,
      );
      setCurrentFilterBlocks((prev) => [...prev, blockId]);
      setCurrentStep('value');
    } else if (currentStep === 'value') {
      setSelectedValue(item.text);
      const blockId = `value-${Date.now()}-${blockCounterRef.current++}`;
      const newBlock: Block = {
        id: blockId,
        type: BlockType.Styled,
        text: item.text,
        style: { fontStyle: 'italic' },
      };
      const updatedBlocks: Block[] = [
        ...blocks,
        newBlock,
        { type: BlockType.Text, text: ' ' },
      ];
      setBlocks(updatedBlocks);
      apiRef.current?.apply((api) => {
        api.setBlocks(updatedBlocks);
      });
      setTimeout(
        () => apiRef.current?.setCursorPosition(apiRef.current.getTextLength()),
        0,
      );
      setCurrentFilterBlocks((prev) => [...prev, blockId]);
      setCurrentStep('field');
    }
  };

  const handleCommit = () => {
    if (
      currentFilterBlocks.length === 3 &&
      selectedField &&
      selectedOperator &&
      selectedValue
    ) {
      const pillId = `pill-${Date.now()}-${blockCounterRef.current++}`;
      const newBlocks = blocks.filter(
        (b) => 'id' in b && !currentFilterBlocks.includes(b.id),
      );
      newBlocks.push({
        id: pillId,
        type: BlockType.Styled,
        text: '',
        uneditable: true,
        undeletable: true,
      });
      setBlocks(newBlocks);
      apiRef.current?.apply((api) => {
        api.setBlocks(newBlocks);
      });
      console.log(newBlocks);
      setReactBlocks((prev) => [
        ...prev,
        {
          blockId: pillId,
          component: (
            <FilterPill
              field={selectedField.name}
              operator={selectedOperator}
              value={selectedValue}
              onDelete={() => removePill(pillId)}
            />
          ),
        },
      ]);
      // Move cursor to end
      setTimeout(() => {
        apiRef.current?.setCursorPosition(apiRef.current.getTextLength());
      }, 0);
      setCurrentFilterBlocks([]);
      setSelectedField(null);
      setSelectedOperator(null);
      setSelectedValue(null);
    }
    return true;
  };

  const handleClear = () => {
    setReactBlocks([]);
    setBlocks([]);
    setCurrentFilterBlocks([]);
    setSelectedField(null);
    setSelectedOperator(null);
    setSelectedValue(null);
    setCurrentStep('field');
    apiRef.current?.apply((api) => {
      api.setBlocks([]);
    });
    apiRef.current?.focus();
  };

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>🔍 Filter Sentence Builder</h1>
      </div>

      <div className="demo-section">
        <div className="instructions">
          <h3>Try it out:</h3>
          <ul>
            <li>Start typing to see available fields</li>
            <li>Select a field to proceed to operators</li>
            <li>Select an operator to proceed to values</li>
            <li>Select a value, then press Enter to create a filter pill</li>
            <li>Repeat to add multiple filters</li>
          </ul>
        </div>

        <div className="editor-wrapper">
          <ErrorBoundary
            errorMessage="The editor encountered an error"
            onError={({ error }) => {
              console.error('Editor error:', error);
            }}
          >
            <SmartInput ref={apiRef}>
              <TypeaheadLookup
                lookups={[
                  {
                    category: 'filter',
                    func: filterLookup,
                  },
                ]}
                wordsToCheck={1}
                minSearchLength={1}
                autoHighlight={true}
                onSelect={handleSelect}
                position="below"
              />
              <CommitNotifier onCommit={handleCommit} />
              <Editor placeholder="Start building your filter sentence..." />
              <ReactBlocksManager reactBlocks={reactBlocks} />
            </SmartInput>
          </ErrorBoundary>

          <div className="editor-actions">
            <button onClick={handleClear} className="clear-button">
              Clear
            </button>
          </div>
        </div>

        <div className="feature-highlights">
          <div className="feature">
            <h4>🔍 Sequential Dropdowns</h4>
            <p>Select field, then operator, then value in sequence</p>
          </div>
          <div className="feature">
            <h4>⚛️ React Components</h4>
            <p>Filter pills rendered as interactive React components</p>
          </div>
          <div className="feature">
            <h4>⌨️ Keyboard Friendly</h4>
            <p>Full keyboard navigation with Enter to confirm</p>
          </div>
        </div>
      </div>

      <div className="data-display">
        <div className="data-column">
          <h3>Available Fields</h3>
          <div className="field-list">
            {fields.map((field) => (
              <div key={field.name} className="field-card">
                <div>
                  <div className="field-name">{field.name}</div>
                  <div className="field-type">{field.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="data-column">
          <h3>Operators</h3>
          <div className="operator-list">
            {selectedField ? (
              selectedField.operators.map((op) => (
                <div key={op} className="operator-card">
                  <div className="operator-name">{op}</div>
                </div>
              ))
            ) : (
              <p>Select a field first</p>
            )}
          </div>
        </div>

        <div className="data-column">
          <h3>Values</h3>
          <div className="value-list">
            {selectedField ? (
              selectedField.values.map((val) => (
                <div key={val} className="value-card">
                  <div className="value-name">{val}</div>
                </div>
              ))
            ) : (
              <p>Select a field first</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterSentenceApp;
