import * as React from "react";

/**
 * Экран ожидания генерации. Никаких процентов и прыгающих точек — дыхание и named-шаги.
 * @startingPoint section="Tarot" subtitle="Ожидание генерации: дыхание вместо спиннера" viewport="700x400"
 */
export interface RitualLoaderProps {
  /** Шаги ожидания. @default ["Слушаю вопрос","Подбираю расклад","Раскладываю карты"] */
  steps?: string[];
  /** Индекс активного шага. @default 0 */
  activeStep?: number;
  /** Подпись внизу. */
  caption?: string;
  /** Уменьшенный вариант — внутри диалога, а не на отдельном экране. @default false */
  compact?: boolean;
  style?: React.CSSProperties;
}
export declare function RitualLoader(props: RitualLoaderProps): JSX.Element;
