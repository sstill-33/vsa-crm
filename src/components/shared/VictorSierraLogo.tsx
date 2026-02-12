import * as React from "react";
import { cn } from "~/lib/utils";

interface VictorSierraLogoProps {
  className?: string;
  size?: number;
  navyColor?: string;
  goldColor?: string;
  /** Show only the VS mark (no text or accent line) */
  markOnly?: boolean;
}

/** VS monogram SVG mark */
function VSMark({
  size,
  navyColor,
  goldColor,
  className,
}: {
  size: number;
  navyColor: string;
  goldColor: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 220 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ height: size, width: "auto" }}
    >
      {/* V */}
      <path d="M20 20 L60 120 L90 120 L50 20 Z" fill={navyColor} />
      <path d="M75 20 L115 20 L75 120 L45 120 Z" fill={navyColor} />

      {/* S */}
      <path
        d="M150 30
           C125 20, 110 45, 140 55
           C170 65, 160 95, 130 90
           L120 115
           C170 130, 200 90, 170 75
           C140 60, 150 40, 180 50
           L190 30
           C170 20, 160 25, 150 30 Z"
        fill={goldColor}
      />
    </svg>
  );
}

export const VictorSierraLogo: React.FC<VictorSierraLogoProps> = ({
  className,
  size = 180,
  navyColor = "#1E3554",
  goldColor = "#E5A21A",
  markOnly = false,
}) => {
  if (markOnly) {
    return <VSMark size={size} navyColor={navyColor} goldColor={goldColor} className={className} />;
  }

  return (
    <div
      className={cn("flex items-center gap-4", className)}
      style={{ height: size }}
    >
      {/* VS Mark */}
      <VSMark size={size} navyColor={navyColor} goldColor={goldColor} />

      {/* Text */}
      <div className="flex flex-col justify-center">
        <span
          className="font-bold tracking-widest uppercase"
          style={{
            fontSize: size * 0.28,
            letterSpacing: "0.15em",
            color: navyColor,
          }}
        >
          Victor Sierra
        </span>
      </div>

      {/* Accent Line */}
      <div
        className="h-full w-[4px] rounded-sm"
        style={{ backgroundColor: goldColor }}
      />
    </div>
  );
};
