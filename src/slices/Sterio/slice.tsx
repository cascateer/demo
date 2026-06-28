import { ApiProvider, createSlice } from "@cascateer/core";
import { DefaultApi, UpdateAlbumRequest } from "@sterio/apis";
import {
  GetYoutubeMusicAlbums200ResponseInner,
  PartialSterioAlbumResourcesFull,
  SpotifyApiAlbumObjectSimplified,
  SterioAlbum,
  SterioAlbumResource,
  SterioAlbumResourcesTable,
  YoutubePlaylist,
} from "@sterio/models";
import { sortBy, sortedUniq, uniq } from "lodash";
import { firstValueFrom, map, switchMap } from "rxjs";
import { ImportComponent } from "./Import/component";

const STERIO_ALBUM_TAG = (id: string) => `sterio/album/${id}`;

export const sterioSlice = createSlice()
  .withData<{
    sterioAlbumId: string;
    youtubePlaylistQueries: string[];
  }>({
    sterioAlbumId: "d155219c-89ca-47c1-8f12-80c9d85a9fec",
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
      }))
      .complete(),
  )
  .withApi(
    new ApiProvider(new DefaultApi())
      .provideEffects(({ effect }) => ({
        spotifyAlbums: effect<string, SpotifyApiAlbumObjectSimplified[]>(
          (api) => ({
            predicate: (q) => api.getSpotifyAlbums({ q }),
          }),
        ),
        sterioAlbum: effect<string, SterioAlbum>((api) => ({
          predicate: (id) => api.getAlbum({ id }),
          tags: STERIO_ALBUM_TAG,
        })),
        sterioAlbumResourcesTable: effect<string, SterioAlbumResourcesTable>(
          (api) => ({
            predicate: (id) => api.getAlbumResourcesTable({ id }),
            tags: STERIO_ALBUM_TAG,
          }),
        ),
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
      }))
      .provideActions(({ action }) => ({
        updateSterioAlbum: action<UpdateAlbumRequest, void>((api) => ({
          predicate: (request) => api.updateAlbum(request),
          tags: ({ sterioAlbum }) => STERIO_ALBUM_TAG(sterioAlbum.id),
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
        sterioAlbumResourcesTable: effect<void, SterioAlbumResourcesTable>(
          ({ store, api }) =>
            () =>
              store.effects
                .sterioAlbumId()
                .pipe(
                  switchMap((id) => api.effects.sterioAlbumResourcesTable(id)),
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
        sterioAlbumResource: effect<
          keyof PartialSterioAlbumResourcesFull,
          SterioAlbumResource | undefined
        >(
          ({ terminal }) =>
            (key) =>
              terminal.effects
                .sterioAlbum()
                .pipe(map(({ resources }) => resources?.[key])),
        ),
      }))
      .provideActions(({ action }) => ({
        updateSterioAlbumResource: action<
          {
            key: keyof PartialSterioAlbumResourcesFull;
            data: Partial<SterioAlbumResource>;
          },
          void
        >(
          ({ api, terminal }) =>
            ({ key, data }) =>
              firstValueFrom(terminal.effects.sterioAlbum()).then((album) =>
                api.actions.updateSterioAlbum({
                  sterioAlbum: {
                    ...album,
                    resources: {
                      ...album.resources,
                      [key]: {
                        ...album.resources?.[key],
                        ...data,
                      },
                    },
                  },
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
              spotifyAlbums: api.effects.spotifyAlbums,
              sterioAlbumResource: terminal.effects.sterioAlbumResource,
              sterioAlbumResourcesTable:
                terminal.effects.sterioAlbumResourcesTable,
              updateSterioAlbumResource:
                terminal.actions.updateSterioAlbumResource,
              youtubeMusicAlbums: api.effects.youtubeMusicAlbums,
              youtubePlaylistQueries: store.effects.youtubePlaylistQueries,
              addYoutubePlaylistQuery: store.actions.addYoutubePlaylistQuery,
              youtubePlaylists: terminal.effects.youtubePlaylists,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
