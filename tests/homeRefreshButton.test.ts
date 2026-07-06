import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const homePageSource = readFileSync(
  new URL("../src/pages/HomePage.tsx", import.meta.url),
  "utf8"
);
const tagCloudSource = readFileSync(
  new URL("../src/components/TagCloud.tsx", import.meta.url),
  "utf8"
);
const searchPanelSource = readFileSync(
  new URL("../src/components/SearchPanel.tsx", import.meta.url),
  "utf8"
);
const layoutCss = readFileSync(
  new URL("../src/styles/layout.css", import.meta.url),
  "utf8"
);
const searchCss = readFileSync(
  new URL("../src/styles/search.css", import.meta.url),
  "utf8"
);
const appShellSource = readFileSync(
  new URL("../src/components/AppShell.tsx", import.meta.url),
  "utf8"
);
const backToTopSource = readFileSync(
  new URL("../src/components/BackToTop.tsx", import.meta.url),
  "utf8"
);

function ruleBody(css: string, selector: string): string {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = css.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Expected CSS rule for ${selector}`);
  return match[1];
}

test("home page refresh button shares back-to-top slot until back-to-top is visible", () => {
  assert.match(homePageSource, /import \{ Film, RefreshCw \} from "lucide-react"/);
  assert.match(homePageSource, /const LATEST_POOL_SIZE = 96;/);
  assert.match(homePageSource, /const HOME_LATEST_CURSOR_KEY = "home\.latest\.cursor";/);
  assert.match(homePageSource, /function nextLatestBatch/);
  assert.match(homePageSource, /loadLatestCursor\(items\.length\)/);
  assert.match(homePageSource, /saveLatestCursor\(\(start \+ count\) % items\.length\)/);
  assert.match(homePageSource, /const refreshHome = useCallback\(async \(\) =>/);
  assert.match(homePageSource, /fetchHomeVideos\(excludeIds\)/);
  assert.match(homePageSource, /fetchListing\(1,\s*LATEST_POOL_SIZE,\s*\{ sort: "latest", includeTotal: false \}\)/);
  assert.match(homePageSource, /setLatestVideos\(nextLatestBatch\(latestResult\.items,\s*DESKTOP_COUNT\)\)/);
  assert.match(homePageSource, /className=\{`home-refresh \$\{refreshing \? "is-refreshing" : ""\}`\}/);
  assert.match(homePageSource, /aria-label="刷新首页"/);
  assert.match(homePageSource, /<RefreshCw size=\{18\} \/>/);

  const refresh = ruleBody(layoutCss, ".home-refresh");
  const shiftedRefresh = ruleBody(layoutCss, ".app-shell.is-back-to-top-visible .home-refresh");
  const backToTop = ruleBody(layoutCss, ".back-to-top");
  assert.match(refresh, /position\s*:\s*fixed/);
  assert.match(refresh, /bottom\s*:\s*24px/);
  assert.match(backToTop, /bottom\s*:\s*24px/);
  assert.match(shiftedRefresh, /bottom\s*:\s*80px/);
  assert.match(refresh, /z-index\s*:\s*var\(--z-overlay\)/);
  assert.doesNotMatch(layoutCss, /\.home-refresh\.is-visible/);

  assert.match(appShellSource, /const \[backToTopVisible,\s*setBackToTopVisible\] = useState\(false\)/);
  assert.match(appShellSource, /backToTopVisible \? "is-back-to-top-visible" : ""/);
  assert.match(appShellSource, /<BackToTop onVisibilityChange=\{setBackToTopVisible\} \/>/);
  assert.match(backToTopSource, /onVisibilityChange\?: \(visible: boolean\) => void/);
  assert.match(backToTopSource, /onVisibilityChange\?\.\(nextVisible\)/);
});

test("home page hides empty tag cloud and uses one empty library state", () => {
  assert.match(tagCloudSource, /const visibleTags = useMemo/);
  assert.match(tagCloudSource, /typeof tag\.count !== "number" \|\| tag\.count > 0/);
  assert.match(tagCloudSource, /if \(visibleTags\.length === 0\) return null/);
  assert.match(tagCloudSource, /visibleTags\.map\(renderTag\)/);
  assert.doesNotMatch(tagCloudSource, /const row[12] = visibleTags\.filter/);
  assert.doesNotMatch(tagCloudSource, /\(\{tag\.count\}\)/);
  assert.doesNotMatch(tagCloudSource, /`\$\{tag\.count\} 个视频`/);

  const tagCloudRow = ruleBody(searchCss, ".tag-cloud__row");
  const tagChip = ruleBody(searchCss, ".tag-chip");
  assert.match(tagCloudRow, /flex-wrap\s*:\s*nowrap/);
  assert.match(tagChip, /flex\s*:\s*0 0 auto/);

  const searchForm = ruleBody(searchCss, ".search-panel__form");
  const searchInput = ruleBody(searchCss, ".search-panel__input");
  const searchSubmit = ruleBody(searchCss, ".search-panel__submit");
  assert.match(searchPanelSource, /placeholder="搜索视频标题或作者"/);
  assert.doesNotMatch(searchPanelSource, /搜索视频标题或作者\.\.\./);
  assert.match(searchForm, /padding\s*:\s*4px/);
  assert.match(searchInput, /height\s*:\s*36px/);
  assert.match(searchSubmit, /height\s*:\s*36px/);

  assert.match(homePageSource, /const homeLoading = rankingLoading \|\| latestLoading/);
  assert.match(homePageSource, /const hasAnyVideos = ranking\.length > 0 \|\| latest\.length > 0/);
  assert.match(homePageSource, /const showEmptyHome = !homeLoading && !hasAnyVideos/);
  assert.match(homePageSource, /<SectionHeader title="随机推荐" \/>/);
  assert.match(homePageSource, /<SectionHeader title="最新视频" \/>/);
  assert.doesNotMatch(homePageSource, /随机展示/);
  assert.doesNotMatch(homePageSource, /共 \$\{latest\.length\} 个/);
  assert.match(homePageSource, /className="container page-section home-discovery-section"/);
  assert.match(homePageSource, /className="container page-section home-primary-section"/);
  assert.match(homePageSource, /className="home-empty"/);
  assert.match(homePageSource, /当前还没有可播放的视频/);

  const discoverySection = ruleBody(layoutCss, ".home-discovery-section");
  const primaryHeader = ruleBody(layoutCss, ".home-primary-section .section-header");
  assert.match(discoverySection, /padding-bottom\s*:\s*var\(--space-2\)/);
  assert.match(primaryHeader, /margin-top\s*:\s*var\(--space-2\)/);

  const empty = ruleBody(layoutCss, ".home-empty");
  assert.match(empty, /min-height\s*:\s*240px/);
  assert.match(empty, /border\s*:\s*1px dashed var\(--border-default\)/);
  assert.match(empty, /border-radius\s*:\s*8px/);
});
