const puppeteer = require('puppeteer');
const helpers = require('./helpers');

const { credentials, randomInt } = helpers;

export async function getSearchLinks(browser) {
    const page = await browser.newPage();

    await page.goto('https://www.bing.com/');
    await page.waitFor('#crs_pane a');

    const links = page.evaluate(() => Array.from(document.querySelectorAll('#crs_pane a')).map(
        (a) => a.textContent,
    ));

    await page.close();

    return links;
}

export async function login(browser) {
    const page = await browser.newPage();

    // Navigate to the login page
    // Ensure username and password are given
    if (!credentials.username) {
        console.error('username is required but was not given');
        process.exit(1);
    } else if (!credentials.password) {
        console.error('password is required but was not given');
        process.exit(1);
    }

    await page.goto('https://login.live.com');

    // Login
    await page.type('[name="loginfmt"]', credentials.username, { delay: 32 });
    const formHandle = await page.$('form');
    await formHandle.press('Enter');
    await page.waitFor('.has-identity-banner');
    await page.type('[name="passwd"]', credentials.password, { delay: 32 });
    await formHandle.press('Enter');
    await page.waitForNavigation();
    page.close();
}

export async function runSearch(browser, text) {
    const searchPage = await browser.newPage();

    await searchPage.goto('https://bing.com/');

    // Check if log in carried over
    await searchPage.evaluate(async () => {
        const signInAnchor = document.querySelector('#id_l');
        const loggedInUsername = signInAnchor.textContent;
        const signedOut = loggedInUsername.toLocaleLowerCase() === 'sign in';

        if (!signedOut) return signedOut;

        // Click sign in if necessary
        signInAnchor.click();

        // HACK: Wait arbitrary time for cookies to be loaded.
        return new Promise((resolve) => setTimeout(resolve, 1000));
    });

    await searchPage.type('[name="q"]', text, { delay: 26 });
    const formHandle = await searchPage.$('#sb_form');
    await formHandle.press('Enter');
    await searchPage.waitForNavigation();
    await searchPage.waitFor(randomInt(2000, 5000));

    await searchPage.close();
}
