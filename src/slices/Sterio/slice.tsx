import { ApiProvider, createSlice } from "@cascateer/core";
import axios from "axios";
import { ImportComponent } from "./Import/component";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const sterioSlice = createSlice({
  data: {},
  store: ({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({}))
      .provideActions(({ action }) => ({}))
      .complete(),
  api: new ApiProvider(axios).complete(),
  terminal: ({ TerminalProvider }) => new TerminalProvider().complete(),
  components: ({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Import: component(() => new ImportComponent({})),
      }))
      .complete(),
  render: ({ Import }) => (
    <>
      <Import />
    </>
  ),
});
