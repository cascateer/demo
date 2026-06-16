import { createStandaloneComponent } from "@cascateer/core";
import { asObservable, createElement } from "@cascateer/lib";
import { flatMap } from "@cascateer/lib/operators";
import { debounceTime, fromEvent, switchMap } from "rxjs";
import { Select } from "../Select/component";
import { QuerySelectProps } from "./types";

export function QuerySelect<T>(props: QuerySelectProps<T>) {
  return createStandaloneComponent("query-select")
    .withStyles(import("../styles.module.scss"), import("./styles.module.scss"))
    .withTemplate<QuerySelectProps<T>>(
      (globalClassNames, classNames) => (props) => {
        const input = createElement("input", {
          className: globalClassNames.input,
          name: props.name,
          type: "text",
        });

        // @ts-ignore
        const options = fromEvent(input, "input").pipe(
          flatMap((event) => {
            const { currentTarget } = event;

            if (currentTarget instanceof HTMLInputElement) {
              return currentTarget.value;
            }

            return [];
          }),
          debounceTime(500),
          switchMap((input) => asObservable(props.query(input))),
        );

        return (
          <div className={classNames.querySelect}>
            {input}
            {/* @ts-ignore */}
            <Select options={options} {...props} />
          </div>
        );
      },
    )(props);
}
