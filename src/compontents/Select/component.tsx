import { createStandaloneComponent } from "@cascateer/core";
import {
  asEnumerable,
  createElement,
  EnumerableItem,
  nonNullable,
  nthArg,
} from "@cascateer/lib";
import { flatMap } from "@cascateer/lib/operators";
import cn from "classnames";
import { noop } from "lodash";
import { combineLatest, fromEvent, map, startWith, withLatestFrom } from "rxjs";
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
          const options = props.options.pipe(
            map(asEnumerable),
            startWith(new Array<EnumerableItem<T>>()),
          );

          const select = createElement("select", {
            className: cn(globalClassNames.input, classNames.select),
            name: props.name,
          });

          const selectedValue = fromEvent<Event>(select, "input").pipe(
            flatMap((event) => {
              const { currentTarget } = event;

              if (currentTarget instanceof HTMLSelectElement) {
                return currentTarget.value;
              }

              return [];
            }),
          );

          selectedValue
            .pipe(
              withLatestFrom(options),
              map(([selectedValue, options]) =>
                nonNullable(
                  options.find(
                    (option, index) =>
                      enumerate(option, index) === selectedValue,
                  ),
                ),
              ),
            )
            .subscribe(onChange);

          combineLatest([props.selectedValue, options]).subscribe({
            next: ([selectedValue, options]) => {
              select.replaceChildren(
                createElement("option", {
                  innerText: selectedValue?.toString() ?? "",
                  disabled: true,
                }),
                ...options.map((option, index) =>
                  createElement("option", {
                    value: enumerate(option, index).toString(),
                    innerText: text(option, index).toString(),
                  }),
                ),
              );

              select.selectedIndex =
                (selectedValue != null
                  ? options.map(enumerate).indexOf(selectedValue)
                  : -1) + 1;
            },
          });

          return select;
        },
    )(props);
}
