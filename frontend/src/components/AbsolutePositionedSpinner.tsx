import { Skeleton, Spin } from "antd";
import React from "react";
import { AbsolutePositionedItem } from "./AbsolutePositionedItem";

interface AbsolutePositionedSpinnerProps {
  tip?: string;
}

export const AbsolutePositionedSpinner: React.FC<
  AbsolutePositionedSpinnerProps
> = ({ tip }) => {
  return (
    <AbsolutePositionedItem position="center">
      <Spin tip={tip}>
        <Skeleton.Node active />
      </Spin>
    </AbsolutePositionedItem>
  );
};
