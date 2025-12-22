import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'artwork',
    title: 'Artwork',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: [{ type: 'user' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Final Image',
            type: 'image',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'options',
            title: 'Drawing Options',
            type: 'object',
            fields: [
                defineField({ name: 'style', type: 'string' }),
                defineField({ name: 'texture', type: 'string' }),
                defineField({ name: 'opacity', type: 'number' }),
                defineField({ name: 'thickness', type: 'number' }),
            ],
        }),
        defineField({
            name: 'likes',
            title: 'Likes',
            type: 'number',
            initialValue: 0,
        }),
    ],
    preview: {
        select: {
            title: 'title',
            author: 'author.nickname',
            media: 'image',
        },
        prepare(selection) {
            const { author } = selection
            return { ...selection, subtitle: author && `by ${author}` }
        },
    },
})
