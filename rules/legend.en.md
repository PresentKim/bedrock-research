Rule IDs exist only for JSON UI rules. For other topics such as add-on content, the Script API, rendering, servers, and tools, go from the [section map](../index.mdx#section-map) to that section's first page, read its page map and summaries, and judge confidence by the [verification level marks](../index.mdx#verification-level-marks) at the end of each item on the page.

## Evidence levels

The meaning of the level marks (`measured`, `vanilla`, `working pack`, `code (source)`, `code (binary)`, `inferred`, `unverified`, `conflict`) and the priority of judgments are in [Verification level marks on the wiki home page](../index.mdx#verification-level-marks). The chapter tables and the topic pages use the same legend.

## Evidence environment

The "Evidence environment" cell of the chapter tables is the platform and version written in the rule's measurement or binary evidence. Only what the rule text and sources state is carried over; where a source abbreviation fixes the environment (`TP` and `DF` are Windows 1.26.52, `NB` is Android 1.26.52.3, `EML`, `E2048`, `HXC` and `IUC` are mobile 1.26.63), that environment is used. A rule with measurement or binary evidence but no stated environment shows `unknown`, and a rule without such evidence shows `-`. Versions are written in the form starting with `1.`, such as `1.26.65.1`. The game's `26.65` is the same as `1.26.65` ([Version scheme](../basics/versions.mdx)).

## ID prefixes

| Prefix | Meaning | Defined in |
| --- | --- | --- |
| `FILE`, `MOD`, `LAY`, `BND`, `EXP`, `COL`, `INP`, `TXT`, `ANI`, `HOST`, `PAT`, `ALT`, `DBG` | JSON UI rules. Each chapter has one prefix | The chapter tables below |
| `C` | Conflict verdicts where sources disagree | [Conflict table](../json-ui/conflicts.mdx) |
| `D` | Items comparing community reports with the rules | [Community reports and comparison](../json-ui/community-reports.mdx) |
| `NB` | Findings of the native client binary analysis | [Findings index](../internals/findings-index.mdx) |
| `R` | Facts newly learned from the binary analysis | [JSON UI engine findings](../internals/json-ui-engine-findings.mdx), [Ore UI engine findings](../internals/ore-ui-engine-findings.mdx) |
| `RV` | Claims of other sources that the binary analysis confirmed or corrected | [JSON UI engine findings](../internals/json-ui-engine-findings.mdx), [Ore UI engine findings](../internals/ore-ui-engine-findings.mdx) |
| `CN` | Item numbers of the Cinnabar (`CN`) analysis record. This wiki has no table by number | None |

Source abbreviations (`VN`, `BC`, `BW`, etc.) are in [Source abbreviations](./source-abbreviations.mdx).
