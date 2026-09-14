import * as React from "react";

/** Варианты уточняющего ответа под репликой продукта — 2–4 коротких формулировки. */
export interface QuickRepliesProps {
  options?: string[];
  /** Выбранный вариант. */
  value?: string;
  onSelect?: (option: string) => void;
  /** @default false */
  disabled?: boolean;
  /** Микро-подпись над рядом, например «Выберите ближе к вашему». */
  label?: string;
  style?: React.CSSProperties;
}
export declare function QuickReplies(props: QuickRepliesProps): JSX.Element;
