const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { version, author, name, homepage, license } = require('./package.json');

const banner = `/*!
* ${name} ${version}
* ©${new Date().getFullYear()} ${author}
* Released under the ${license} license
${homepage ? `* ${homepage}` : ''}
*/`;

// 创建配置工厂函数
const createConfig = (filename, libraryType, minimize = false) => ({
   mode: 'production',
   entry: './script/RbGestureEvent.mjs',
   experiments: {
      outputModule: true,
   },
   output: {
      filename,
      path: path.resolve(__dirname, 'dist'),
      library: {
         ...(libraryType === 'var' && { name: 'RbGestureEvent' }),
         type: libraryType,
      },
   },
   optimization: {
      minimize,
      minimizer: [
         new TerserPlugin({
            terserOptions: {
               format: {
                  comments: /@preserve|@license|@cc_on|!/,
               },
            },
            extractComments: false,
         }),
         new webpack.BannerPlugin({
            banner,
            raw: true,
         }),
      ],
   },
   plugins: [],
});

// 导出配置数组
module.exports = [
   createConfig('RbGestureEvent.js', 'var', false),
   createConfig('RbGestureEvent.min.js', 'var', true),
   createConfig('RbGestureEvent.esm.min.mjs', 'module', true),
];