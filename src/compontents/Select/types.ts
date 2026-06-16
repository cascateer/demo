import { EnumerableItem, Enumerator, MaybeObservable } from "@cascateer/lib";
import { UnaryFunction } from "rxjs";

export type SelectProps<T> = {
  options: MaybeObservable<T>;
  id: MaybeObservable<PropertyKey | undefined>;
  name: string;
  enumerate?: Enumerator<T>;
  text?: Enumerator<T>;
  onChange?: UnaryFunction<EnumerableItem<T>, void>;
};
