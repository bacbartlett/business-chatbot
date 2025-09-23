"use client";

// react-scan must be imported before React
import { scan } from "react-scan";
import { useEffect } from "react";

export function ReactScan(): JSX.Element | null {
  useEffect(() => {
    const enabled =
      process.env.NEXT_PUBLIC_REACT_SCAN === "1" ||
      process.env.NEXT_PUBLIC_REACT_SCAN === "true" ||
      (process.env.NODE_ENV === "development" &&
        process.env.NEXT_PUBLIC_REACT_SCAN !== "0" &&
        process.env.NEXT_PUBLIC_REACT_SCAN !== "false");

    if (!enabled) return;

    scan({
      enabled: true,
      // set to true to log render info to console
      // log: true,
    });
  }, []);

  return null;
}


