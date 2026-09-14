import * as React from "react";

/** Пустое состояние — спокойное объяснение, без извинений и без иллюстраций-мультиков. */
export interface EmptyStateProps {
  title?: string;
  description?: string;
  /** Обычно <Button variant="secondary">. */
  action?: React.ReactNode;
  /** Форма глифа. @default "circle" */
  glyph?: "circle" | "card";
  /** @default false */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function EmptyState(props: EmptyStateProps): JSX.Element;
