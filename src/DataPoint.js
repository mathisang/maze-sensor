class DataPoint {
    constructor() {
        this.arr = []
    }

    setFilter(n) {
        this.sum = 0;

        if(this.arr.length >= n) {
            for(this.i = 0; this.i < n; this.i++) {
                this.sum += this.arr[this.arr.length - (this.i+1)]
            }
        }

        return this.sum / n;
    }

    push(data) {
        this.arr.push(data)
    }

    getDataFilter() {
        return this.setFilter(3)
    }
}

export { DataPoint }