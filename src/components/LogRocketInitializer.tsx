"use client";

import LogRocket from "logrocket";
import { useEffect } from "react";

export const LogRocketInitializer = () => {
  useEffect(() => {
    LogRocket.init("torys/torys");
  }, []);

  return null;
};
