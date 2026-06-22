import { Observable, UnaryFunction } from "rxjs";
import { SelectProps } from "../Select/types";

export type QuerySelectProps<T> = Omit<SelectProps<T>, "options"> & {
  query?: Observable<string | undefined>;
  onQueryChange?: UnaryFunction<string, void>;
  onQueryInput?: UnaryFunction<string, void>;
  options: (query: string) => Observable<T>;
};
