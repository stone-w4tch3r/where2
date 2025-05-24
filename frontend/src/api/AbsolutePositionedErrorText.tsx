import { Typography } from "antd";
import { AbsolutePositionedItem } from "@/components/AbsolutePositionedItem";
import React from "react";

interface AbsolutePositionedErrorTextProps {
  message: string;
}

export const AbsolutePositionedErrorText: React.FC<
  AbsolutePositionedErrorTextProps
> = ({ message }) => {
  return (
    <AbsolutePositionedItem position="center">
      <Typography.Text type="danger">{message}</Typography.Text>
    </AbsolutePositionedItem>
  );
};
