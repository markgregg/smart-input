import { Block, BlockType } from '@smart-input/core';
import { HistoricBlock } from '@src/historicBlock';

const convertHistoricBlocks = async (
  blocks: Block[],
): Promise<HistoricBlock[]> => {
  // Fetch all URLs in parallel
  const fetchPromises = blocks.map(async (block) => {
    // Check if block is a document or image with a URL
    if (block.type === BlockType.Document || block.type === BlockType.Image) {
      try {
        const response = await fetch(block.url);
        const blob = await response.blob();

        // Convert blob to base64 for storage
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            '',
          ),
        );

        return {
          block,
          blobData: base64,
          contentType: block.contentType,
        };
      } catch (error) {
        console.error(`Failed to fetch blob data for ${block.type}:`, error);
      }
    }

    return {
      block,
    };
  });

  return await Promise.all(fetchPromises);
};

const exposeContentAsUrl = async (
  historicBlocks: HistoricBlock[],
): Promise<Block[]> => {
  return historicBlocks.map(({ block, blobData, contentType }) => {
    // If there's no blob data, return the block as is
    if (!blobData) {
      return block;
    }

    // Convert base64 back to blob
    const binaryString = atob(blobData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], {
      type: contentType || 'application/octet-stream',
    });

    // Create a blob URL from the blob
    const url = URL.createObjectURL(blob);

    return {
      ...block,
      url,
    };
  });
};

export { convertHistoricBlocks, exposeContentAsUrl };
