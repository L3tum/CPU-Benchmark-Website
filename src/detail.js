import $ from 'jquery';
import {
    getACAverageAggregationUrl,
    getAverageAggregationUrl,
    getSCAverageAggregationUrl,
    getSingleSaveUrl
} from "./common/github";
import {wiki_links} from "./common/wiki_links_feature_flags";
import Chart from 'chart.js';
import {vendor_colors} from "./common/vendor_colors";

let renderPromise = new Promise((resolve) => resolve());
let average = null;
let score = 0.0;

const template = `
<div class="col-12 d-flex justify-content-end"><h5>[save]</h5></div>
<div class="col-12 d-flex justify-content-between"><h2>[cpu]</h2><h2>[score] Points</h2></div>
<div class="col-12 col-lg-6" style="margin-top: 50px">
<h5>Results</h5>
<table class="table">
<thead>
<tr>
<th>Threads</th>
<th>Score</th>
</tr>
</thead>
<tbody>
[results_all]
</tbody>
</table>
<br><br>
<h5>Results per Category</h5>
<table class="table">
<thead>
<tr data-toggle="collapse" data-target="#category_table" class="clickable">
<th>Category (Click to expand)</th>
<th>Score</th>
</tr>
</thead>
<tbody id="category_table" class="collapse">
[results_categories]
</tbody>
</table>
<br><br>
<h5>Results Detailed</h5>
<table class="table">
<thead>
<tr data-toggle="collapse" data-target="#detailed_table" class="clickable">
<th>Benchmark (Click to expand)</th>
<th>Score</th>
</tr>
</thead>
<tbody id="detailed_table" class="collapse">
[results_detailed]
</tbody>
</table>
</div>
<div class="col-12 col-lg-6" style="margin-top: 50px">
<h5>Comparisons</h5>
<h6>Total Average</h6>
<canvas id="score_comparison" width="400" height="100%"></canvas>
<br><br>
<div id="sc_average">
<h6>Single Core Average</h6>
<canvas id="sc_comparison" width="400" height="100%"></canvas>
</div>
<div id="ac_average">
<h6>All Core Average</h6>
<canvas id="ac_comparison" width="400" height="100%"></canvas>
</div>
</div>
<div class="col-12 col-lg-6" style="margin-top: 50px">
<h5>Machine</h5>
<table class="table">
<thead>
<tr>
<th>Property</th>
<th>Value</th>
</tr>
</thead>
<tbody>
[info]
</tbody>
</table>
</div>
`;

const single_info_template = `
<tr>
    <td>[name]</td>
    <td>[value]</td>
</tr>
`;

const single_result_template = `
<tr>
    <td>[name]</td>
    <td>[value]</td>
</tr>
`;

function error() {
    $('#accordion').html("<h5>Can't find the specified save!</h5>")
}

function renderComparison(comparisons, context, label = 'Points') {
    comparisons.sort(function (a, b) {
        if (a.value > b.value) {
            return -1;
        }

        if (b.value > a.value) {
            return 1;
        }

        return 0;
    });

    const lowest = Math.round(comparisons[comparisons.length - 1].value - 10000 > 0 ? (comparisons[comparisons.length - 1].value - 10000) / 10000 : 0) * 10000;
    const highest = Math.round(comparisons[0].value + 10000 < 100000 ? (comparisons[0].value + 10000) / 10000 : 10000) * 10000;

    const myChart = new Chart(context, {
        type: 'horizontalBar',
        data: {
            labels: comparisons.map((comparison) => comparison.name),
            datasets: [{
                label: label,
                data: comparisons.map((comparison) => comparison.value),
                backgroundColor: comparisons.map((comparison) => comparison.color),
                // borderColor: [
                //     'rgba(255, 99, 132, 1)',
                //     'rgba(54, 162, 235, 1)',
                //     'rgba(255, 206, 86, 1)',
                //     'rgba(75, 192, 192, 1)',
                //     'rgba(153, 102, 255, 1)',
                //     'rgba(255, 159, 64, 1)'
                // ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        beginAtZero: true,
                        min: lowest,
                        max: highest
                    }
                }],
                yAxes: [{
                    stacked: true
                }]
            }
        }
    });
}

