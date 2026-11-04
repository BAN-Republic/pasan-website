import { defineArrayMember, defineField, defineType } from "sanity";

function imageWithAlt(name: string, title: string, group: string) {
  return defineField({
    name,
    title,
    type: "image",
    group,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alt text",
        type: "string",
        description: "Describe the image for screen readers.",
      }),
    ],
  });
}

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  groups: [
    { name: "profile", title: "Profile", default: true },
    { name: "about", title: "About" },
    { name: "contact", title: "Contact" },
    { name: "images", title: "Images" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "profile",
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "tagline", type: "string", group: "profile" }),
    defineField({
      name: "roles",
      type: "array",
      group: "profile",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "showreelYoutubeUrl",
      title: "Showreel YouTube link",
      type: "url",
      group: "profile",
      validation: (rule) => rule.uri({ scheme: ["https", "http"] }),
    }),
    defineField({ name: "quote", type: "text", rows: 2, group: "about" }),
    defineField({
      name: "bioParagraphs",
      title: "Bio paragraphs",
      type: "array",
      group: "about",
      of: [defineArrayMember({ type: "text", rows: 4 })],
    }),
    defineField({
      name: "awards",
      type: "array",
      group: "about",
      of: [
        defineArrayMember({
          type: "object",
          name: "award",
          fields: [
            defineField({
              name: "title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({ name: "detail", type: "string" }),
          ],
        }),
      ],
    }),
    defineField({
      name: "stats",
      type: "array",
      group: "about",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({
              name: "value",
              type: "number",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "suffix",
              type: "string",
              description: 'For example "+".',
            }),
            defineField({
              name: "label",
              type: "string",
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { value: "value", suffix: "suffix", label: "label" },
            prepare({ value, suffix, label }) {
              return { title: `${value ?? ""}${suffix ?? ""}`, subtitle: label };
            },
          },
        }),
      ],
    }),
    defineField({
      name: "clients",
      type: "array",
      group: "about",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "email",
      type: "string",
      group: "contact",
      validation: (rule) => rule.email(),
    }),
    defineField({ name: "location", type: "string", group: "contact" }),
    defineField({ name: "availability", type: "string", group: "contact" }),
    defineField({
      name: "socials",
      type: "object",
      group: "contact",
      fields: ["youtube", "facebook", "instagram", "vimeo", "linkedin"].map((name) =>
        defineField({
          name,
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["https"] }),
        }),
      ),
    }),
    imageWithAlt("heroImage", "Hero image", "images"),
    imageWithAlt("portraitImage", "Portrait image", "images"),
    imageWithAlt("gradeLabImage", "Grade lab image", "images"),
    imageWithAlt("contactImage", "Contact image", "images"),
  ],
  preview: {
    prepare() {
      return { title: "Site settings" };
    },
  },
});
