import { createStandaloneComponent } from "@cascateer/core";
import {
  asEnumerable,
  asObservable,
  createElement,
  EnumerableItem,
  nonNullable,
  nthArg,
} from "@cascateer/lib";
import { flatMap } from "@cascateer/lib/operators";
import cn from "classnames";
import { noop } from "lodash";
import {
  combineLatest,
  fromEvent,
  map,
  shareReplay,
  startWith,
  withLatestFrom,
} from "rxjs";
import { SelectProps } from "./types";

export function Select<T>(props: SelectProps<T>) {
  // @ts-ignore
  return createStandaloneComponent("select")
    .withStyles(import("../styles.module.scss"), import("./styles.module.scss"))
    .withTemplate<SelectProps<T>>(
      (globalClassNames, classNames) =>
        ({
          enumerate = nthArg(1),
          text = enumerate,
          onChange = noop,
          ...props
        }) => {
          const select = createElement("select", {
            className: cn(globalClassNames.input, classNames.select),
            name: props.name,
          });

          const options = asObservable(props.options).pipe(
            map(asEnumerable),
            startWith(new Array<EnumerableItem<T>>()),
          );

          fromEvent<Event>(select, "change")
            .pipe(
              flatMap((event) => {
                const { currentTarget } = event;

                if (currentTarget instanceof HTMLSelectElement) {
                  return currentTarget.value;
                }

                return [];
              }),
              shareReplay(1),
              withLatestFrom(options),
              map(([selectedKey, options]) =>
                nonNullable(
                  options.find(
                    (option, index) => enumerate(option, index) === selectedKey,
                  ),
                ),
              ),
            )
            .subscribe(onChange);

          combineLatest([options, asObservable(props.value)]).subscribe({
            next: ([options, selectedKey]) => {
              select.replaceChildren(
                ...options.map((option, index) =>
                  createElement("option", {
                    value: enumerate(option, index).toString(),
                    innerText: text(option, index).toString(),
                  }),
                ),
              );

              select.selectedIndex =
                selectedKey != null
                  ? options.map(enumerate).indexOf(selectedKey)
                  : -1;
            },
          });

          return select;
        },
    )(props);
}
