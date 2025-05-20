import React, { ReactNode } from "react";
import styled from "@emotion/styled";

type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

interface AbsolutePositionedItemProps {
  children: ReactNode;
  position: Position;
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

const AbsolutePositionedItemContainer = styled.div<{
  position: Position;
  zIndex: number;
}>`
  position: absolute;
  ${({ position }): string => positionStyles[position]}
  z-index: ${({ zIndex }): number => zIndex};
  pointer-events: auto;
`;

export const AbsolutePositionedItem: React.FC<AbsolutePositionedItemProps> = ({
  children,
  position,
  zIndex = 1000,
}) => {
  return (
    <AbsolutePositionedItemContainer position={position} zIndex={zIndex}>
      {children}
    </AbsolutePositionedItemContainer>
  );
};
