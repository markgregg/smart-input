import { CommitNotifierProps, EditorProps } from '@smart-input/core';
import { TypeaheadLookupProps } from '@smart-input/typeahead';

export type TestProps = {
  e?: Partial<EditorProps>;
  t?: Partial<TypeaheadLookupProps>;
  c?: Partial<CommitNotifierProps>;
  enableMouseEvents?: boolean;
};
