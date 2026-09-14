import * as React from "react";

/**
 * Основная кнопка Аркана. Три уровня: primary (одно действие на экран), secondary, text.
 * @startingPoint section="Core" subtitle="Кнопки: primary / secondary / text, все состояния" viewport="700x260"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** @default "primary" */
  variant?: "primary" | "secondary" | "text" | "danger";
  /** @default "md" */
  size?: "sm" | "md" | "lg";
  /** Растянуть на всю ширину — для доковых действий. @default false */
  block?: boolean;
  /** Показать спиннер и заблокировать нажатие. @default false */
  loading?: boolean;
  /** @default false */
  disabled?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
