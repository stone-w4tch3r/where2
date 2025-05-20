import React, { ReactNode } from "react";
import styled from "@emotion/styled";

type OverlayPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

interface MapOverlayProps {
  children: ReactNode;
  position: OverlayPosition;
  zIndex?: number;
}

const positionStyles = {
  "top-left": `
    top: 20px;
    left: 20px;
  `,
  "top-right": `
    top: 20px;
    right: 20px;
  `,
  "bottom-left": `
    bottom: 20px;
    left: 20px;
  `,
  "bottom-right": `
    bottom: 20px;
    right: 20px;
  `,
  center: `
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  `,
};

const OverlayContainer = styled.div<{
  position: OverlayPosition;
  zIndex: number;
}>`
  position: absolute;
  ${({ position }) => positionStyles[position]}
  z-index: ${({ zIndex }) => zIndex};
  pointer-events: auto;
`;

export const MapOverlay: React.FC<MapOverlayProps> = ({
  children,
  position,
  zIndex = 1000,
}) => {
  return (
    <OverlayContainer position={position} zIndex={zIndex}>
      {children}
    </OverlayContainer>
  );
};
