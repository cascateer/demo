import { Observable, UnaryFunction } from "rxjs";
import { SelectProps } from "../Select/types";

export type QuerySelectProps<T> = Omit<SelectProps<T>, "options"> & {
  query?: Observable<string | undefined>;
  onQueryChange?: UnaryFunction<string, void>;
  options: UnaryFunction<string, Observable<T>>;
};
