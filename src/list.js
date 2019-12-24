import $ from 'jquery';
import {getPageFileUrl} from "./common/github";

const results = [];

let current_page = 1;

const item_template = `
<div class="col-12">
<div class="card">
    <a id="heading-[number]" class="detail-button [vendor]" href="[filename]">
        <div class="card-header d-flex justify-content-between">
            <h5 class="mb-0">
                [cpu]
            </h5>
            <h5>
                Score [score]</span>
            </h5>
        </div>
    </a>
 </div>
 </div>
`;

function renderCpuList(cpus) {
    let html = '';

    cpus.forEach(function (item, index) {
        console.log(item.Value);

        const item_parts = item.Value.split(" === ");
        const item_html = item_template.replace(/\[number]/g, index.toString())
            .replace(/\[cpu]/g, item_parts[0])
            .replace(/\[vendor]/g, item_parts[1])
            .replace(/\[score]/g, item_parts[2])
            .replace(/\[filename]/g, '?detail=' + item.SaveFile);

        html += item_html;
    });

    return html;
}

function getResultsCurrentPage(page = current_page - 1) {
    return new Promise((resolve, reject) => {
        if (results.length > page * 10) {
            resolve(results.slice(page * 10, page * 10 + 10));
        } else {
            fetch(getPageFileUrl(page + 1)).then(result => {
                if (result.ok && result.status !== 404) {
                    result.json().then(json => {
                        results.push(...json.Entries);

                        if (results.length > page * 10) {
                            resolve(results.slice(page * 10, page * 10 + 10));
                        } else {
                            resolve([]);
                        }
                    });
                } else {
                    resolve([]);
                }
            });
        }
    });
}

function render() {
    const prev = $('#prev');
    const next = $('#next');
    const current = $('#current');

    prev.off('click');
    prev.prop('disabled', true);
    next.off('click');
    next.prop('disabled', true);
    current.html(current_page);

    getResultsCurrentPage().then(results => {
        const html = renderCpuList(results);

        $('#accordion').html(html);
        $('.collapse').collapse();
        current.html(current_page);

        // Check previous page
        getResultsCurrentPage(current_page - 2).then(results => {
            if (results.length === 0) {
                prev.prop('disabled', true);
                prev.off('click');
            } else {
                prev.prop('disabled', false);
                prev.on('click', () => {
                    current_page--;
                    render();
                });
            }
        });

        // Check next page
        getResultsCurrentPage(current_page).then(results => {
            if (results.length === 0) {
                next.prop('disabled', true);
                next.off('click');
            } else {
                next.prop('disabled', false);
                next.on('click', () => {
                    current_page++;
                    render();
                });
            }
        });

        // // Register detail buttons
        // $('.detail-button').on('click', function () {
        //     window.location.href = '/detail/' + $(this).data('filename');
        // });
    });
}

export {render};
