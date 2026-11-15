"use client";

import { useState } from "react";
import { CloseIcon, VolumeIcon } from "@/components/ui/icons";
import RadioPlayer from "./RadioPlayer";

export default function MobileRadio() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="mobile-radio" data-collapsed={collapsed}>
      <div id="mobile-radio-player" className="mobile-radio__panel" inert={collapsed}>
        <RadioPlayer />
      </div>
      <button
        type="button"
        className="icon-btn mobile-radio__toggle"
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? "Show radio player" : "Hide radio player"}
        aria-expanded={!collapsed}
        aria-controls="mobile-radio-player"
        title={collapsed ? "Show radio player" : "Hide radio player (keeps playing)"}
      >
        {collapsed ? <VolumeIcon /> : <CloseIcon />}
      </button>
    </div>
  );
}
