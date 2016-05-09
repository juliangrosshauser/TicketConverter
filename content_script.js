String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message == 'GetTicketContent') {
    sendResponse(getContent());
  }
});

const getContent = () => {
  const email = document.evaluate('//div[contains(@class, "ember-view workspace") and (not(@style) or @style!="display: none;")]//span[@class="ember-view sender"]/a[@class="email"]', document, null, XPathResult.STRING_TYPE, null).stringValue;
  if (email == null || email === '') {
    return null;
  }
  let content = { email };

  const firstParagraph = document.evaluate('(//div[contains(@class, "ember-view workspace") and (not(@style) or @style!="display: none;")]//div[@class="zd-comment"])[last()]/p[1]', document, null, XPathResult.STRING_TYPE, null).stringValue;
  if (firstParagraph.startsWith('License ID:')) {
    const prefixedLicenseID = firstParagraph.split('\n')[0];
    const licenseID = prefixedLicenseID.replace(/^.+: /, '');
    content.licenseID = licenseID;
  }

  let value = document.evaluate('//div[contains(@class, "ember-view workspace") and (not(@style) or @style!="display: none;")]//div[@class="factbranch_success_screen"]/div[@class="factbranch_item "][2]/div[@class="factbranch_item_value"]', document, null, XPathResult.STRING_TYPE, null).stringValue;
  if (value == "low" || value == "okay" || value == "high") {
    switch (value) {
      case 'low':
        value += ' ⭕️';
        break;
      case 'okay':
        value += ' ⏺';
        break;
      case 'high':
        value += ' ✳️';
        break;
      default:
        break;
    }

    content.value = value.capitalize();
  } else {
    // HACK: An internal comment shifts the `factbranch_item`s by one.
    value = document.evaluate('//div[contains(@class, "ember-view workspace") and (not(@style) or @style!="display: none;")]//div[@class="factbranch_success_screen"]/div[@class="factbranch_item "][3]/div[@class="factbranch_item_value"]', document, null, XPathResult.STRING_TYPE, null).stringValue;
    if (value == "low" || value == "okay" || value == "high") {
      switch (value) {
        case 'low':
          value += ' ⭕️';
          break;
        case 'okay':
          value += ' ⏺';
          break;
        case 'high':
          value += ' ✳️';
          break;
        default:
          break;
      }

      content.value = value.capitalize();
    }
  }

  let version = document.evaluate('//div[contains(@class, "ember-view workspace") and (not(@style) or @style!="display: none;")]//div[@class="factbranch_success_screen"]/div[@class="factbranch_item "][3]//div[@class="factbranch_item_value"]', document, null, XPathResult.STRING_TYPE, null).stringValue;
  if (version.startsWith('PSPDFKit for ')) {
    content.version = version;
  } else {
    // HACK: An internal comment shifts the `factbranch_item`s by one.
    version = document.evaluate('//div[contains(@class, "ember-view workspace") and (not(@style) or @style!="display: none;")]//div[@class="factbranch_success_screen"]/div[@class="factbranch_item "][4]//div[@class="factbranch_item_value"]', document, null, XPathResult.STRING_TYPE, null).stringValue;
    if (version.startsWith('PSPDFKit for ')) {
      content.version = version;
    }
  }

  return content;
};
