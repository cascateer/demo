import {
  ApiProvider,
  createSlice,
  defineCustomProperties,
} from "@cascateer/core";
import axios from "axios";
import { combineLatest, delay, from, map, tap } from "rxjs";
import { CubeComponent } from "./Cube/component";
import { CubeActionsComponent } from "./CubeActions/component";
import { CubeControlsComponent } from "./CubeControls/component";
import { mod } from "./math";
import { Cube } from "./types";

const BASE_URL = "https://api.cascateer.dev";

defineCustomProperties({
  "--cubie-coord-0": {
    inherits: true,
    initialValue: "0",
    syntax: "<integer>",
  },
  "--cubie-coord-1": {
    inherits: true,
    initialValue: "0",
    syntax: "<integer>",
  },
  "--cubie-coord-2": {
    inherits: true,
    initialValue: "0",
    syntax: "<integer>",
  },
});

declare global {
  namespace JSX {
    interface CSSCustomPropertyDefinitions {
      "--cubie-coord-0": JSX.CSSCustomIntegerPropertyDefinition;
      "--cubie-coord-1": JSX.CSSCustomIntegerPropertyDefinition;
      "--cubie-coord-2": JSX.CSSCustomIntegerPropertyDefinition;
    }
  }
}

export const rubiksSlice = createSlice({
  data: {
    baseActionQueue: new Array<Cube.BaseAction>(),
    currentBaseActionIndex: 0,
  },
  store: ({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        baseActionQueue: signal(({ data }) => data.property("baseActionQueue")),
        currentBaseActionIndex: signal(({ data }) =>
          data.property("currentBaseActionIndex"),
        ),
      }))
      .provideActions(({ action }) => ({
        queueAction: action<Cube.Action>(({ baseActionQueue }) =>
          baseActionQueue.update(
            (action) => (baseActionQueue) =>
              baseActionQueue.concat(action.split()),
          ),
        ),
        incrementCurrentBaseActionIndex: action<void>(
          ({ currentBaseActionIndex }) =>
            currentBaseActionIndex.update(
              () => (currentBaseActionIndex) => currentBaseActionIndex + 1,
              { sameOrigin: true },
            ),
        ),
      }))
      .complete(),
  api: new ApiProvider(axios)
    .provideEffects(({ effect }) => ({
      baseMoves: effect<void, Cube.BaseMoves>((axios) => ({
        predicate: () =>
          from(axios.get(`${BASE_URL}/rubiks/baseMoves`)).pipe(delay(1e3)),
        tags: "baseMoves",
      })),
      customMoves: effect<void, Cube.Move[]>((axios) => ({
        predicate: () =>
          from(axios.get(`${BASE_URL}/rubiks/customMoves`)).pipe(delay(0e3)),
        tags: "customMoves",
      })),
    }))
    .provideActions(({ action }) => ({
      youtubeAuth: action<void, void>((axios) => ({
        predicate: () =>
          from(
            axios.get(`${BASE_URL}/youtube/auth`, { withCredentials: true }),
          ).pipe(tap(({ data }) => window.open(data, "_blank")?.focus())),
      })),
      youtubeTest: action<void, void>((axios) => ({
        predicate: () => from(axios.get(`${BASE_URL}/youtube/test`)),
      })),
    }))
    .complete(),
  terminal: ({ TerminalProvider }) =>
    new TerminalProvider()
      .provideEffects(({ effect }) => ({
        baseMoves: effect<void, Cube.BaseMoves>(
          ({ api }) => api.effects.baseMoves,
        ),
        customMoves: effect<void, Cube.Move[]>(
          ({ api }) => api.effects.customMoves,
        ),
        currentBaseActionParity: effect<void, Cube.BaseActionParity>(
          ({ store }) =>
            () =>
              store.effects
                .currentBaseActionIndex()
                .pipe(map((index) => (mod(index, 2) === 1 ? "odd" : "even"))),
        ),
        currentBaseAction: effect<void, Cube.BaseAction | undefined>(
          ({ store }) =>
            () =>
              combineLatest([
                store.effects.baseActionQueue(),
                store.effects.currentBaseActionIndex(),
              ]).pipe(
                map(
                  ([baseActionQueue, currentBaseActionIndex]) =>
                    baseActionQueue[currentBaseActionIndex],
                ),
              ),
        ),
        currentSliceActions: effect<void, Cube.SliceAction[]>(
          ({ store }) =>
            () =>
              combineLatest([
                store.effects.baseActionQueue(),
                store.effects.currentBaseActionIndex(),
              ]).pipe(
                map(([baseActionQueue, currentBaseActionIndex]) =>
                  baseActionQueue.slice(0, currentBaseActionIndex).flat(),
                ),
              ),
        ),
      }))
      .provideEffects(({ effect }) => ({
        layout: effect<void, Cube.Layout>(
          ({ terminal }) =>
            () =>
              terminal.effects
                .currentSliceActions()
                .pipe(
                  map((currentSliceActions) =>
                    new Cube.Layout().apply(...currentSliceActions),
                  ),
                ),
        ),
      }))
      .complete(),
  components: ({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Cube: component(
          ({ store, terminal }) =>
            new CubeComponent({
              currentBaseActionIndex: store.effects.currentBaseActionIndex,
              currentBaseActionParity: terminal.effects.currentBaseActionParity,
              currentBaseAction: terminal.effects.currentBaseAction,
              incrementCurrentBaseActionIndex:
                store.actions.incrementCurrentBaseActionIndex,
              layout: terminal.effects.layout,
            }),
        ),
        CubeActions: component(
          ({ store }) =>
            new CubeActionsComponent({
              baseActionQueue: store.effects.baseActionQueue,
              currentBaseActionIndex: store.effects.currentBaseActionIndex,
            }),
        ),
        CubeControls: component(
          ({ store, api, terminal }) =>
            new CubeControlsComponent({
              baseMoves: terminal.effects.baseMoves,
              customMoves: terminal.effects.customMoves,
              queueAction: store.actions.queueAction,
              youtubeAuth: api.actions.youtubeAuth,
              youtubeTest: api.actions.youtubeTest,
            }),
        ),
      }))
      .complete(),
  render: ({ Cube, CubeActions, CubeControls }) => (
    <>
      <Cube />
      <CubeActions />
      <CubeControls />
    </>
  ),
});
