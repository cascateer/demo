import { createStandaloneComponent } from "@cascateer/core";
import { asObservable, createElement } from "@cascateer/lib";
import { flatMap } from "@cascateer/lib/operators";
import cn from "classnames";
import { fromEvent } from "rxjs";
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

      fromEvent<Event>(input, "input")
        .pipe(
          flatMap((event) => {
            const { currentTarget } = event;

            if (currentTarget instanceof HTMLInputElement) {
              return currentTarget.value;
            }

            return [];
          }),
        )
        .subscribe(props.onChange);

      asObservable(props.value).subscribe({
        next: (value) => (input.value = value ?? ""),
      });

      return input;
    })(props);
}
