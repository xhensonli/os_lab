$(function () {
    let main = new Vue({
        el: '#main',
        data() {
            return {
                pcbList: [],
                list: [],
                processing: null,
                inputList: [1, 2, 3, 4, 5, 6, 7, 8, 9],
                id: 0,
                period: 0
            }
        },
        methods: {
            createPCB(len) {
                let pcb = {
                    name: 'PCB-' + this.id++,
                    needTime: len,
                    serveTime: len
                };
                this.pcbList.push(pcb);
                this.list.push(pcb)
            }
        },
        created() {
            setInterval(() => {
                if (this.pcbList.length !== 0 || this.processing != null) {
                    if (this.processing == null) {
                        this.processing = this.pcbList[0];
                        this.pcbList.splice(0, 1);
                    }
                    if (this.period === 3) {
                        if (this.processing.needTime !==0) {
                            this.pcbList.push(this.processing);
                        } else {
                            this.list.splice(this.list.indexOf(this.processing), 1);
                        }
                        this.processing = this.pcbList[0];
                        this.pcbList.splice(0, 1);
                        this.period = 0;
                    } else {
                        if (this.processing.needTime === 0) {
                            this.list.splice(this.list.indexOf(this.processing), 1);
                            this.processing = null;
                            this.period = 0;
                        } else this.period++;
                    }
                    this.processing && this.processing.needTime--;
                }
            }, 500);
        }
    })
})