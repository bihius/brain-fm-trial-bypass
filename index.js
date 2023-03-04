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
// ==/UserScript==
(async function () {
    // CONFIG 
    // choose default playlist (relax, focus, sleep)
    const playlist = "focus";
    // choose activity (work, learning, creativity)
    const activity = "work";
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
        low_effect: "//div//child::p[contains(text(),'Use this effect level if you are generally sensitive to sounds, or if ')]",
        medium_effect: "//div//child::p[contains(text(),'Our standard level of neural phase locking is a great place to start. ')]",
        strong_effect: "//div//child::p[contains(text(),'Try the strongest level of our neural phase locking technology if ')]",
        focus_playlist: "//p[contains(text(), Focus)]",
        relax_playlist: "//p[contains(text(), Relax)]",
        sleep_playlist: "//p[contains(text(), Sleep)]",
        next_button: "//button[contains(text(), 'Next')]",
        quiz: "//button[contains(text(), 'quiz')]",
        input_name: "//input[@id='Name']",
        input_email: "//input[@id='Email']",
        input_password: "//input[@id='Password']",
        submit_button: "//button[contains(text(), 'Create Account')]",
        playlist_select: "//img[@alt='Lady working in focus mode']",
        trial_end: "//div[contains(text(), 'Your trial has ended.')]",
        subscribe: "//button[contains(text(), 'Subscribe')]",
    }

    'use strict';
    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(() => {
            console.log("Bypassing trial on brain.fm");
            main();
        }, DEFAULT_TIMEOUT * 20);

    });
    // Checks if user is logged in, if yes checks if user is on last trial day if yes it log's out and register new account
    async function main() {

        let isLogged = checkLoginStatus();
        console.log("Is user logged: " + isLogged);
        if (isLogged == true) {
            console.log("checking trial status");
            let trialExpired = checkIfTrialIsExpired();
            console.log("Is trial expired: " + trialExpired);
            if (trialExpired == true) {
                console.log("Logging out");
                await logout();
                console.log("registering new account");
                await register();
            }
            else if (trialExpired == false) {
                console.log("Your trial is active");
                return;
            }
            else {
                console.log("Can't check trial status, trying one more time in 60 seconds...");
                setTimeout(main, DEFAULT_TIMEOUT * 2);
            }
        }
        else if (isLogged == false) {
            register();
        }
        else {
            console.log("can't check login status, exiting");
        }
    }

    async function register() {
        return new Promise(resolve => {
            let isPageLoaded = waitForPageIsLoaded();
            if (isPageLoaded) {
                clickOnElement(elements.singUpButton);
                fillFormAndRegister().then(() => {
                    skipSplashScreen();
                    skipQuiz();
                    console.log("register complete");
                    executeAfterFoundInXpath(elements.playlist_select, choosePlaylist);
                    executeAfterFoundInXpath(elements.activity, autoConfig);
                    resolve();
                });
            }
            else {
                console.log("Page is not loaded");
                setTimeout(async () => {
                    await register();
                    resolve();
                }, DEFAULT_TIMEOUT);
            }
        });
    }


    // logs out user
    async function logout() {
        return new Promise(resolve => {
            let isPageLoaded = waitForPageIsLoaded();
            if (!isPageLoaded) {
                setTimeout(async () => {
                    await logout();
                    resolve();
                }, DEFAULT_TIMEOUT);
            } else {
                overrideConfirmPopup();
                clickOnElement(elements.profileIcon);
                clickOnElement(elements.logoutButton);
                console.log("logout complete");
                resolve();
            }
        });
    }

    // Overrides confirm popup by closing it
    function overrideConfirmPopup() {
        window.confirm = function (message) {
            const beforeConfirmEvent = new Event("beforeconfirm");
            document.dispatchEvent(beforeConfirmEvent);
            return true;
        };
        document.addEventListener("beforeconfirm", handleConfirm);
    }
    // Handles confirm popup
    function handleConfirm(event) {
        event.preventDefault();
        const confirmButton = document.querySelector('#popup_ok');
        if (confirmButton) {
            confirmButton.click();
        }
    }

    function autoConfig() {
        console.log("auto config...");
        switch (activity) {
            case "learning":
                getElementByXpath(elements.learning_music).click();
                break;
            case "work":
                getElementByXpath(elements.work_music).click();
                break;
            case "creativity":
                getElementByXpath(elements.creativity_music).click();
                break;
            default:
                break;
        }
        switch (effect) {
            case "low":
                getElementByXpath(elements.low_effect).click();
                break;
            case "medium":
                getElementByXpath(elements.medium_effect).click();
                break;
            case "strong":
                getElementByXpath(elements.strong_effect).click();
                break;
            default:
                break;
        }
        console.log("config complete");
    }


    function choosePlaylist() {
        console.log("chossing playlist...");
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
    function skipSplashScreen() {
        for (let i = 0; i < 3; i++) {
            clickOnElement(elements.next_button);
        }
    }
    // skip quiz
    function skipQuiz() {
        const quiz = getElementByXpath(elements.quiz);
        if (quiz != null || quiz != undefined) {
            quiz.click();
        }
        else {
            console.log("quiz does not exist")
        }
    }
    // fill register form with random data and click submit button
    function fillFormAndRegister() {
        return new Promise(resolve => {
            setTimeout(() => {
                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(getElementByXpath(elements.input_name), getRandomName());
                nameInput.dispatchEvent(new Event('input', { bubbles: true }));

                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(getElementByXpath(elements.input_email), getRandomEmail());
                emailInput.dispatchEvent(new Event('input', { bubbles: true }));

                Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set.call(getElementByXpath(elements.input_password), getRandomPassword());
                passwordInput.dispatchEvent(new Event('input', { bubbles: true }));

                var submitButton = getElementByXpath("//button[@type='submit']");
                submitButton.click();

                resolve();
            }, DEFAULT_TIMEOUT);
        });
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
    // Checks if all page elements are loaded, returns true if yes
    function waitForPageIsLoaded() {
        if (document.readyState === 'complete') {
            console.log("page is loaded");
            return true;
        }
        else {
            setTimeout(waitForPageIsLoaded, DEFAULT_TIMEOUT);
        }
    }
    // Execute function after element is found
    function executeAfterFoundInXpath(xpath, callback) {
        const element = getElementByXpath(xpath);

        if (element) {
            callback();
        } else {
            setTimeout(() => executeAfterFoundInXpath(xpath, callback), DEFAULT_TIMEOUT);
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

