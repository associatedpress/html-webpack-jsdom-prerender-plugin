export default {
  oneOf: [
    // {
    //   'index.html': {
    //     'chunks': ['chunk1', 'chunk2', ...],
    //   },
    // } ...
    {
      type: 'object',
      propertyNames: {
        pattern: '\.html$', // eslint-disable-line no-useless-escape
      },
      patternProperties: {
        '.*': {
          type: 'object',
          properties: {
            chunks: {
              type: 'array',
              description: 'Array of chunks to prerender in the page',
            },
          },
          required: ['chunks'],
        },
      },
      minProperties: 1,
    },
  ],
}
