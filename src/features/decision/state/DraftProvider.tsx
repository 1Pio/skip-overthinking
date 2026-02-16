import {
  createContext,
  type Dispatch,
  type PropsWithChildren,
  type ReactElement,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

import { draftReducer, type DraftAction } from "./draft.reducer";
import {
  clearDraftStorage,
  hydrateDraftFromStorage,
  persistDraftToStorage,
} from "./draft.storage";
import { type DecisionDraft, type DecisionDetails } from "./draft.types";

type DraftContextValue = {
  draft: DecisionDraft;
  dispatch: Dispatch<DraftAction>;
  updateDecision: (payload: Partial<DecisionDetails>) => void;
  initializeDraft: (payload: DecisionDraft) => void;
  resetDraft: () => void;
};

const DraftContext = createContext<DraftContextValue | undefined>(undefined);

export const DraftProvider = ({ children }: PropsWithChildren): ReactElement => {
  const [draft, dispatch] = useReducer(draftReducer, undefined, hydrateDraftFromStorage);

  useEffect(() => {
    persistDraftToStorage(draft);
  }, [draft]);

  const value = useMemo<DraftContextValue>(
    () => ({
      draft,
      dispatch,
      updateDecision: (payload) => {
        dispatch({ type: "decisionUpdated", payload });
      },
      initializeDraft: (payload) => {
        dispatch({ type: "draftInitialized", payload });
      },
      resetDraft: () => {
        dispatch({ type: "draftReset" });
        clearDraftStorage();
      },
    }),
    [draft],
  );

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
};

export const useDraft = (): DraftContextValue => {
  const context = useContext(DraftContext);
  if (!context) {
    throw new Error("useDraft must be used within DraftProvider");
  }

  return context;
};
