import { createContext, useContext } from "react";
import { SAFE_DEFAULT } from "@bp/presentation-catalogue";
import type { DesignSelection } from "@bp/presentation-catalogue";

// Immutable platform fallback. Each SiteShell supplies its own request-local selection.
export const DesignContext = createContext<Readonly<DesignSelection>>(SAFE_DEFAULT);
export function useDesign(): Readonly<DesignSelection> { return useContext(DesignContext); }

// Explicit W1 reference scope; persisted W3 recipes resolve independently.
export const StandardRecipeContext = createContext(false);
export const ResolvedAppearanceContext = createContext(false);
