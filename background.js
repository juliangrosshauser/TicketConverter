// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(() => {
  // Replace all rules ...
  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    // With a new rule ...
    chrome.declarativeContent.onPageChanged.addRules([
      {
        // That fires when a page's URL is 'pspdfkit.zendesk.com'...
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'pspdfkit.zendesk.com' }
          })
        ],
        // And shows the extension's page action.
        actions: [ new chrome.declarativeContent.ShowPageAction() ]
      }
    ]);
  });
});

chrome.pageAction.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, "GetTicketContent", content => {
    if (content != null) {
      let textContent = `**Email:** ${content.email}`;

      if (content.licenseID != null) {
        textContent = `**License ID:** ${content.licenseID}\\n${textContent}`;
      }

      if (content.value != null) {
        textContent += `\\n**Customer Value:** ${content.value}`;
      }

      let additionalLabels = [];

      if (content.version != null) {
        textContent += `\\n**Last Downloaded Version:** ${content.version}`;

        if (content.version.indexOf('iOS') != -1) {
          additionalLabels.push('iOS');
        }

        if (content.version.indexOf('Android') != -1) {
          additionalLabels.push('Android');
        }
      }

      textContent += `\\n**Zendesk Ticket:** ${tab.url}\\n\\n---\\n\\n`;

      chrome.tabs.create({ "url": "https://github.com/PSPDFKit/PSPDFKit/issues/new" }, new_tab => {
        chrome.tabs.executeScript(new_tab.id, { "code": `
          window.onload = () => {
            document.getElementById('issue_body').value = "${textContent}";
            document.querySelector('[data-hotkey="l"]').click();
            document.querySelector('input[value="customer-issue"]').click();
            ${addLabel(additionalLabels[0])}
            ${addLabel(additionalLabels[1])}
            document.querySelector('[data-hotkey="l"]').click();
          };
        `});
      });
    }
  });
});

const addLabel = function(label) {
  if (label !== undefined) {
    return `document.querySelector('input[value="${label}"]').click();`;
  }
};
