import { App } from "@cascateer/core";
import { rubiksSlice } from "./slices/Rubiks/slice";
import { sterioSlice } from "./slices/Sterio/slice";

new App(
  ({ SliceProvider }) =>
    new SliceProvider()
      .provideSlices(({ slice }) => ({
        rubiks: slice(() => rubiksSlice),
        sterio: slice(() => sterioSlice),
      }))
      .complete(),
  ({ sterio: Sterio }) => <Sterio />,
).renderTo(document.body);
