import { Config } from 'poi'

const config: Config = {
  entry: 'src/index.tsx',
  plugins: [
    {
      resolve: '@poi/plugin-typescript',
      options: {},
    },
    {
      resolve: '@poi/plugin-astroturf',
      options: {
        loaderOptions: {
          extension: '.scss',
        },
      },
    },
  ],
}

export default config
