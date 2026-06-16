import {
  Action,
  ApiEffect,
  createComponent,
  StoreEffect,
} from "@cascateer/core";
import { property } from "@cascateer/lib";
import { YtMusicSearchAlbums200ResponseInner } from "@sterio/api";
import { QuerySelect } from "../../../compontents/QuerySelect/component";

export const ImportComponent = createComponent("import")
  .withStyles(import("./styles.module.scss"), import("./styles.scss?inline"))
  .withTemplate<
    {
      ytMusicAlbumId: StoreEffect<string | undefined>;
      updateYtMusicAlbumId: Action<string, void>;
      ytMusicSearchAlbums: ApiEffect<
        string,
        YtMusicSearchAlbums200ResponseInner[]
      >;
    },
    {}
  >((ctx, cn) => () => {
    return (
      <QuerySelect
        query={ctx.ytMusicSearchAlbums}
        value={ctx.ytMusicAlbumId()}
        name="yt-music-search-albums"
        enumerate={property("albumId")}
        text={property("text")}
        onChange={({ albumId }) => ctx.updateYtMusicAlbumId(albumId)}
      />
    );
  });
