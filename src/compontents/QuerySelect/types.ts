import { MaybeObservable } from "@cascateer/lib";
import { UnaryFunction } from "rxjs";
import { SelectProps } from "../Select/types";

export type QuerySelectProps<T> = Omit<SelectProps<T>, "options"> & {
  query: UnaryFunction<string, MaybeObservable<T>>;
};
