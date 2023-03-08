// ==UserScript==
// @name Brain.fm trial bypass
// @namespace http://tampermonkey.net/
// @version 1.05
// @description Auto register on Brain.fm when trial is ending
// @author https://github.com/b3valsek
// @match https://my.brain.fm/*
// @grant unsafeWindow
// ==/UserScript==

(function () {
    'use strict';
    // CONFIG
    const PLAYLIST = "focus"; // choose default playlist (relax, focus, sleep)
    const ACTIVITY_TYPE = "learning"; // choose activity (work, learning, creativity)
    const EFFECT_LEVEL = "medium"; // choose neural level (low, medium, high)
    const NAMES = ["Adam", "Ewa", "Michał", "Katarzyna", "Paweł", "Anna", "Tomasz", "Magdalena", "Krzysztof", "Monika", "Korbin", "Clovis"];
    const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    const DOMAINS = ['armyspy.com', 'rhyta.com', 'dayrep.com', 'teleworm.us', 'superrito.com', 'einrot.com', 'cuvox.de', 'gustr.com', 'fleckens.hu', 'glockenhofer.com', 'jourrapide.com', 'speedpost.net', 'armyspy.net', 'rhyta.net', 'dayrep.net'];
    const DEFAULT_TIMEOUT = 500; // in ms
    const SELECTORS = {
        profileHeadIcon: "//div[@data-testid='profile-button']",
        signUpButton: "//a[@data-testid='sign-up']",
        changeActivityButton: "//span[contains(text(), 'Activity')]",
        logoutButton: "//a[@data-testid='logout']",
        activityLearning: "//div//child::p[contains(text(),'Use this music')]",
        activityWork: "//div//child::p[contains(text(),'Music designed to facilitate cognitively')]",
        activityCreativity: "//div//child::p[contains(text(),'Music designed to engage and inspire. ')]",
        effectLow: "//div//h6[contains(text(), 'low')]",
        effectMedium: "//div//h6[contains(text(), 'medium')]",
        effectMedium: "//div//h6[contains(text(), 'high')]",
        playlistFocus: "//p[contains(text(), Focus)]",
        playlistRelax: "//p[contains(text(), Relax)]",
        playlistSleep: "//p[contains(text(), Sleep)]",
        nextButtonInSplashScreen: "//button[contains(text(), 'Next')]",
        quizSkipButton: "//button[contains(text(), 'Take this quiz later')]",
        registerInputName: "//input[@id='name']",
        registerInputEmail: "//input[@id='email']",
        registerInputPassword: "//input[@id='password']",
        createAccountButton: "//button[contains(text(), 'Create Account')]",
        selectPlaylistPopUp: "//img[@alt='Lady working in focus mode']",
        trialEndLabel: "//div[contains(text(), 'Your trial has ended')]",
        //trialEndLabel: "//div[contains(text(), 'Your trial ends in 2 days')]",
        subscribeButton: "//button[contains(text(), 'Subscribe')]",
        closeButtonInActivitySelectPopUp: "//img[@data-testid='closeButton']",
        quizSkipButtonSecond: "//div[@data-testid='onboardingCardCloseButton']",
        splashScreenSkip: "//button[@data-testid='skipButton']",
    }

    window.onload = async function () {
        await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 15));
        window.confirm = function () {
            return true;
        };
        await console.log("Bypassing trial on brain.fm");
        await main();
    };

    async function main() {
        let isLogged = await checkLoginStatus();
        await console.log("Is user logged: " + isLogged);
        if (isLogged === true) {
            let trialExpired = await checkIfTrialIsExpired();
            await console.log("Is trial expired: " + trialExpired);
            if (trialExpired === true) {
                await console.log("Logging out");
                await logout();
                await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2));
                await register();
            } else if (trialExpired === false) {
                await console.log("Your trial is active");
                return;
            } else {
                await console.log("Can't check trial status, trying one more time in 60 seconds...");
                await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2 * 60));
                await main();
            }
        } else if (isLogged === false) {
            if (getElementByXpath(SELECTORS.registerInputEmail) != null || getElementByXpath(SELECTORS
                .registerInputEmail) !=
                undefined) {
                await register();
            } else {
                await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2));
                main();
            }
        } else {
            await console.log("can't check login status, exiting");
        }
    }
    async function register() {
        clickOnElement(SELECTORS.signUpButton);
        await console.log("Registering new account");
        fillFormAndRegister()
        await console.log("Filling complete");
        skipSplashScreen();
        await console.log("Register complete");
        clickOnElement(SELECTORS.splashScreenSkip);
        await executeAfterFoundInXpath(SELECTORS.selectPlaylistPopUp, choosePlaylist);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2 * 16));
        autoConfig();
    }
    // logs out user
    async function logout() {
        overrideConfirmFunction();
        clickOnElement(SELECTORS.profileHeadIcon);
        clickOnElement(SELECTORS.logoutButton);
    }
    // Automatically click ok on the confirm popup
    async function overrideConfirmFunction() {
        window.confirm = function () {
            return true;
        }
        unsafeWindow.confirm = function () {
            return true;
        }
    }
    async function autoConfig() {
        await console.log("Activity selected: " + ACTIVITY_TYPE);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT));
        await clickOnElement(SELECTORS.changeActivityButton);
        switch (ACTIVITY_TYPE) {
            case "learning":
                await clickOnElement(SELECTORS.activityLearning);
                break;
            case "work":
                await clickOnElement(SELECTORS.activityWork);
                break;
            case "creativity":
                await clickOnElement(SELECTORS.activityCreativity);
                break;
            default:
                break;
        }
        await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT));
        await console.log("Effect selected: " + EFFECT_LEVEL);
        switch (EFFECT_LEVEL) {
            case "low":
                await clickOnElement(SELECTORS.effectLow);
                break;
            case "medium":
                await clickOnElement(SELECTORS.effectMedium);
                break;
            case "strong":
                await clickOnElement(SELECTORS.effectMedium);
                break;
            default:
                break;
        }
        await clickOnElement(SELECTORS.closeButtonInActivitySelectPopUp);
        await console.log("Auto config complete");
    }
    async function choosePlaylist() {
        await console.log("Playlist selected: " + PLAYLIST);
        switch (PLAYLIST) {
            case "relax":
                await clickOnElement(SELECTORS.playlistRelax);
                break;
            case "focus":
                await clickOnElement(SELECTORS.playlistFocus);
                break;
            case "sleep":
                await clickOnElement(SELECTORS.playlistSleep);
                break;
            default:
                await clickOnElement(SELECTORS.playlistFocus);
                break;
        }
    }
    // skip all splash screen elements by just clicking them automatically
    async function skipSplashScreen() {
        for (let i = 0; i < 3; i++) {
            clickOnElement(SELECTORS.nextButtonInSplashScreen);
        }
        clickOnElement(SELECTORS.quizSkipButton);
    }
    // fill register form with random data and click submit button
    async function fillFormAndRegister() {
        let intervalId = setInterval(function () {
            let nameInput = getElementByXpath(SELECTORS.registerInputName);
            let emailInput = getElementByXpath(SELECTORS.registerInputEmail);
            let passwordInput = getElementByXpath(SELECTORS.registerInputPassword);
            if (nameInput && emailInput && passwordInput) {
                clearInterval(intervalId);
                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
                    .set.call(
                        nameInput, getRandomName());
                nameInput.dispatchEvent(new Event('input', {
                    bubbles: true
                }));
                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
                    .set.call(
                        emailInput, getRandomEmail());
                emailInput.dispatchEvent(new Event('input', {
                    bubbles: true
                }));
                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")
                    .set.call(
                        passwordInput, getRandomPassword());
                passwordInput.dispatchEvent(new Event('input', {
                    bubbles: true
                }));
                let submitButton = getElementByXpath("//button[@type='submit']");
                submitButton.click();
            }
        }, DEFAULT_TIMEOUT);
    }
    // Checks if login is successful, returns true if yes
    async function checkLoginStatus() {
        if (getElementByXpath(SELECTORS.profileHeadIcon) != null || getElementByXpath(SELECTORS.profileHeadIcon) !=
            undefined) {
            return true;
        } else {
            return false;
        }
    };
    // Check if trial is expired, returns true if yes
    async function checkIfTrialIsExpired() {
        if (getElementByXpath(SELECTORS.trialEndLabel) != null || getElementByXpath(SELECTORS.trialEndLabel) !=
            undefined) {
            return true;
        } else {
            return false;
        }
    }
    // Generates a random name for the user, returns a string
    function getRandomName() {
        return NAMES[Math.floor(Math.random() * NAMES.length)];
    }
    // Generates a random name for the email, returns a string
    function getRandomEmail() {
        const randomDomain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
        const randomString = Math.random()
            .toString(36)
            .substring(2, 8);
        return `${randomString}@${randomDomain}`;
    }
    // Generates a random password, returns a string
    function getRandomPassword() {
        return Array.from({
            length: 10
        }, () => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)])
            .join('');
    }
    // Gets an element from the XPath, returns the element
    function getElementByXpath(xPathToElement) {
        return document.evaluate(
            xPathToElement, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
        )
            .singleNodeValue;
    }
    // Execute function after element is found
    function executeAfterFoundInXpath(xpath, callback) {
        const element = getElementByXpath(xpath);
        if (element) {
            callback();
        } else {
            setTimeout(() => executeAfterFoundInXpath(xpath, callback), DEFAULT_TIMEOUT * 2);
        }
    }
    // Clicks on a element 
    function clickOnElement(path) {
        executeAfterFoundInXpath(path, function () {
            const element = getElementByXpath(path);
            if (element) {
                element.click();
            }
        });
    }
})();