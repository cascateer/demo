import { ApiProvider, createSlice } from "@cascateer/core";
import { DefaultApi } from "@sterio/apis";
import {
  YoutubeMusicAlbums200ResponseInner,
  YoutubePlaylist,
} from "@sterio/models";
import { constant, sortBy, sortedUniq, uniq } from "lodash";
import { map, switchMap } from "rxjs";
import { ImportComponent } from "./Import/component";

export const sterioSlice = createSlice()
  .withData<{
    youtubeMusicAlbumId?: string;
    youtubePlaylistId?: string;
    youtubePlaylistQueries: string[];
  }>({
    youtubePlaylistQueries: [],
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
        youtubePlaylistQueries: signal(({ data }) =>
          data.property("youtubePlaylistQueries"),
        ),
      }))
      .provideActions(({ action }) => ({
        updateYoutubeMusicAlbumId: action<string>(({ youtubeMusicAlbumId }) =>
          youtubeMusicAlbumId.update(constant),
        ),
        updateYoutubePlaylistId: action<string>(({ youtubePlaylistId }) =>
          youtubePlaylistId.update(constant),
        ),
        addYoutubePlaylistQuery: action<string>(({ youtubePlaylistQueries }) =>
          youtubePlaylistQueries.update(
            (query) => (queries) => uniq(queries.concat(query)),
          ),
        ),
      }))
      .complete(),
  )
  .withApi(
    new ApiProvider(new DefaultApi())
      .provideEffects(({ effect }) => ({
        youtubeMusicAlbums: effect<
          string | undefined,
          YoutubeMusicAlbums200ResponseInner[]
        >((api) => ({
          predicate: (q) => api.youtubeMusicAlbums({ q }),
        })),
        youtubePlaylists: effect<string[], YoutubePlaylist[]>((api) => ({
          predicate: (ids: string[]) =>
            ids.length > 0
              ? api.youtubePlaylists({ ids: `${sortedUniq(sortBy(ids))}` })
              : [],
        })),
      }))
      .complete(),
  )
  .withTerminal(({ TerminalProvider }) =>
    new TerminalProvider()
      .provideEffects(({ effect }) => ({
        youtubePlaylistIds: effect<void, string[]>(
          ({ store }) =>
            () =>
              store.effects.youtubePlaylistQueries().pipe(
                map((queries) =>
                  queries
                    .map((query) => query.trim())
                    .flatMap((query) => {
                      const id = (() => {
                        try {
                          return new URL(query).searchParams.get("list");
                        } catch {
                          return query;
                        }
                      })();

                      if (id != null && /^[\w-]+$/.test(id)) {
                        return id;
                      }

                      return [];
                    }),
                ),
              ),
        ),
      }))
      .provideEffects(({ effect }) => ({
        youtubePlaylists: effect<void, YoutubePlaylist[]>(
          ({ api, terminal }) =>
            () =>
              terminal.effects
                .youtubePlaylistIds()
                .pipe(switchMap(api.effects.youtubePlaylists)),
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
              youtubeMusicAlbums: api.effects.youtubeMusicAlbums,
              youtubePlaylistId: store.effects.youtubePlaylistId,
              updateYoutubePlaylistId: store.actions.updateYoutubePlaylistId,
              youtubePlaylistQueries: store.effects.youtubePlaylistQueries,
              addYoutubePlaylistQuery: store.actions.addYoutubePlaylistQuery,
              youtubePlaylists: terminal.effects.youtubePlaylists,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
