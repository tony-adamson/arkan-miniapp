import * as React from "react";

/** Модальное окно поверх экрана: заголовок, пояснение, вертикальный стек действий. */
export interface ModalProps {
  /** @default true */
  open?: boolean;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  /** Кнопки — обычно <Button block> в вертикальном стеке. */
  actions?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function Modal(props: ModalProps): JSX.Element | null;
