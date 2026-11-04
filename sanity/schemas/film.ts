import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { createElement } from "react";
import { defineArrayMember, defineField, defineType } from "sanity";
import { FILM_CATEGORIES, FILM_ROLES } from "@/lib/types";
import { getYouTubeId, youTubeThumbnail } from "@/lib/youtube";

export const film = defineType({
  name: "film",
  title: "Film",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "film" }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube link",
      type: "url",
      description:
        "Paste the link from YouTube (youtu.be, watch?v=, shorts or embed links all work).",
      validation: (rule) =>
        rule
          .required()
          .uri({ scheme: ["https", "http"] })
          .custom((value) =>
            !value || getYouTubeId(value)
              ? true
              : "This doesn't look like a YouTube video link.",
          ),
    }),
    defineField({
      name: "client",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "product", type: "string" }),
    defineField({
      name: "category",
      type: "string",
      options: { list: [...FILM_CATEGORIES], layout: "radio" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "year",
      type: "number",
      validation: (rule) => rule.integer().min(1990).max(2100),
    }),
    defineField({
      name: "role",
      title: "Roles",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: [...FILM_ROLES], layout: "grid" },
    }),
    defineField({
      name: "thumbnail",
      type: "image",
      description: "Optional. Leave empty to use the YouTube thumbnail.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for screen readers.",
        }),
      ],
    }),
    defineField({
      name: "description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.max(300),
    }),
    defineField({
      name: "featured",
      type: "boolean",
      description: "The first featured film is shown as the large card.",
      initialValue: false,
    }),
    defineField({
      name: "published",
      title: "Show on website",
      type: "boolean",
      description: "Turn off to hide this film without deleting it.",
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: "title",
      client: "client",
      youtubeUrl: "youtubeUrl",
      thumbnail: "thumbnail",
      published: "published",
    },
    prepare({ title, client, youtubeUrl, thumbnail, published }) {
      const id = typeof youtubeUrl === "string" ? getYouTubeId(youtubeUrl) : null;
      return {
        title,
        subtitle: [client, published === false ? "Hidden" : null]
          .filter(Boolean)
          .join(" · "),
        media: id
          ? createElement("img", {
              src: youTubeThumbnail(id, "mqdefault"),
              alt: "",
              style: { width: "100%", height: "100%", objectFit: "cover" },
            })
          : thumbnail,
      };
    },
  },
});
