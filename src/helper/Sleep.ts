class Sleep {

    static sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    static noSleepPromise() {
        return Sleep.sleep(0).then(() => []);
    }

}

export default Sleep;
