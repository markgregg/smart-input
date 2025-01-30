export const findChangePosition = (oldText: string, newText: string) => {
  for (let index = 0; index < newText.length; index++) {
    if (index > oldText.length || index > newText.length) {
      return index;
    }
    if (oldText[index] !== newText[index]) {
      return index;
    }
  }
  return newText.length;
}

export const getCursorPosition = (pre: HTMLPreElement | null) => {
  if (!pre) {
    return 0;
  }
  const selection = document.getSelection();
  if (selection && selection.rangeCount > 0) {
    let totalLength = 0;
    const range = selection.getRangeAt(0);
    const getPosition = (element: HTMLElement, target: Node): number | null => {
      for (let index = 0; index < element.childNodes.length; index += 1) {
        const child = element.childNodes[index] as HTMLElement;
        if (child === target) {
          return totalLength + range.endOffset + (child.childNodes.length > 0 && child.childNodes[0].nodeName === 'BR' ? 1 : 0);
        }
        if (child && child.nodeName === '#text') {
          const textLength = (child.textContent ?? '').length
          totalLength += textLength;
        }
        if (child && child.nodeName === 'BR') {
          totalLength += 1;
        }
        if (child.childNodes.length > 0) {
          const length = getPosition(child, target);
          if (length) {
            return length;
          }
        }
      }
      return null;
    }
    return getPosition(pre, range.endContainer) ?? 0;
  }
  return 0;
}

export const setCursorPosition = (pre: HTMLPreElement, position: number) => {
  if (position !== -1) {
    let totalLength = 0;
    const getNodeAtPos = (element: HTMLElement): HTMLElement | null => {
      for (let index = 0; index < element.childNodes.length; index += 1) {
        const child = element.childNodes[index] as HTMLElement;
        if (child && child.nodeName === '#text') {
          const textLength = (child.textContent ?? '').length
          totalLength += textLength;
          if (position <= totalLength) {
            return child;
          }
        }
        if (child.childNodes.length > 0) {
          const node = getNodeAtPos(child);
          if (node) {
            return node;
          }
        }
      }
      return null;
    }
    const node = getNodeAtPos(pre);
    if (node) {
      const selection = document.getSelection();
      if (selection) {
        selection.setPosition(node, position - (totalLength - (node.textContent ?? '').length));
      }
      return;
    }
    const selection = document.getSelection();
    if (selection) {
      const node = getTextLastNode(pre);
      if (node && node.nodeName === '#text') {
        selection.setPosition(node, (node.textContent ?? '').length > 0 ? (node.textContent ?? '').length : 0);
      }
    }
  }
};

const getTextLastNode = (element: HTMLElement): HTMLElement | null => {
  for (let index = element.childNodes.length - 1; index >= 0; index -= 1) {
    const child = element.childNodes[index] as HTMLElement;
    if (child.childNodes.length > 0) {
      const node = getTextLastNode(child);
      if (node) {
        return node;
      }
    } else if ((child.textContent ?? '').length > 0) {
      return child;
    }
  }
  return null;
}

export const removeDoubleLineFeed = (text: string) => {
  return text.replaceAll('\n\n', '\n');
}

export const findEndOfChange = (text: string, newText: string): number | null => {
  if (newText.length === 0) {
    return null;
  }
  for (let count = 1; ; count++) {
    if (newText.length === count) {
      return null;
    }
    if (text.length === count) {
      return newText.length - count + 1;
    }
    if (newText[newText.length - count] !== text[text.length - count]) {
      return newText.length - count + 1;
    }
  }
}