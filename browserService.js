const fs = require("fs");
const got = require("got");
const { PendingXHR } = require("pending-xhr-puppeteer");
const { Cluster } = require("puppeteer-cluster");

const fsPromises = fs.promises;

function getMainDomain(url) {
  try {
    let hostname = new URL(url).hostname;
    if (hostname) {
      // Remove subdomains
      const parts = hostname.split("/")[0].split(".");
      if (parts && parts.length > 0) {
        hostname = parts.pop();
        hostname = `${parts.pop()}.${hostname}`;
        return hostname;
      }
    }
  } catch (_) {}
  return "";
}

const getPageAdStatistics = async (domains) => {
  let list;
  try {
    let currentWebsiteDomain = "";
    if (fs.existsSync("list.json")) {
      list = JSON.parse(await fsPromises.readFile("list.json", "utf8"));
    } else {
      const response = await got(
        "https://pgl.yoyo.org/adservers/serverlist.php?hostformat=nohtml"
      );
      list = response.body.split("\n").filter((i) => i);
      await fsPromises.writeFile("list.json", JSON.stringify(list));
    }

    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 10,
      timeout: 3000000,
    });

    await cluster.task(async ({ page, data: currentUrl }) => {
      const pendingXHR = new PendingXHR(page);

      const thirdPartyTrackers = new Set();

      await page.setRequestInterception(true);

      page.on("request", async (interceptedRequest) => {
        const resourceType = interceptedRequest.resourceType();
        const url = interceptedRequest.url();
        if (
          resourceType === "image" ||
          resourceType === "stylesheet" ||
          resourceType === "font"
        ) {
          await interceptedRequest.abort();
        } else {
          await interceptedRequest.continue();
        }

        if (resourceType === "xhr") {
          const mainDomain = getMainDomain(url);
          if (
            mainDomain &&
            list.includes(mainDomain) &&
            mainDomain !== currentWebsiteDomain
          )
            thirdPartyTrackers.add(mainDomain);
        }
      });

      await page.exposeFunction("getMainDomain", (text) => getMainDomain(text));

      const startTime = process.hrtime();
      currentWebsiteDomain = getMainDomain(currentUrl);

      await page.goto(currentUrl, { waitUntil: "domcontentloaded" });

      await pendingXHR.waitForAllXhrFinished();
      const adsUrl = await page.evaluate(async (list) => {
        const currentWebsiteDomain = await window.getMainDomain(
          window.location.href
        );
        const elements = document.getElementsByTagName("iframe");
        const adsUrl = new Set();
        for (let index = 0; index < elements.length; index++) {
          const element = elements[index];
          if (element.src && element.src !== "about:blank") {
            const mainDomain = await window.getMainDomain(element.src);
            if (
              mainDomain &&
              list.includes(mainDomain) &&
              mainDomain !== currentWebsiteDomain
            )
              adsUrl.add(mainDomain);
          }
        }

        return Array.from(adsUrl);
      }, list);

      const endTime = process.hrtime(startTime);

      return {
        adsUrl,
        thirdPartyTrackers: Array.from(thirdPartyTrackers),
        timeInMs: (endTime[0] * 1000000000 + endTime[1]) / 1000000,
        domain: currentUrl,
      };
    });

    const statistics = [];
    for (let index = 0; index < domains.length; index++) {
      const domain = domains[index];
      statistics.push(await cluster.execute(domain));
    }

    await cluster.idle();
    await cluster.close();

    return statistics;
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  getPageAdStatistics,
};
