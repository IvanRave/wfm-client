# Well file manager (WFM)
## Developer documentation
>team development - best decision

### WFM services
* WFM client - protected cabinet: http://wfm-client.azurewebsites.net/
* WFM info - public site: http://wfm.azurewebsites.net/
* WFM mobile - created from WFM client using Phonegap

### WFM services dependencies
* WFM fonts: https://github.com/IvanRave/wfm-fonts/
contains section icons for all WFM services
* WFM dictionary: https://github.com/IvanRave/wfm-dict/
contains words (with translation) for all WFM services

### Cabinet hierarchy
![CabinetHierarchy] (https://raw.github.com/IvanRave/wfm/master/src/img/structure/cabinet.png "Cabinet hierarchy")
* Company may include many users
* User may be in many companies
* Company may contain many regions
* Regions divides by fields
* Field divides by groups
* Group divides by wells

### Widget hierarchy
![WidgetStructure] (https://raw.github.com/IvanRave/wfm/master/src/img/structure/widget.png "Widget structure")
* Well (well group, well field, well region) may contain widget layouts
* Widget layout may contain widget blocks (columns) - 1, 2, 3 or 4 different size columns
* Widget block may contain widgets
* Widget may be few types
