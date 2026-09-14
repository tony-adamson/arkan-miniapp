import * as React from "react";

/**
 * Карта таро — центральный объект продукта. Рубашка, раскрытие (3D-переворот), лицевая сторона, подпись позиции.
 * @startingPoint section="Tarot" subtitle="Карта: рубашка, раскрытие, лицо, позиция" viewport="700x420"
 */
export interface TarotCardProps {
  /** Название карты, например «Башня». Показывается только в раскрытом состоянии. */
  name?: string;
  /** Римская нумерация старшего аркана, например «XVI». */
  numeral?: string;
  /** Подпись позиции в раскладе: «Что мешает», «Что уже происходит». */
  position?: string;
  /** back — рубашка; revealing — идёт переворот; face — лицо. @default "back" */
  state?: "back" | "revealing" | "face";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** @default false */
  reversed?: boolean;
  /** Если задан и state="back" — карта кликабельна. */
  onReveal?: () => void;
  style?: React.CSSProperties;
}
export declare function TarotCard(props: TarotCardProps): JSX.Element;
