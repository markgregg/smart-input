import { Block, EditorProps } from '@src/types';
import { stringifyCSSProperties } from 'react-style-stringify';

const addBlockEventListeners = (
  element: HTMLElement,
  block: Block,
  options: EditorProps,
) => {
  (window as any).lastAddBlockEventListeners = {
    blockId: 'id' in block ? block.id : 'no-id',
    optionsKeys: Object.keys(options),
    hasOnBlockClick: !!options.onBlockClick,
  };
  const {
    onBlockClick,
    onBlockDblClick,
    onBlockMouseUp,
    onBlockMouseDown,
    onBlockMouseEnter,
    onBlockMouseLeave,
    onBlockMouseOver,
    onBlockMouseMove,
  } = options;
  if (onBlockClick)
    element.onclick = (event: MouseEvent) => onBlockClick?.(block, event);
  if (onBlockDblClick)
    element.ondblclick = (event: MouseEvent) => onBlockDblClick?.(block, event);
  if (onBlockMouseUp)
    element.onmouseup = (event: MouseEvent) => onBlockMouseUp?.(block, event);
  if (onBlockMouseDown)
    element.onmousedown = (event: MouseEvent) =>
      onBlockMouseDown?.(block, event);
  if (onBlockMouseEnter)
    element.onmouseenter = (event: MouseEvent) =>
      onBlockMouseEnter?.(block, event);
  if (onBlockMouseLeave)
    element.onmouseleave = (event: MouseEvent) =>
      onBlockMouseLeave?.(block, event);
  if (onBlockMouseOver)
    element.onmouseover = (event: MouseEvent) =>
      onBlockMouseOver?.(block, event);
  if (onBlockMouseMove)
    element.onmousemove = (event: MouseEvent) =>
      onBlockMouseMove?.(block, event);
};

const getElementText = (element: HTMLElement): string => {
  if (element.childElementCount === 0) {
    return element.textContent ?? '';
  }
  for (let index = 0; index < element.childNodes.length; index++) {
    const node = element.childNodes[index];
    if (node && node.nodeType === Node.TEXT_NODE) {
      return node.textContent ?? '';
    }
  }
  return '';
};

const setElementText = (element: HTMLElement, text: string): void => {
  if (element.childElementCount === 0) {
    element.textContent = text;
    return;
  }
  for (let index = 0; index < element.childNodes.length; index++) {
    const node = element.childNodes[index];
    if (node && node.nodeType === Node.TEXT_NODE) {
      node.textContent = text;
      return;
    }
  }
};

const areStylesDifferent = (
  blockStyle: React.CSSProperties,
  elementStyle: string,
): boolean => {
  const blockCss = stringifyCSSProperties(blockStyle).replace(/\s/g, '');
  const elementCss = elementStyle
    .replace(/\s/g, '')
    .replace('cursor:grab;', '')
    .replace('-webkit-user-drag:element;', '');
  return blockCss !== elementCss;
};

const blocksToText = (blocks: Block[]): string => {
  return blocks
    .map((b) => (b.type === 'text' || b.type === 'styled' ? b.text : ''))
    .join('');
};

export {
  addBlockEventListeners,
  getElementText,
  setElementText,
  areStylesDifferent,
  blocksToText,
};
