import { Observable, UnaryFunction } from "rxjs";

export interface InputProps extends JSX.Props {
  name: string;
  value: Observable<string | undefined>;
  onChange?: UnaryFunction<string, void>;
}
