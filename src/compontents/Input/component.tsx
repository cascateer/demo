import { createStandaloneComponent } from "@cascateer/core";
import { createElement } from "@cascateer/lib";
import { flatMap } from "@cascateer/lib/operators";
import cn from "classnames";
import { fromEvent, withLatestFrom } from "rxjs";
import { InputProps } from "./types";

export function Input(props: InputProps) {
  // @ts-ignore
  return createStandaloneComponent("input")
    .withStyles(import("../styles.module.scss"), import("./styles.module.scss"))
    .withTemplate<InputProps>(
      (globalClassNames, classNames) =>
        ({ value, ...props }) => {
          const input = createElement("input", {
            className: cn(globalClassNames.input),
            name: props.name,
            type: "text",
          });

          fromEvent<Event>(input, "input")
            .pipe(
              flatMap((event) => {
                const { currentTarget } = event;

                if (currentTarget instanceof HTMLInputElement) {
                  return currentTarget.value;
                }

                return [];
              }),
              withLatestFrom(value),
            )
            .subscribe({
              next: ([sourceValue, targetValue]) => {
                if (sourceValue !== targetValue) {
                  input.value = targetValue ?? "";
                }

                props.onChange?.call(null, sourceValue);
              },
            });

          value.subscribe({
            next: (value) => (input.value = value ?? ""),
          });

          return input;
        },
    )(props);
}
