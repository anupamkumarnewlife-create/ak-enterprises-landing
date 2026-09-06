/* AK Enterprises - lead capture.
 *
 * Posts form submissions straight to Supabase's REST API. No SDK, no CDN:
 * the forms are the only way leads reach the business, so they should not
 * depend on a third-party script loading.
 *
 * The key below is the *publishable* key and is meant to be public. It can
 * only INSERT into leads / lead_surveys - reading, updating and deleting are
 * blocked by row-level security, and status/notes are not insertable at all.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://yasmylhhnltrgufwsxoe.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_K-YcEeRGFhuGsMspFP1kfQ_BgeJTR7H';
  var LEAD_KEY = 'ak_lead_id';
  var TIMEOUT_MS = 15000;

  // The client mints the row id itself: the public role has no SELECT rights,
  // so there is no way to read a database-generated id back.
  function uuid() {
    if (window.crypto && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      var v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  function clip(value, max) {
    if (value === null || value === undefined) return null;
    var s = String(value).trim();
    if (!s) return null;
    return s.length > max ? s.slice(0, max) : s;
  }

  function queryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function post(table, row) {
    var ctrl = window.AbortController ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, TIMEOUT_MS) : null;

    return fetch(SUPABASE_URL + '/rest/v1/' + table, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': 'Bearer ' + SUPABASE_KEY,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(row),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (res) {
      if (timer) clearTimeout(timer);
      if (!res.ok) {
        return res.text().then(function (body) {
          throw new Error('supabase ' + res.status + ': ' + body);
        });
      }
      return true;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  /* Saves a lead. Resolves with the new lead id, rejects if it did not save. */
  window.akSubmitLead = function (form, source) {
    var data = new FormData(form);
    var id = uuid();

    return post('leads', {
      id: id,
      name: clip(data.get('name'), 120) || '-',
      mobile: clip(data.get('mobile'), 30) || '-',
      area: clip(data.get('area'), 160) || '-',
      leakage_type: clip(data.get('type'), 40) || 'other',
      source: source === 'modal' ? 'modal' : 'hero',
      page_url: clip(window.location.href, 500),
      referrer: clip(document.referrer, 500),
      utm_source: clip(queryParam('utm_source'), 120),
      utm_medium: clip(queryParam('utm_medium'), 120),
      utm_campaign: clip(queryParam('utm_campaign'), 160),
      user_agent: clip(navigator.userAgent, 500)
    }).then(function () {
      try { sessionStorage.setItem(LEAD_KEY, id); } catch (e) { /* private mode */ }
      return id;
    });
  };

  /* Saves the thank-you page survey, linked to the lead when we still know it. */
  window.akSubmitSurvey = function (form) {
    var data = new FormData(form);
    var leadId = null;
    try { leadId = sessionStorage.getItem(LEAD_KEY); } catch (e) { /* private mode */ }

    return post('lead_surveys', {
      lead_id: leadId || null,
      leak_location: clip(data.get('where'), 60),
      duration: clip(data.get('since'), 60),
      tried_before: clip(data.get('tried'), 60)
    });
  };
})();
