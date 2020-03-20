import puppeteer from 'puppeteer';
import { getSearchLinks, login, runSearch } from './ms-rewards';

const isDev = process.env.NDOE_ENV !== 'production';

async function main() {
    const browser = await puppeteer.launch({
        devtools: isDev,
    });

    // eslint-disable-next-line no-unused-vars
    const [_, searchLinks] = await Promise.all([
        // Set the cookies necessary from logging in
        login(browser),
        // Get list of text to search for
        getSearchLinks(browser),
    ]);

    // Create a list of searches to run, but don't run them yet
    const runnableSearches = searchLinks.map((textContent) => () => runSearch(browser, textContent));

    // Open searches in browser serially
    // eslint-disable-next-line no-restricted-syntax
    for (const search of runnableSearches) {
        search();
    }

    await browser.close();
}

main();
