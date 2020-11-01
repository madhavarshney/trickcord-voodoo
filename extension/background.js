const client = new Faye.Client('http://localhost:8000/faye');

const getScript = (toCopy) => `
window.focus();

setTimeout(() => {
    // From https://stackoverflow.com/a/18455088
    function copyTextToClipboard(text) {
        // Create a textbox field where we can insert text to.
        var copyFrom = document.createElement("textarea");

        // Set the text content to be the text you wished to copy.
        copyFrom.textContent = text;

        // Append the textbox field into the body as a child.
        // "execCommand()" only works when there exists selected text, and the text is inside
        // document.body (meaning the text is part of a valid rendered HTML element).
        document.body.appendChild(copyFrom);

        // Select all the text!
        copyFrom.select();

        // Execute command
        document.execCommand('copy');

        // (Optional) De-select the text using blur().
        copyFrom.blur();

        // Remove the textbox field from the document.body, so no other JavaScript nor
        //other elements can get access to this.
        document.body.removeChild(copyFrom);
    }

    const messageList = document.querySelector('[data-list-id="chat-messages"]');
    const input = document.querySelectorAll('[contenteditable=true]')[1];

    messageList.dispatchEvent(new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        charCode: 0,
        code: "Escape",
        key: "Escape",
        keyCode: 27,
        location: 0,
        which: 27
    }));

    setTimeout(() => {
        messageList.dispatchEvent(new KeyboardEvent('keyup', {
            bubbles: true,
            cancelable: true,
            charCode: 0,
            code: "Escape",
            key: "Escape",
            keyCode: 27,
            location: 0,
            which: 27
        }));

        copyTextToClipboard("${toCopy}");
        document.execCommand("paste");

        setTimeout(() => {
            input.dispatchEvent(new KeyboardEvent('keydown', {
                bubbles: true,
                cancelable: true,
                charCode: 0,
                code: "Enter",
                key: "Enter",
                keyCode: 13,
                location: 0,
                which: 13
            }));

            setTimeout(() => {
                input.dispatchEvent(new KeyboardEvent('keyup', {
                    bubbles: true,
                    cancelable: true,
                    charCode: 0,
                    code: "Enter",
                    key: "Enter",
                    keyCode: 13,
                    location: 0,
                    which: 13
                }));
            }, 50);
        }, 100)
    }, 50);
}, 0);
`;

client.subscribe('/messages', (message) => {
    chrome.tabs.query({ url: `https://discord.com/channels/${message.guild}/${message.channel}` }, (tabs) => {
        if (tabs && tabs.length) {
            chrome.tabs.executeScript(tabs[0].id, {
                code: getScript(message.text)
            });
        } else {
            alert('You missed a trick or treat!');
        }
    });
});
