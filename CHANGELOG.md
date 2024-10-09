# Changelog

## [1.2.4](https://github.com/gravity-ui/table/compare/v1.2.3...v1.2.4) (2024-10-09)


### Bug Fixes

* **BaseTable:** fix virtual rows positioning when reordering or sorting rows ([#71](https://github.com/gravity-ui/table/issues/71)) ([ab0f936](https://github.com/gravity-ui/table/commit/ab0f936025d75802ee768a5a562f25a62e392e63))
* **TableSettings:** popover actions background in dark theme ([#68](https://github.com/gravity-ui/table/issues/68)) ([7b95f62](https://github.com/gravity-ui/table/commit/7b95f62eea7c780085373c20c130600bce354f32))

## [1.2.3](https://github.com/gravity-ui/table/compare/v1.2.2...v1.2.3) (2024-10-04)


### Bug Fixes

* **BaseTable:** pass getIsCustomRow, groupHeaderClassName and renderCustomRowContent into BaseRow ([#66](https://github.com/gravity-ui/table/issues/66)) ([28bf6d2](https://github.com/gravity-ui/table/commit/28bf6d28d0e65980ed4a645b9fea2301d5b0baec))
* **BaseTable:** take offset into account when virtualizing ([#65](https://github.com/gravity-ui/table/issues/65)) ([af52206](https://github.com/gravity-ui/table/commit/af522063b975428079d61e4a2fa1f260f49ddabd))

## [1.2.2](https://github.com/gravity-ui/table/compare/v1.2.1...v1.2.2) (2024-10-02)


### Bug Fixes

* **TableSettings:** group ordering state initializing ([#63](https://github.com/gravity-ui/table/issues/63)) ([e9a6ec1](https://github.com/gravity-ui/table/commit/e9a6ec12e0df86169270c2087b19eded8e0fcb51))

## [1.2.1](https://github.com/gravity-ui/table/compare/v1.2.0...v1.2.1) (2024-09-30)


### Bug Fixes

* **Table:** fix settings column size ([#59](https://github.com/gravity-ui/table/issues/59)) ([8d506a9](https://github.com/gravity-ui/table/commit/8d506a9f7f7dfe124906b9548bdfbe9ed3d08d08))

## [1.2.0](https://github.com/gravity-ui/table/compare/v1.1.0...v1.2.0) (2024-09-26)


### Features

* **Table:** table settings component added ([#51](https://github.com/gravity-ui/table/issues/51)) ([8936fe1](https://github.com/gravity-ui/table/commit/8936fe1036379967264651984d814403c349b706))

## [1.1.0](https://github.com/gravity-ui/table/compare/v1.0.0...v1.1.0) (2024-09-25)


### Features

* **Table:** styled SortIndicator added ([#49](https://github.com/gravity-ui/table/issues/49)) ([d4e7d82](https://github.com/gravity-ui/table/commit/d4e7d823f102c9e77e8520b502495a80a1db37c0))
* **Table:** styled SortIndicator export added ([#53](https://github.com/gravity-ui/table/issues/53)) ([39b5709](https://github.com/gravity-ui/table/commit/39b5709b19263cbe3af17a98072abb5ea201cd4d))
* **Table:** table size supported ([#50](https://github.com/gravity-ui/table/issues/50)) ([50e7778](https://github.com/gravity-ui/table/commit/50e7778ce7be93360ba9cff69651844f6f0308f6))


### Bug Fixes

* **BaseHeaderCell:** sorting on resize fixed ([#55](https://github.com/gravity-ui/table/issues/55)) ([716a45b](https://github.com/gravity-ui/table/commit/716a45bf52c80175d77fcbc16bbdc29a1b93a086))

## [1.0.0](https://github.com/gravity-ui/table/compare/v0.9.0...v1.0.0) (2024-09-12)


### chore

* release 1.0.0 ([39e558b](https://github.com/gravity-ui/table/commit/39e558b4db4631a149d8a9c84726800aa42fd096))

## [0.9.0](https://github.com/gravity-ui/table/compare/v0.8.1...v0.9.0) (2024-09-12)


### Features

* **BaseTable:** improve base table styles ([#45](https://github.com/gravity-ui/table/issues/45)) ([f43d9ce](https://github.com/gravity-ui/table/commit/f43d9ce21a6469973c840880004f171802b8414a))
* **Table:** drag column added ([#43](https://github.com/gravity-ui/table/issues/43)) ([2c47d99](https://github.com/gravity-ui/table/commit/2c47d99691746c1cc117e4a8d8d789709d34c2dc))
* **Table:** selection column added ([#41](https://github.com/gravity-ui/table/issues/41)) ([951b48c](https://github.com/gravity-ui/table/commit/951b48cc478d7cf4c9a699957c868a435e17ad45))


### Bug Fixes

* **BaseTable:** calc aria-rowindex fixed ([#47](https://github.com/gravity-ui/table/issues/47)) ([5216d52](https://github.com/gravity-ui/table/commit/5216d52dbc0cf2697f046e2fe9bf61cac9923a7d))

## [0.8.1](https://github.com/gravity-ui/table/compare/v0.8.0...v0.8.1) (2024-09-11)


### Bug Fixes

* **BaseTable:** do not pass table prop as row html attribute, move some inline styles to css ([#39](https://github.com/gravity-ui/table/issues/39)) ([634a28e](https://github.com/gravity-ui/table/commit/634a28ed0c38683fde25feb13fba4da8080f58dd))

## [0.8.0](https://github.com/gravity-ui/table/compare/v0.7.1...v0.8.0) (2024-09-10)


### Features

* **BaseTable:** additional properties for classNames and attributes customization ([#36](https://github.com/gravity-ui/table/issues/36)) ([33db774](https://github.com/gravity-ui/table/commit/33db774a4d25b5901dfa0136d8d56d09d5089a9a))
* **BaseTable:** remove withTableReorder hoc ([#38](https://github.com/gravity-ui/table/issues/38)) ([b672d8d](https://github.com/gravity-ui/table/commit/b672d8d77d9fafccc59a6e8b52b8653d4ddf6ddf))

## [0.7.1](https://github.com/gravity-ui/table/compare/v0.7.0...v0.7.1) (2024-09-09)


### Bug Fixes

* **BaseTable:** do not import dnd-kit if reordering is not used ([#34](https://github.com/gravity-ui/table/issues/34)) ([31ef94d](https://github.com/gravity-ui/table/commit/31ef94d52f47cdd369f5391a103bb2d15d584b50))

## [0.7.0](https://github.com/gravity-ui/table/compare/v0.6.0...v0.7.0) (2024-09-06)


### Features

* **BaseTable:** aria-(multiselectable,selected) support added ([#33](https://github.com/gravity-ui/table/issues/33)) ([fa5c464](https://github.com/gravity-ui/table/commit/fa5c464c08fa32009832107473aa9194436f36e3))
* **BaseTable:** custom empty content support added ([#31](https://github.com/gravity-ui/table/issues/31)) ([b92ee11](https://github.com/gravity-ui/table/commit/b92ee11a5481e2cc9ffe8d1dc95ad965719b82ea))
* rename table components to Base* prefix ([#29](https://github.com/gravity-ui/table/issues/29)) ([aab6643](https://github.com/gravity-ui/table/commit/aab6643467bbaa55a7b463bd548851ab49470b75))
* **Table:** base border/font design ([#32](https://github.com/gravity-ui/table/issues/32)) ([ec55971](https://github.com/gravity-ui/table/commit/ec559716b2b32637457ef2fcfbf20f147fef416a))

## [0.6.0](https://github.com/gravity-ui/table/compare/v0.5.0...v0.6.0) (2024-08-16)


### Features

* **Table:** aria-(colcount,colindex,rowcount,rowindex) support added ([#24](https://github.com/gravity-ui/table/issues/24)) ([e07d74a](https://github.com/gravity-ui/table/commit/e07d74a837579183734cb6bd54d7341ae261c075))
* **Table:** aria-sort support added ([#26](https://github.com/gravity-ui/table/issues/26)) ([81987fe](https://github.com/gravity-ui/table/commit/81987fe5ba524e8af1d036f94c4898d083b244ad))
* **Table:** attributes customization ([#27](https://github.com/gravity-ui/table/issues/27)) ([018dd18](https://github.com/gravity-ui/table/commit/018dd188d06dbb7399660d814ee295d4ca0dcfe6))

## [0.5.0](https://github.com/gravity-ui/table/compare/v0.4.0...v0.5.0) (2024-07-29)


### Features

* **Table:** some classNames functions support added ([#23](https://github.com/gravity-ui/table/issues/23)) ([f23aa92](https://github.com/gravity-ui/table/commit/f23aa92943ffa279c18bd70e5380a892b4327f39))

## [0.4.0](https://github.com/gravity-ui/table/compare/v0.3.0...v0.4.0) (2024-07-24)


### Features

* **Table:** footer ([#22](https://github.com/gravity-ui/table/issues/22)) ([484954c](https://github.com/gravity-ui/table/commit/484954c5baa636b4eebb3ce7db9624fe3f397ec7))
* **Table:** get rid of gravity usage in the base table ([#17](https://github.com/gravity-ui/table/issues/17)) ([431d5de](https://github.com/gravity-ui/table/commit/431d5de9be8489afaaa75c21ddb2180a8d6dc913))
* **Table:** remove cell-content ([#15](https://github.com/gravity-ui/table/issues/15)) ([51a84c5](https://github.com/gravity-ui/table/commit/51a84c5b1bbcc3203e7998a2d6139d51b689ddfb))
* **Table:** rework render props ([#21](https://github.com/gravity-ui/table/issues/21)) ([3360374](https://github.com/gravity-ui/table/commit/3360374e7182863ca797cd641436eee62ee34111))
* **Table:** sticky header support added ([#18](https://github.com/gravity-ui/table/issues/18)) ([a87a5d9](https://github.com/gravity-ui/table/commit/a87a5d9efbb275a057334bb99372352f294f0e37))

## [0.3.0](https://github.com/gravity-ui/table/compare/v0.2.1...v0.3.0) (2024-07-15)


### Features

* **Table:** column pinning support enabled ([#11](https://github.com/gravity-ui/table/issues/11)) ([9146096](https://github.com/gravity-ui/table/commit/9146096db5f81e812af183c76db78c51c4a87f18))

## [0.2.1](https://github.com/gravity-ui/table/compare/v0.2.0...v0.2.1) (2024-07-15)


### Bug Fixes

* **Table:** missing prop rowVirtualizer for row measuring ([#12](https://github.com/gravity-ui/table/issues/12)) ([56290d5](https://github.com/gravity-ui/table/commit/56290d553bf52d01f6259d71c1e9063542b6ca2c))

## [0.2.0](https://github.com/gravity-ui/table/compare/v0.1.1...v0.2.0) (2024-07-11)


### Features

* **Table:** pass table and rowVirtualizer instances instead of options and hoc ([#9](https://github.com/gravity-ui/table/issues/9)) ([8b52702](https://github.com/gravity-ui/table/commit/8b527024430d7619ed83eb2a4a0ff1f4bfbba469))

## [0.1.1](https://github.com/gravity-ui/table/compare/v0.1.0...v0.1.1) (2024-07-01)


### Bug Fixes

* **Table:** fix drag when virtualization enabled ([#7](https://github.com/gravity-ui/table/issues/7)) ([cf86ba2](https://github.com/gravity-ui/table/commit/cf86ba26557f44d5978eaf60bc355301f38449a7))

## [0.1.0](https://github.com/gravity-ui/table/compare/v0.0.1...v0.1.0) (2024-07-01)


### Features

* **HeaderCell:** add header groupping possibility ([#5](https://github.com/gravity-ui/table/issues/5)) ([56466ff](https://github.com/gravity-ui/table/commit/56466ffaf3b8df8c5a922d7807518249a4a1a7b9))

## 0.0.1 (2024-05-21)


### chore

* release 0.0.1 ([857f1b1](https://github.com/gravity-ui/table/commit/857f1b1718d487223a3de35d86da0aa7cc87ea39))
