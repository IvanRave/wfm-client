# Well file manager (WFM)

## WFM services
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

## WFM helpers
* __WFM fonts__ https://github.com/IvanRave/wfm-fonts/
contains section icons for all WFM services
* __WFM dictionary__ https://github.com/IvanRave/wfm-dict/
contains words (with translation) for all WFM services

### WFM developer documentation
WFM client (mobile or web) - main WFM service.
WFM client is a secured cabinet to manage well's documentation (files, data).

#### Cabinet hierarchy
![CabinetHierarchy] (docs/cabinet.png "Cabinet hierarchy")
* Each company may include many users
* User may be in many companies
* Company may contain many regions
* Well regions divides by fields
* Well field divides by groups
* Well group divides by wells
* Each well contains sections and widgets (widgets for each section and more)

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

#### Widget hierarchy
##### Simple scheme
![WidgetStructure] (https://drive.google.com/uc?export=view&id=0B9c2LY35SH-cbWl3ak94c1pxYWM "Widget structure")
##### Data scheme
![WidgetStructure] (docs/widget.png "Widget structure")
* Well (well group, well field, well region) may contain widget layouts
* Widget layout may contain widget blocks (columns) - 1, 2, 3 or 4 different size columns
* Widget block may contain widgets
* Widget has options (depending of widget type)
