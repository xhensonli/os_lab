
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
                processing: null
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
            setInterval(() => {
                if (this.processing == null && this.queues[0].length !== 0) {
                    this.processing = this.queues[0][0];
                    this.queues[0].splice(0, 1);
                    this.processing.status = '运行';
                    rest = 1;
                    return;
                }
                if (this.processing != null) {
                    this.processing.used++;
                    if (this.processing.used === this.processing.needTime) {
                        //可以撤销
                        this.pcbList.splice(this.pcbList.indexOf(this.processing), 1);
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
                        this.queues[idx].splice(0, 1);
                        rest = 1 << idx;
                    }

                }
            }, 500)

        }
    });

})