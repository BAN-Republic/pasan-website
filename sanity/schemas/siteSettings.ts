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
    defineField({
      name: "showreelReleaseDate",
      title: "Showreel release date",
      type: "date",
      group: "profile",
      description: "When the showreel was published on YouTube. Optional; helps search engines show the video.",
    }),
    defineField({
      name: "marqueeWords",
      title: "Marquee words",
      type: "array",
      group: "profile",
      description: "The scrolling strip under the hero.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
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
      name: "craftTags",
      title: "Craft tags",
      type: "array",
      group: "about",
      description: "Small tags under the bio.",
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "journeyIntro",
      title: "Journey intro",
      type: "text",
      rows: 3,
      group: "about",
      description: "The paragraph beside the Journey heading.",
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
            defineField({
              name: "detail",
              type: "array",
              description: "One line. Select a film title and press Ctrl/Cmd+I to set it in italics.",
              // Plain text with italics only: no headings, lists or links.
              of: [
                defineArrayMember({
                  type: "block",
                  styles: [{ title: "Normal", value: "normal" }],
                  lists: [],
                  marks: { decorators: [{ title: "Italic", value: "em" }], annotations: [] },
                }),
              ],
              validation: (rule) => rule.max(1),
            }),
          ],
          preview: {
            select: { title: "title", detail: "detail" },
            prepare({ title, detail }) {
              const block = Array.isArray(detail) ? detail[0] : null;
              const text = Array.isArray(block?.children)
                ? block.children.map((child: { text?: string }) => child.text ?? "").join("")
                : "";
              return { title, subtitle: text };
            },
          },
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
    defineField({
      name: "phone",
      type: "string",
      group: "contact",
      description: "Shown on the site as a tap-to-call link. Use the international format, e.g. +94 77 123 4567.",
      validation: (rule) =>
        rule.regex(/^\+?[0-9 ()-]{7,20}$/, { name: "phone number" }).warning(),
    }),
    defineField({ name: "location", type: "string", group: "contact" }),
    defineField({ name: "availability", type: "string", group: "contact" }),
    defineField({
      name: "footerLine",
      title: "Footer line",
      type: "string",
      group: "contact",
      description: "Shown in the footer before the copyright.",
    }),
    defineField({
      name: "socials",
      type: "object",
      group: "contact",
      fields: ["youtube", "facebook", "instagram", "tiktok", "vimeo", "linkedin"].map((name) =>
        defineField({
          name,
          type: "url",
          validation: (rule) => rule.uri({ scheme: ["https"] }),
        }),
      ),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      group: "images",
      description: "Full logo on a transparent background (PNG). Shown in the intro and the footer.",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "string",
          description: "Usually the words in the logo.",
        }),
      ],
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
