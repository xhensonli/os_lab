$(function () {


    let main = new Vue({
        el: '#main',
        data() {
            return {
                jobServeType: 1,
                processServeType: 1,
                memTable: [
                    {
                        partitionAddr: 0,
                        partitionSize: 100,
                        inuse: false,
                        message: '空闲'
                    }
                ],
                minMemSize: 5,
                // freeMemTable: {
                //
                // },
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
                jcbMap: new Map(),
                pcbList: [],
                dialogFormVisible: false,
                globalTime: 0,
                totalMemory: 100,
                totalTapeDriver: 4,
                recordList: [],
                isRunning: false,
                runningPcb: null
            }
        },
        watch: {
            totalMemory(mem) {
                if (!this.isRunning)
                    this.memTable[0].partitionSize = mem;
            }
        },
        methods: {
            deleteJcb(idx) {
                this.jcbList.splice(idx, 1);
            },
            time2Num(time) {
                let times = time.split(':');
                return Number(times[0] * 60) + Number(times[1]);
            },
            num2Time(num) {
                let min = Math.floor(num / 60);
                let sec = num % 60;
                if (min < 10) min = '0' + min;
                if (sec < 10) sec = '0' + sec;
                return min + ':' + sec;
            },
            reset() {
                // this.recordList = []
                this.jcbList.forEach( x => x.status = '后备');
                this.memTable = [
                    {
                        partitionAddr: 0,
                        partitionSize: 100,
                        inuse: false,
                        message: '空闲'
                    }
                ];
                this.jcbMap.clear();
                this.globalTime = 0;
                this.recordList = []
            },
            tableRowClassName({row, rowIndex}) {
                if (row.status === '装入') {
                    return 'running-row';
                } else if (row.status === '后备') {
                    return 'waiting-row';
                } else if (row.status === '完成') {
                    return 'finish-row';
                }
            },
            pcbTableRowClassName({row, rowIndex}) {
                if (row.status === '运行') {
                    return 'running-row';
                } else if (row.status === '就绪') {
                    return 'waiting-row';
                }
            },
            addJcb() {
                console.log(this.inputJcb);
                this.jcbList.push({
                    jobName: this.inputJcb.jobName,
                    arriveTime: this.inputJcb.arriveTime,
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
                if (this.jobServeType === 1) this.fcfs();
                else if (this.jobServeType === 2) this.sjf();
            },
            addRecord(name, message) {
                this.recordList.push({
                    time: this.num2Time(this.globalTime),
                    name,
                    message
                })
            },
            start() {
                let t = Number.MAX_VALUE;
                this.jcbList.forEach( j => {
                    t = Math.min(this.time2Num(j.arriveTime), t);
                });
                this.globalTime = t;
                this.isRunning = true;

                this.selectAndRunJcb();
                this.schedulePcb();
                let intervalId = setInterval(() => {
                    this.globalTime++;
                    if (this.runningPcb != null) this.runningPcb.serveTime++;
                    if (!this.jcbList.some( j => j.status !== '完成')) {
                        clearInterval(intervalId);
                        this.isRunning = false;
                        let totalRtime = 0;
                        this.jcbList.forEach( j => totalRtime += j.rtime);
                        this.addRecord('all', '全部运行完成，周平均转时间为' + (totalRtime / this.jcbList.length).toFixed(2));
                        return;
                    }
                    this.finishPcb();
                    this.selectAndRunJcb();
                    this.schedulePcb();

                }, 500)
            },
            allocateMem(need, jName) {
                for (let i = 0; i < this.memTable.length; i++) {
                    if (!this.memTable[i].inuse && this.memTable[i].partitionSize >= need) {
                        if (this.memTable[i].partitionSize - need < this.minMemSize) {
                            this.memTable[i].inuse = true;
                            this.memTable[i].message = jName + '正在使用'
                        } else {
                            let newAddr = this.memTable[i].partitionAddr + need;
                            this.memTable.splice(i + 1, 0, {
                                partitionAddr: newAddr,
                                partitionSize: this.memTable[i].partitionSize - need,
                                inuse: false,
                                message: '空闲'
                            });
                            // console.log(this.memTable[i].partitionSize);
                            this.memTable[i].partitionSize = need;
                            console.log(this.memTable[i].partitionSize);
                            this.memTable[i].inuse = true;
                            this.memTable[i].message = jName + '正在使用'
                            // console.log(i, this.memTable[i], this.memTable[i].partitionSize);
                        }
                        return true;
                    }
                }
                return false;
            },
            freeMem(name) {
                let index = -1;
                for (let idx = 0; idx < this.memTable.length; idx++) {
                    if (this.memTable[idx].message.indexOf(name) !== -1) {
                        index = idx;
                        break;
                    }
                }

                if (index !== -1) {
                    this.memTable[index].inuse = false;
                    this.memTable[index].message = '空闲';

                    //合并
                    if (index !== this.memTable.length - 1 && !this.memTable[index + 1].inuse) {
                        console.log(this.memTable[index].partitionSize);
                        this.memTable[index].partitionSize += this.memTable[index + 1].partitionSize;
                        this.memTable.splice(index + 1, 1);
                    }
                    if (index !== 0 && !this.memTable[index - 1].inuse) {
                        this.memTable[index - 1].partitionSize += this.memTable[index].partitionSize;
                        this.memTable.splice(index, 1);
                    }
                }
            },
            schedulePcb() {
                let pre = this.runningPcb;
                if (this.pcbList.length !== 0) {
                    if (this.processServeType === 1) {
                        this.runningPcb = this.pcbList[0];
                    } else {
                        this.pcbList.forEach( p => {
                            if (this.runningPcb == null || p.needTime < this.runningPcb.needTime) this.runningPcb = p;
                        })
                    }
                    this.runningPcb.status = '运行';
                    if (pre != null && pre !== this.runningPcb) {
                        pre.status = '就绪';
                        this.addRecord(pre.jobName, '暂停运行');
                        this.addRecord(this.runningPcb.jobName, '运行')
                    } else if (pre == null){
                        this.addRecord(this.runningPcb.jobName, '运行')
                    }
                }
            },
            finishPcb() {
                if (this.runningPcb != null && this.runningPcb.serveTime >= this.runningPcb.needTime) {

                    let j = this.jcbMap.get(this.runningPcb.jobName);
                    j.status = '完成';
                    let rtime = this.globalTime - this.time2Num(j.arriveTime);
                    j.rtime = rtime;
                    this.addRecord(j.jobName, '运行完成，周转时间为' + rtime);
                    j.finishTime = this.num2Time(this.globalTime);
                    this.freeMem(this.runningPcb.jobName);
                    this.totalMemory += j.needMemory;
                    this.totalTapeDriver += j.needTapeDriver;
                    this.pcbList.splice(this.pcbList.indexOf(this.runningPcb), 1);
                    this.runningPcb = null;
                }

            },
            selectAndRunJcb() {   //从符合资源的jcb选择最合适的运行成为pcb
                this.jcbList.filter(j => this.time2Num(j.arriveTime) === this.globalTime).forEach( j => {
                    this.addRecord(j.jobName, '到达')
                });
                this.jcbList.slice()
                    .filter(x => this.time2Num(x.arriveTime) <= this.globalTime && x.status === '后备')
                    .sort( (a, b) =>
                        this.jobServeType === 1 ?
                            this.time2Num(a.arriveTime) - this.time2Num(b.arriveTime) :
                            a.serveTime - b.serveTime
                    )
                    .forEach( j => {
                        if (j.needTapeDriver <= this.totalTapeDriver
                            && this.allocateMem(j.needMemory, j.jobName)) {
                            this.totalMemory -= j.needMemory;
                            this.totalTapeDriver -= j.needTapeDriver;
                            this.pcbList.push({
                                jobName: j.jobName,
                                serveTime: 0,
                                needTime: j.serveTime,
                                status: '就绪'
                            });
                            this.jcbMap.set(j.jobName, j);
                            j.status = '装入';
                            this.addRecord(j.jobName, '装入内存')
                        }
                    })
                // console.log(this.memTable[0].partitionSize);

            }

        }
    })


});