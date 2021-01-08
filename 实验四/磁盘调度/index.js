$(function () {


    let main = new Vue({
        el: '#main',
        data() {
            return {
                queue1: [],
                queue2: [],
                usingQ1: true,
                tracks: [7, 6, 5, 4, 3, 2, 1],
                isGoingUp: true,
                target: 8,
                isReading: true,
                hasNew: false,
                current: 8,
                status: 2,//0 正在移动，1 到达， 2 停滞,
                findingTime :0,
                orderList: []
            }
        },

        methods: {
            process() {

                setInterval(() => {
                    // if (this.target > 0) {
                        // if (this.isGoingUp) {
                        // if (this.usingQ1 && this.queue1.length === 0 || !this.usingQ1 && this.queue2.length === 0) return;
                    if (this.target === this.current) {
                        // this.isReading === true ? this.isReading = true;
                        // this.isReading = false;
                        let q = this.usingQ1 ? this.queue1 : this.queue2;
                        if (this.status === 0) {
                            this.status = 1;
                            return;//只管读就完事了
                        }
                        else if (this.status === 1) {
                            this.status = 2;
                            q.splice(q.indexOf(this.target), 1);
                        }
                        let candidate = q.filter(x => this.isGoingUp ? x >= this.current : x <= this.current)
                            .sort((x, y) => this.isGoingUp ? x - y : y - x);

                        if (candidate.length === 0) {//这个方向上没有
                            this.isGoingUp = !this.isGoingUp;
                            candidate = q.filter(x => this.isGoingUp ? x >= this.current : x <= this.current)
                                .sort((x, y) => this.isGoingUp ? x - y : y - x);
                            if (candidate.length === 0) {//另一个方向也没有，队列已空
                                this.usingQ1 = !this.usingQ1;
                            } else {//返回时有任务
                                this.target = candidate[0];
                                this.orderList.push(this.target);
                                console.log("push");
                                if (this.target === this.current) this.status = 1;
                                else {
                                    this.status = 0;
                                    this.isGoingUp? this.current++ : this.current--;
                                }
                                this.isReading = true;
                            }
                        } else {
                            this.target = candidate[0];
                            this.orderList.push(this.target);
                            console.log("push");
                            if (this.target === this.current) this.status = 1;
                            else {
                                this.status = 0;
                                this.isGoingUp? this.current++ : this.current--;
                            }
                            this.isReading = true;
                        }
                    } else {
                        this.isGoingUp? this.current++ : this.current--;
                        this.findingTime++;
                    }
                        // }
                    // }
                }, 1000);
            },
            addTask(track) {
                (this.usingQ1 ? this.queue2 : this.queue1).push(track);
            },
            getStatusMsg() {
                switch (this.status) {
                    case 0: return '正在移动';
                    case 1: return '正在读取';
                    case 2: return '停止';
                }
            }
        },
        created() {
            this.process();
        }
    })


})