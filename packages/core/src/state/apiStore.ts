import { createSubscriberStore } from './utils';
import { SmartInputApi } from '@src/types/api';
import { ApiState } from '@src/types/state/api';

export const createApiStore = () =>
  createSubscriberStore<ApiState>((set) => ({
    api: null,
    element: null,
    setElement: (element: HTMLPreElement | null) => set({ element }),
    setApi: (api: SmartInputApi) => set({ api }),
  }));
