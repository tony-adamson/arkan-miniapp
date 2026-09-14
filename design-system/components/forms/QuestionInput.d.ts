import * as React from "react";

/**
 * Поле формулировки вопроса: автовысота, счётчик, состояния idle / focus / error / sending.
 * @startingPoint section="Forms" subtitle="Поле вопроса со всеми состояниями" viewport="700x300"
 */
export interface QuestionInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: () => void;
  /** @default "О чём вы хотите спросить?" */
  placeholder?: string;
  /** @default "idle" */
  state?: "idle" | "error" | "sending";
  /** Текст ошибки под полем (только при state="error"). */
  error?: string;
  /** @default 280 */
  maxLength?: number;
  /** Подсказка под полем в обычном состоянии. */
  hint?: string;
  style?: React.CSSProperties;
}
export declare function QuestionInput(props: QuestionInputProps): JSX.Element;
