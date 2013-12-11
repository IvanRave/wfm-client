# Well file manager client (WFM client)

* [Environment] (#environment)
* [Cabinet structure] (#cabinet-structure)
* [Write notes] (#write-notes)
* [Build notes] (#build-notes)
* [Publish notes] (#publish-notes)

## Environment

![WFMServicesStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cYk9POHE3UTM2Vjg "WFM services structure")

### WFM services
* __WFM client__ http://wfm-client.azurewebsites.net/
protected cabinet: manage companies, wells etc.
* __WFM info__ http://wfm.azurewebsites.net/
public site with info about WFM: pricing, docs, contacts etc.
* __WFM admin__ http://wfm-admin.azurewebsites.net/ protected service for database administration
(will be moved to Intranet access to protect requests)
* __WFM mobile client__ https://build.phonegap.com/apps/628274/ 
mobile application created from WFM client using Phonegap
* __WFM API__ http://wfm-client.azurewebsites.net/api/
methods to manage WFM data. Methods are secured and required authorization. 
After getting auth token (after registration ang authentication) you can make requests to API

### WFM data storage
* Authentication data: relational database to store user profiles
* Structured data: relational database to store structured WFM data, e.g. companies, well regions, groups, fields, wells
* Unstructured data: non-relational storage to store dynamic data, e.g. well perfomance properties, units and data
* File storage: secured blob storage to store WFM files

### WFM helpers
* __WFM fonts__ https://github.com/IvanRave/wfm-fonts/
contains section icons for all WFM services
* __WFM dictionary__ https://github.com/IvanRave/wfm-dict/
contains words (with translation) for all WFM services

## Cabinet structure
### Hierarchy
![CabinetHierarchy] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cZEh5aWtNWHpQUVE "Cabinet hierarchy")
* Each company may include many users
* User may be in many companies
* Company may contain many regions
* Well regions divides by fields
* Well field divides by groups
* Well group divides by wells
* Each stage (company, region, field, group, well) contains sections and widgets (widgets per section and more).

### Sections

Section - it is a part of page view (or part of file manager like a folder).

* Id
* ListOfFiles {Array.<File>} - Files from file table
* IdOfSectionPattern

Name, color, icon, visibility, and other properties of section defined in patterns on admin level.
If needed, properties can be moved from pattern to the section level: for example every section can have own name.

### Section patterns

* IdOfPattern
* Name {string}
* IconUrl {string} - Icon url
* IsVisibleOnPage {boolean} - Is visible on a page. Some sections can be showed only like folders in file manager: do not show on a page.
* IsVisibleAsFolder {boolean} - Is visible in a file manager (as a folder). Some sections (like summary) can't include files: do not show as a folders
* FileFormatRegularExpression {string} - Regular expression for available file formats

#### Well sections

* Summary (main well parameters)
* Sketch and volumes
* History
* Map
* Log
* Perfomance
* Test
* Integrity
* Nodal analysis
* Report

### Widget hierarchy
#### Simple scheme
![WidgetStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cbWl3ak94c1pxYWM "Widget structure")
### Data scheme
![WidgetStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cY0V3T3pEVWZjanc "Widget structure")
* Well (well group, well field, well region) may contain widget layouts
* Widget layout may contain widget blocks (columns) - 1, 2, 3 or 4 different size columns
* Widget block may contain widgets
* Widget has options (depending of widget type)

### Well test - Измерение показателей скважины
* Сперва пользователь определяет необходимые параметры для замера.
Все возможные параметры можно получить с помощью GET запроса соотвествующего API
Данные параметры может редактировать только админ (модератор) сайта.
Если пользователь хочет добавить свой какой-либо параметр, ему необходимо связаться с админом (модератором) сайта
(пока не утвердились со всей структурой, лучше это делать просто по имэйлу)
* Выбранные параметры необходимо закрепить за скважиной (Well), точнее за группой (WellGroup):
для каждой WellGroup свой набор параметров, по которым проводятся тесты всех скважин данной группы.
Для связи WellGroup и WfmParameter можно возпользоваться API "WellGroupWfmParameter" (GET - получить, POST - добавить)
* Начало теста. Фактически замер начинается в любое время, принимаемое за начало отсчёта (нулевой час).
Со скважины снимаются показатели (соответствующие выбранным параметрам). Каждый новый час - получение новых показателей.
Тест длится обычно двенадцать часов или сутки. Для разделения понятий введены два обозначения:
<ul>
    <li>TestScope - полный тест, набор ежечасных показателей</li>
    <li>TestData - единица теста - данные за определённый час</li>
</ul>
* Cперва добавляется TestScope, получается созданный TestScope.Id и с этим идентификатором добавляются по очереди TestData
(по возрастанию номера часа: 0, 1, 2.. - лимит технически не задан, но подразумевается либо до 12, либо до 24).
В TestData в параметре Dict содержится набор значений: {WfmParameter.Id: соответствующее значение замера}.

### Constants
#### File purposes (array)
    [{ id: 'summary', name: 'Summary', formatList: ['*'] }, // any file type (main well files)
    { id: 'sketch', name: 'Sketch', formatList: ['image/jpeg', 'image/png'] },
    { id: 'volume', name: 'Volume', formatList: ['image/jpeg', 'image/png'] },
    { id: 'history', name: 'History', formatList: ['*'] }, // any file type
    { id: 'map', name: 'Map', formatList: [] }, // file loading forbidden
    { id: 'log', name: 'Log', formatList: [''] }, // las files has empty mime type
    { id: 'pd', name: 'Perfomance', formatList: ['text/plain', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'] },
    { id: 'test', name: 'Test', formatList: [] }, // file loading forbidden
    { id: 'integrity', name: 'Integrity', formatList: ['image/jpeg', 'image/png', 'application/pdf'] },
    { id: 'nodalanalysis', name: 'Nodal analysis', formatList: ['image/jpeg', 'image/png'] },
    { id: 'report', name: 'Report', formatList: ['application/pdf'] }]

#### File statuses (array)
    ['work', 'archive']

#### Access levels for company user (JSON object)
    {
    "CanManageAll":{"AccessCode":1,"Description":"Can manage"},
    "CanEditAll":{"AccessCode":2,"Description":"Can edit"},
    "CanViewAll":{"AccessCode":4,"Description":"Can view"}
    }
every user has a property "AccessLevel" (which equals SUM of AccessCode from the Enumerator above).
For example: if user "Can view" and "Can edit" then AccessLevel = (4 + 2 = 6).
To check "Whether the user has access to edit (or manage, or view..)?", you may use "bitwise AND":
```return (user.AccessLevel & needAccessLevel) > 0```

## Write notes

### Guidelines
* [Angular commit guidelines] (https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit-message-format)
* [Javascript style guide] (http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml)

### Localization

* Generate any language using assemble.io engine
* Add json object with required language to wfm-dict helper
* Change settings in Gruntfile.js

### CORS support

* Do not use in production (IE9 doesn't support requests with json type and cookies)
* Only for development (in modern browsers) and other project types (IOS, desktop etc.)

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
* Push to gh-pages branch: ```grunt gh-pages```
