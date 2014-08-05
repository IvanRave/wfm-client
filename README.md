# Well file manager client (WFM client)

WFM description: https://github.com/IvanRave/wfm

* [Write notes] (#write-notes)
* [Separate client development] (#separate-client-development)
* [Build notes] (#build-notes)
* [Publish notes] (#publish-notes)

## Write notes

### Guidelines
* [Angular commit guidelines] (https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format)
* [Javascript style guide] (http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)

### Localization

* Generate any language using assemble.io engine
* Add json object with required language to wfm-dict helper
* Change settings in Gruntfile.js

### TODO tasks

* JS: @todo fix: some method #23!
* HTML: <!-- TODO: feat: to do something good #12! -->
In accordance with 
* JSDoc documentation (@todo tag)
* Google styleguide (TODO comment)
* AngularJS commit style (fix, feat, chore, refactor...) (without target object)

#### Priority

* A format: #NN!
* The first number: a level of importance (1 - very high important, 5 - non-important)
* The second number: a level of difficulty (1 - very low difficulty, 5 - very high difficulty)
Use this development order: from light and imporant tasks #11! to difficult and non-important #55!
Use a search (in all files) to find a need priority (search by a regular expression)

### CORS support

* Do not use in production (IE9 doesn't support requests with json type and cookies)
* Only for development (in modern browsers) and other project types (IOS, desktop etc.)

## Separate client development

This is an example of a request to the WFM: http://jsfiddle.net/IvanRave/bkF48

Tools for building new independent features (only last versions of tools):
* pseudo classical pattern to organize JS code
* http://jquery.com/ for requests to the WFM API and other needs
* http://knockoutjs.com/ for two-way bindings, etc.
* http://getbootstrap.com/ for a markup
* CSS or SCSS for a style

* Use http://jsfiddle.net/ or your local server to send request to the WFM API
* If you need new API methods, firstly try to construct a test data as a simple JS object and use it for your purposes.

* After realization of your feauture we will integrate it to the main source

## Build notes

### Website build types

#### Development (dev folder)
* ```grunt```

#### Production (dst folder)
* ```grunt --prod```

### Other build types:

#### IPad (IOS)
* ```grunt --ipad```

#### Metro (Windows)
* ```grunt --metro```
Metro application can not use links to directories. Please use full url path (with index.html)

## Publish notes

### Source files (master branch)

After all commits:

* Define version level: PATCH, MINOR, MAJOR using [semantic versioning](http://semver.org/)
* Bump a version: ```grunt bump[:minor, :major]```
* Generate change log for changes since previous version: ```grunt changelog```
* Commit all changed files
* Create tag for new version: ```git tag -a vX.Y.Z -m "Version vZ.Y.Z"```
* Push tag: ```git push origin vZ.Y.Z```

### Distributive (gh-pages branch)
* Create distributive: ```grunt --prod```
* Publish a site (push to gh-pages branch): ```grunt gh-pages```