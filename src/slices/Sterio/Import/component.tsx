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
  PartialSterioAlbumResourcesFull,
  SpotifyApiAlbumObjectSimplified,
  SterioAlbumResource,
  SterioAlbumResourcesTable,
  YoutubePlaylist,
} from "@cascateer/sterio/api/models";
import { map } from "rxjs";
import { Input } from "../../../compontents/Input/component";
import { QuerySelect } from "../../../compontents/QuerySelect/component";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      spotifyAlbums: ApiEffect<string, SpotifyApiAlbumObjectSimplified[]>;
      sterioAlbumResource: TerminalEffect<
        keyof PartialSterioAlbumResourcesFull,
        SterioAlbumResource | undefined
      >;
      sterioAlbumResourcesTable: TerminalEffect<
        void,
        SterioAlbumResourcesTable
      >;
      updateSterioAlbumResource: Action<
        {
          key: keyof PartialSterioAlbumResourcesFull;
          data: Partial<SterioAlbumResource>;
        },
        void
      >;
      youtubeMusicAlbums: ApiEffect<
        string,
        GetYoutubeMusicAlbums200ResponseInner[]
      >;
      youtubePlaylistQueries: StoreEffect<string[]>;
      addYoutubePlaylistQuery: Action<string, void>;
      youtubePlaylists: TerminalEffect<void, YoutubePlaylist[]>;
    },
    {}
  >((ctx, classNames) => () => (
    <div className={classNames.importMatchColumns}>
      <div className={classNames.importMatchColumn}>
        <h4>YoutubeMusic*</h4>
        <QuerySelect
          placeholder="Search albums..."
          options={ctx.youtubeMusicAlbums}
          selectedValue={ctx
            .sterioAlbumResource("youtubeMusic")
            .pipe(map((resource) => resource?.id))}
          name="youtube-music-album-resource-id"
          enumerate={property("albumId")}
          text={property("text")}
          onChange={({ albumId }) =>
            ctx.updateSterioAlbumResource({
              key: "youtubeMusic",
              data: { id: albumId },
            })
          }
        />
        <Input
          name="youtube-music-album-resource-iteratee"
          placeholder="iteratee"
          value={ctx
            .sterioAlbumResource("youtubeMusic")
            .pipe(map((resource) => resource?.iteratee))}
          onChange={(iteratee) =>
            ctx.updateSterioAlbumResource({
              key: "youtubeMusic",
              data: { iteratee },
            })
          }
        />
        <>
          {ctx
            .sterioAlbumResourcesTable()
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
            .sterioAlbumResource("youtube")
            .pipe(map((resource) => resource?.id))}
          name="youtube-album-resource-id"
          enumerate={property("id")}
          text={(playlist) => playlist.title ?? playlist.id}
          onChange={({ id }) =>
            ctx.updateSterioAlbumResource({
              key: "youtube",
              data: { id },
            })
          }
        />
        <Input
          name="youtube-album-resource-iteratee"
          placeholder="iteratee"
          value={ctx
            .sterioAlbumResource("youtube")
            .pipe(map((resource) => resource?.iteratee))}
          onChange={(iteratee) =>
            ctx.updateSterioAlbumResource({
              key: "youtube",
              data: { iteratee },
            })
          }
        />
        <>
          {ctx
            .sterioAlbumResourcesTable()
            .pipe(map(({ youtube }) => youtube.map((row) => <div>{row}</div>)))}
        </>
      </div>
      <div className={classNames.importMatchColumn}>
        <h4>Spotify</h4>
        <QuerySelect
          placeholder="Search albums..."
          options={ctx.spotifyAlbums}
          selectedValue={ctx
            .sterioAlbumResource("spotify")
            .pipe(map((resource) => resource?.id))}
          name="spotify-album-resource-id"
          enumerate={property("id")}
          text={(album) =>
            `${album.name} - ${album.artists.map(property("name")).join(", ")} (${album.release_date.slice(0, 4)})`
          }
          onChange={({ id }) =>
            ctx.updateSterioAlbumResource({
              key: "spotify",
              data: { id },
            })
          }
        />
        <Input
          name="spotify-album-resource-iteratee"
          placeholder="iteratee"
          value={ctx
            .sterioAlbumResource("spotify")
            .pipe(map((resource) => resource?.iteratee))}
          onChange={(iteratee) =>
            ctx.updateSterioAlbumResource({
              key: "spotify",
              data: { iteratee },
            })
          }
        />
        <>
          {ctx
            .sterioAlbumResourcesTable()
            .pipe(map(({ spotify }) => spotify.map((row) => <div>{row}</div>)))}
        </>
      </div>
    </div>
  ));
