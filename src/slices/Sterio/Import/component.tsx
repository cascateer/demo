import {
  Action,
  ApiEffect,
  createComponent,
  StoreEffect,
  TerminalEffect,
} from "@cascateer/core";
import { EndoFunction, property } from "@cascateer/lib";
import {
  GetYoutubeMusicAlbums200ResponseInner,
  SpotifyApiAlbumObjectSimplified,
  SterioAlbum,
  YoutubePlaylist,
} from "@cascateer/sterio/api";
import { map } from "rxjs";
import { Input } from "../../../compontents/Input/component";
import { QuerySelect } from "../../../compontents/QuerySelect/component";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      updateSterioAlbumId: Action<string, void>;
      sterioAlbum: ApiEffect<void, SterioAlbum>;
      updateSterioAlbum: Action<EndoFunction<SterioAlbum>, void>;
      sterioAlbumResourceConflicts: TerminalEffect<void, string>;

      youtubeMusicAlbums: ApiEffect<
        string,
        GetYoutubeMusicAlbums200ResponseInner[]
      >;
      youtubePlaylistQueries: StoreEffect<string[]>;
      addYoutubePlaylistQuery: Action<string, void>;
      youtubePlaylists: TerminalEffect<void, YoutubePlaylist[]>;
      spotifyAlbums: ApiEffect<string, SpotifyApiAlbumObjectSimplified[]>;
    },
    {}
  >((ctx, classNames) => () => (
    <>
      <div className={classNames.importColumns}>
        <div className={classNames.importColumn}>
          <h4>YoutubeMusic*</h4>
          <QuerySelect
            placeholder="Search albums..."
            options={ctx.youtubeMusicAlbums}
            selectedValue={ctx
              .sterioAlbum()
              .pipe(map(property("youtubeMusicId")))}
            name="youtube-music-album-resource-id"
            enumerate={property("albumId")}
            text={property("text")}
            onChange={({ albumId }) => ctx.updateSterioAlbumId(albumId)}
          />
          <Input
            name="youtube-music-album-resource-iteratee"
            placeholder="iteratee"
            value={ctx
              .sterioAlbum()
              .pipe(map(property("youtubeMusicIteratee")))}
            onChange={(iteratee) =>
              ctx.updateSterioAlbum((album) => ({
                ...album,
                youtubeMusicIteratee: iteratee,
              }))
            }
          />
        </div>
        <div className={classNames.importColumn}>
          <h4>Youtube</h4>
          <QuerySelect
            placeholder="Enter playlist ID or URL..."
            onQueryChange={ctx.addYoutubePlaylistQuery}
            options={() => ctx.youtubePlaylists()}
            selectedValue={ctx.sterioAlbum().pipe(map(property("youtubeId")))}
            name="youtube-album-resource-id"
            enumerate={property("id")}
            text={(playlist) => playlist.title ?? playlist.id}
            onChange={({ id }) =>
              ctx.updateSterioAlbum((album) => ({
                ...album,
                youtubeId: id,
              }))
            }
          />
          <Input
            name="youtube-album-resource-iteratee"
            placeholder="iteratee"
            value={ctx.sterioAlbum().pipe(map(property("youtubeIteratee")))}
            onChange={(iteratee) =>
              ctx.updateSterioAlbum((album) => ({
                ...album,
                youtubeIteratee: iteratee,
              }))
            }
          />
        </div>
        <div className={classNames.importColumn}>
          <h4>Spotify</h4>
          <QuerySelect
            placeholder="Search albums..."
            options={ctx.spotifyAlbums}
            selectedValue={ctx.sterioAlbum().pipe(map(property("spotifyId")))}
            name="spotify-album-resource-id"
            enumerate={property("id")}
            text={(album) =>
              `${album.name} - ${album.artists.map(property("name")).join(", ")} (${album.release_date.slice(0, 4)})`
            }
            onChange={({ id }) =>
              ctx.updateSterioAlbum((album) => ({
                ...album,
                spotifyId: id,
              }))
            }
          />
          <Input
            name="spotify-album-resource-iteratee"
            placeholder="iteratee"
            value={ctx.sterioAlbum().pipe(map(property("spotifyIteratee")))}
            onChange={(iteratee) =>
              ctx.updateSterioAlbum((album) => ({
                ...album,
                spotifyIteratee: iteratee,
              }))
            }
          />
        </div>
      </div>
      <p>
        {ctx
          .sterioAlbumResourceConflicts()
          .pipe(
            map(
              (html) => new DOMParser().parseFromString(html, "text/html").body,
            ),
          )}
      </p>
    </>
  ));
