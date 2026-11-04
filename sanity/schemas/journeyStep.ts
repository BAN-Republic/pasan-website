import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { defineField, defineType } from "sanity";
import { JOURNEY_STATUSES } from "@/lib/types";

export const journeyStep = defineType({
  name: "journeyStep",
  title: "Journey step",
  type: "document",
  orderings: [orderRankOrdering],
  fields: [
    orderRankField({ type: "journeyStep" }),
    defineField({
      name: "period",
      type: "string",
      description: 'For example "2012 – 21" or "2025 –".',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "organisation", type: "string" }),
    defineField({ name: "description", type: "text", rows: 3 }),
    defineField({
      name: "status",
      type: "string",
      description: "Present shows a red REC dot; upcoming uses outline text.",
      options: {
        list: JOURNEY_STATUSES.map((value) => ({
          value,
          title: value[0].toUpperCase() + value.slice(1),
        })),
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "past",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: "title", period: "period", organisation: "organisation" },
    prepare({ title, period, organisation }) {
      return {
        title,
        subtitle: [period, organisation].filter(Boolean).join(" · "),
      };
    },
  },
});
