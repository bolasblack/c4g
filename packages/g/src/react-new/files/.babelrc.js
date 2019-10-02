const path = require('path')

module.exports = {
  plugins: [
    [
      // astroturf/css-loader not compatible with thread-loader, so we use babel plugin
      'astroturf/plugin',
      {
        tagName: 'css',
        extension: '.scss',
        writeFiles: true, // Writes css files to disk using the result of `getFileName`
        getFileName(hostFilePath, pluginsOptions) {
          const basepath = path.join(
            path.dirname(hostFilePath),
            path.basename(hostFilePath, path.extname(hostFilePath)),
          )
          const relativePath = path.relative(__dirname, basepath)
          return `.astroturf/extracted_styles/${relativePath}.scss`
        },
      },
    ],
  ],
}
