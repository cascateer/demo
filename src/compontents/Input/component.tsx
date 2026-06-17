import { createStandaloneComponent } from "@cascateer/core";
import { asObservable, createElement } from "@cascateer/lib";
import { flatMap } from "@cascateer/lib/operators";
import cn from "classnames";
import { fromEvent, withLatestFrom } from "rxjs";
import { InputProps } from "./types";

export function Input(props: InputProps) {
  // @ts-ignore
  return createStandaloneComponent("input")
    .withStyles(import("../styles.module.scss"), import("./styles.module.scss"))
    .withTemplate<InputProps>((globalClassNames, classNames) => (props) => {
      const input = createElement("input", {
        className: cn(globalClassNames.input),
        name: props.name,
        type: "text",
      });

      const value = asObservable(props.value);

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
            props.onChange?.call(null, sourceValue);

            if (sourceValue !== targetValue) {
              input.value = targetValue ?? "";
            }
          },
        });

      value.subscribe({
        next: (value) => (input.value = value ?? ""),
      });

      return input;
    })(props);
}
