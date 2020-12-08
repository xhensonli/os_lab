$(function () {


    let main = new Vue({
        el: '#main',
        data() {
            return {
                serveType: 1,
                minSize: 10,
                memTable: [
                    {
                        partitionAddr: 0,
                        partitionSize: 60,
                        message: '操作系统使用',
                        status: 1
                    },
                    {
                        partitionAddr: 60,
                        partitionSize: 600,
                        message: '空闲',
                        status: 0
                    }
                ],
                currentIndex: -1,
                optTable: [
                    {
                        name: '作业1',
                        opt: 0,
                        size: 130
                    },
                    {
                        name: '作业2',
                        opt: 0,
                        size: 60
                    },
                    {
                        name: '作业3',
                        opt: 0,
                        size: 100
                    },
                    {
                        name: '作业2',
                        opt: 1,
                        size: 60
                    },
                    {
                        name: '作业4',
                        opt: 0,
                        size: 200
                    },
                    {
                        name: '作业3',
                        opt: 1,
                        size: 100
                    },
                    {
                        name: '作业1',
                        opt: 1,
                        size: 130
                    },{
                        name: '作业5',
                        opt: 0,
                        size: 140
                    },
                    {
                        name: '作业6',
                        opt: 0,
                        size: 60
                    },
                    {
                        name: '作业7',
                        opt: 0,
                        size: 50
                    }

                ],
                isRunning: false,
                circleIndex: 0
                // formLabelWidth: '100%',
            }
        },

        methods: {
            memTableClassName({row, rowIndex}) {
                if (row.status === 0) return 'free-row';
                else return 'inuse-row'
            },
            process() {
                this.isRunning = true;
                let intervalId = setInterval(() => {
                    if (this.currentIndex === this.optTable.length - 2) {//保证下面的++this.currentIndex 在正确范围内
                        this.isRunning = false;
                        clearInterval(intervalId);//清除定时器并继续这次执行
                    }
                    let option = this.optTable[++this.currentIndex];
                    if (option.opt === 0) {
                        this.serveType === 1 ? this.allocate(option.name, option.size) : this.circulateAllocate(option.name, option.size);
                    } else {
                        this.free(option.name);
                    }
                }, 1000)
            },
            reset() {
                this.currentIndex = -1;
                this.memTable = [
                    {
                        partitionAddr: 0,
                        partitionSize: 60,
                        message: '操作系统使用',
                        status: 1
                    },
                    {
                        partitionAddr: 60,
                        partitionSize: 600,
                        message: '空闲',
                        status: 0
                    }
                ];
                this.circleIndex = 0;
            },
            allocate(name, size) {
                let index = -1;
                let addr = -1;
                for (let idx = 0; idx < this.memTable.length; idx++) {
                    let mem = this.memTable[idx];
                    if (mem.message === '空闲') {
                        if (mem.partitionSize - size > this.minSize) {
                            addr = mem.partitionAddr;
                            mem.partitionAddr += size;
                            mem.partitionSize -= size;
                            index = idx;
                            break;
                        } else if (mem.partitionSize > size) {
                            mem.message = name + '正在使用';
                            mem.status = 1;
                            break;
                        }
                    }
                }
                if (index !== -1) {
                    this.memTable.splice(index, 0, {
                        partitionAddr: addr,
                        partitionSize: size,
                        message: name + '正在使用',
                        status: 1
                    })
                }
            },
            circulateAllocate(name, size) {
                let index = -1;
                let addr = -1;
                while (true) {
                    let idx = this.circleIndex++ % this.memTable.length;
                    let mem = this.memTable[idx];
                    if (mem.message === '空闲') {
                        if (mem.partitionSize - size > this.minSize) {
                            addr = mem.partitionAddr;
                            mem.partitionAddr += size;
                            mem.partitionSize -= size;
                            index = idx;
                            break;
                        } else if (mem.partitionSize > size) {
                            mem.message = name + '正在使用';
                            mem.status = 1;
                            break;
                        }
                    }
                }
                if (index !== -1) {
                    this.memTable.splice(index, 0, {
                        partitionAddr: addr,
                        partitionSize: size,
                        message: name + '正在使用',
                        status: 1
                    })
                }
            },
            free(name) {
                let index = -1;
                for (let idx = 0; idx < this.memTable.length; idx++) {
                    if (this.memTable[idx].message.indexOf(name) !== -1) {
                        index = idx;
                        break;
                    }
                }

                if (index !== -1) {
                    this.memTable[index].status = 0;
                    this.memTable[index].message = '空闲';

                    //合并
                    if (index !== this.memTable.length - 1 && this.memTable[index + 1].status === 0) {
                        this.memTable[index].partitionSize += this.memTable[index + 1].partitionSize;
                        this.memTable.splice(index + 1, 1);
                    }
                    if (index !== 0 && this.memTable[index - 1].status === 0) {
                        this.memTable[index - 1].partitionSize += this.memTable[index].partitionSize;
                        this.memTable.splice(index, 1);
                    }
                }
            }
        }
    })


})