import {
  Action,
  ApiEffect,
  createComponent,
  StoreEffect,
  TerminalEffect,
} from "@cascateer/core";
import { property } from "@cascateer/lib";
import {
  GetYoutubeMusicAlbums200ResponseInner,
  SpotifyApiAlbumObjectSimplified,
  SterioAlbumResource,
  SterioAlbumResourcesMatchColumns,
  YoutubePlaylist,
} from "@sterio/models";
import { map } from "rxjs";
import { Input } from "../../../compontents/Input/component";
import { QuerySelect } from "../../../compontents/QuerySelect/component";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      youtubeMusicAlbumResource: StoreEffect<Partial<SterioAlbumResource> | null>;
      updateYoutubeMusicAlbumResource: Action<
        Partial<SterioAlbumResource>,
        void
      >;
      youtubeMusicAlbums: ApiEffect<
        string,
        GetYoutubeMusicAlbums200ResponseInner[]
      >;
      youtubePlaylistQueries: StoreEffect<string[]>;
      addYoutubePlaylistQuery: Action<string, void>;
      youtubeAlbumResource: StoreEffect<Partial<SterioAlbumResource> | null>;
      updateYoutubeAlbumResource: Action<Partial<SterioAlbumResource>, void>;
      youtubePlaylists: TerminalEffect<void, YoutubePlaylist[]>;
      spotifyAlbumResource: StoreEffect<Partial<SterioAlbumResource> | null>;
      updateSpotifyAlbumResource: Action<Partial<SterioAlbumResource>, void>;
      spotifyAlbums: ApiEffect<string, SpotifyApiAlbumObjectSimplified[]>;
      albumResourcesMatchColumns: ApiEffect<
        void,
        SterioAlbumResourcesMatchColumns
      >;
    },
    {}
  >((ctx, classNames) => () => {
    return (
      <div className={classNames.importMatchColumns}>
        <div className={classNames.importMatchColumn}>
          <h4>YoutubeMusic*</h4>
          <QuerySelect
            placeholder="Search albums..."
            options={ctx.youtubeMusicAlbums}
            selectedValue={ctx
              .youtubeMusicAlbumResource()
              .pipe(map((resource) => resource?.id))}
            name="youtube-music-album-resource-id"
            enumerate={property("albumId")}
            text={property("text")}
            onChange={({ albumId }) =>
              ctx.updateYoutubeMusicAlbumResource({ id: albumId })
            }
          />
          <Input
            name="youtube-music-album-resource-iteratee"
            placeholder="iteratee"
            value={ctx
              .youtubeMusicAlbumResource()
              .pipe(map((resource) => resource?.iteratee))}
            onChange={(iteratee) =>
              ctx.updateYoutubeMusicAlbumResource({ iteratee })
            }
          />
          <>
            {ctx
              .albumResourcesMatchColumns()
              .pipe(
                map(({ youtubeMusic }) =>
                  youtubeMusic.map((row) => <div>{row}</div>),
                ),
              )}
          </>
        </div>
        <div className={classNames.importMatchColumn}>
          <h4>Youtube</h4>
          <QuerySelect
            placeholder="Enter playlist ID or URL..."
            onQueryChange={ctx.addYoutubePlaylistQuery}
            options={() => ctx.youtubePlaylists()}
            selectedValue={ctx
              .youtubeAlbumResource()
              .pipe(map((resource) => resource?.id))}
            name="youtube-album-resource-id"
            enumerate={property("id")}
            text={(playlist) => playlist.title ?? playlist.id}
            onChange={ctx.updateYoutubeAlbumResource}
          />
          <Input
            name="youtube-album-resource-iteratee"
            placeholder="iteratee"
            value={ctx
              .youtubeAlbumResource()
              .pipe(map((resource) => resource?.iteratee))}
            onChange={(iteratee) =>
              ctx.updateYoutubeAlbumResource({ iteratee })
            }
          />
          <>
            {ctx
              .albumResourcesMatchColumns()
              .pipe(
                map(({ youtube }) => youtube.map((row) => <div>{row}</div>)),
              )}
          </>
        </div>
        <div className={classNames.importMatchColumn}>
          <h4>Spotify</h4>
          <QuerySelect
            placeholder="Search albums..."
            options={ctx.spotifyAlbums}
            selectedValue={ctx
              .spotifyAlbumResource()
              .pipe(map((resource) => resource?.id))}
            name="spotify-album-resource-id"
            enumerate={property("id")}
            text={(album) =>
              `${album.name} - ${album.artists.map(property("name")).join(", ")} (${album.release_date.slice(0, 4)})`
            }
            onChange={ctx.updateSpotifyAlbumResource}
          />
          <Input
            name="spotify-album-resource-iteratee"
            placeholder="iteratee"
            value={ctx
              .spotifyAlbumResource()
              .pipe(map((resource) => resource?.iteratee))}
            onChange={(iteratee) =>
              ctx.updateSpotifyAlbumResource({ iteratee })
            }
          />
          <>
            {ctx
              .albumResourcesMatchColumns()
              .pipe(
                map(({ spotify }) => spotify.map((row) => <div>{row}</div>)),
              )}
          </>
        </div>
      </div>
    );
  });
