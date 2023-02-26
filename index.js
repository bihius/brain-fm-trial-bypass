// ==UserScript==
// @name         Bypass trial on brain.fm
// @namespace    http://tampermonkey.net/
// @version      0.72
// @description  Autoregister on brain.fm when trial is ending
// @author       https://github.com/b3valsek
// @match        https://my.brain.fm/*
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/b3valsek/brain-fm-bypass/test/index.js
// @downloadURL  https://raw.githubusercontent.com/b3valsek/brain-fm-bypass/test/index.js
// ==/UserScript==
(function () {

    // Config
    // choose default playlist (relax, focus, sleep)
    const playlist = "focus";
    // choose activity (work, learning, creativity)
    const activity = "work";
    // choose neural level (low, medium, high)
    const effect = "medium";

    const NAMES = ["Adam", "Ewa", "Michał", "Katarzyna", "Paweł", "Anna", "Tomasz", "Magdalena", "Krzysztof", "Monika"];
    const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    const DOMAINS = [
        'armyspy.com', 'rhyta.com', 'dayrep.com', 'teleworm.us', 'superrito.com',
        'einrot.com', 'cuvox.de', 'gustr.com', 'fleckens.hu', 'glockenhofer.com',
        'jourrapide.com', 'speedpost.net', 'armyspy.net', 'rhyta.net', 'dayrep.net'
    ];
    const DEFAULT_TIMEOUT = 500;

    'use strict';

    let isPageLoaded = checkIfAllPageElementsLoaded();
    main();
    /**
     * If page is loaded do mainInternal() if not try again
     */
    async function main() {

        if (isPageLoaded == true) {
            await mainInternal();
        }
        else {
            console.log("Page is not loaded");
            isPageLoaded = checkIfAllPageElementsLoaded();
            setTimeout(main, DEFAULT_TIMEOUT);
        }


    }
    /**
     * Checks if user is logged in, if yes checks if user is on last trial day if yes it log's out and register new account
     */
    async function mainInternal() {

        let loginStatus = checkLoginStatus();

        if (loginStatus == true) {
            let trialStatusLabel = getElementByXpath("//div[@id='root']//child::div[contains(text(),'Your trial')]");
            if (trialStatusLabel == null || trialStatusLabel == undefined) {
                setTimeout(main, DEFAULT_TIMEOUT);
                return 0;
            }
            let trialOnLastDay = checkLastTrialDay(trialStatusLabel);

            if (trialOnLastDay == true) {
                await logout();
                await register();
            }
            else if (trialOnLastDay == false) {
                sleep(1000 * 60 * 60 * 6);
                console.log("Script hibernation for 6 hours started");
            }
            else {
                console.log("Can't check trial status, exiting");
            }
        }
        else if (loginStatus == false) {
            register();
        }
        else {
            console.log("can't check login status, exiting");
        }
    }

    async function register() {
        let isPageLoaded = checkIfAllPageElementsLoaded();
        if (isPageLoaded != true) { setTimeout(register, 100); }
        let loginStatus = checkLoginStatus();
        if (loginStatus == true) { logout(); }
        var singUpButton = getElementByXpath("//a[@data-testid='sign-up']");
        singUpButton.click();
        // fill register form with random data and click submit button
        fillFormAndRegister();
        // skip all splash screen elements by just clicking them automatically
        skipSplashScreen();
        console.log("register complete");
        await setTimeout(choosePlaylist, DEFAULT_TIMEOUT * 10);
        await setTimeout(selectOtherPresets, DEFAULT_TIMEOUT * 10);
    }

    function logout() {
        if (isPageLoaded != true) { setTimeout(logout, DEFAULT_TIMEOUT); }
        overrideConfirmFunction();
        clickLogoutButton();
        waitForTargetNodeAndClickFirstChild();
        console.log("logout complete");
    }

    function clickLogoutButton() {
        var profileLogo = getElementByXpath("//div[@data-testid='profile-button']");
        profileLogo.click();
        var logoutBtn = getElementByXpath("//a[@data-testid='logout']");
        if (logoutBtn) {
            logoutBtn.click();
        } else {
            setTimeout(clickLogoutButton, DEFAULT_TIMEOUT);
        }
    }

    function waitForTargetNodeAndClickFirstChild() {
        console.log("waiting for idk what");
        const targetNode = document.querySelector('.sc-eJKXev.bWTRyq');
        if (targetNode) {
            targetNode.firstElementChild.click();
        } else {
            const observer = new MutationObserver(handleMutation);
            observer.observe(document.body, { childList: true, subtree: true });
        }
    }

    function handleMutation(mutationsList) {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                const addedNode = mutation.addedNodes[0];
                if (addedNode.classList.contains('sc-eJKXev') && addedNode.classList.contains('bWTRyq')) {
                    addedNode.firstElementChild.click();
                    observer.disconnect();
                    break;
                }
            }
        }
    }

    function overrideConfirmFunction() {
        window.confirm = function (message) {
            const beforeConfirmEvent = new Event("beforeconfirm");
            document.dispatchEvent(beforeConfirmEvent);
            return true;
        };
        document.addEventListener("beforeconfirm", handleConfirm);
    }

    function handleConfirm(event) {
        event.preventDefault();
        const confirmButton = document.querySelector('#popup_ok');
        if (confirmButton) {
            confirmButton.click();
        }
    }


    function selectOtherPresets() {
        let isPageLoaded = checkIfAllPageElementsLoaded();
        if (isPageLoaded == false) {
            setTimeout(selectOtherPresets, DEFAULT_TIMEOUT);
        }
        switch (activity) {
            case "learning":
                getElementByXpath("//div//child::p[contains(text(),'Use this music')]").click();
                break;
            case "work":
                getElementByXpath("//div//child::p[contains(text(),'Music designed to facilitate cognitively')]").click();
                break;
            case "creativity":
                getElementByXpath("//div//child::p[contains(text(),'Music designed to engage and inspire. ')]").click();
                break;
            default:
                getElementByXpath("//div//child::p[contains(text(),'Music designed to facilitate cognitively')]").click();
                break;
        }
        switch (effect) {
            case "low":
                getElementByXpath("//div//child::p[contains(text(),'Use this effect level if you are generally sensitive to sounds, or if )]").click();
                break;
            case "medium":
                getElementByXpath("//div//child::p[contains(text(),'Our standard level of neural phase locking is a great place to start. ')]").click();
                break;
            case "medium":
                getElementByXpath("//div//child::p[contains(text(),'Try the strongest level of our neural phase locking technology if ')]").click();
                break;
            default:
                getElementByXpath("//div//child::p[contains(text(),'Our standard level of neural phase locking is a great place to start. ')]").click();
                break;
        }
    }

    function choosePlaylist() {
        console.log("chossing playlist...");
        switch (playlist) {
            case "relax":
                window.open("https://my.brain.fm/relax", "_self");
                break;
            case "focus":
                window.open("https://my.brain.fm/focus", "_self");
                break;
            case "sleep":
                window.open("https://my.brain.fm/sleep", "_self");
                break;
            default:
                window.open("https://my.brain.fm/focus", "_self");
                break;
        }
    }

    function skipSplashScreen() {
        console.log("Skipping splash screen...");
        const targetClasses = [".sc-bcXHqe.sc-dkrFOg.jAnHtB.cOXSVm"];
        const config = { childList: true, subtree: true };
        const observer = new MutationObserver((mutationsList, observer) => {
            mutationsList.forEach((mutation) => {
                if (mutation.type === "childList") {
                    const elements = targetClasses.flatMap((targetClass) =>
                        Array.from(document.querySelectorAll(targetClass))
                    );
                    if (elements.length > 0) {
                        elements.forEach((element) => {
                            element.click();
                        });
                        skipSplashScreen();
                    }
                }
            });
        });
        observer.observe(document.body, config);
        console.log("Splash screen skipped");
    }
    /**
     * Fills the registration form and submits it
     */
    function fillFormAndRegister() {

        var intervalId = setInterval(function () {
            var nameInput = document.getElementById("name");
            var emailInput = document.getElementById("email");
            var passwordInput = document.getElementById("password");

            if (nameInput && emailInput && passwordInput) {
                clearInterval(intervalId);

                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(nameInput, getRandomName());
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));

                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(emailInput, getRandomEmail());
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));

                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(passwordInput, getRandomPassword());
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

                var submitButton = getElementByXpath("//button[@type='submit']");
                submitButton.click();
            }
        }, DEFAULT_TIMEOUT);
    }
    /**
     * Checks if user is logged in
     * @returns {Boolean}
     */
    function checkLoginStatus() {

        let isPageLoaded = checkIfAllPageElementsLoaded();

        if (isPageLoaded != true) {
            setTimeout(checkLoginStatus, DEFAULT_TIMEOUT);
        }

        if (document.getElementById('email')) {
            return false;
        } else {
            return true;
        }
    }
    /**
     * Checking is today day is the last day of trial
     * @returns {Boolean}
     */
    function checkLastTrialDay(trialStatusLabel) {
        if (trialStatusLabel.innerText.includes('Your trial ends in 1 day')) {
            return true;
        }
        return false;
    }
    /**
     * Returns random user name
     * @returns {String}
     */
    function getRandomName() {
        return NAMES[Math.floor(Math.random() * NAMES.length)];
    }
    /**
     * Returns random email
     * @returns {String}
     */
    function getRandomEmail() {
        const randomDomain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
        const randomString = Math.random().toString(36).substring(2, 8);
        return `${randomString}@${randomDomain}`;
    }
    /**
     * Returns random password
     * @returns {String}
     */
    function getRandomPassword() {
        return Array.from({ length: 10 }, () => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]).join('');
    }
    /**
     * Returns html elementy selected by xPath
     * @param {String} xPathToElement 
     * @returns {Node}
     */
    function getElementByXpath(xPathToElement) {
        return document.evaluate(
            xPathToElement,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
    }
    /**
     * Sleeps thread
     * @param {number} ms 
     * @returns {Promise}
     */
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms * 1000));
    }
    /**
     * Checks if page is loaded
     */
    function checkIfAllPageElementsLoaded() {
        return document.readyState === 'complete';
    }
})();

