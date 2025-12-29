import { BehaviourState } from '@atypes/state';
import { createSubscriberStore } from './utils';

export const createBehaviourStore = () =>
  createSubscriberStore<BehaviourState>((set, get) => ({
    selectionInProgress: false,
    setSelectionInProgress: (selectionInProgress: boolean) => {
      if (get().selectionInProgress !== selectionInProgress) {
        set({ selectionInProgress });
      }
    },
  }));
