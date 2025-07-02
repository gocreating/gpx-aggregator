import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function waitForAllTilesLoaded(page) {
  // 等待所有地圖 tile 載入完成
  await page.waitForFunction(() => {
    const tiles = document.querySelectorAll('.leaflet-tile');
    if (!tiles.length) return false;
    return Array.from(tiles).every(img => img.complete && img.naturalWidth > 0);
  }, null, { timeout: 15000 });
}

async function takeTabletDarkMultiTrackScreenshot() {
  const screenshotsDir = './docs/screenshots';
  if (!fs.existsSync('./docs')) fs.mkdirSync('./docs');
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir);

  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await context.newPage();

  try {
    console.log('🚀 開始平板深色多軌跡截圖...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

    // 切換深色主題
    try {
      const themeSelector = page.locator('button').filter({ hasText: '淺色主題' }).or(
        page.locator('[role="button"]').filter({ hasText: '淺色主題' })
      ).or(
        page.locator('div').filter({ hasText: '淺色主題' })
      ).first();
      await themeSelector.click({ timeout: 10000 });
      await page.locator('text=深色主題').click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    } catch (error) {
      console.log('⚠️ 無法切換主題，跳過深色主題截圖');
    }

    // 注入3份 GPX
    const gpxList = [
      {
        name: '台北101登山路線',
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="GPX Aggregator Demo">\n  <metadata>\n    <name>台北101登山路線</name>\n  </metadata>\n  <trk>\n    <name>台北101登山路線</name>\n    <trkseg>\n      <trkpt lat=\"25.033\" lon=\"121.565\"><ele>10</ele><time>2024-01-01T08:00:00Z</time></trkpt>\n      <trkpt lat=\"25.034\" lon=\"121.566\"><ele>50</ele><time>2024-01-01T08:30:00Z</time></trkpt>\n      <trkpt lat=\"25.035\" lon=\"121.567\"><ele>100</ele><time>2024-01-01T09:00:00Z</time></trkpt>\n    </trkseg>\n  </trk>\n</gpx>`
      },
      {
        name: '陽明山步道',
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="GPX Aggregator Demo">\n  <metadata>\n    <name>陽明山步道</name>\n  </metadata>\n  <trk>\n    <name>陽明山步道</name>\n    <trkseg>\n      <trkpt lat=\"25.165\" lon=\"121.553\"><ele>20</ele><time>2024-01-02T08:00:00Z</time></trkpt>\n      <trkpt lat=\"25.166\" lon=\"121.554\"><ele>80</ele><time>2024-01-02T08:30:00Z</time></trkpt>\n      <trkpt lat=\"25.167\" lon=\"121.555\"><ele>120</ele><time>2024-01-02T09:00:00Z</time></trkpt>\n    </trkseg>\n  </trk>\n</gpx>`
      },
      {
        name: '象山親山步道',
        xml: `<?xml version="1.0" encoding="UTF-8"?>\n<gpx version="1.1" creator="GPX Aggregator Demo">\n  <metadata>\n    <name>象山親山步道</name>\n  </metadata>\n  <trk>\n    <name>象山親山步道</name>\n    <trkseg>\n      <trkpt lat=\"25.027\" lon=\"121.570\"><ele>15</ele><time>2024-01-03T08:00:00Z</time></trkpt>\n      <trkpt lat=\"25.028\" lon=\"121.571\"><ele>60</ele><time>2024-01-03T08:30:00Z</time></trkpt>\n      <trkpt lat=\"25.029\" lon=\"121.572\"><ele>110</ele><time>2024-01-03T09:00:00Z</time></trkpt>\n    </trkseg>\n  </trk>\n</gpx>`
      }
    ];

    await page.evaluate((gpxList) => {
      function strToFile(str, name) {
        const blob = new Blob([str], { type: 'application/gpx+xml' });
        return new File([blob], name + '.gpx', { type: 'application/gpx+xml' });
      }
      const files = gpxList.map(g => strToFile(g.xml, g.name));
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        Object.defineProperty(files, 'length', { value: files.length });
        Object.defineProperty(fileInput, 'files', { value: files });
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }, gpxList);

    // 等待軌跡載入
    await page.waitForTimeout(2500);
    await waitForAllTilesLoaded(page);

    // active 其中一個 GPX（第一個）
    const trackCard = page.locator('[data-testid="track-card"], .track-item, [class*="TrackItem"], [class*="Card"]').first();
    if (await trackCard.count() > 0) {
      await trackCard.click();
      await page.waitForTimeout(1000);
    }

    // 再次確保地圖載入完整
    await waitForAllTilesLoaded(page);
    await page.waitForTimeout(1000);

    // 截圖
    await page.screenshot({
      path: `${screenshotsDir}/tablet-dark-multitrack-active.png`,
      fullPage: true
    });
    console.log('✅ 平板深色多軌跡截圖完成！');
  } finally {
    await browser.close();
  }
}

takeTabletDarkMultiTrackScreenshot(); 