// module.exports = {
//   plugins: {
//     autoprefixer: {}
//   }
// }
module.exports = {
  plugins: [
    // ...
    require('tailwindcss')('./tailwind.js'),
    require('autoprefixer'),
    // require('orgchart'),
    // require('./src/assets/main.css'),
    // ...
  ]
}