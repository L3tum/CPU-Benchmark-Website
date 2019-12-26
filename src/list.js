import $ from 'jquery';
import {getHighestFrequencyAggregationUrl, getPageFileUrl, getSingleSaveUrl} from "./common/github.ts";
import homeTemplate from './templates/home_template.msc';
import {getHighestOverallScoreAggregationUrl} from "./common/github";

const results = [];

let current_page = 1;

function getHighestFrequencies() {
    return new Promise((resolve, reject) => {
        fetch(getHighestFrequencyAggregationUrl()).then(highestFrequenciesJSON => {
            if (!highestFrequenciesJSON.ok) {
                resolve([]);

                return;
            }

            highestFrequenciesJSON.json().then(highestFrequencies => {
                const entries = highestFrequencies.Entries.length > 5 ? highestFrequencies.Entries.slice(0, 5) : highestFrequencies.Entries;
                const list = [];
                const promises = [];

                for (const entry of entries) {
                    promises.push(new Promise((resolve, reject) => {
                        fetch(getSingleSaveUrl(entry.SaveFile)).then(saveFileJSON => {
                            if (!saveFileJSON.ok) {
                                resolve();

                                return;
                            }

                            saveFileJSON.json().then(saveFile => {
                                list.push({
                                    frequency: (parseInt(entry.Value) / 1000).toFixed(2),
                                    name: saveFile.MachineInformation.Cpu.Name,
                                    vendor: saveFile.MachineInformation.Cpu.Vendor,
                                    filename: '?detail=' + entry.SaveFile
                                });

                                resolve();
                            });
                        })
                    }));
                }

                Promise.all(promises).then(() => {
                    list.sort(function (a, b) {
                        if (a.frequency > b.frequency) {
                            return -1;
                        }

                        if (a.frequency < b.frequency) {
                            return 1;
                        }

                        return 0;
                    });

                    resolve(list);
                });
            });
        });
    });
}

function getHighestScores() {
    return new Promise((resolve, reject) => {
        fetch(getHighestOverallScoreAggregationUrl()).then(highestScoresJSON => {
            if (!highestScoresJSON.ok) {
                resolve([]);

                return;
            }

            highestScoresJSON.json().then(highestScores => {
                const entries = highestScores.Entries.length > 5 ? highestScores.Entries.slice(0, 5) : highestScores.Entries;
                const list = [];

                for (const entry of entries) {
                    const parts = entry.Value.split(' === ');

                    list.push({
                        score: parseInt(parts[2]),
                        name: parts[0],
                        vendor: parts[1],
                        filename: '?detail=' + entry.SaveFile
                    });
                }

                list.sort(function (a, b) {
                    if (a.score > b.score) {
                        return -1;
                    }

                    if (a.score < b.score) {
                        return 1;
                    }

                    return 0;
                });

                resolve(list);
            });
        });
    });
}

function renderCpuList(cpus) {
    const cpuList = [];

    cpus.forEach(function (item) {
        const item_parts = item.Value.split(" === ");

        cpuList.push({
            name: item_parts[0],
            vendor: item_parts[1],
            score: item_parts[2],
            filename: '?detail=' + item.SaveFile
        });
    });

    return cpuList;
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
        const cpuList = renderCpuList(results);

        getHighestFrequencies().then(highestFrequencies => {

            getHighestScores().then(highestScores => {
                $('#accordion').html(homeTemplate({
                    cpus: cpuList,
                    highestFrequencies: highestFrequencies,
                    highestScores: highestScores
                }));
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
    });
}

export {render};
