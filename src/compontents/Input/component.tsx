import { createStandaloneComponent } from "@cascateer/core";
import { createElement } from "@cascateer/lib";
import { eventListener } from "@cascateer/lib/observable";
import cn from "classnames";
import { debounceTime, merge, withLatestFrom } from "rxjs";
import { InputProps } from "./types";

export function Input(props: InputProps) {
  // @ts-ignore
  return createStandaloneComponent("input")
    .withStyles(import("../styles.module.scss"), import("./styles.module.scss"))
    .withTemplate<InputProps>((globalClassNames) => ({ value, ...props }) => {
      const input = createElement("input", {
        className: cn(globalClassNames.input),
        name: props.name,
        placeholder: props.placeholder,
        type: "text",
      });

      merge(
        eventListener(input, "change"),
        eventListener(input, "input").pipe(debounceTime(1e3)),
      )
        .pipe(withLatestFrom(value))
        .subscribe({
          next: ([{ type, target }, sourceValue]) => {
            const targetValue = target.value;

            if (targetValue !== sourceValue) {
              target.value = sourceValue ?? "";
            }

            switch (type) {
              case "change":
                props.onChange?.call(null, targetValue);

                break;
              case "input":
                props.onInput?.call(null, targetValue);

                break;
            }
          },
        });

      value.subscribe({
        next: (value) => (input.value = value ?? ""),
      });

      return input;
    })(props);
}
