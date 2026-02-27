/**
 * nav.js - Shared navigation component
 * Renders the navbar into any element with id="nav-container"
 * Automatically highlights the current page link
 */
(function () {
    const navLinks = [
        { href: 'add_update_player.html', label: 'Add/Update Player' },
        { href: 'batting_practice.html',  label: 'Batting Practice'  },
        { href: 'hitting_results.html',   label: 'Hitting Results'   },
        { href: 'fielding_practice.html', label: 'Fielding Practice' },
        { href: 'fielding_results.html',  label: 'Fielding Results'  },
        { href: 'bullpen.html',           label: 'Bullpen Tracking'  },
        { href: 'bullpen_results.html',   label: 'Bullpen Results'   },
    ];

    function renderNav() {
        var container = document.getElementById('nav-container');
        if (!container) return;

        var currentPage = window.location.pathname.split('/').pop() || 'index.html';

        var navItems = navLinks.map(function (link) {
            var isActive = link.href === currentPage;
            return '<li class="nav-item' + (isActive ? ' active' : '') + '">' +
                '<a class="nav-link" href="' + link.href + '">' + link.label +
                (isActive ? ' <span class="sr-only">(current)</span>' : '') +
                '</a></li>';
        }).join('');

        container.innerHTML =
            '<nav class="navbar navbar-expand-lg navbar-light bg-light">' +
                '<a class="navbar-brand font-weight-bold" href="add_update_player.html">&#9918; Team Tracker</a>' +
                '<button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" ' +
                    'aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">' +
                    '<span class="navbar-toggler-icon"></span>' +
                '</button>' +
                '<div class="collapse navbar-collapse" id="navbarNav">' +
                    '<ul class="navbar-nav">' + navItems + '</ul>' +
                '</div>' +
            '</nav>';
    }

    document.addEventListener('DOMContentLoaded', renderNav);
})();
