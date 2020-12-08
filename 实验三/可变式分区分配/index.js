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
                optTable: []
                // formLabelWidth: '100%',
            }
        },

        methods: {

            allocate(name, size) {
                let index = -1;
                let addr = -1;
                for (let idx of this.memTable) {
                    let mem = this.memTable[idx];
                    if (mem.message === '空闲') {
                        if (mem.partitionSize - size > this.minSize) {
                            addr = mem.partitionAddr;
                            mem.partitionAddr += size;
                            mem.partitionSize -= size;
                            index = idx;
                        } else if (mem.partitionSize > size) {
                            mem.message = '正在使用';
                            mem.status = 1;
                        }
                    }
                }
            }
        }
    })


})