# quill-markup

> A markup highlighting module for the [Quill](https://quilljs.com/) text editor

[![Build Status](https://travis-ci.org/jmquigley/quill-markup.svg?branch=master)](https://travis-ci.org/jmquigley/quill-markup)
[![tslint code style](https://img.shields.io/badge/code_style-TSlint-5ed9c7.svg)](https://palantir.github.io/tslint/)
[![Test Runner](https://img.shields.io/badge/testing-ava-blue.svg)](https://github.com/avajs/ava)
[![NPM](https://img.shields.io/npm/v/quill-markup.svg)](https://www.npmjs.com/package/quill-markup)
[![Coverage Status](https://coveralls.io/repos/github/jmquigley/quill-markup/badge.svg?branch=master)](https://coveralls.io/github/jmquigley/quill-markup?branch=master)

*THIS IS A WORK IN PROGRESS AND SHOULD NOT BE USED*

## Installation

This module uses [yarn](https://yarnpkg.com/en/) to manage dependencies and run scripts for development.

To install as an application dependency:
```
$ yarn add --dev quill-markup
```

To build the app and run all tests:
```
$ yarn run all
```

To start a web server and view a demo of this module use:
```
$ yarn start
```
This will start a local express web server @ http://localhost:4000

If developing the module use the webpack watcher to automatically build changes with:

```
$ yarn start watch
```
This will detect changes and rebuild the bundle for testing with (with the web server above)


## Overview
This module turns the Quill WYSIWYG editor into a a fixed text markup editor (for modes like markdown, restructured text, etc).  It takes advantage of the underlying api for styling and undo/redo.

## Usage
TODO: Add usage documentation

## API

#### attributes

#### methods


Note that some of the testing is limited due to use of JSDOM.  This library, and Quill, rely on `getSelection` to deterime positions within the editor.  This function is not available in JSDOM and is a helper stub in this module (see `./test/helpers/getSelection.js`).  Right now I don't see a way to move around within the an instantiated editor within this DOM (to test things like inserting new characters randomly and testing undo/redo).  If any ever uses this and has suggestions on how to overcome this it would be most welcome.
