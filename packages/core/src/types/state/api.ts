import { SmartInputApi } from '../api';

export interface ApiState {
  api: SmartInputApi | null;
  element: HTMLPreElement | null;
  setElement: (element: HTMLPreElement | null) => void;
  setApi: (api: SmartInputApi) => void;
}
