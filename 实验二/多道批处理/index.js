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
                    status: '后备',
                    needMemory: '',
                    needTapeDriver: ''
                },
                dialogFormVisible: false,
                totalMemory: 100,
                totalTapeDriver: 5,
                recordList: [],
                isRunning: false
            }
        },

        methods: {
            deleteJcb(idx) {
                this.jcbList.splice(idx, 1);
            },
            reset() {
                this.recordList = []
                this.jcbList.forEach( x => x.status = '后备')
            },
            tableRowClassName({row, rowIndex}) {
                if (row.status === '运行') {
                    return 'running-row';
                } else if (row.status === '后备') {
                    return 'waiting-row';
                } else if (row.status === '完成') {
                    return 'finish-row';
                }
            },
            addJcb() {
                this.jcbList.push({
                    jobName: this.inputJcb.jobName,
                    arriveTime: Number(this.inputJcb.arriveTime),
                    serveTime: Number(this.inputJcb.serveTime),
                    startTime: null,
                    status: '后备',
                    needMemory: Number(this.inputJcb.needMemory),
                    needTapeDriver: Number(this.inputJcb.needTapeDriver)
                });
                this.inputJcb = {

                };
                this.dialogFormVisible = false;
            },
            calculate () {
                if (this.serveType === 1) this.fcfs();
                else if (this.serveType === 2) this.sjf();
            },
            fcfs() {
                this.jcbList.sort((x, y) => x.arriveTime - y.arriveTime)
                let time = 0;
                let processList = this.jcbList.slice();
                this.isRunning = true;
                processList.filter( job => job.arriveTime === 0).forEach(job => {
                    if (job.needMemory <= this.totalMemory && job.needTapeDriver <= this.totalTapeDriver) {
                        job.status = '运行';
                        job.startTime = 0;
                        this.recordList.push({
                            time,
                            jobName: job.jobName,
                            message: '开始',
                            memory: '总内存减少 ' + this.totalMemory + ' -> ' + (this.totalMemory - job.needMemory),
                            tapeDriver: '总磁带机减少 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver - job.needTapeDriver)
                        });
                        this.totalMemory -= job.needMemory;
                        this.totalTapeDriver -= job.needTapeDriver
                    }
                });
                let intervalId = setInterval( () => {
                    time++;
                    if (processList.length === 0) {
                        clearInterval(intervalId);
                        this.isRunning = false;
                        return;
                    }
                    for (let i = 0; i < processList.length; i++) {
                        let job = processList[i];
                        if (job.status === '运行' && job.startTime + job.serveTime === time) {
                            job.status = '完成';
                            this.recordList.push({
                                time,
                                jobName: job.jobName,
                                message: '完成',
                                memory: '总内存增加 ' + this.totalMemory + ' -> ' + (this.totalMemory + job.needMemory),
                                tapeDriver: '总磁带机增加 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver + job.needTapeDriver)
                            });
                            this.totalMemory += job.needMemory;
                            this.totalTapeDriver += job.needTapeDriver
                            processList.splice(i, 1);
                            i--;
                        }
                    }
                    for (let i = 0; i < processList.length; i++) {
                        let job = processList[i];
                        if (job.status === '后备' && job.arriveTime <= time
                            && job.needMemory <= this.totalMemory && job.needTapeDriver <= this.totalTapeDriver) {
                            job.status = '运行';
                            job.startTime = time;
                            this.recordList.push({
                                time,
                                jobName: job.jobName,
                                message: '开始',
                                memory: '总内存减少 ' + this.totalMemory + ' -> ' + (this.totalMemory - job.needMemory),
                                tapeDriver: '总磁带机减少 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver - job.needTapeDriver)
                            });
                            this.totalMemory -= job.needMemory;
                            this.totalTapeDriver -= job.needTapeDriver
                        }
                        if (job.status === '后备' && job.arriveTime <= time
                            && job.needMemory <= this.totalMemory && job.needTapeDriver <= this.totalTapeDriver) {
                            job.status = '运行';
                            job.startTime = time;
                            this.recordList.push({
                                time,
                                jobName: job.jobName,
                                message: '开始',
                                memory: '总内存减少 ' + this.totalMemory + ' -> ' + (this.totalMemory - job.needMemory),
                                tapeDriver: '总磁带机减少 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver - job.needTapeDriver)
                            });
                            this.totalMemory -= job.needMemory;
                            this.totalTapeDriver -= job.needTapeDriver
                        }
                    }
                }, 1000)
            },
            sjf() {
                this.jcbList.sort((x, y) => x.arriveTime - y.arriveTime)
                let time = 0;
                let processList = this.jcbList.slice();
                this.isRunning = true;
                processList.filter(job => job.arriveTime === 0).forEach(job => {
                    if (job.needMemory <= this.totalMemory && job.needTapeDriver <= this.totalTapeDriver) {
                        job.status = '运行';
                        job.startTime = time;
                        this.recordList.push({
                            time,
                            jobName: job.jobName,
                            message: '开始',
                            memory: '总内存减少 ' + this.totalMemory + ' -> ' + (this.totalMemory - job.needMemory),
                            tapeDriver: '总磁带机减少 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver - job.needTapeDriver)
                        });
                        this.totalMemory -= job.needMemory;
                        this.totalTapeDriver -= job.needTapeDriver
                    }
                })
                let intervalId = setInterval( () => {
                    time++;
                    if (processList.length === 0) {
                        clearInterval(intervalId);
                        this.isRunning = false;
                        return;
                    }
                    for (let i = 0; i < processList.length; i++) {
                        let job = processList[i];
                        if (job.status === '运行' && job.startTime + job.serveTime === time) {
                            job.status = '完成';
                            this.recordList.push({
                                time,
                                jobName: job.jobName,
                                message: '完成',
                                memory: '总内存增加 ' + this.totalMemory + ' -> ' + (this.totalMemory + job.needMemory),
                                tapeDriver: '总磁带机增加 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver + job.needTapeDriver)
                            });
                            this.totalMemory += job.needMemory;
                            this.totalTapeDriver += job.needTapeDriver
                            processList.splice(i, 1);
                            i--;
                        }
                    }
                    let arrivedList = processList.filter(job => job.arriveTime <= time);
                    arrivedList.sort((x, y) => x.serveTime - y.serveTime);
                    for (let i = 0; i < arrivedList.length; i++) {
                        let job = arrivedList[i];

                        if (job.status === '后备'
                            && job.needMemory <= this.totalMemory && job.needTapeDriver <= this.totalTapeDriver) {
                            job.status = '运行';
                            job.startTime = time;
                            this.recordList.push({
                                time,
                                jobName: job.jobName,
                                message: '开始',
                                memory: '总内存减少 ' + this.totalMemory + ' -> ' + (this.totalMemory - job.needMemory),
                                tapeDriver: '总磁带机减少 ' + this.totalTapeDriver + ' -> ' + (this.totalTapeDriver - job.needTapeDriver)
                            });
                            this.totalMemory -= job.needMemory;
                            this.totalTapeDriver -= job.needTapeDriver
                        }
                    }
                }, 1000)

            },

        }
    })


})