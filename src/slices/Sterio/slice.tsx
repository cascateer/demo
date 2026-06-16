import { ApiProvider, createSlice } from "@cascateer/core";
import {
  DefaultApi,
  YoutubeMusicSearchAlbums200ResponseInner,
} from "@sterio/api";
import { constant } from "lodash";
import { from } from "rxjs";
import { ImportComponent } from "./Import/component";

export const sterioSlice = createSlice()
  .withData<{
    youtubeMusicAlbumId?: string;
    youtubePlaylistId?: string;
  }>({})
  .withStore(({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        youtubeMusicAlbumId: signal(({ data }) =>
          data.property("youtubeMusicAlbumId"),
        ),
      }))
      .provideActions(({ action }) => ({
        updateYoutubeMusicAlbumId: action<string>(({ youtubeMusicAlbumId }) =>
          youtubeMusicAlbumId.update(constant),
        ),
      }))
      .complete(),
  )
  .withApi(
    new ApiProvider(new DefaultApi())
      .provideEffects(({ effect }) => ({
        youtubeMusicSearchAlbums: effect<
          string,
          YoutubeMusicSearchAlbums200ResponseInner[]
        >((api) => ({
          predicate: (query) => from(api.youtubeMusicSearchAlbums(query)),
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
              youtubeMusicAlbumId: store.effects.youtubeMusicAlbumId,
              updateYoutubeMusicAlbumId:
                store.actions.updateYoutubeMusicAlbumId,
              youtubeMusicSearchAlbums: api.effects.youtubeMusicSearchAlbums,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
