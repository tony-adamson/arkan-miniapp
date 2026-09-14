import * as React from "react";

/**
 * Реплика диалога. Продукт говорит «в полный лист» без пузыря, пользователь — акцентным пузырём справа.
 * @startingPoint section="Chat" subtitle="Реплика продукта и реплика пользователя" viewport="700x360"
 */
export interface MessageProps {
  /** @default "arkan" */
  from?: "arkan" | "user";
  children?: React.ReactNode;
  /** Время под репликой, например «21:04». */
  time?: string;
  /** Длинное толкование: шрифт --font-read, мера --read-measure. @default false */
  longform?: boolean;
  /** Появление снизу вверх при добавлении в поток. @default false */
  appear?: boolean;
  style?: React.CSSProperties;
}
export declare function Message(props: MessageProps): JSX.Element;
