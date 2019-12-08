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
