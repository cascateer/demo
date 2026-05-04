import { createComponent, StoreEffect } from "@cascateer/core";
import { map } from "rxjs";
import { Cube } from "../types";

export const CubeActionsComponent = createComponent("cubeActions")
  .withStyles(import("./styles.module.scss"))
  .withTemplate<
    {
      baseActionQueue: StoreEffect<Cube.BaseAction[]>;
    },
    {}
  >((deps) => () => (
    <>
      {deps.baseActionQueue().list((baseAction) => (
        <div>{baseAction.pipe(map((baseAction) => baseAction.join(" ")))}</div>
      ))}
    </>
  ));
