$(function () {


    let main = new Vue({
        el: '#main',
        data() {
            return {
                processList: [],
                totalResource1: 3,
                totalResource2: 3,
                isSafe: true,
                dialogFormVisible: false,
                inputProcess: {
                    processName: '',
                    hasResource1: 0,
                    hasResource2: 0,
                    needResource1: 0,
                    needResource2: 0
                }
            }
        },

        methods: {
            getRowColor() {
                if(this.isSafe) return 'safe-row';
                else return 'unsafe-row';
            },
            addProcess() {
                this.inputProcess.hasResource1 = Number(this.inputProcess.hasResource1);
                this.inputProcess.hasResource2 = Number(this.inputProcess.hasResource2);
                this.inputProcess.needResource1 = Number(this.inputProcess.needResource1);
                this.inputProcess.needResource2 = Number(this.inputProcess.needResource2);
                this.processList.push(this.inputProcess);
                this.inputProcess = {
                    processName: '',
                    hasResource1: 0,
                    hasResource2: 0,
                    needResource1: 0,
                    needResource2: 0
                }
                this.dialogFormVisible = false;
                this.calculate();
            },
            deleteProcess(index) {
                this.processList.splice(index, 1);
                this.calculate();
            },
            calculate() {
                let restResource1 = this.totalResource1, restResource2 = this.totalResource2;

                let list = JSON.parse(JSON.stringify(this.processList));
                console.log(list);
                list.forEach(p => console.log(p.hasResource1, p.hasResource2, p.needResource1, p.needResource2))
                while (true) {
                    list = list.filter( p => p.hasResource1 > 0 || p.hasResource2 > 0 || p.needResource1 > 0 || p.needResource2 > 0);
                    if (list.length === 0) {
                        this.isSafe = true;
                        return;
                    }
                    restResource1 = this.totalResource1;
                    restResource2 = this.totalResource2;
                    list.forEach( p => {
                        restResource1 -= p.hasResource1;
                        restResource2 -= p.hasResource2;
                        console.log(restResource1, restResource2);
                    });
                    if (restResource1 < 0 || restResource2 < 0) {
                        this.isSafe = false;
                        return;
                    }
                    let hasRelease = false;
                    list.forEach( p => {
                        if (p.needResource1 <= restResource1 && p.needResource2 <= restResource2) {
                            p.needResource1 = 0;
                            p.needResource2 = 0;
                            p.hasResource1 = 0;
                            p.hasResource2 = 0;
                            hasRelease = true;
                        }
                    })
                    if (!hasRelease) {
                        this.isSafe = false;
                        return;
                    }
                }
            }
        }
    })


})