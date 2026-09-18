import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

interface AuthFlowState {
  mfaChallengeId?: string;
  setMfaChallengeId(value?: string): void;
  clear(): void;
}

const AuthFlowContext = createContext<AuthFlowState | null>(null);

export function AuthFlowProvider({ children }: PropsWithChildren) {
  const [mfaChallengeId, setMfaChallengeId] = useState<string>();
  const value = useMemo<AuthFlowState>(
    () => ({
      ...(mfaChallengeId !== undefined ? { mfaChallengeId } : {}),
      setMfaChallengeId,
      clear: () => setMfaChallengeId(undefined),
    }),
    [mfaChallengeId],
  );
  return <AuthFlowContext.Provider value={value}>{children}</AuthFlowContext.Provider>;
}

export function useAuthFlow(): AuthFlowState {
  const value = useContext(AuthFlowContext);
  if (!value) throw new Error("AuthFlowProvider is required");
  return value;
}
