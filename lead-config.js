/*
 * OMKARVIA - lead submission configuration
 * ----------------------------------------
 * The consultation popup posts the visitor's details (JSON) to `leadEndpoint`.
 * The popup shows "success" ONLY when that endpoint answers with a 2xx status.
 * While `leadEndpoint` is empty, the popup tells the visitor the online request
 * could not be sent and offers WhatsApp / phone instead - it never fakes success.
 *
 * To connect it, set leadEndpoint to a URL you control or trust, e.g.
 *   - your own backend route          'https://api.yourdomain.com/leads'
 *   - a form service you have signed up for (Formspree, Web3Forms, Getform ...)
 *     'https://formspree.io/f/XXXXXXXX'
 * Only PUBLIC endpoint URLs belong here. Never put API keys, passwords or secrets
 * in this file - it is downloaded by every visitor's browser.
 *
 * JSON body sent:
 *   { name, phone (+91XXXXXXXXXX), email, projectType, location,
 *     source, pageUrl, submittedAt }
 * The endpoint must allow CORS from your site's origin.
 */
window.OMKARVIA_CONFIG = {
  leadEndpoint: '',
  requestTimeoutMs: 15000
};
