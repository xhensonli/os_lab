$(function () {


    let main = new Vue({
        el: '#main',
        data() {
            return {
                serveType: 1,
                jcbList: [],
                inputJcb: {
                    jobName: '',
                    arriveTime: '',
                    serveTime: '',
                    startTime: '',
                    finishTime: '',
                    turnRoundTime: '',
                    weightedTurnRoundTime: ''
                },
                dialogFormVisible: false,
                // formLabelWidth: '100%',
            }
        },
        watch: {
            serveType() {
                this.calculate();
            }
        },
        methods: {
            process(n) {
                console.log('get sub' + n);
            },
            deleteJcb(idx) {
                this.jcbList.splice(idx, 1);
            },
            addJcb() {
                this.jcbList.push(this.inputJcb);
                this.inputJcb = {
                    jobName: '',
                    arriveTime: '',
                    serveTime: '',
                    startTime: '',
                    finishTime: '',
                    turnRoundTime: '',
                    weightedTurnRoundTime: '',
                };
                this.dialogFormVisible = false;
                this.calculate();
            },
            calculate () {
                if (this.serveType === 1) this.fcfs();
                else if (this.serveType === 2) this.sjf();
                else if (this.serveType === 3) this.hrn();
            },
            fcfs() {
                this.jcbList.sort((x, y) => x.arriveTime - y.arriveTime)
                let time = 0;
                for (let job of this.jcbList) {
                   time = Math.max(Number(job.arriveTime), time);
                   job.startTime = time;
                   time += Number(job.serveTime);
                   job.finishTime = time;
                   job.turnRoundTime = job.finishTime - job.arriveTime;
                   job.weightedTurnRoundTime = (job.turnRoundTime / job.serveTime).toFixed(2);
                }
            },
            sjf() {
                this.jcbList.sort((x, y) => x.arriveTime - y.arriveTime)
                let time = 0;
                let ans = [];
                while (this.jcbList.length > 0) {

                    time = Math.max(time, this.jcbList[0].arriveTime);
                    let temp = this.jcbList[0];
                    let index = 1;
                    while (index < this.jcbList.length && this.jcbList[index].arriveTime <= time) {
                        temp = this.jcbList[index].serveTime < temp.serveTime ? this.jcbList[index] : temp;
                        index++;
                    }
                    let job = temp;
                    this.jcbList.splice(this.jcbList.indexOf(temp), 1);
                    job.startTime = time;
                    time += Number(job.serveTime);
                    job.finishTime = time;
                    job.turnRoundTime = job.finishTime - job.arriveTime;
                    job.weightedTurnRoundTime = (job.turnRoundTime / job.serveTime).toFixed(2);
                    ans.push(job);
                }
                this.jcbList = ans;
            },
            hrn() {
                this.jcbList.sort((x, y) => x.arriveTime - y.arriveTime)
                let time = 0;
                let ans = [];
                while (this.jcbList.length > 0) {

                    time = Math.max(time, this.jcbList[0].arriveTime);
                    let temp = this.jcbList[0];
                    let index = 1;
                    while (index < this.jcbList.length && this.jcbList[index].arriveTime <= time) {
                        temp = this.getRp(time - this.jcbList[index].arriveTime, this.jcbList[index].serveTime) > this.getRp(time - temp.arriveTime, temp.serveTime) ?
                            this.jcbList[index] : temp;
                        index++;
                    }
                    let job = temp;
                    this.jcbList.splice(this.jcbList.indexOf(temp), 1);
                    job.startTime = time;
                    time += Number(job.serveTime);
                    job.finishTime = time;
                    job.turnRoundTime = job.finishTime - job.arriveTime;
                    job.weightedTurnRoundTime = (job.turnRoundTime / job.serveTime).toFixed(2);
                    ans.push(job);
                }
                this.jcbList = ans;
            },
            getRp(wait, serve) {
                return (wait + serve) / serve;
            },
            getAverage(param) {
                const { columns, data } = param;
                const sums = [];
                columns.forEach((column, index) => {
                    if (index === 0) {
                        sums[index] = '平均';
                        return;
                    }
                    if (index === 5 || index === 6) {
                        const values = data.map(item => Number(item[column.property]));
                        sums[index] = values.reduce((prev, curr) => {
                            return prev + curr;
                        }, 0);
                        sums[index] = (sums[index] / values.length).toFixed(2);
                    } else {
                        sums[index] = ''
                    }
                });

                return sums;
            }
        }
    })


})