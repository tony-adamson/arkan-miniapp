import * as React from "react";

/** Чип быстрого ответа — вариант реплики пользователя в диалоге расклада. */
export interface ChipProps {
  children?: React.ReactNode;
  /** @default false */
  selected?: boolean;
  /** @default false */
  disabled?: boolean;
  /** neutral — обычный вариант, accent — подсказанный системой. @default "neutral" */
  tone?: "neutral" | "accent";
  onClick?: () => void;
  style?: React.CSSProperties;
}
export declare function Chip(props: ChipProps): JSX.Element;
