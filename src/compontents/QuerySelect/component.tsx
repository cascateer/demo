import { createStandaloneComponent } from "@cascateer/core";
import { noop, over, thru } from "lodash";
import { BehaviorSubject, switchMap } from "rxjs";
import { Input } from "../Input/component";
import { Select } from "../Select/component";
import { QuerySelectProps } from "./types";

export function QuerySelect<T>(props: QuerySelectProps<T>) {
  return createStandaloneComponent("query-select")
    .withStyles(import("../styles.module.scss"), import("./styles.module.scss"))
    .withTemplate<QuerySelectProps<T>>(
      (globalClassNames, classNames) =>
        ({ options, ...props }) => {
          const { query, updateQuery } = thru(
            new BehaviorSubject(""),
            (query) => ({
              query: props.query ?? query,
              updateQuery: (value: string) => query.next(value),
            }),
          );

          return (
            <div className={classNames.querySelect}>
              <Input
                name={props.name}
                value={query}
                onChange={over(props.onQueryChange ?? noop, updateQuery)}
                onInput={over(props.onQueryInput ?? noop, updateQuery)}
              />
              <Select options={query.pipe(switchMap(options))} {...props} />
            </div>
          );
        },
    )(props);
}
