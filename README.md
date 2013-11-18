## Well file manager (WFM)
### Developer documentation
>team development - best decision

[Site] (http://wfm-client.azurewebsites.net/)

[Source code] (https://github.com/IvanRave/wfm-client/)

![CabinetHierarchy] (https://raw.github.com/IvanRave/wfm/master/src/img/structure/cabinet.png "Cabinet hierarchy")
* Company may include many users
* User may be in many companies
* Company may contain many regions
* Regions divides by fields
* Field divides by groups
* Group divides by wells

![WidgetStructure] (https://raw.github.com/IvanRave/wfm/master/src/img/structure/widget.png "Widget structure")
* Well (well group, well field, well region) may contain widget layouts
* Widget layout may contain widget blocks (columns) - 1, 2, 3 or 4 different size columns
* Widget block may contain widgets
* Widget may be few types