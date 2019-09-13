const { ipcRenderer, shell } = require('electron');
const fs = require('fs');
const JSEncrypt = require('node-jsencrypt');

let encrypter = new JSEncrypt();

let key
let reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

// hide the background register modal
$("#register-form").hide();

// Retrieve encryption key and send it to the main window so we can call it when sending requests once logged in (May implement an inital call then interval of retrieval to prevent e/d problems)
$.get("http://localhost:3001/publicKey", function(resp) {
    key = resp;
    encrypter.setPublicKey(key);
    ipcRenderer.send('passKey()', key);
})




$(function() {

    // Send call to main.js to kill program
    $("#exitButton").click(function() {
        1
        ipcRenderer.send('exitProgram()');
    });

    // Does nothing for now.
    $("#Sign-in").click(function(e) {

        e.preventDefault();
        $("#alertDiv").show();



    });

    // When register-confirm-btn is clicked, we make a ton of calls.
    $("#register-confirm-btn").click(function(e) {

        // Hide alert div (aesthetic appeal)
        $("#alertDiv").hide();

        // Prevent the event from firing
        e.preventDefault();


        // grab values
        let email = $("#register-email").val();
        let user = $("register-username").val();
        let pass = $("register-password").val();
        let confirm = $("register-confirm").val();


        // clear values (aesthetic & functionality)
        $("#register-email").val("");
        $("#register-username").val("");
        $("#register-password").val("");
        $("#register-confirm").val("");

        // If the email isn't similar to the regexp, throw error "The enter email is invalid."
        if (!email.match(reg)) {
            $("#alertSpan").text("The entered email is invalid.");
            $("#alertDiv").show();
        } else { // email exist in database?

            // send a post request to the server (for testing purposes it just contacts my local machine for now)
            // Yes, I know, Jquery has a req lib, I'm just more familiar with req-headers with the fetch library
            fetch("http://localhost:3001/emailExists", {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                redirect: 'follow',
                referrer: 'no-referrer',
                // Encrypt the payload
                body: `{"a": "${encrypter.encrypt(email)}"}`
            }).then(r => r.text()).then(result => { // retrieve result and convert it to text
                // if result is 1, we throw an error
                if (result == 1) {
                    $("#alertSpan").text("This email is already registered to an account.");
                    $("#alertDiv").show();
                } else {
                    // continue checking values. Maybe a future implemntation can push all of the data at once, then the server sends a package of responses
                    // it would work, as if one of user / email returns a 1 the account creation process will not continue. Past that, just grab which one and pull from a config.json for the err message

                    /*
                    Just a test example of this (very low level theoretical code lmao)
                    send(user, email)

                    check(user, email)

                    format({"user" result, "email" result})
                    For documentation sakes, let's make user true and email false.

                    send(package)

                    case user : %config_user_exists_error%
                    case email: %config_email_exists_error%
                    Would completely remove the need for doing multiple calls. I may add this, I don't know. For now, this will be fine.
                    */

                }
            });
        }

    })

    // I tried doing a fancy embed thing, but neither electron nor github was very fond of that, so let's just push it to their browser
    $("#github-footer").click(function() {
        shell.openExternal('https://github.com/SpecifiesDev');
    })

    // Let's prevent the default BS close, and implement a fadeout. Purely aesthetic.
    $('#alertDiv').on('close.bs.alert', function(e) {
        e.preventDefault();

        $("#alertDiv").fadeOut();
    });

    // Do everything to pull up the register modal
    $("#signupClick").click(function() {
        $("#alertDiv").hide();
        $('#register-form').show();
        $('#login-form').hide();
    });

    // Return to login.
    $("#register-close").click(function(e) {
        e.preventDefault();
        $("#alertDiv").hide();
        // We time out because the fadeout takes time to perform.
        setTimeout(() => {
            $('#login-form').show();
        }, 500);
        $('#register-form').fadeOut();
    });


});

// Prevent enter key from being pressed at all. (May just changed it to enter form data, but for now this is okay)
function handleKeyPress(elem, e) {
    let charCode;
    if (e && e.which) {
        charCode = e.which;
    } else if (window.event) {
        e = window.event;
        charCode = e.keyCode;
    }
    if (charCode == 13) {
        e.preventDefault();
    }
}
