import {
  Action,
  ApiEffect,
  createComponent,
  StoreEffect,
} from "@cascateer/core";
import { property } from "@cascateer/lib";
import { YoutubeMusicSearchAlbums200ResponseInner } from "@sterio/api";
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
    },
    {}
  >((ctx, classNames) => () => {
    return (
      <div>
        <QuerySelect
          query={ctx.youtubeMusicSearchAlbums}
          id={ctx.youtubeMusicAlbumId()}
          name="youtube-music-search-albums"
          enumerate={property("albumId")}
          text={property("text")}
          onChange={({ albumId }) => ctx.updateYoutubeMusicAlbumId(albumId)}
        />
        <QuerySelect
          query={ctx.youtubeMusicSearchAlbums}
          id={ctx.youtubeMusicAlbumId()}
          name="youtube-music-search-albums"
          enumerate={property("albumId")}
          text={property("text")}
          onChange={({ albumId }) => ctx.updateYoutubeMusicAlbumId(albumId)}
        />
      </div>
    );
  });
