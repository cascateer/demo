import { ApiProvider, createSlice } from "@cascateer/core";
import { DefaultApi, YtMusicSearchAlbums200ResponseInner } from "@sterio/api";
import { constant } from "lodash";
import { from } from "rxjs";
import { ImportComponent } from "./Import/component";

export const sterioSlice = createSlice()
  .withData<{ ytMusicAlbumId?: string }>({})
  .withStore(({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        ytMusicAlbumId: signal(({ data }) => data.property("ytMusicAlbumId")),
      }))
      .provideActions(({ action }) => ({
        updateYtMusicAlbumId: action<string>(({ ytMusicAlbumId }) =>
          ytMusicAlbumId.update(constant),
        ),
      }))
      .complete(),
  )
  .withApi(
    new ApiProvider(new DefaultApi())
      .provideEffects(({ effect }) => ({
        ytMusicSearchAlbums: effect<
          string,
          YtMusicSearchAlbums200ResponseInner[]
        >((api) => ({
          predicate: (query) => from(api.ytMusicSearchAlbums(query)),
        })),
      }))
      .complete(),
  )
  .withTerminal(({ TerminalProvider }) => new TerminalProvider().complete())
  .withComponents(({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Import: component(
          ({ store, api }) =>
            new ImportComponent({
              ytMusicAlbumId: store.effects.ytMusicAlbumId,
              updateYtMusicAlbumId: store.actions.updateYtMusicAlbumId,
              ytMusicSearchAlbums: api.effects.ytMusicSearchAlbums,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
