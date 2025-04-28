"use client";

import LogRocket from "logrocket";
import { useEffect } from "react";

export const LogRocketInitializer = () => {
  useEffect(() => {
    LogRocket.init("jhaizt/torys");
  }, []);

  return null;
};
