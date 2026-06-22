import {
  Action,
  ApiEffect,
  createComponent,
  StoreEffect,
  TerminalEffect,
} from "@cascateer/core";
import { property } from "@cascateer/lib";
import {
  SpotifyApiAlbumObjectSimplified,
  YoutubeMusicAlbums200ResponseInner,
  YoutubePlaylist,
} from "@sterio/models";
import { QuerySelect } from "../../../compontents/QuerySelect/component";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      youtubeMusicAlbumId: StoreEffect<string | undefined>;
      updateYoutubeMusicAlbumId: Action<string, void>;
      youtubeMusicAlbums: ApiEffect<
        string,
        YoutubeMusicAlbums200ResponseInner[]
      >;
      youtubePlaylistId: StoreEffect<string | undefined>;
      updateYoutubePlaylistId: Action<string, void>;
      youtubePlaylistQueries: StoreEffect<string[]>;
      addYoutubePlaylistQuery: Action<string, void>;
      youtubePlaylists: TerminalEffect<void, YoutubePlaylist[]>;
      spotifyAlbumQuery: StoreEffect<string | undefined>;
      updateSpotifyAlbumQuery: Action<string, void>;
      spotifyAlbumId: StoreEffect<string | undefined>;
      updateSpotifyAlbumId: Action<string, void>;
      spotifyAlbums: ApiEffect<string, SpotifyApiAlbumObjectSimplified[]>;
    },
    {}
  >((ctx, classNames) => () => {
    return (
      <>
        <div>
          <QuerySelect
            options={ctx.youtubeMusicAlbums}
            selectedValue={ctx.youtubeMusicAlbumId()}
            name="youtube-music-albums"
            enumerate={property("albumId")}
            text={property("text")}
            onChange={({ albumId }) => ctx.updateYoutubeMusicAlbumId(albumId)}
          />
        </div>
        <div>
          <QuerySelect
            onQueryChange={ctx.addYoutubePlaylistQuery}
            options={() => ctx.youtubePlaylists()}
            selectedValue={ctx.youtubePlaylistId()}
            name="youtube-playlists"
            enumerate={property("id")}
            text={(playlist) => playlist.title ?? playlist.id}
            onChange={({ id }) => ctx.updateYoutubePlaylistId(id)}
          />
        </div>
        <div>
          <QuerySelect
            query={ctx.spotifyAlbumQuery()}
            onQueryInput={ctx.updateSpotifyAlbumQuery}
            options={ctx.spotifyAlbums}
            selectedValue={ctx.spotifyAlbumId()}
            name="spotify-albums"
            enumerate={property("id")}
            text={(album) =>
              `${album.name} - ${album.artists.map(property("name")).join(", ")} (${album.release_date.slice(0, 4)})`
            }
            onChange={({ id }) => ctx.updateSpotifyAlbumId(id)}
          />
        </div>
      </>
    );
  });
