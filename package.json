{
  "name": "file-upload-with-preview",
  "version": "4.2.0",
  "description": "A simple file-upload utility that shows a preview of the uploaded image. Written in pure JavaScript. No dependencies. Works well with Bootstrap 4 or without a framework.",
  "author": "John Datserakis <johndatserakis@gmail.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/johndatserakis/file-upload-with-preview.git"
  },
  "bugs": {
    "url": "https://github.com/johndatserakis/file-upload-with-preview/issues"
  },
  "keywords": [
    "upload",
    "uploader",
    "preview",
    "image",
    "file",
    "bootstrap"
  ],
  "main": "dist/file-upload-with-preview.umd.js",
  "module": "dist/file-upload-with-preview.esm.js",
  "unpkg": "dist/file-upload-with-preview.min.js",
  "scripts": {
    "start": "cross-env NODE_ENV=development webpack-dev-server --open --hot --display-error-details",
    "build": "npm run test && npm run build:example && npm run build:library",
    "build:umd": "rollup --config build/rollup.config.js --format umd --file dist/file-upload-with-preview.umd.js",
    "build:es": "rollup --config build/rollup.config.js --format es --file dist/file-upload-with-preview.esm.js",
    "build:unpkg": "rollup --config build/rollup.config.js --format iife --file dist/file-upload-with-preview.min.js",
    "build:library": "rm -rf ./dist npm run build:unpkg & npm run build:es & npm run build:umd & npm run build:unpkg",
    "build:example": "rm -rf ./docs && cross-env NODE_ENV=production webpack --progress --hide-modules",
    "test": "jest"
  },
  "devDependencies": {
    "@babel/cli": "^7.11.6",
    "@babel/core": "^7.11.6",
    "@babel/plugin-transform-runtime": "^7.11.5",
    "@babel/preset-env": "^7.11.5",
    "@babel/runtime": "^7.11.2",
    "babel-jest": "^24.9.0",
    "babel-loader": "^8.1.0",
    "clean-webpack-plugin": "^1.0.0",
    "copy-webpack-plugin": "^4.6.0",
    "cross-env": "^5.2.1",
    "css-loader": "^0.28.11",
    "eslint": "^4.19.1",
    "eslint-config-airbnb-base": "^13.2.0",
    "eslint-loader": "^2.2.1",
    "eslint-plugin-import": "^2.22.1",
    "file-loader": "^1.1.11",
    "html-webpack-plugin": "^3.2.0",
    "jest": "^24.9.0",
    "mini-css-extract-plugin": "^0.4.1",
    "minimist": "^1.2.5",
    "node-sass": "^4.14.1",
    "optimize-css-assets-webpack-plugin": "^4.0.3",
    "rollup": "^1.32.1",
    "rollup-plugin-babel": "^4.4.0",
    "rollup-plugin-commonjs": "^9.3.4",
    "rollup-plugin-node-resolve": "^3.3.0",
    "rollup-plugin-scss": "^1.0.2",
    "rollup-plugin-terser": "^4.0.3",
    "sass-loader": "^7.3.1",
    "style-loader": "^0.21.0",
    "terser-webpack-plugin": "^1.4.5",
    "webpack": "^4.44.2",
    "webpack-cli": "^3.3.12",
    "webpack-dev-server": "^3.11.0"
  },
  "jest": {
    "moduleFileExtensions": [
      "js"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/example/$1"
    },
    "transform": {
      "^.+\\.js$": "<rootDir>/node_modules/babel-jest",
      "^.+\\.(scss|less|svg|png)$": "./test/styleMock.js"
    }
  }
}
