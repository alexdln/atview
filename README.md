# atview

## AST Block Compatibility

Compatibility below is based on block conversions implemented in `src` (`ast-to-data` and `data-to-ast` for `leaflet`, `pckt`, `offprint`, and `atview` providers).

Legend:
- `yes` = supported and mapped
- `partial` = supported with caveats or lossy mapping
- `no` = not supported

### paragraph

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `children` | yes | yes | partial | yes | partial | pckt keeps rich facets, but heading/other structured contexts can flatten; atview inline reconstruction is facet-driven and can be lossy with overlaps |

### heading

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `level` | `2..6` | yes | yes | partial | yes | offprint clamps to `2..4` when round-tripping |
| `children` | yes | yes | partial | yes | partial | pckt exports heading text only (no inline facets), atview imports heading children as plain text |

### blockquote

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `children` | yes | yes | partial | yes | partial | pckt/offprint/atview store as rich text spans but can flatten complex nesting on import |

### code-block

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | stable |
| `text` | yes | yes | yes | yes | yes | stable |
| `language` | optional | yes | yes | yes | yes | stable |

### media

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `image` | required | yes | yes | yes | yes | required in ast; offprint import skips image block if blob is missing |
| `text` | optional | no | no | no | yes | only atview keeps media text span |
| `alt` | optional | yes | yes | yes | yes | stable |
| `width`/`height` | optional | yes | yes | partial | yes | offprint exports aspect ratio only when both width and height are present |
| `title` | optional | no | yes | no | yes | leaflet/offprint converters do not map title |
| `caption` | optional | yes | yes | yes | yes | stable |

### unordered-list

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `items[].children` | yes | yes | yes | yes | partial | atview serializes list items as plain text |
| `items[].sublist` | optional | partial | no | yes | no | leaflet import can read nested items, but export currently does not write nested children |

### ordered-list

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `items[].children` | yes | yes | yes | yes | partial | atview list content is text-only serialization |
| `items[].sublist` | optional | partial | no | yes | no | leaflet export currently drops nested children |
| `start` | optional | yes | yes | yes | partial | atview uses numbered text output but does not restore `start` on import |

### task-list

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | no | yes | yes | partial | partial |
| `items[].checked` | yes | no | yes | yes | partial | atview loses check state on import |
| `items[].children` | yes | no | yes | yes | partial | atview task text is serialized inline and not restored as task-list |

### bsky-post

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | stable |
| `uri` | yes | yes | yes | yes | yes | stable |
| `cid` | yes | yes | yes | yes | partial | atview export facet writes `uri` only; `cid` is not preserved by current exporter |
| `text` | optional | no | no | no | partial | partial |

### horizontal-rule

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| intrinsic properties | none | yes | yes | yes | yes | atview uses span + facet representation |

### website

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | almost stable |
| `uri` | yes | yes | yes | yes | yes | stable |
| `title` | optional | yes | yes | yes | partial | atview facet export writes `uri` but not `title`, import can only recover title if feature already contains it |

### table

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | no | yes | no | no | partial |
| `rows` | yes | no | yes | no | no | pckt keeps rows |
| `cells[].content` | yes | no | yes | no | no | pckt stores cell content as text blocks |
| `cells[].colspan`/`rowspan` | optional | no | yes | no | no | pckt maps both through cell attrs |

### iframe

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | yes | yes | yes | stable |
| `url` | yes | yes | yes | yes | yes | stable |
| `height` | optional | yes | no | no | no | only leaflet currently preserves iframe height |

### math

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | yes | no | yes | yes | partial |
| `content` | yes | yes | no | yes | yes | partial |

### hard-break

| property | ast | leaflet | pckt | offprint | atview | compatibility |
|--|--|--|--|--|--|--|
| block support | yes | partial | yes | no | yes | partial |
| intrinsic properties | none | partial | yes | no | yes | partial |

### unsupported provider blocks

These blocks exist in provider schemas but currently have no AST block equivalent and are skipped when converting provider data to AST:

| provider | provider block | ast support | behavior |
|--|--|--|--|
| offprint | `app.offprint.block.imageGrid` | no | ignored in `offprint/data-to-ast` |
| offprint | `app.offprint.block.imageCarousel` | no | ignored in `offprint/data-to-ast` |
| offprint | `app.offprint.block.imageDiff` | no | ignored in `offprint/data-to-ast` |
| offprint | `app.offprint.block.button` | no | ignored in `offprint/data-to-ast` |
