## Evidence levels

| Level | Meaning |
| --- | --- |
| measured | There is a record measured in game |
| vanilla | Actually used in the `ui/` files of the vanilla resource pack |
| working pack | A distributed, working pack uses it that way |
| code | Confirmed by reading source or compiled output. Game behavior is not guaranteed |
| inferred | Judged from the evidence above |
| unverified | A source claimed it, but the evidence could not be confirmed |
| conflict | Sources disagree and it is not fully resolved. The verdict is in the [conflict table](../json-ui/conflicts.mdx) |

The priority of judgments is measured, vanilla, working pack, code, inferred, in that order. When sources of the same level disagree, the later measurement wins, and if they still disagree the rule stays `conflict`.

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

Source abbreviations (`VN`, `BC`, `BW`, etc.) are in the source abbreviation table of the [JSON UI overview](../json-ui/index.mdx).