function fetchAveragePointsAroundScore(nameToSkip, limit = 10000) {
    return new Promise((resolve, reject) => {
        fetch(getAverageAggregationUrl()).then(averagesJSON => {
            if (!averagesJSON.ok) {
                resolve([]);
                return;
            }

            averagesJSON.json().then(averages => {
                const parsedAverages = [];
                const promises = [];

                for (const entry of averages.Entries) {
                    if (entry.Value === nameToSkip) {
                        continue;
                    }

                    promises.push(new Promise((resolve1 => {
                        fetch(getSingleSaveUrl(entry.SaveFile)).then(averageSaveFileJSON => {
                            if (!averageSaveFileJSON.ok) {
                                resolve1();
                            }

                            averageSaveFileJSON.json().then(averageSaveFile => {
                                const averageScore = calculateOverallScore(averageSaveFile);

                                if (averageScore <= score + limit && averageScore >= score - limit) {
                                    parsedAverages.push({
                                        'name': averageSaveFile.MachineInformation.Cpu.Name,
                                        'value': averageScore,
                                        'color': vendor_colors[averageSaveFile.MachineInformation.Vendor]
                                    });
                                }

                                resolve1();
                            });
                        });
                    })));
                }

                Promise.all(promises).then(() => {
                    resolve(parsedAverages);
                });
            });
        });
    });
}

function renderPointsComparisonGraph(save) {
    return new Promise((resolve, reject) => {
        fetch(getSingleSaveUrl(`average_${save.MachineInformation.Cpu.Caption.replace('@', 'at').replace(/ /g, '_').replace(/,/g, '_')}.automated`)).then(json => {
            let averagePromise = new Promise((resolve1) => resolve1());

            if (json.ok) {
                averagePromise = json.json().then(averaged => {
                    return new Promise((resolve1) => {
                        average = averaged;
                        resolve1();
                    });
                });
            }

            Promise.all([averagePromise, renderPromise]).then(() => {
                fetchAveragePointsAroundScore(save.MachineInformation.Cpu.Caption).then(averages => {
                    const comparisons = [
                        {'name': 'You', 'value': score, 'color': '#008000'},
                        ...averages
                    ];

                    if (average !== null) {
                        comparisons.push(
                            {
                                'name': 'Average',
                                'value': calculateOverallScore(average),
                                'color': vendor_colors[average.MachineInformation.Cpu.Vendor]
                            });
                    }

                    if (comparisons.length > 1) {
                        renderComparison(comparisons, document.getElementById('score_comparison'))
                    }

                    resolve();
                });
            });
        });
    });
}

function renderSCComparisonGraph(save, limit = 10000) {
    return new Promise((resolve, reject) => {
        renderPromise.then(() => {
            if (!(1 in save.Results)) {
                document.getElementById('sc_average').classList.add('d-none');
                resolve();

                return;
            }

            fetch(getSCAverageAggregationUrl()).then(scaveragesJSON => {
                if (!scaveragesJSON.ok) {
                    document.getElementById('sc_average').classList.add('d-none');
                    resolve();

                    return;
                }

                scaveragesJSON.json().then(scAverages => {
                    const comparisons = [
                        {
                            'name': 'You',
                            'value': save.Results[1].find(bench => bench.Benchmark === "Category: all").Points,
                            'color': vendor_colors[save.MachineInformation.Cpu.Vendor]
                        }
                    ];

                    for (const entry of scAverages.Entries) {
                        const parts = entry.Value.split(' === ');
                        const points = parseInt(parts[1]);

                        if (score <= points + limit && score >= points - limit) {
                            comparisons.push({'name': parts[0].trim(), 'value': points, 'color': 'grey'});
                        }
                    }

                    if (comparisons.length > 1) {
                        renderComparison(comparisons, document.getElementById('sc_comparison'));
                    }

                    resolve();
                });
            });
        });
    });
}

function renderACComparisonGraph(save, limit = 10000) {
    return new Promise((resolve, reject) => {
        renderPromise.then(() => {
            if (!(save.MachineInformation.Cpu.LogicalCores in save.Results)) {
                document.getElementById('ac_average').classList.add('d-none');
                resolve();

                return;
            }

            fetch(getACAverageAggregationUrl(save.MachineInformation.Cpu.LogicalCores)).then(acAveragesJSON => {
                if (!acAveragesJSON.ok) {
                    document.getElementById('ac_average').classList.add('d-none');
                    resolve();

                    return;
                }

                acAveragesJSON.json().then(acAverages => {
                    const comparisons = [
                        {
                            'name': 'You',
                            'value': save.Results[save.MachineInformation.Cpu.LogicalCores].find(bench => bench.Benchmark === "Category: all").Points,
                            'color': vendor_colors[save.MachineInformation.Cpu.Vendor]
                        }
                    ];

                    for (const entry of acAverages.Entries) {
                        const parts = entry.Value.split(' === ');
                        const points = parseInt(parts[1]);

                        if (score <= points + limit && score >= points - limit) {
                            comparisons.push({'name': parts[0].trim(), 'value': points, 'color': 'grey'});
                        }
                    }

                    if (comparisons.length > 1) {
                        renderComparison(comparisons, document.getElementById('ac_comparison'));
                    }

                    resolve();
                });
            });
        });
    });
}

