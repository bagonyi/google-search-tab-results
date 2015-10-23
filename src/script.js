console.log('Extension loaded.');

function onResultsAvailable(callback) {
    var retries = 0,
        timer = window.setInterval(function () {
            var div = document.getElementById('ires');
            console.log('Checking if #ires is available..');
            if (div && div.offsetParent !== null) {
                console.log('#ires is available and visible, running setup()..');
                window.clearInterval(timer);
                callback();
            }

            if (retries++ > 100) {
                console.log('#ires was not available after 1 second..');
                window.clearInterval(timer);
            }
        }, 10);
}

function getElementsByXpath(xpath, contextNode) {
    var xpathResult,
        results = [],
        element;

    if (contextNode === undefined) {
        xpathResult = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE, null);
    } else {
        xpathResult = contextNode.evaluate(xpath, contextNode, null, XPathResult.ANY_TYPE, null);
    }

    element = xpathResult.iterateNext();
    while (element) {
        results[results.length] = element;
        element = xpathResult.iterateNext();
    }

    return results;
}

function setup() {
    var results = getElementsByXpath('//div[@id="ires"]//a[not(@class) and not(@data-ved) and @href]'),
        //results = document.querySelectorAll('.srg a:not(.fl):not(._Fmb):not([data-ved])'),
        resultsLength = results.length,
        focusedResult = window.sessionStorage.selectedResult || 0,
        timer,
        retries = 0;

    console.log('In setup');

    for (var i = 0; i < resultsLength; i++) {
        results[i].tabIndex = 1000 + i;

        (function (i) {
            results[i].addEventListener('click', function () {
                window.sessionStorage.selectedResult = i;
            });
        }(i));
    }

    if (document.getElementById('pnnext')) {
        document.getElementById('pnnext').tabIndex = 1001 + resultsLength;
        document.getElementById('pnnext').onkeydown = function (event) {
            var char = event.which || event.keyCode;
            if (char === 9) {
                results[0].focus();
                return false;
            }
        }
    }

    timer = window.setInterval(function () {
        if (retries++ > 50) {
            window.clearInterval(timer);
            console.log('Max retries.. clearing interval.');
        }

        document.body.focus();
        results[focusedResult].focus();

        if (results[focusedResult] !== document.activeElement) {
            console.log('Not active yet. Retry');
            return;
        }

        console.log('Focused. All ok.');

        window.clearInterval(timer);
    }, 10);
}

onResultsAvailable(setup);

window.onhashchange = function () {
    console.log('Hash changed running onResultsAvailable(setup)..');
    window.sessionStorage.selectedResult = 0;
    onResultsAvailable(setup);
};
