<a name="v0.8.7"></a>
### v0.8.7 (2014-01-16)


#### Bug Fixes

* **historyImage:** fix for new file system ([d9e35f79](https://github.com/IvanRave/wfm/commit/d9e35f7960a98a036aa73d434d3f986c48c49394))
* **wellHistoryFile:** fix for new file system ([15831b6f](https://github.com/IvanRave/wfm/commit/15831b6f31af5fac179faa4877e02fae87842eba))
* **wellLog:**
  * img figures model and service ([9d62985c](https://github.com/IvanRave/wfm/commit/9d62985c30bfd48b1c41cfe0c098853d722b1973))
  * separate logs from files ([985f56c1](https://github.com/IvanRave/wfm/commit/985f56c12ea86c530bddc0c99dce1b28c4efa37d))

<a name="v0.8.3"></a>
### v0.8.3 (2013-12-17)


#### Bug Fixes

* **wellSketch:**
  * change file, remove sketch ([0d50782a](https://github.com/IvanRave/wfm/commit/0d50782a197f8696cd5afde51729cfd9e2d31576))
  * create sketch from file ([40d6ab0d](https://github.com/IvanRave/wfm/commit/40d6ab0d0aa97fab68b93a4465612b0fd9bce825))
  * fix for new file manager ([ed49d255](https://github.com/IvanRave/wfm/commit/ed49d25572ab79cb84ea902382e918f0ff0149fb))


#### Features

* **sections:** for companies, regions, groups ([da16db53](https://github.com/IvanRave/wfm/commit/da16db53b9d187597a6ff800af8cf6122ddd778f))

<a name="v0.8.2"></a>
### v0.8.2 (2013-12-13)


#### Bug Fixes

* **fieldMap:**
  * load map tiles using map id ([2f5a6d30](https://github.com/IvanRave/wfm/commit/2f5a6d30c6aea097997cf8609c75c17c3a96743d))
  * create map from selected file ([25447a5c](https://github.com/IvanRave/wfm/commit/25447a5c6de900b3652c84d11e801f6bef5acb6b))
* **fileManager:** set scroll for file list ([d9e11813](https://github.com/IvanRave/wfm/commit/d9e11813d329bee3ba05935e0ba843506f67abc0))


#### Features

* **fileManager:**
  * add callback to submit button ([14bd148e](https://github.com/IvanRave/wfm/commit/14bd148e7af4a8fbae775e650404f40210d16876))
  * delete few files in one click ([e15c4cfb](https://github.com/IvanRave/wfm/commit/e15c4cfbff94dd48c9b7bd6caeec0d41f1a4aa5b))
  * add file type restrictions ([f9b506b8](https://github.com/IvanRave/wfm/commit/f9b506b8f90b44a410feb8fb23d07d762d4d2b40))
  * add view, load file list ([f1bd278c](https://github.com/IvanRave/wfm/commit/f1bd278c987dbad586fcac20bec072521e74e78f))
  * structurize, add data services ([a0ce8022](https://github.com/IvanRave/wfm/commit/a0ce802298f24f3fc6cfc3d3e9bbdda4b3fb9eb5))
* **sections:** add base model for sections ([7dbd49fa](https://github.com/IvanRave/wfm/commit/7dbd49fa6b85b32c2353666ccabc6366466fe3b4))

<a name="v0.8.1"></a>
### v0.8.1 (2013-12-10)


#### Features

* **company:** move to workspace menu ([6cd1d9bf](https://github.com/IvanRave/wfm/commit/6cd1d9bfa134f928d54576f7c1578fef6278651f))

<a name="v0.8.0"></a>
## v0.8.0 (2013-12-09)


#### Bug Fixes

* **fieldMap:**
  * fix map upload button ([64403f51](https://github.com/IvanRave/wfm/commit/64403f519e30e722e4b27e00707f00c870417f1a))
  * get name from file ([db28d79b](https://github.com/IvanRave/wfm/commit/db28d79bac486b6896c7dfc769a0f5b1cf44980e))
* **fieldMaps:** fix for new file-section struct ([23f64028](https://github.com/IvanRave/wfm/commit/23f6402845d654623951c8c5f760a66000ac3f13))
* **wfmStages:** clear selection when delete ([1b232d3b](https://github.com/IvanRave/wfm/commit/1b232d3b423de0df6d8e9185c0b962b074d7bb58))


#### Features

* **companyFile:** add file model, link with maps ([d69dbd55](https://github.com/IvanRave/wfm/commit/d69dbd553e76f9dd2bb0eac16e536e6214941d82))
* **fieldSection:** add view with selection ([9ee5fc9f](https://github.com/IvanRave/wfm/commit/9ee5fc9f0e7d4b1b00bb3041ec8b6f0f1bf96c15))
* **fieldSections:**
  * add empty templates ([3910d403](https://github.com/IvanRave/wfm/commit/3910d4037466205aa4558a19f7fbc77be70db0db))
  * add model and properties ([ed10c263](https://github.com/IvanRave/wfm/commit/ed10c263346a807614244eeaeb0cefc6bc4e77a0))
* **menu:** highlight selected item of menu ([7357b2cc](https://github.com/IvanRave/wfm/commit/7357b2cc392fa3e58629b9204ac3b8ccee7c0712))
* **sectionPattern:** add model, load to fields ([17ecbdcb](https://github.com/IvanRave/wfm/commit/17ecbdcb9df778dcd2d7b1524f15b41ee3ce7caa))
* **well:** load sections from server ([e238c42a](https://github.com/IvanRave/wfm/commit/e238c42a362b7ca129bd090a4eb320b1948be6f8))

<a name="v0.7.4"></a>
### v0.7.4 (2013-12-03)


#### Bug Fixes

* **wellSummary:** fix datepicker for mobile ([f48b7af7](https://github.com/IvanRave/wfm/commit/f48b7af703f012e59e66205d0455dda29ed3b41e))
* **wellTest:** add test scope without modal ([72cb0baf](https://github.com/IvanRave/wfm/commit/72cb0bafd70195de55d298496d27bfe340f4351b))

<a name="v0.7.3"></a>
### v0.7.3 (2013-11-29)


#### Bug Fixes

* **images:** open many images with panzoom ([8a2994a9](https://github.com/IvanRave/wfm/commit/8a2994a92654903e286bc5cb52b241e9969dc7f8))


#### Features

* **images:** add zoom controls to modal window ([575f3cc8](https://github.com/IvanRave/wfm/commit/575f3cc87869d33a073ccb00e195e433e0100481))
* **modal:** add close button to panzoom modal ([2d8fe479](https://github.com/IvanRave/wfm/commit/2d8fe479914627edaa070461991f7e57ae1da372))

<a name="v0.7.2"></a>
### v0.7.2 (2013-11-29)


#### Features

* **image:** pan, zoom for images ([367ae8b4](https://github.com/IvanRave/wfm/commit/367ae8b4a4f978a25d43fd743f4715eb95104d0f))



