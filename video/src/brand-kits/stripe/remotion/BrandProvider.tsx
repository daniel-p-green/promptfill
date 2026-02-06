import React, { createContext, useContext, type ReactNode } from "react";
import { stripeFonts } from "../brand/fonts";
import { stripeTokens, type BrandTokens } from "../brand/tokens";
import { type MotionEnergy } from "./motion/presets";

type BrandContextValue = {
  tokens: BrandTokens;
  fonts: typeof stripeFonts;
  energy: MotionEnergy;
};

const BrandContext = createContext<BrandContextValue | null>(null);

export const BrandProvider: React.FC<{
  children: ReactNode;
  energy?: MotionEnergy;
}> = ({ children, energy = "medium" }) => {
  return (
    <BrandContext.Provider
      value={{
        tokens: stripeTokens,
        fonts: stripeFonts,
        energy,
      }}
    >
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = (): BrandContextValue => {
  const value = useContext(BrandContext);
  if (!value) {
    throw new Error("useBrand must be used inside BrandProvider");
  }
  return value;
};
