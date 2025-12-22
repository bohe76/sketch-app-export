import { defineField, defineType } from 'sanity'

export default defineType({
    name: 'user',
    title: 'User',
    type: 'document',
    fields: [
        defineField({
            name: 'uid',
            title: 'Firebase UID',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'nickname',
            title: 'Nickname',
            type: 'string',
        }),
        defineField({
            name: 'avatar',
            title: 'Avatar',
            type: 'image',
            options: {
                hotspot: true,
            },
        }),
    ],
})
