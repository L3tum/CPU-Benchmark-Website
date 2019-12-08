import $ from 'jquery';
import {getSingleSaveUrl, getPageFileUrl} from "./common/github";

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
                Score [score] <span class="score [score-class]" title="Faster (green) or slower (orange) than the reference 3900X"></span>
            </h5>
        </div>
    </a>
 </div>
 </div>
`;

function renderCpuList(cpus) {
    const promises = [];
    let html = [];

    cpus.forEach(function (item, index) {
        promises.push(fetch(getSingleSaveUrl(item)).then(function (json) {
            return json.json().then(function (save) {
                let item_html = item_template
                    .replace(/\[number]/g, index.toString())
                    .replace(/\[cpu]/g, save.MachineInformation.Cpu.Name)
                    .replace(/\[vendor]/g, save.MachineInformation.Cpu.Vendor)
                    .replace(/\[filename]/g, '/detail/' + item);

                let keys = Object.keys(save.Results);
                let total_ac = 0;
                let number_ac = 0;

                keys.forEach(function (key) {
                    if (!Array.isArray(save.Results[key])) {
                        return;
                    }

                    let total = 0;
                    let number = 0;

                    save.Results[key].forEach(function (result) {
                        if (!result.Benchmark.startsWith('Category:')) {
                            total += result.Points;
                            number++;
                        }
                    });

                    total_ac += total;
                    number_ac += number;
                });

                const score = total_ac / number_ac;

                item_html = item_html.replace(/\[score]/g, isNaN(score) ? '0'.padStart(5, '0') : score.toFixed(0).padStart(5, '0'));
                item_html = item_html.replace(/\[score-class]/g, isNaN(score) ? 'below' : score < 50000 ? 'below' : score === 50000 ? 'same' : 'above');

                html[index] = item_html;
            });
        }));
    });

    return Promise.all(promises).then(() => {
        return html.join('');
    });
}

function getResultsCurrentPage(page = current_page - 1) {
    return new Promise((resolve, reject) => {
        if (results.length > page * 10) {
            resolve(results.slice(page * 10, page * 10 + 10));
        } else {
            fetch(getPageFileUrl(page + 1)).then(result => {
                if (result.ok && result.status !== 404) {
                    result.json().then(json => {
                        results.push(...json.ResultSaveFiles);

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
        $('#accordion').html('');

        renderCpuList(results).then((html) => {
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
    });
}

export {render};
