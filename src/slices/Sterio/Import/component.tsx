import {
  Action,
  ApiEffect,
  createComponent,
  StoreEffect,
  TerminalEffect,
} from "@cascateer/core";
import { property } from "@cascateer/lib";
import {
  YoutubeMusicSearchAlbums200ResponseInner,
  YoutubePlaylist,
} from "@sterio/models";
import { QuerySelect } from "../../../compontents/QuerySelect/component";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      youtubeMusicAlbumId: StoreEffect<string | undefined>;
      updateYoutubeMusicAlbumId: Action<string, void>;
      youtubeMusicSearchAlbums: ApiEffect<
        string,
        YoutubeMusicSearchAlbums200ResponseInner[]
      >;
      youtubePlaylistId: StoreEffect<string | undefined>;
      updateYoutubePlaylistId: Action<string, void>;
      youtubePlaylistQueries: StoreEffect<string[]>;
      addYoutubePlaylistQuery: Action<string, void>;
      youtubePlaylists: TerminalEffect<void, YoutubePlaylist[]>;
    },
    {}
  >((ctx, classNames) => () => {
    return (
      <div>
        <QuerySelect
          options={ctx.youtubeMusicSearchAlbums}
          selectedValue={ctx.youtubeMusicAlbumId()}
          name="youtube-music-search-albums"
          enumerate={property("albumId")}
          text={property("text")}
          onChange={({ albumId }) => ctx.updateYoutubeMusicAlbumId(albumId)}
        />
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
    );
  });
