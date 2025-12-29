import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './components/App';
import { TestProps } from './props';

import './index.less';

// Parse props from URL query parameter
const getTestPropsFromURL = (): TestProps | undefined => {
  const urlParams = new URLSearchParams(window.location.search);
  const propsParam = urlParams.get('props');

  if (propsParam) {
    try {
      const parsed = JSON.parse(decodeURIComponent(propsParam)) as TestProps;
      console.warn('Parsed props from URL:', parsed);
      return parsed;
    } catch (error) {
      console.error('Failed to parse props from URL:', error);
      return undefined;
    }
  }

  return undefined;
};

const testProps = {
  ...getTestPropsFromURL(),
  /*enableMouseEvents: true,
  e: {
    enableLineBreaks: true,
  }*/
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App testProps={testProps} />
    </React.StrictMode>,
  );
}
