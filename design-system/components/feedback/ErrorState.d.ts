import * as React from "react";

/** Ошибка: inline-плашка в диалоге или полноэкранное состояние. */
export interface ErrorStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  /** @default "inline" */
  variant?: "inline" | "screen";
  style?: React.CSSProperties;
}
export declare function ErrorState(props: ErrorStateProps): JSX.Element;
