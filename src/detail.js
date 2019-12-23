import $ from 'jquery';
import {getSingleSaveUrl} from "./common/github";
import {wiki_links} from "./common/wiki_links_feature_flags";

const template = `
<div class="col-12 d-flex justify-content-end"><h5>[save]</h5></div>
<div class="col-12 d-flex justify-content-between"><h2>[cpu]</h2><h2>[score] Points <span class="score [score-class]" title="Faster (green) or slower (orange) than the reference 3900X"></span></h2></div>
<div class="col-12 col-lg-6" style="margin-top: 50px">
<h5>Results</h5>
<table class="table">
<thead>
<tr>
<th>Benchmark</th>
<th>Score</th>
</tr>
</thead>
<tbody>
[results]
</tbody>
</table>
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
<tr [optional-class]>
    <td>[name]</td>
    <td>[value] <span class="score [score-class]" title="Faster (green) or slower (orange) than the [reference] of [reference-points]"></span></td>
</tr>
`;

function error() {
    $('#accordion').html("<h5>Can't find the specified save!</h5>")
}

let use_average_measures = false;
let average = null;

export function getReferencePoints(threads, benchmark) {
    let points = 50000;

    if (!use_average_measures) {
        return points;
    }

    if (!Object.keys(average.Results).includes(threads)) {
        return points;
    }

    if (!Array.isArray(average.Results[threads])) {
        return points;
    }

    const results = average.Results[threads];

    results.forEach(function (result) {
        if (result.Benchmark === benchmark) {
            points = result.Points;
        }
    });

    return points;
}

export function renderResults(save) {
    let results = [];
    let keys = Object.keys(save.Results);

    keys.forEach(function (key) {
        if (!Array.isArray(save.Results[key])) {
            return;
        }

        save.Results[key].forEach(function (result) {
            const referencePoints = getReferencePoints(key, result.Benchmark);
            let template = single_result_template
                .replace('[value]', result.Points)
                .replace('[name]', `${result.Benchmark} @ ${key} ${parseInt(key) === 1 ? 'Threads' : 'Threads'}`)
                .replace('[score-class]', result.Points >= referencePoints ? 'above' : 'below')
                .replace('[reference]', use_average_measures ? 'average' : 'reference 3900x')
                .replace('[reference-points]', referencePoints);

            if (result.Benchmark.startsWith('Category: all')) {
                template = template.replace('[optional-class]', 'class="category-all"')
            } else if (result.Benchmark.startsWith('Category:')) {
                template = template.replace('[optional-class]', 'class="category"')
            }

            results.push(template);
        });
    });

    results.sort(function (a, b) {
        const aCategory = a.includes('Category');
        const aCategoryAll = a.includes('Category: all');
        const bCategory = b.includes('Category');
        const bCategoryAll = b.includes('Category: all');

        if (aCategoryAll) {
            return -1;
        }

        if (bCategoryAll) {
            return 1;
        }

        if (aCategory && !bCategory) {
            return -1;
        }

        if (!aCategory && bCategory) {
            return 1;
        }

        return 0;
    });

    return results.join('');
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
        .replace('[value]', `${save.MachineInformation.Cpu.IntelFeatureFlags.TPMFeatureFlags}\n
        ${save.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81One},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.ExtendedFeatureFlagsF81Two},
        ${save.MachineInformation.Cpu.IntelFeatureFlags.FeatureFlagsApm},`);

    for (let wikiLinksKey in wiki_links) {
        feature_flags = feature_flags.replace(new RegExp(`([^a-zA-Z0-9_])${wikiLinksKey}(?![a-zA-Z0-9_]+)(,?)`, "g"), `$1<a href="${wiki_links[wikiLinksKey]}" target="_blank">${wikiLinksKey}</a>$2`);
    }

    feature_flags = feature_flags.replace(/,? ?NONE(,?)/g, '$1').replace(/,\W*,/g, ',').replace(/,\W*<\/td>/g, '');;

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
        cores += `#${core.Number.toString().padStart(2, '0')} ${(save.MachineInformation.Cpu.MaxClockSpeed / 1000).toFixed(2)} GHz${(core.Number + 1) % 3 === 0 ? '\n' : '\t'}`;
    });

    info += single_info_template.replace('[name]', 'Cores').replace('[value]', `<span style="white-space: pre">${cores}</span>`);

    let caches = '';

    save.MachineInformation.Cpu.Caches.forEach(function (cache) {
        caches += `${cache.Level}\t${cache.CapacityHRF}\t${cache.Associativity}-way\t${cache.TimesPresent}-times\t${cache.Type === 1 ? 'Instruction' : cache.Type === 2 ? 'Data' : ''}\n`;
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

export function render() {
    $('#sorting').parent().hide();
    $('#sorting').hide();
    $('#prev').parent().hide();

    const id = window.location.search.replace("?detail=", "");

    fetch(getSingleSaveUrl(id)).then(result => {
        if (!result.ok || result.status === 404) {
            error();
            return;
        }

        result.json().then(save => {
            fetch(getSingleSaveUrl(`average_${save.MachineInformation.Cpu.Caption.replace(/@/g, 'at').replace(/ /g, '_').replace(/,/g, '_')}.automated`)).then(average_result => {
                return new Promise((resolve, reject) => {
                    if (result.ok && result.status !== 404) {
                        use_average_measures = true;

                        average_result.json().then(average_save => {
                            average = average_save;
                            resolve();
                        }).catch(() => {
                            resolve();
                        });
                    } else {
                        resolve();
                    }
                });
            }).then(() => {
                let html = template.replace(/\[save]/g, id).replace(/\[cpu]/g, save.MachineInformation.Cpu.Name);

                html = html.replace('[info]', renderInfo(save));
                html = html.replace('[results]', renderResults(save));

                html = html.replace(/\[optional-class]/g, "");

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

                html = html.replace(/\[score]/g, isNaN(score) ? '0'.padStart(5, '0') : score.toFixed(0).padStart(5, '0'));
                html = html.replace(/\[score-class]/g, isNaN(score) ? 'below' : score < 50000 ? 'below' : score === 50000 ? 'same' : 'above');

                $('#accordion').html(html);
                $('.navbar').addClass(save.MachineInformation.Cpu.Vendor);
            });
        }).catch((err) => {
            console.error(err);
            error();
        });
    });
}
