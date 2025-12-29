import { create, StateCreator } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
const creatStore = <T extends object>(initializer: StateCreator<T, [], []>) =>
  create(initializer);

const createSubscriberStore = <T extends object>(
  initializer: StateCreator<T, any, []>,
) => create(subscribeWithSelector(initializer));

export { creatStore, createSubscriberStore };
