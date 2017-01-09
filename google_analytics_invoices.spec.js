require('dotenv').config()

var assert = require('assert');

const username = process.env.GOOGLE_EMAIL;
const password = process.env.GOOGLE_PASSWORD;

assert(username, "Missing username in environment variable GOOGLE_EMAIL");
assert(password, "Missing password in environment variable GOOGLE_PASSWORD");

const untilClickable = function (elem) { return protractor.ExpectedConditions.elementToBeClickable(elem) };
const untilPresent = function (elem) { return protractor.ExpectedConditions.presenceOf(elem) };

function presenceOfAny(elementArrayFinder) {
    return function () {
        return elementArrayFinder.count().then(function (count) {
            return count > 0;
        });
    }
}

const adwordsStartPage = 'https://adwords.google.com/home/#?modal_active=none';

const elements = {
    signInLink: element(by.css('.cta-signin')),
    emailInput: element(by.css('[name=Email]')),
    passwordInput: element(by.css('[name=Passwd]')),
    nextButton: element(by.css('input#next')),
    signInButton: element(by.css('input#signIn')),
    transactionHistory: element(by.css('#gwt-debug-billing-navigation-bar-transaction-history')),
    settingsDropDown: element(by.css('#aw-cues-gearicon')),
    billingMenuItem: element(by.css('[navi-id=aw-cues-item-billing3-adwords] a')),
    transactionDocumentItem: element(by.css('.b3-transaction-documents-row')),
    allTransactionDocumentItems: element.all(by.css('.b3-transaction-documents-row .b3id-hierarchical-zippy-header')),
    iframe: element(by.id('paymentsIframeContainerIframe'))
};

beforeEach(function(){
    return browser.ignoreSynchronization = true;
});

describe('Checkout stuff', function() {
    it('Has credentials in the path', function () {
       expect(username).toBeTruthy();
       expect(password).toBeTruthy();
    });

    it('Go to analytics', function() {
        browser.get(adwordsStartPage);
    });

    it('Start signin', function () {
        elements.signInLink.click();
    });

    it('Fills email', function () {
        browser.wait(untilClickable(elements.emailInput), 4000);
        elements.emailInput.sendKeys(username);
        untilClickable(elements.nextButton)
        elements.nextButton.click()
    });

    it('Fills password', function () {
        browser.wait(untilClickable(elements.passwordInput), 4000);
        elements.passwordInput.sendKeys(password);
        browser.wait(untilClickable(elements.signInButton), 1000);
        elements.signInButton.click()
    });

    it('Clicks dropdown', function () {
        browser.wait(untilClickable(elements.settingsDropDown), 10000);
        elements.settingsDropDown.click();
    });

    it('Clicks Billing', function () {
        elements.billingMenuItem.click();
    });

    it('Finds collapsed items', function () {
        browser.driver.sleep(8000);
        console.log('Starting collapsed item search');

        browser.wait(untilPresent(elements.iframe), 10000);
        browser.switchTo().frame('paymentsIframeContainerIframe');
    });

    it('Finds collapsed items', function () {
        browser.wait(presenceOfAny(elements.allTransactionDocumentItems), 10000);
    });

    const foundItems = [];
    it('Opens collapsed items', function () {
        elements.allTransactionDocumentItems.each(function (item) {
            item.click();

            browser.driver.sleep(400).then(function () {
                const parent = item.element(by.xpath('..'));

                parent.getText().then(function (text) {
                    var date = text.match(/\(.*:? ([^)]+)\)/)[1];
                    var name = text.match(/(.*)\(/)[1].trim();
                    foundItems.push({
                        filename: name + '.pdf',
                        date: date
                    })
                });

                parent.element(by.className('b3-document-link')).click()
            })
        })
    });

    it('waits for download to complete', function () {
        browser.driver.sleep(3000)
        console.log('Found Items: ', foundItems.map(function (item) { return item.filename;}))
    });
});