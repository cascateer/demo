import { MaybeObservable } from "@cascateer/lib";
import { UnaryFunction } from "rxjs";

export interface InputProps extends JSX.Props {
  name: string;
  value: MaybeObservable<string | undefined>;
  onChange?: UnaryFunction<string, void>;
}
