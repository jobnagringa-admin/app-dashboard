/**
 * Clerk Authentication Helper Functions
 * Migrated from legacy Webflow site
 */

var COOKIE_NAME = 'user';
var LOCAL_KEY = 'user';
var COOKIE_TTL = 86400;

function setCookie(e, n, t, o) {
  var r = [encodeURIComponent(e) + '=' + encodeURIComponent(n), 'path=/', 'max-age=' + t];
  o && o.domain && r.push('domain=' + o.domain);
  o && o.secure && r.push('secure');
  o && o.sameSite && r.push('samesite=' + o.sameSite);
  document.cookie = r.join('; ');
}

function persistUserData(e) {
  window.user = e;
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(e));
  } catch (e) {}
  try {
    var n = null,
      t = null;
    e && e.primaryEmailAddress && e.primaryEmailAddress.emailAddress
      ? (n = e.primaryEmailAddress.emailAddress)
      : e &&
        e.emailAddresses &&
        e.emailAddresses.length &&
        (n = (e.emailAddresses[0] && e.emailAddresses[0].emailAddress) || null);
    e && e.primaryPhoneNumber && e.primaryPhoneNumber.phoneNumber
      ? (t = e.primaryPhoneNumber.phoneNumber)
      : e &&
        e.phoneNumbers &&
        e.phoneNumbers.length &&
        (t = (e.phoneNumbers[0] && e.phoneNumbers[0].phoneNumber) || null);
    var o = {
        firstName: (e && e.firstName) || null,
        phoneNumber: t,
        email: n,
        publicMetadata: (e && e.publicMetadata) || {},
      },
      r = 'https:' === window.location.protocol,
      a = window.location.hostname,
      i =
        a.slice(-'.jobnagringa.com.br'.length) === '.jobnagringa.com.br'
          ? '.jobnagringa.com.br'
          : void 0;
    setCookie(COOKIE_NAME, JSON.stringify(o), COOKIE_TTL, {
      secure: r,
      sameSite: 'Strict',
      domain: i,
    });
  } catch (e) {}
}

function getUserFromCookie() {
  try {
    for (
      var e = document.cookie ? document.cookie.split(';') : [], n = null, t = 0;
      t < e.length;
      t++
    ) {
      var o = e[t].replace(/^\s+|\s+$/g, '');
      if (0 === o.indexOf(COOKIE_NAME + '=')) {
        n = o;
        break;
      }
    }
    if (!n) return null;
    var r = '';
    try {
      r = decodeURIComponent(n.split('=')[1] || '');
    } catch (e) {
      r = '';
    }
    if (!r) return null;
    var a = null;
    try {
      a = window.JSON && JSON.parse ? JSON.parse(r) : null;
    } catch (e) {
      a = null;
    }
    return a;
  } catch (e) {
    return null;
  }
}

function userShouldBeLoggedIn() {
  try {
    var e = getUserFromCookie();
    if (!e) {
      var n = encodeURIComponent(window.location.href);
      return void (window.location.href =
        'https://accounts.jobnagringa.com.br/sign-in?redirect_url=' + n);
    }
    window.console && console.log && console.log('User logged in with email:', e.email || null);
  } catch (e) {
    var t = encodeURIComponent(window.location.href);
    window.location.href = 'https://accounts.jobnagringa.com.br/sign-in?redirect_url=' + t;
  }
}

function userIsPaidCustomer() {
  try {
    var e = getUserFromCookie();
    return !!(e && e.publicMetadata && e.publicMetadata.isPaidCustomer === !0);
  } catch (e) {
    return !1;
  }
}

function populateFirstNameFromUser() {
  try {
    var e = getUserFromCookie();
    if (!e) return;
    var n = '';
    e.firstName && '' !== String(e.firstName).replace(/^\s+|\s+$/g, '')
      ? (n = String(e.firstName).replace(/^\s+|\s+$/g, ''))
      : e.fullName && '' !== String(e.fullName).replace(/^\s+|\s+$/g, '')
        ? (n = String(e.fullName)
            .replace(/^\s+|\s+$/g, '')
            .split(/\s+/)[0])
        : e.username &&
          '' !== String(e.username).replace(/^\s+|\s+$/g, '') &&
          (n = String(e.username).replace(/^\s+|\s+$/g, ''));
    if (!n) return;
    for (
      var t = document.querySelectorAll
          ? document.querySelectorAll('[data-ms-member="first-name"]')
          : [],
        o = 0;
      o < t.length;
      o++
    )
      'value' in t[o] ? (t[o].value = n) : (t[o].textContent = n);
  } catch (e) {}
}

