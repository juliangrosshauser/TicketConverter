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
      let textContent = `Email: ${content.email}`;

      if (content.licenseID != null) {
        textContent = `License ID: ${content.licenseID}\\n${textContent}`;
      }

      if (content.value != null) {
        textContent += `\\nCustomer Value: ${content.value}`;
      }

      if (content.version != null) {
        textContent += `\\nLast Downloaded Version: ${content.version}`;
      }

      textContent += `\\nZendesk Ticket: ${tab.url}\\n\\n`;

      chrome.tabs.create({ "url": "https://github.com/PSPDFKit/PSPDFKit/issues/new" }, new_tab => {
        chrome.tabs.executeScript(new_tab.id, { "code": `document.getElementById('issue_body').value = "${textContent}";` });
      });
    }
  });
});
