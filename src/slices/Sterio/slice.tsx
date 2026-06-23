import { ApiProvider, createSlice } from "@cascateer/core";
import { flatMap } from "@cascateer/lib/observables";
import { DefaultApi, GetAlbumResourcesMatchColumnsRequest } from "@sterio/apis";
import {
  GetYoutubeMusicAlbums200ResponseInner,
  SpotifyApiAlbumObjectSimplified,
  SterioAlbumResource,
  SterioAlbumResourcesMatchColumns,
  YoutubePlaylist,
} from "@sterio/models";
import { sortBy, sortedUniq, uniq } from "lodash";
import { combineLatest, map, mergeAll, switchMap } from "rxjs";
import { ImportComponent } from "./Import/component";

export const sterioSlice = createSlice()
  .withData<{
    albumResources: Record<
      "youtubeMusic" | "youtube" | "spotify",
      Partial<SterioAlbumResource> | null
    >;
    youtubePlaylistQueries: string[];
  }>({
    albumResources: {
      youtubeMusic: {
        id: "MPREb_kGyzNTOQJLH",
      },
      youtube: {
        id: "OLAK5uy_miuj7l2JKCuzKEoaT6eNeDQd6hvUxTrhI",
      },
      spotify: {
        id: "6vPoK8jIddDv4a6ksinsGr",
        iteratee: "${name/(.*) - (2023 Abbey Road Remaster)$/$1 ($2)/}",
      },
    },
    youtubePlaylistQueries: [],
  })
  .withStore(({ StoreProvider }) =>
    new StoreProvider()
      .provideSignals(({ signal }) => ({
        youtubeMusicAlbumResource: signal(({ data }) =>
          data.property("albumResources").property("youtubeMusic"),
        ),
        youtubePlaylistQueries: signal(({ data }) =>
          data.property("youtubePlaylistQueries"),
        ),
        youtubeAlbumResource: signal(({ data }) =>
          data.property("albumResources").property("youtube"),
        ),
        spotifyAlbumResource: signal(({ data }) =>
          data.property("albumResources").property("spotify"),
        ),
      }))
      .provideActions(({ action }) => ({
        updateYoutubeMusicAlbumResource: action<Partial<SterioAlbumResource>>(
          ({ youtubeMusicAlbumResource }) =>
            youtubeMusicAlbumResource.update(
              (resource) => (currentResource) => ({
                ...(currentResource ?? {}),
                ...resource,
              }),
            ),
        ),
        addYoutubePlaylistQuery: action<string>(({ youtubePlaylistQueries }) =>
          youtubePlaylistQueries.update(
            (query) => (queries) => uniq(queries.concat(query)),
          ),
        ),
        updateYoutubeAlbumResource: action<Partial<SterioAlbumResource>>(
          ({ youtubeAlbumResource }) =>
            youtubeAlbumResource.update((resource) => (currentResource) => ({
              ...(currentResource ?? {}),
              ...resource,
            })),
        ),
        updateSpotifyAlbumResource: action<Partial<SterioAlbumResource>>(
          ({ spotifyAlbumResource }) =>
            spotifyAlbumResource.update((resource) => (currentResource) => ({
              ...(currentResource ?? {}),
              ...resource,
            })),
        ),
      }))
      .complete(),
  )
  .withApi(
    new ApiProvider(new DefaultApi())
      .provideEffects(({ effect }) => ({
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
        albumResourcesMatchColumns: effect<
          GetAlbumResourcesMatchColumnsRequest,
          SterioAlbumResourcesMatchColumns
        >((api) => ({
          predicate: (body) => api.getAlbumResourcesMatchColumns(body),
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
        albumResourcesMatchColumns: effect<
          void,
          SterioAlbumResourcesMatchColumns
        >(
          ({ store, api }) =>
            () =>
              combineLatest([
                store.effects.youtubeMusicAlbumResource(),
                store.effects.youtubeAlbumResource(),
                store.effects.spotifyAlbumResource(),
              ]).pipe(
                flatMap(
                  ([
                    youtubeMusicAlbumResource,
                    youtubeAlbumResource,
                    spotifyAlbumResource,
                  ]) =>
                    youtubeMusicAlbumResource?.id != null &&
                    youtubeAlbumResource?.id != null &&
                    spotifyAlbumResource?.id != null
                      ? api.effects.albumResourcesMatchColumns({
                          sterioAlbumResourcesFull: {
                            youtubeMusic: {
                              id: youtubeMusicAlbumResource.id,
                              iteratee: youtubeMusicAlbumResource.iteratee,
                            },
                            youtube: {
                              id: youtubeAlbumResource.id,
                              iteratee: youtubeAlbumResource.iteratee,
                            },
                            spotify: {
                              id: spotifyAlbumResource.id,
                              iteratee: spotifyAlbumResource.iteratee,
                            },
                          },
                        })
                      : [],
                ),
                mergeAll(),
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
              youtubeMusicAlbumResource:
                store.effects.youtubeMusicAlbumResource,
              updateYoutubeMusicAlbumResource:
                store.actions.updateYoutubeMusicAlbumResource,
              youtubeMusicAlbums: api.effects.youtubeMusicAlbums,
              youtubePlaylistQueries: store.effects.youtubePlaylistQueries,
              addYoutubePlaylistQuery: store.actions.addYoutubePlaylistQuery,
              youtubeAlbumResource: store.effects.youtubeAlbumResource,
              updateYoutubeAlbumResource:
                store.actions.updateYoutubeAlbumResource,
              youtubePlaylists: terminal.effects.youtubePlaylists,
              spotifyAlbumResource: store.effects.spotifyAlbumResource,
              updateSpotifyAlbumResource:
                store.actions.updateSpotifyAlbumResource,
              spotifyAlbums: api.effects.spotifyAlbums,
              albumResourcesMatchColumns:
                terminal.effects.albumResourcesMatchColumns,
            }),
        ),
      }))
      .complete(),
  )
  .withTemplate(({ Import }) => <Import />);
