const path = require('path');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { version, author, name, homepage, license } = require('./package.json');

module.exports = {
   entry: './script/RbGestureEvent.mjs',
   mode: 'production',
   output: {
      filename: 'RbGestureEvent.min.js',
      path: path.resolve(__dirname, 'dist'),
      // module: true,
   },
   // experiments: {
   //    outputModule: true,
   // },
   optimization: {
      minimize: true, // 启用代码压缩
      minimizer: [
         new TerserPlugin({
            terserOptions: {
               format: {
                  comments: /@preserve|@license|@cc_on|!/,
               },
            },
            extractComments: false, // 不将注释提取到单独的文件中
         }),
         new webpack.BannerPlugin({
            entryOnly: true, // 是否仅在入口包中输出 banner 信息
            banner: () => {
               return `/*!\n`
                  + `* ${name} ${version}` + '\n'
                  + `* ©${new Date().getFullYear()} ${author}` + '\n'
                  + `* Released under the ${license} license` + '\n'
                  + (homepage ? `* ${homepage}` + '\n' : '')
                  + `*/`;
            },
            raw: true,
         }),
      ],
   },
};