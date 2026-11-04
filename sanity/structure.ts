import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";
import type { StructureResolver } from "sanity/structure";
import { SITE_SETTINGS_ID } from "@/lib/types";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Site settings")
        .id(SITE_SETTINGS_ID)
        .child(
          S.document()
            .schemaType("siteSettings")
            .documentId(SITE_SETTINGS_ID)
            .title("Site settings"),
        ),
      S.divider(),
      orderableDocumentListDeskItem({ type: "film", title: "Films", S, context }),
      orderableDocumentListDeskItem({ type: "journeyStep", title: "Journey", S, context }),
      orderableDocumentListDeskItem({ type: "btsFrame", title: "BTS journal", S, context }),
    ]);
