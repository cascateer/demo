import { ApiProvider, createSlice } from "@cascateer/core";
import { DefaultApi } from "@sterio/apis";
import {
  YoutubeMusicSearchAlbums200ResponseInner,
  YoutubePlaylist,
} from "@sterio/models";
import { constant, uniq } from "lodash";
import { switchMap } from "rxjs";
import { ImportComponent } from "./Import/component";

export const sterioSlice = createSlice()
  .withData<{
    youtubeMusicAlbumId?: string;
    youtubePlaylistId?: string;
    youtubePlaylistIds: string[];
  }>({
    youtubePlaylistId: "PLEouLkiLHdSDWX0mmkQ07iEcF6AyYFyNN",
    youtubePlaylistIds: [
      "PLkROH3Eqs0T8GFsJ0ACddo8hc1M4_GFFu",
      "PLEouLkiLHdSDWX0mmkQ07iEcF6AyYFyNN",
    ],
  })
  .withStore(({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        youtubeMusicAlbumId: signal(({ data }) =>
          data.property("youtubeMusicAlbumId"),
        ),
        youtubePlaylistId: signal(({ data }) =>
          data.property("youtubePlaylistId"),
        ),
        youtubePlaylistIds: signal(({ data }) =>
          data.property("youtubePlaylistIds"),
        ),
      }))
      .provideActions(({ action }) => ({
        updateYoutubeMusicAlbumId: action<string>(({ youtubeMusicAlbumId }) =>
          youtubeMusicAlbumId.update(constant),
        ),
        updateYoutubePlaylistId: action<string>(({ youtubePlaylistId }) =>
          youtubePlaylistId.update(constant),
        ),
        addYoutubePlaylistId: action<string>(({ youtubePlaylistIds }) =>
          youtubePlaylistIds.update(
            (playlistId) => (youtubePlaylistIds) =>
              uniq(youtubePlaylistIds.concat(playlistId)),
          ),
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
          predicate: (q) => api.youtubeMusicSearchAlbums({ q }),
        })),
        youtubePlaylists: effect<string, YoutubePlaylist[]>((api) => ({
          predicate: (ids) => api.youtubePlaylists({ ids }),
        })),
      }))
      .complete(),
  )
  .withTerminal(({ TerminalProvider }) =>
    new TerminalProvider()
      .provideEffects(({ effect }) => ({
        youtubePlaylists: effect<void, YoutubePlaylist[]>(
          ({ store, api }) =>
            () =>
              store.effects
                .youtubePlaylistIds()
                .pipe(
                  switchMap((ids) =>
                    api.effects.youtubePlaylists(ids.join(",")),
                  ),
                ),
        ),
      }))
      .complete(),
  )
  .withComponents(({ ComponentsProvider }) =>
    new ComponentsProvider()
      .provideComponents(({ component }) => ({
        Import: component(
          ({ store, api, terminal }) =>
            new ImportComponent({
              youtubeMusicAlbumId: store.effects.youtubeMusicAlbumId,
              updateYoutubeMusicAlbumId:
                store.actions.updateYoutubeMusicAlbumId,
              youtubeMusicSearchAlbums: api.effects.youtubeMusicSearchAlbums,
              youtubePlaylistId: store.effects.youtubePlaylistId,
              updateYoutubePlaylistId: store.actions.updateYoutubePlaylistId,
              youtubePlaylistIds: store.effects.youtubePlaylistIds,
              addYoutubePlaylistId: store.actions.addYoutubePlaylistId,
              youtubePlaylists: terminal.effects.youtubePlaylists,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
