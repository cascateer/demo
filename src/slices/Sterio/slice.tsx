import { ApiProvider, createSlice } from "@cascateer/core";
import { EndoFunction } from "@cascateer/lib";
import {
  DefaultApi,
  GetYoutubeMusicAlbums200ResponseInner,
  SpotifyApiAlbumObjectSimplified,
  SterioAlbum,
  UpdateAlbumRequest,
  YoutubePlaylist,
} from "@cascateer/sterio/api";
import { constant, sortBy, sortedUniq, thru, uniq } from "lodash";
import { combineLatest, firstValueFrom, map, switchMap } from "rxjs";
import { ImportComponent } from "./Import/component";

const STERIO_ALBUM_TAG = (id: string) => `sterio/album/${id}`;

export const sterioSlice = createSlice()
  .withData<{
    sterioAlbumId: string;
    youtubePlaylistQueries: string[];
  }>({
    sterioAlbumId: "MPREb_bt4NaNkx0W4",
    youtubePlaylistQueries: [],
  })
  .withStore(({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        sterioAlbumId: signal(({ data }) => data.property("sterioAlbumId")),
        youtubePlaylistQueries: signal(({ data }) =>
          data.property("youtubePlaylistQueries"),
        ),
      }))
      .provideActions(({ action }) => ({
        addYoutubePlaylistQuery: action<string>(({ youtubePlaylistQueries }) =>
          youtubePlaylistQueries.update(
            (query) => (queries) => uniq(queries.concat(query)),
          ),
        ),
        updateSterioAlbumId: action<string>(({ sterioAlbumId }) =>
          sterioAlbumId.update(constant),
        ),
      }))
      .complete(),
  )
  .withApi(
    new ApiProvider(new DefaultApi())
      .provideEffects(({ effect }) => ({
        sterioAlbum: effect<string, SterioAlbum>((api) => ({
          predicate: (id) => api.getAlbum({ id }),
          tags: STERIO_ALBUM_TAG,
        })),
        sterioAlbumIds: effect<void, string[]>((api) => ({
          predicate: () => api.getAlbumIds(),
        })),
        sterioAlbumResourceConflicts: effect<string, string>((api) => ({
          predicate: (id) => api.getAlbumResourceConflicts({ id }),
          tags: STERIO_ALBUM_TAG,
        })),
        youtubeMusicAlbums: effect<
          string,
          GetYoutubeMusicAlbums200ResponseInner[]
        >((api) => ({
          predicate: (q) => api.getYoutubeMusicAlbums({ q }),
        })),
        youtubePlaylists: effect<string[], YoutubePlaylist[]>((api) => ({
          predicate: (ids) =>
            ids.length > 0
              ? api.getYoutubePlaylists({ ids: `${sortedUniq(sortBy(ids))}` })
              : [],
        })),
        spotifyAlbums: effect<string, SpotifyApiAlbumObjectSimplified[]>(
          (api) => ({
            predicate: (q) => api.getSpotifyAlbums({ q }),
          }),
        ),
      }))
      .provideActions(({ action }) => ({
        updateSterioAlbum: action<UpdateAlbumRequest, void>((api) => ({
          predicate: (request) => api.updateAlbum(request),
          tags: ({ sterioAlbum }) =>
            STERIO_ALBUM_TAG(sterioAlbum.youtubeMusicId),
        })),
      }))
      .complete(),
  )
  .withTerminal(({ TerminalProvider }) =>
    new TerminalProvider()
      .provideEffects(({ effect }) => ({
        sterioAlbum: effect<void, SterioAlbum>(
          ({ store, api }) =>
            () =>
              store.effects
                .sterioAlbumId()
                .pipe(switchMap((id) => api.effects.sterioAlbum(id))),
        ),
        sterioAlbumIds: effect<void, string[]>(
          ({ api }) =>
            () =>
              api.effects.sterioAlbumIds(),
        ),
      }))
      .provideEffects(({ effect }) => ({
        sterioAlbumIndex: effect<void, number>(
          ({ terminal }) =>
            () =>
              combineLatest([
                terminal.effects.sterioAlbumIds(),
                terminal.effects.sterioAlbum(),
              ]).pipe(
                map(([albumIds, album]) =>
                  albumIds.findIndex(
                    (albumId) => albumId === album.youtubeMusicId,
                  ),
                ),
              ),
        ),
        sterioAlbumResourceConflicts: effect<void, string>(
          ({ store, api }) =>
            () =>
              store.effects
                .sterioAlbumId()
                .pipe(
                  switchMap((id) =>
                    api.effects.sterioAlbumResourceConflicts(id),
                  ),
                ),
        ),
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
      .provideActions(({ action }) => ({
        stepSterioAlbum: action<number, void>(
          ({ store, terminal }) =>
            (step) =>
              firstValueFrom(
                combineLatest([
                  terminal.effects.sterioAlbum(),
                  terminal.effects.sterioAlbumIds(),
                ]),
              ).then(([album, albumIds]) =>
                thru(
                  albumIds[albumIds.indexOf(album.youtubeMusicId) + step],
                  async (albumId) => {
                    if (albumId != null) {
                      return store.actions.updateSterioAlbumId(albumId);
                    }
                  },
                ),
              ),
        ),
        updateSterioAlbum: action<EndoFunction<SterioAlbum>, void>(
          ({ api, terminal }) =>
            (patch) =>
              firstValueFrom(terminal.effects.sterioAlbum()).then((album) =>
                api.actions.updateSterioAlbum({
                  sterioAlbum: patch(album),
                }),
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
              updateSterioAlbumId: store.actions.updateSterioAlbumId,
              sterioAlbum: terminal.effects.sterioAlbum,
              sterioAlbumIndex: terminal.effects.sterioAlbumIndex,
              stepSterioAlbum: terminal.actions.stepSterioAlbum,
              updateSterioAlbum: terminal.actions.updateSterioAlbum,
              sterioAlbumResourceConflicts:
                terminal.effects.sterioAlbumResourceConflicts,
              youtubeMusicAlbums: api.effects.youtubeMusicAlbums,
              youtubePlaylistQueries: store.effects.youtubePlaylistQueries,
              addYoutubePlaylistQuery: store.actions.addYoutubePlaylistQuery,
              youtubePlaylists: terminal.effects.youtubePlaylists,
              spotifyAlbums: api.effects.spotifyAlbums,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
