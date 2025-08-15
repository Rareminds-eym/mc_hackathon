import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GmpSimulation from "../gmp-simulation/GmpSimulation";

export default function GmpSimulationScreen({ mode: routeMode }) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [redirecting, setRedirecting] = useState(false);

  // Use mode from router if provided, else calculate from moduleId
  let mode = routeMode ?? "violation-root-cause";
  if (!routeMode && (moduleId === "6" || moduleId === "HL2")) mode = "solution";
  console.log(`[GmpSimulationScreen] moduleId:`, moduleId);
  console.log(`[GmpSimulationScreen] simulation mode:`, mode);
  // Debug: Log mode prop passed to GmpSimulation
  React.useEffect(() => {
    console.log(`[GmpSimulationScreen] Rendering GmpSimulation with mode:`, mode);
  }, [mode, moduleId, routeMode]);

  // Handler to navigate to HL2 (module 6)
  const handleProceedToLevel2 = () => {
    console.log(`[GmpSimulationScreen] Proceed to Level 2 clicked. Current moduleId:`, moduleId);
    // Always navigate to HL2, regardless of current route
    if (moduleId !== "HL2" && moduleId !== "6") {
      setRedirecting(true);
      console.log(`[GmpSimulationScreen] Navigating to /modules/HL2 ...`);
      navigate("/modules/HL2", { replace: true });
      setTimeout(() => window.location.reload(), 100); // Force reload to ensure HL2 displays
    } else {
      console.log(`[GmpSimulationScreen] Already in HL2, no navigation needed.`);
    }
  };

  // Prevent double rendering during redirect
  if (redirecting) {
    console.log(`[GmpSimulationScreen] Redirecting, not rendering simulation.`);
    return null;
  }

  return (
    <div style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif' }}>
      <GmpSimulation mode={mode} onProceedToLevel2={handleProceedToLevel2} />
    </div>
  );
}
