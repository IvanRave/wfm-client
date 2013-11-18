# Well file manager (WFM)
## Developer documentation
>team development - best decision

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

### WFM helpers
* __WFM fonts__ https://github.com/IvanRave/wfm-fonts/
contains section icons for all WFM services
* __WFM dictionary__ https://github.com/IvanRave/wfm-dict/
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
