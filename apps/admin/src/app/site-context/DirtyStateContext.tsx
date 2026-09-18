import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { ConfirmDialog } from "../../ui/components";

interface DirtyStateValue {
  dirty: boolean;
  setDirty(value: boolean): void;
  dirtyLabel: string;
  setDirtyLabel(value: string): void;
}
const DirtyStateContext = createContext<DirtyStateValue | null>(null);

export function DirtyStateProvider({ children }: PropsWithChildren) {
  const [dirty, setDirty] = useState(false);
  const [dirtyLabel, setDirtyLabel] = useState("unsaved changes");

  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, [dirty]);

  const value = useMemo(() => ({ dirty, setDirty, dirtyLabel, setDirtyLabel }), [dirty, dirtyLabel]);
  return (
    <DirtyStateContext.Provider value={value}>
      {children}
      <ConfirmDialog
        open={false}
        title="Discard unsaved changes?"
        description={`This page has ${dirtyLabel}. Leaving now discards browser-local edits that have not been accepted by the server.`}
        confirmLabel="Discard and leave"
        cancelLabel="Stay on page"
        destructive
        onCancel={() => undefined}
        onConfirm={() => setDirty(false)}
      />
    </DirtyStateContext.Provider>
  );
}

export function useDirtyState(): DirtyStateValue {
  const value = useContext(DirtyStateContext);
  if (!value) throw new Error("DirtyStateProvider is required");
  return value;
}
