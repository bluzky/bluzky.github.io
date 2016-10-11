# Front-end Skeleton

## 1. setup
- Install `node` and `npm`
- Install `bower`  
`npm install bower -g`
- Install `gulp`   
`npm install gulp -g`

Then run following commands
```
$ cd client
$ npm install
$ bower install
```

## 2. Build source
- Run `gulp dev` to build assets. By default, build directory is `assets/`
You can config source and destination and other paths in `client/package.json` file

- For `scss`, `css`, `js` and `vendor`, resource will be copy recursively, and keep the directory structure same as in source directory


## 3. Watch source for changes
- Run `gulp watch`


## 4. All configurations
- configuration is stored in file `client/package.json`
```javascript
{
  ...,
  "gulpConfig": {
    "sourceDir": "source/",
    "destinationDir": "../static/assets/",
    "sourcesPaths": {
      "css": "css/",
      "js": "js/",
      "scss": "scss/",
      "vendor": "vendor/",
      "fonts": "fonts/*",
      "image": "img/"
    },
    "destinationPaths": {
      "css": "css/",
      "js": "js/",
      "scss": "css/",
      "vendor": "vendor/",
      "fonts": "fonts/",
      "image": "img/"
    },
    "custom": {
      "bower_components/jquery/dist/jquery.min.js": "lib/js/",
      "bower_components/font-awesome/fonts/*": "lib/fonts/",
      "bower_components/font-awesome/css/font-awesome.min.css": "lib/css/"
    }
  }
}
```

- `custom` is custom mapping source file and destination build directory.  
`"sourceFile" : "outputDir"`   
`outputDir` is relative path in `destinationDir`   
`sourcesPaths` are relative paths  
`destinationPaths` are relative paths  

**Example:**  
`lib/js/' turn into '../assets/lib/js/`
