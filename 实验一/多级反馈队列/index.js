
$(function () {
    let controller = new Vue({
        el: '#main',
        data() {
            return {
                queues: [
                    [],
                    [],
                    [],
                    []
                ],
                pcbList: [],
                id: 0,
                createList: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                processing: null,
                recordList: []
            }
        },
        methods: {
            createPCB(len) {
                let pcb = {
                    name: 'PCB-'+this.id++,
                    needTime: len,
                    used: 0,
                    pri: 1,
                    status: '就绪'
                };
                this.queues[0].push(pcb);
                this.pcbList.push(pcb);
            }
        },
        created() {
            this.processing = null;
            let rest = 1;
            let time = 0;
            setInterval(() => {
                time++;
                if (this.processing == null && this.queues[0].length !== 0) {
                    this.processing = this.queues[0][0];
                    this.queues[0].splice(0, 1);
                    this.processing.status = '运行';
                    this.recordList.push({
                        time,
                        name: this.processing.name,
                        message: '开始运行'
                    })
                    rest = 1;
                    return;
                }
                if (this.processing != null) {
                    this.processing.used++;
                    if (this.processing.used === this.processing.needTime) {
                        //可以撤销
                        this.pcbList.splice(this.pcbList.indexOf(this.processing), 1);
                        this.recordList.push({
                            time,
                            name: this.processing.name,
                            message: '结束'
                        })
                        this.processing = null;
                        let idx = 0;
                        for (let i = 0; i < this.queues.length; i++) {
                            if (this.queues[i].length !== 0) {
                                idx = i;
                                break;
                            }
                        }
                        this.processing = this.queues[idx][0];
                        if (this.processing.used === 0) {
                            this.recordList.push({
                                time,
                                name: this.processing.name,
                                message: '开始运行'
                            })
                        } else {
                            this.recordList.push({
                                time,
                                name: this.processing.name,
                                message: '重新运行'
                            })
                        }
                        this.processing.status = '运行';
                        this.queues[idx].splice(0, 1);
                        rest = 1 << idx;
                        return;
                    }
                    if ( rest !== 0) {
                        rest--;
                    }
                    if (rest === 0) {
                        this.queues[this.processing.pri].push(this.processing);
                        this.processing.pri++;
                        this.recordList.push({
                            time,
                            name: this.processing.name,
                            message: '时间片耗尽，进入下一队列'
                        })
                        this.processing.status = '就绪';
                        this.processing = null;
                        let idx = 0;
                        for (let i = 0; i < this.queues.length; i++) {
                            if (this.queues[i].length !== 0) {
                                idx = i;
                                break;
                            }
                        }
                        this.processing = this.queues[idx][0];
                        this.processing.status = '运行';
                        if (this.processing.used === 0) {
                            this.recordList.push({
                                time,
                                name: this.processing.name,
                                message: '开始运行'
                            })
                        } else {
                            this.recordList.push({
                                time,
                                name: this.processing.name,
                                message: '重新运行'
                            })
                        }
                        this.queues[idx].splice(0, 1);
                        rest = 1 << idx;
                    }

                }
            }, 500)

        }
    });

})