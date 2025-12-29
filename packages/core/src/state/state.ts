import React from 'react';
import { State } from '@atypes/state';

// @ts-expect-error initialisation later
export const StateContext = React.createContext<State>();
