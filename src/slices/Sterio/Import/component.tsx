import { createComponent } from "@cascateer/core";
import { QuerySelect } from "../../../components/QuerySelect";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<{}, {}>((ctx, classNames) => () => {
    return <QuerySelect />;
  });
