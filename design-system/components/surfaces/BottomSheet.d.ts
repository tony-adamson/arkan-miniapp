import * as React from "react";

/** Нижний шит: ручка, заголовок, контент, необязательный футер с действием. */
export interface BottomSheetProps {
  /** @default true */
  open?: boolean;
  title?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  style?: React.CSSProperties;
}
export declare function BottomSheet(props: BottomSheetProps): JSX.Element | null;
