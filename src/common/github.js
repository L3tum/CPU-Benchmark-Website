const BASE_URL = "https://raw.githubusercontent.com/";
const OWNER = "L3tum";
const REPO = "CPU-Benchmark-Database";
const BRANCH = "master";
const PATH = "saves";
const AGGREGATIONS_PATH = "aggregations";

export function getSingleSaveUrl(filename) {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${PATH}/${filename}.json`;
}

export function getPageFileUrl(page) {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/pagination/${page}.json`;
}

export function getAverageAggregationUrl() {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/byCPU/average.json`;
}

export function getSCAverageAggregationUrl() {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/averageByCoreCount/1.json`;
}

export function getACAverageAggregationUrl(count) {
    return `${BASE_URL}${OWNER}/${REPO}/${BRANCH}/${AGGREGATIONS_PATH}/averageByCoreCount/${count}.json`;
}
