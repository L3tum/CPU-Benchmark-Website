import $ from 'jquery';
import 'popper.js';
import 'bootstrap';
import './index.scss';

$(function () {
    if (window.location.search.startsWith("?detail=")) {
        import('./detail').then(res => {
           res.render();
        });
    } else {
        import('./list').then(res => {
            res.render();
        });
    }
});
