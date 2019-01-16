'use strict';

Entry.HWMonitor = class HWMonitor {
    constructor(hwModule) {
        this.svgDom = Entry.Dom(
            $(
                '<svg id="hwMonitor" width="100%" height="100%"' +
                    'version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
            )
        );

        this._hwModule = hwModule;
        const that = this;
        Entry.addEventListener('windowResized', function() {
            const mode = that._hwModule.monitorTemplate.mode;
            if (mode === 'both') {
                that.resize();
                that.resizeList();
            }

            if (mode === 'list') {
                that.resizeList();
            } else {
                that.resize();
            }
        });
        Entry.addEventListener('hwModeChange', function() {
            that.changeMode();
        });
        this.changeOffset = 0; // 0 : off 1: on
        this.scale = 0.5;
        this._listPortViews = {};
    }

    initView() {
        this.svgDom = Entry.Dom(
            $(
                '<svg id="hwMonitor" width="100%" height="100%"' +
                    'version="1.1" xmlns="http://www.w3.org/2000/svg"></svg>'
            )
        );
    }
    generateView() {
        this.snap = Entry.SVG('hwMonitor');
        this._svgGroup = this.snap.elem('g');
        this._portMap = {
            n: [],
            e: [],
            s: [],
            w: [],
        };

        const monitorTemplate = this._hwModule.monitorTemplate;

        const imgObj = {
            href: Entry.mediaFilePath + monitorTemplate.imgPath,
            x: -monitorTemplate.width / 2,
            y: -monitorTemplate.height / 2,

            width: monitorTemplate.width,
            height: monitorTemplate.height,
        };

        this._portViews = {};
        this.hwView = this._svgGroup.elem('image');
        this.hwView = this.hwView.attr(imgObj);
        this._template = monitorTemplate;
        const ports = monitorTemplate.ports;
        this.pathGroup = null;
        this.pathGroup = this._svgGroup.elem('g');

        const portsTemp = [];
        for (const key in ports) {
            const port = ports[key];
            const portView = this.generatePortView(port, '_svgGroup');

            this._portViews[key] = portView;
            portsTemp.push(portView);
        }

        portsTemp.sort(function(a, b) {
            return a.box.x - b.box.x;
        });

        const portMap = this._portMap;

        portsTemp.map(function(v) {
            const degree = (Math.atan2(-v.box.y, v.box.x) / Math.PI + 2) % 2;
            let map;

            if (degree < 1) {
                map = portMap.n;
            } else {
                map = portMap.s;
            }
            map.push(v);
        });
        this.resize();
    }

    toggleMode(mode) {
        const monitorTemplate = this._hwModule.monitorTemplate;
        if (mode === 'list') {
            monitorTemplate.TempPort = null;
            if (this._hwModule.monitorTemplate.ports) {
                this._hwModule.monitorTemplate.TempPort = this._hwModule.monitorTemplate.ports;
                this._hwModule.monitorTemplate.listPorts = this.addPortEle(
                    this._hwModule.monitorTemplate.listPorts,
                    this._hwModule.monitorTemplate.ports
                );
            }

            $(this._svglistGroup).remove();

            if (this._svgGroup) {
                $(this._svgGroup).remove();
            }

            $(this._pathGroup).remove();
            this._hwModule.monitorTemplate.mode = 'list';
            this.generateListView();
        } else {
            if (this._hwModule.monitorTemplate.TempPort) {
                this._hwModule.monitorTemplate.ports = this._hwModule.monitorTemplate.TempPort;
                this._hwModule.monitorTemplate.listPorts = this.removePortEle(
                    this._hwModule.monitorTemplate.listPorts,
                    this._hwModule.monitorTemplate.ports
                );
            }

            $(this._svglistGroup).remove();
            this._hwModule.monitorTemplate.mode = 'both';
            this.generateListView();
            this.generateView();
        }
    }

    setHwmonitor(module) {
        this._hwmodule = module;
    }

    changeMode() {
        if (this._hwModule.monitorTemplate.mode === 'both') {
            this.toggleMode('list');
        } else if (this._hwModule.monitorTemplate.mode === 'list') {
            this.toggleMode('both');
        } else {
            return;
        }
    }

    addPortEle(listPort, ports) {
        if (typeof ports !== 'object') {
            return listPort;
        }

        for (const item in ports) {
            listPort[item] = ports[item];
        }

        return listPort;
    }

    removePortEle(listPort, ports) {
        if (typeof ports !== 'object') {
            return listPort;
        }

        for (const item in ports) {
            delete listPort[item];
        }
        return listPort;
    }

    generateListView() {
        this._portMapList = {
            n: [],
        };
        this._svglistGroup = null;

        this.listsnap = Entry.SVG('hwMonitor');
        this._svglistGroup = this.listsnap.elem('g');
        const monitorTemplate = this._hwModule.monitorTemplate;
        this._template = monitorTemplate;
        const ports = monitorTemplate.listPorts;

        this.pathGroup = this._svglistGroup.elem('g');

        const portsTempList = [];

        for (const key in ports) {
            const port = ports[key];
            const portView = this.generatePortView(port, '_svglistGroup');

            this._listPortViews[key] = portView;
            portsTempList.push(portView);
        }
        const portMapList = this._portMapList;

        portsTempList.map(function(v) {
            portMapList.n.push(v);
        });

        this.resizeList();
    }

    generatePortView(port, target) {
        const svgGroup = this[target].elem('g');
        svgGroup.addClass('hwComponent');
        let path = null;

        path = this.pathGroup.elem('path').attr({
            d: 'm0,0',
            fill: 'none',
            stroke: port.type === 'input' ? '#00CFCA' : '#CA7DFF',
            'stroke-width': 3,
        });

        const wrapperRect = svgGroup.elem('rect').attr({
            x: 0,
            y: 0,
            width: 150,
            height: 22,
            rx: 4,
            ry: 4,
            fill: '#fff',
            stroke: '#a0a1a1',
        });
        const nameView = svgGroup.elem('text').attr({
            x: 4,
            y: 12,
            fill: '#000',
            class: 'hwComponentName',
            'alignment-baseline': 'central',
        });
        nameView.textContent = port.name;

        let width = nameView.getComputedTextLength();

        svgGroup.elem('rect').attr({
            x: width + 8,
            y: 2,
            width: 30,
            height: 18,
            rx: 9,
            ry: 9,
            fill: port.type === 'input' ? '#00CFCA' : '#CA7DFF',
        });

        const valueView = svgGroup.elem('text').attr({
            x: width + 13,
            y: 12,
            fill: '#fff',
            class: 'hwComponentValue',
            'alignment-baseline': 'central',
        });
        valueView.textContent = 0;
        width += 40;

        wrapperRect.attr({
            width,
        });

        const returnObj = {
            group: svgGroup,
            value: valueView,
            type: port.type,
            path,
            box: {
                x: port.pos.x - this._template.width / 2,
                y: port.pos.y - this._template.height / 2,
                width,
            },
            width,
        };

        return returnObj;
    }

    getView() {
        return this.svgDom;
    }

    update() {
        const portData = Entry.hw.portData;
        const sendQueue = Entry.hw.sendQueue;
        const mode = this._hwModule.monitorTemplate.mode;
        const objectKeys = this._hwModule.monitorTemplate.keys || [];
        let portView = [];

        if (mode === 'list') {
            portView = this._listPortViews;
        } else if (mode === 'both') {
            portView = this._listPortViews;

            if (this._portViews) {
                for (const item in this._portViews) {
                    portView[item] = this._portViews[item];
                }
            }
        } else {
            portView = this._portViews;
        }

        if (sendQueue) {
            for (const item in sendQueue) {
                if (sendQueue[item] != 0 && portView[item]) {
                    portView[item].type = 'output';
                }
            }
        }

        for (const key in portView) {
            const port = portView[key];

            if (port.type === 'input') {
                let value = portData[key];
                if (objectKeys.length > 0) {
                    $.each(objectKeys, function(idx, valueKey) {
                        if ($.isPlainObject(value)) {
                            value = value[valueKey] || 0;
                        } else {
                            return false;
                        }
                    });
                    port.value.textContent = value ? value : 0;
                    port.group.getElementsByTagName('rect')[1].attr({ fill: '#00CFCA' });
                } else {
                    port.value.textContent = value ? value : 0;
                    port.group.getElementsByTagName('rect')[1].attr({ fill: '#00CFCA' });
                }
            } else {
                let value = sendQueue[key];
                if (objectKeys.length > 0) {
                    $.each(objectKeys, function(idx, valueKey) {
                        if ($.isPlainObject(value)) {
                            value = value[valueKey] || 0;
                        } else {
                            return false;
                        }
                    });
                    port.value.textContent = value ? value : 0;
                    port.group.getElementsByTagName('rect')[1].attr({ fill: '#CA7DFF' });
                } else {
                    port.value.textContent = value ? value : 0;
                    port.group.getElementsByTagName('rect')[1].attr({ fill: '#CA7DFF' });
                }
            }
        }
    }

    resize() {
        if (this.hwView) {
            this.hwView.attr({
                transform: `scale(${this.scale})`,
            });
        }

        let bRect = {};
        if (this.svgDom) {
            bRect = this.svgDom.get(0).getBoundingClientRect();
        }

        this._svgGroup.attr({
            transform: `translate(${bRect.width / 2},${bRect.height / 1.8})`,
        });

        this._rect = bRect;

        if (this._template.height <= 0 || bRect.height <= 0) {
            return;
        }

        this.scale = this._template.height * (bRect.height / this._template.height) / 1000;
        this.align();
    }

    resizeList() {
        const bRect = this.svgDom.get(0).getBoundingClientRect();
        this._svglistGroup.attr({
            transform: `translate(${bRect.width / 2},${bRect.height / 2})`,
        });
        this._rect = bRect;
        this.alignList();
    }

    align() {
        let ports = this._portMap.s.concat();
        this._alignNS(ports, this._template.height * (this.scale / 3) + 5, 27);

        ports = this._portMap.n.concat();
        this._alignNS(ports, -this._template.height * this.scale / 3 - 32, -27);
    }

    alignList() {
        let ports = {};
        ports = this._hwModule.monitorTemplate.listPorts;
        const length = ports.length;
        for (let i = 0; i < ports.length; i++) {
            const port = ports[i];

            port.group.attr({
                transform: `translate(${this._template.width * (i / length - 0.5)},${-this._template
                    .width /
                    2 -
                    30})`,
            });
        }

        ports = this._portMapList.n.concat();
        this._alignNSList(ports, -this._template.width * this.scale / 2 - 32, -27);
    }

    _alignNS(ports, yCursor, gap) {
        let lP = -this._rect.width / 2;
        let rP = this._rect.width / 2;
        const width = this._rect.width;
        let wholeWidth = 0;

        for (let i = 0; i < ports.length; i++) {
            wholeWidth += ports[i].width + 5;
        }

        if (wholeWidth < rP - lP) {
            rP = wholeWidth / 2 + 3;
            lP = -wholeWidth / 2 - 3;
        }

        while (ports.length > 1) {
            const lPort = ports.shift();
            const rPort = ports.pop();
            const prevLP = lP;
            const prevRP = rP;
            let gapTemp = gap;
            if (wholeWidth <= rP - lP) {
                lP += lPort.width + 5;
                rP -= rPort.width + 5;
                gapTemp = 0;
            } else if (ports.length === 0) {
                lP = (lP + rP) / 2 - 3;
                rP = lP + 6;
            } else {
                lP = Math.max(lP, -width / 2 + lPort.width) + 15;
                rP = Math.min(rP, width / 2 - rPort.width) - 15;
            }

            this._movePort(lPort, lP, yCursor, prevLP);
            this._movePort(rPort, rP, yCursor, prevRP);

            wholeWidth -= lPort.width + rPort.width + 10;
            yCursor += gapTemp;
        }

        if (ports.length) {
            this._movePort(ports[0], (rP + lP - ports[0].width) / 2, yCursor, 100);
        }
    }

    _alignNSList(ports) {
        const width = this._rect.width;
        let initX = -this._rect.width / 2 + 10;
        const initY = -this._rect.height / 2 + 10;

        let lineIndent = 0;
        let currentWidth = 0;
        const tempXpos = initX;
        let Yval = 0;
        let cPort = 0;
        let nPort = 0;
        for (let i = 0; i < ports.length; i++) {
            cPort = ports[i];

            if (i !== ports.length - 1) {
                nPort = ports[i + 1];
            }

            currentWidth += cPort.width;

            const lP = initX;
            Yval = initY + lineIndent * 30;
            cPort.group.attr({
                transform: `translate(${lP},${Yval})`,
            });
            initX += cPort.width + 10;

            if (currentWidth > width - (cPort.width + nPort.width / 2.2)) {
                lineIndent += 1;
                initX = tempXpos;
                currentWidth = 0;
            }
        }
    }

    _movePort(port, x, y, prevPointer) {
        let groupX = x;
        let path;
        const portX = port.box.x * this.scale;
        const portY = port.box.y * this.scale;

        if (x > prevPointer) {
            // left side
            groupX = x - port.width;
            if (x > portX && portX > prevPointer) {
                path = `M${portX},${y}L${portX},${portY}`;
            } else {
                path = `M${(x + prevPointer) / 2},${y}l0,${
                    portY > y ? 28 : -3
                }H${portX}L${portX},${portY}`;
            }
        } else if (x < portX && portX < prevPointer) {
            // right side
            path = `m${portX},${y}L${portX},${portY}`;
        } else {
            path = `m${(prevPointer + x) / 2},${y}l0,${
                portY > y ? 28 : -3
            }H${portX}L${portX},${portY}`;
        }

        port.group.attr({ transform: `translate(${groupX},${y})` });
        port.path.attr({ d: path });
    }
};