export function renderResults(save) {
    const results_all = [];
    const results_categories = [];
    const results_detailed = [];
    const keys = Object.keys(save.Results);

    keys.forEach(function (key) {
        if (!Array.isArray(save.Results[key])) {
            return;
        }

        save.Results[key].forEach(function (result) {
            if (result.Benchmark.startsWith('Category: all')) {
                let template = single_result_template
                    .replace('[value]', result.Points)
                    .replace('[name]', `${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`);

                results_all.push(template);
            } else if (result.Benchmark.startsWith('Category:')) {
                let template = single_result_template
                    .replace('[value]', result.Points)
                    .replace('[name]', `${result.Benchmark.replace('Category: ', '')} @ ${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`);

                results_categories.push(template);
            } else {
                let template = single_result_template
                    .replace('[value]', result.Points)
                    .replace('[name]', `${result.Benchmark} @ ${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`);

                results_detailed.push(template);
            }
        });
    });

    return {'all': results_all, 'categories': results_categories, 'detailed': results_detailed};
}

function renderFeatureFlags(save) {
    let feature_flags;

    feature_flags += single_info_template.replace('[name]', "Feature Flags")
        .replace('[value]', `${save.MachineInformation.Cpu.FeatureFlagsOne},
        ${save.MachineInformation.Cpu.FeatureFlagsTwo},`);

    feature_flags += single_info_template.replace('[name]', "Extended Feature Flags")
        .replace('[value]', `${save.MachineInformation.Cpu.ExtendedFeatureFlagsF7One},
        ${save.MachineInformation.Cpu.ExtendedFeatureFlagsF7Two},
        ${save.MachineInformation.Cpu.ExtendedFeatureFlagsF7Three},`);

    feature_flags += single_info_template.replace('[name]', "AMD Feature Flags")
        .replace('[value]', `${save.MachineInformation.Cpu.AMDFeatureFlags.ExtendedFeatureFlagsF81One},
        ${save.MachineInformation.Cpu.AMDFeatureFlags.ExtendedFeatureFlagsF81Two},
        ${save.MachineInformation.Cpu.AMDFeatureFlags.FeatureFlagsSvm},
        ${save.MachineInformation.Cpu.AMDFeatureFlags.FeatureFlagsApm},`);

    feature_flags += single_info_template.replace('[name]', "Intel Feature Flags")
        .replace('[value]', `${save.MachineInformation.Cpu.IntelFeatureFlags.TPMFeatureFlags},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81One},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81Two},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.FeatureFlagsApm},`);

    for (let wikiLinksKey in wiki_links) {
        feature_flags = feature_flags.replace(new RegExp(`([^a-zA-Z0-9_])${wikiLinksKey}(?![a-zA-Z0-9_]+)(,?)`, "g"), `$1<a href="${wiki_links[wikiLinksKey]}" target="_blank">${wikiLinksKey}</a>$2`);
    }

    feature_flags = feature_flags.replace(/,? ?NONE(,?)/g, '$1').replace(/,\W*,/g, ',').replace(/,\W*<\/td>/g, '');

    return feature_flags;
}

