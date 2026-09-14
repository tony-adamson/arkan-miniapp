import * as React from "react";

/**
 * Карточка прошлого расклада в истории.
 * @startingPoint section="Surfaces" subtitle="Расклад в истории: вопрос, дата, карты" viewport="700x220"
 */
export interface SpreadCardProps {
  /** Вопрос пользователя — главная строка карточки. */
  question?: string;
  /** Человеческая дата: «вчера, 21:40». */
  date?: string;
  /** Названия карт расклада. */
  cards?: string[];
  /** @default "done" */
  status?: "done" | "unfinished" | "today";
  onOpen?: () => void;
  style?: React.CSSProperties;
}
export declare function SpreadCard(props: SpreadCardProps): JSX.Element;