function handleCommunityContent() {
  try {
    for (
      var e = userIsPaidCustomer()
          ? '[data-ms-content="!community"]'
          : '[data-ms-content="community"]',
        n = document.querySelectorAll ? document.querySelectorAll(e) : [],
        t = 0;
      t < n.length;
      t++
    ) {
      var o = n[t];
      o && o.parentNode && o.parentNode.removeChild(o);
    }
  } catch (e) {}
}

// Initialize Clerk integration
!(function () {
  function e() {
    if (!window.Clerk || !Clerk.load) return;
    var e = null;
    try {
      e = Clerk.load();
    } catch (e) {}
    e && e.then
      ? e
          .then(function () {
            try {
              var e = Clerk.user;
              e && persistUserData(e);
            } catch (e) {}
          })
          .catch(function () {})
      : setTimeout(function () {
          try {
            var e = Clerk.user;
            e && persistUserData(e);
          } catch (e) {}
        }, 1e3);
  }
  window.addEventListener
    ? window.addEventListener('load', e)
    : window.attachEvent
      ? window.attachEvent('onload', e)
      : (function (e) {
          var n = window.onload;
          window.onload = function (t) {
            (n && n.call(e, t), e());
          };
        })(e);
})();

function runDomFuncs() {
  populateFirstNameFromUser();
  handleCommunityContent();
}

document.addEventListener
  ? (document.addEventListener('DOMContentLoaded', runDomFuncs),
    window.addEventListener && window.addEventListener('load', runDomFuncs))
  : document.attachEvent
    ? (document.attachEvent('onreadystatechange', function () {
        'complete' === document.readyState && runDomFuncs();
      }),
      window.attachEvent && window.attachEvent('onload', runDomFuncs))
    : (function (e) {
        var n = window.onload;
        window.onload = function (t) {
          (n && n.call(e, t), runDomFuncs());
        };
      })(window);

// Community content visibility handler (minified version)
!(function () {
  function e() {
    try {
      for (
        var e = 'user', t = document.cookie ? document.cookie.split(';') : [], n = null, o = 0;
        o < t.length;
        o++
      ) {
        var r = t[o].replace(/^\s+|\s+$/g, '');
        if (0 === r.indexOf(e + '=')) {
          n = r;
          break;
        }
      }
      if (!n) return null;
      var a = '';
      try {
        a = decodeURIComponent(n.split('=')[1] || '');
      } catch (e) {
        a = '';
      }
      if (!a) return null;
      var c = null;
      try {
        c = window.JSON && JSON.parse ? JSON.parse(a) : null;
      } catch (e) {
        c = null;
      }
      return c;
    } catch (e) {
      return null;
    }
  }
  function t() {
    var t = e();
    return !!(t && t.publicMetadata && t.publicMetadata.isPaidCustomer === !0);
  }
  function n(e, t) {
    try {
      for (var n, o = document.getElementsByTagName('*'), r = o.length - 1; r >= 0; r--)
        ((n = o[r]),
          n &&
            n.getAttribute &&
            n.getAttribute(e) === t &&
            n.parentNode &&
            n.parentNode.removeChild(n));
    } catch (e) {}
  }
  function o() {
    t() ? n('data-ms-content', '!community') : n('data-ms-content', 'community');
  }
  o();
  document.addEventListener
    ? (document.addEventListener('DOMContentLoaded', o),
      window.addEventListener && window.addEventListener('load', o))
    : document.attachEvent
      ? (document.attachEvent('onreadystatechange', function () {
          'complete' === document.readyState && o();
        }),
        window.attachEvent && window.attachEvent('onload', o))
      : (function (e) {
          var t = window.onload;
          window.onload = function (n) {
            (t && t.call(e, n), o());
          };
        })(window);
})();