export function renderInfo(save) {
    let info = '';

    info += single_info_template.replace('[name]', 'Caption').replace('[value]', save.MachineInformation.Cpu.Caption);
    info += single_info_template.replace('[name]', 'Vendor').replace('[value]', save.MachineInformation.Cpu.Vendor);
    info += single_info_template.replace('[name]', 'Cores').replace('[value]', save.MachineInformation.Cpu.PhysicalCores);
    info += single_info_template.replace('[name]', 'Threads').replace('[value]', save.MachineInformation.Cpu.LogicalCores);
    info += single_info_template.replace('[name]', 'NUMA').replace('[value]', `${save.MachineInformation.Cpu.Nodes} Node${save.MachineInformation.Cpu.Nodes === 1 ? '' : 's'} @ ${save.MachineInformation.Cpu.LogicalCoresPerNode} Threads per Node`);
    info += single_info_template.replace('[name]', 'Frequency').replace('[value]', `${(save.MachineInformation.Cpu.MaxClockSpeed / 1000).toFixed(2)} GHz Measured / ${(save.MachineInformation.Cpu.NormalClockSpeed / 1000).toFixed(2)} GHz Reported`);
    info += single_info_template.replace('[name]', 'Socket').replace('[value]', save.MachineInformation.Cpu.Socket);
    info += single_info_template.replace('[name]', 'BIOS').replace('[value]', `${save.MachineInformation.SmBios.BIOSCodename} ${save.MachineInformation.SmBios.BIOSVersion} by ${save.MachineInformation.SmBios.BIOSVendor}`);
    info += single_info_template.replace('[name]', 'Mainboard').replace('[value]', `${save.MachineInformation.SmBios.BoardName} ${save.MachineInformation.SmBios.BoardVersion} by ${save.MachineInformation.SmBios.BoardVendor}`);

    let cores = '';

    save.MachineInformation.Cpu.Cores.forEach(function (core) {
        cores += `#${core.Number.toString().padStart(2, '0')} ${(core.MaxClockSpeed / 1000).toFixed(2)} GHz${(core.Number + 1) % 3 === 0 ? '\n' : '\t'}`;
    });

    info += single_info_template.replace('[name]', 'Cores').replace('[value]', `<span style="white-space: pre">${cores}</span>`);

    let caches = '';

    save.MachineInformation.Cpu.Caches.forEach(function (cache) {
        caches += `${cache.Level}\t${cache.CapacityHRF}\t${cache.Associativity}-way\t${cache.TimesPresent}-times\t${cache.Type}\n`;
    });

    info += single_info_template.replace('[name]', 'Caches').replace('[value]', `<span style="white-space: pre">${caches}</span>`);

    let rams = '';

    save.MachineInformation.RAMSticks.forEach(function (ram, index) {
        rams += `${ram.Name ? ram.Name : index} ${ram.CapacityHRF} @ ${ram.Speed} Mhz by ${ram.Manfucturer}\n`;
    });

    info += single_info_template.replace('[name]', 'RAM').replace('[value]', `<span style="white-space: pre">${rams}</span>`);

    info += renderFeatureFlags(save);

    return info;
}

export function calculateOverallScore(save) {
    const keys = Object.keys(save.Results);
    let total_ac = 0;
    let number_ac = 0;

    keys.forEach(function (key) {
        if (!Array.isArray(save.Results[key])) {
            return;
        }

        let total = 0;
        let number = 0;

        for (const resultKey in save.Results[key]) {
            const result = save.Results[key][resultKey];

            if (result.hasOwnProperty('Benchmark') && result.Benchmark.startsWith('Category: all')) {
                total += result.Points;
                number++;

                break;
            }
        }

        total_ac += total;
        number_ac += number;
    });

    return parseInt((total_ac / number_ac).toFixed(0));
}

export function render() {
    $('#sorting').parent().hide();
    $('#sorting').hide();
    $('#prev').parent().hide();

    const id = window.location.search.replace("?detail=", "");

    renderPromise = new Promise((resolve, reject) => {
        fetch(getSingleSaveUrl(id)).then(result => {
            if (!result.ok || result.status === 404) {
                error();
                return;
            }

            result.json().then(save => {
                renderPointsComparisonGraph(save);
                renderSCComparisonGraph(save);
                renderACComparisonGraph(save);

                let html = template.replace(/\[save]/g, id).replace(/\[cpu]/g, save.MachineInformation.Cpu.Name);

                html = html.replace('[info]', renderInfo(save));

                const results = renderResults(save);

                html = html.replace('[results_all]', results.all.join(''));
                html = html.replace('[results_categories]', results.categories.join(''));
                html = html.replace('[results_detailed]', results.detailed.join(''));

                score = calculateOverallScore(save);

                html = html.replace(/\[score]/g, isNaN(score) ? '0'.padStart(5, '0') : score.toString().padStart(5, '0'));

                $('#accordion').html(html);
                $('.navbar').addClass(save.MachineInformation.Cpu.Vendor);
                resolve();
            });
        }).catch((err) => {
            console.error(err);
            error();
        });
    });
}
