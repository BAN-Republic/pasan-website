import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";

export const btsFrame = defineType({
  name: "btsFrame",
  title: "BTS frame",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "btsFrame" }),
    defineField({
      name: "image",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Describe the image for screen readers.",
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "caption", type: "string" }),
    defineField({
      name: "label",
      type: "string",
      description: 'Short tag on the frame, for example "Day 02".',
    }),
  ],
  preview: {
    select: { label: "label", caption: "caption", media: "image" },
    prepare({ label, caption, media }) {
      return { title: caption || label || "Untitled frame", subtitle: label, media };
    },
  },
});
