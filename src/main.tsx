import { App } from "@cascateer/core";
import { rubiksSlice } from "./slices/Rubiks/slice";

new App(
  ({ SliceProvider }) =>
    new SliceProvider()
      .provideSlices(({ slice }) => ({
        rubiks: slice(() => rubiksSlice),
      }))
      .complete(),
  ({ rubiks: Rubiks }) => <Rubiks />,
).appendTo(document.body);
