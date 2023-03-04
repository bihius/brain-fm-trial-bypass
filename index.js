// ==UserScript==
// @name         Bypass trial on brain.fm
// @namespace    http://tampermonkey.net/
// @version      0.74
// @description  Autoregister on brain.fm when trial is ending
// @author       https://github.com/b3valsek
// @match        https://my.brain.fm/*
// @grant        unsafeWindow
// @updateURL    https://raw.githubusercontent.com/b3valsek/brain-fm-bypass/test/index.js
// @downloadURL  https://raw.githubusercontent.com/b3valsek/brain-fm-bypass/test/index.js
// @grant        unsafeWindow
// ==/UserScript==
(function () {
    // CONFIG 
    // choose default playlist (relax, focus, sleep)
    const playlist = "focus";
    // choose activity (work, learning, creativity)
    const activity = "learning";
    // TODO dodac aktywnosci dla innych playlist 
    // choose neural level (low, medium, high)
    const effect = "medium";

    const NAMES = ["Adam", "Ewa", "Michał", "Katarzyna", "Paweł", "Anna", "Tomasz", "Magdalena", "Krzysztof", "Monika", "Korbin", "Clovis"];
    const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
    const DOMAINS = [
        'armyspy.com', 'rhyta.com', 'dayrep.com', 'teleworm.us', 'superrito.com',
        'einrot.com', 'cuvox.de', 'gustr.com', 'fleckens.hu', 'glockenhofer.com',
        'jourrapide.com', 'speedpost.net', 'armyspy.net', 'rhyta.net', 'dayrep.net'
    ];
    const DEFAULT_TIMEOUT = 500;
    const elements = {
        profileIcon: "//div[@data-testid='profile-button']",
        singUpButton: "//a[@data-testid='sign-up']",
        activity: "//span[contains(text(), 'Activity')]",
        logoutButton: "//a[@data-testid='logout']",
        learning_music: "//div//child::p[contains(text(),'Use this music')]",
        work_music: "//div//child::p[contains(text(),'Music designed to facilitate cognitively')]",
        creativity_music: "//div//child::p[contains(text(),'Music designed to engage and inspire. ')]",
        low_effect: "//div//h6[contains(text(), 'low')]",
        medium_effect: "//div//h6[contains(text(), 'medium')]",
        strong_effect: "//div//h6[contains(text(), 'high')]",
        focus_playlist: "//p[contains(text(), Focus)]",
        relax_playlist: "//p[contains(text(), Relax)]",
        sleep_playlist: "//p[contains(text(), Sleep)]",
        next_button: "//button[contains(text(), 'Next')]",
        quiz: "//button[contains(text(), 'Take this quiz later')]",
        input_name: "//input[@id='name']",
        input_email: "//input[@id='email']",
        input_password: "//input[@id='password']",
        submit_button: "//button[contains(text(), 'Create Account')]",
        playlist_select: "//img[@alt='Lady working in focus mode']",
        trial_end: "//div[contains(text(), 'Your trial has ended.')]",
        //trial_end: "//div[contains(text(), 'Your trial ends in 3 days')]",
        subscribe: "//button[contains(text(), 'Subscribe')]",
        close_button: "//img[@data-testid='closeButton']",
        quiz2: "//div[@data-testid='onboardingCardCloseButton]'",
    }

    'use strict';

    document.addEventListener("DOMContentLoaded", async function () {
        await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 15));
        window.confirm = function () {
            return true;
        };
        await console.log("Bypassing trial on brain.fm");
        await main();
    });

    async function main() {
        let isLogged = await checkLoginStatus();
        await console.log("Is user logged: " + isLogged);
        if (isLogged == true) {
            await console.log("checking trial status");
            let trialExpired = await checkIfTrialIsExpired();
            await console.log("Is trial expired: " + trialExpired);
            if (trialExpired == true) {
                await console.log("Logging out");
                await logout();
                await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2));
                await register();
            } else if (trialExpired == false) {
                await console.log("Your trial is active");
                return;
            } else {
                await console.log("Can't check trial status, trying one more time in 60 seconds...");
                await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2 * 60));
                await main();
            }
        } else if (isLogged == false) {
            if (getElementByXpath(elements.singUpButton) != null || getElementByXpath(elements.singUpButton) != undefined) {
                setTimeout(main, DEFAULT_TIMEOUT * 2);
            } else {
                await register();
            }
        } else {
            await console.log("can't check login status, exiting");
        }
    }

    async function register() {
        clickOnElement(elements.singUpButton);
        await console.log("Registering new account");
        fillFormAndRegister()
        await console.log("Filling complete");
        skipSplashScreen();
        await console.log("Register complete");
        await executeAfterFoundInXpath(elements.playlist_select, choosePlaylist);
        await new Promise(resolve => setTimeout(resolve, DEFAULT_TIMEOUT * 2 * 12));
        autoConfig();
    }
    // logs out user
    async function logout() {
        overrideConfirmFunction();
        clickOnElement(elements.profileIcon);
        clickOnElement(elements.logoutButton);
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
        await console.log("Activity selected: " + activity);
        await clickOnElement(elements.activity);
        switch (activity) {
            case "learning":
                clickOnElement(elements.learning_music);
                break;
            case "work":
                clickOnElement(elements.work_music);
                break;
            case "creativity":
                clickOnElement(elements.creativity_music);
                break;
            default:
                break;
        }
        await console.log("Effect selected: " + effect);
        switch (effect) {
            case "low":
                clickOnElement(elements.low_effect);
                break;
            case "medium":
                clickOnElement(elements.medium_effect);
                break;
            case "strong":
                clickOnElement(elements.strong_effect);
                break;
            default:
                break;
        }
        clickOnElement(elements.close_button);
        await console.log("Auto config complete");
    }

    async function choosePlaylist() {
        await console.log("Playlist selected: " + playlist);
        switch (playlist) {
            case "relax":
                clickOnElement(elements.relax_playlist);
                break;
            case "focus":
                clickOnElement(elements.focus_playlist);
                break;
            case "sleep":
                clickOnElement(elements.sleep_playlist);
                break;
            default:
                clickOnElement(elements.focus_playlist);
                break;
        }
    }
    // skip all splash screen elements by just clicking them automatically
    async function skipSplashScreen() {
        for (let i = 0; i < 3; i++) {
            clickOnElement(elements.next_button);
        }
        clickOnElement(elements.quiz);
    }
    // fill register form with random data and click submit button
    async function fillFormAndRegister() {
        var intervalId = setInterval(function () {
            var nameInput = getElementByXpath(elements.input_name);
            var emailInput = getElementByXpath(elements.input_email);
            var passwordInput = getElementByXpath(elements.input_password);

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

    // Checks if login is successful, returns true if yes
    function checkLoginStatus() {
        if (getElementByXpath(elements.profileIcon) != null || getElementByXpath(elements.profileIcon) != undefined) {
            return true;
        }
        else {
            return false;
        }
    };
    // Check if trial is expired, returns true if yes
    function checkIfTrialIsExpired() {
        if (getElementByXpath(elements.trial_end) != null || getElementByXpath(elements.trial_end) != undefined) {
            return true;
        }
        else {
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
        const randomString = Math.random().toString(36).substring(2, 8);
        return `${randomString}@${randomDomain}`;
    }
    // Generates a random password, returns a string
    function getRandomPassword() {
        return Array.from({ length: 10 }, () => CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]).join('');
    }
    // Gets an element from the XPath, returns the element
    function getElementByXpath(xPathToElement) {
        return document.evaluate(
            xPathToElement,
            document,
            null,
            XPathResult.FIRST_ORDERED_NODE_TYPE,
            null
        ).singleNodeValue;
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

