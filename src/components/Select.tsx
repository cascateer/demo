import { MaybeObservable } from "@cascateer/core";
import {
  asEnumerable,
  asObservable,
  EnumerableItem,
  Enumerator,
  nonNullable,
  nthArg,
} from "@cascateer/core/lib";
import { flatMap } from "@cascateer/core/operators";
import { tap } from "lodash";
import {
  combineLatest,
  fromEvent,
  map,
  shareReplay,
  startWith,
  UnaryFunction,
  withLatestFrom,
} from "rxjs";

export function Select<T>(props: {
  options: MaybeObservable<T>;
  value: MaybeObservable<PropertyKey>;
  name: string;
  enumerate?: Enumerator<T>;
  text?: Enumerator<T>;
  onChange?: UnaryFunction<EnumerableItem<T>, void>;
}) {
  const items$ = asObservable(props.options).pipe(
    map(asEnumerable),
    startWith([]),
  );
  const selectedKey$ = asObservable(props.value);

  const enumerate = props.enumerate ?? nthArg(1);
  const text = props.text ?? enumerate;

  const select = tap(
    document.createElement("select"),
    (select) => (select.name = props.name),
  );

  const selectedItem$ = fromEvent<Event>(select, "change").pipe(
    flatMap((event) => {
      const { currentTarget } = event;

      if (currentTarget instanceof HTMLSelectElement) {
        return currentTarget.value;
      }

      return [];
    }),
    shareReplay(1),
    withLatestFrom(items$),
    map(([selectedKey, items]) =>
      nonNullable(
        items.find((item, index) => enumerate(item, index) === selectedKey),
      ),
    ),
  );

  selectedItem$.subscribe({
    next: (item) => props.onChange?.call(null, item),
  });

  combineLatest([items$, selectedKey$]).subscribe({
    next: ([items, selectedKey]) => {
      select.replaceChildren(
        ...items.map((item, index) =>
          tap(document.createElement("option"), (option) => {
            option.value = enumerate(item, index).toString();
            option.innerText = text(item, index).toString();
          }),
        ),
      );

      select.value = selectedKey.toString();
      select.selectedIndex = items.map(enumerate).indexOf(selectedKey);
    },
  });

  return select;
}
