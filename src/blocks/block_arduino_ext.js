"use strict";

Entry.ArduinoExt = {
    name: 'ArduinoExt',
    setZero: function () {
        if(!Entry.hw.sendQueue.SET) {
            Entry.hw.sendQueue = {
                GET: {},
                SET: {},
            }
        } else {
            var keySet = Object.keys(Entry.hw.sendQueue.SET);
            keySet.forEach(function (key) {
                Entry.hw.sendQueue.SET[key].data = 0;
                Entry.hw.sendQueue.SET[key].time = new Date().getTime();
            });
        }
        Entry.hw.update();
    },
    sensorTypes: {
        ALIVE: 0,
        DIGITAL: 1,
        ANALOG: 2,
        PWM: 3,
        SERVO_PIN: 4,
        TONE: 5,
        PULSEIN: 6,
        ULTRASONIC: 7,
        TIMER: 8
    },
    toneTable: {
        "0": 0,
        "C": 1,
        "CS": 2,
        "D": 3,
        "DS": 4,
        "E": 5,
        "F": 6,
        "FS": 7,
        "G": 8,
        "GS": 9,
        "A": 10,
        "AS": 11,
        "B": 12,
    },
    toneMap: {
        "1": [33, 65, 131, 262, 523, 1046, 2093, 4186],
        "2": [35, 69, 139, 277, 554, 1109, 2217, 4435],
        "3": [37, 73, 147, 294, 587, 1175, 2349, 4699],
        "4": [39, 78, 156, 311, 622, 1245, 2849, 4978],
        "5": [41, 82, 165, 330, 659, 1319, 2637, 5274],
        "6": [44, 87, 175, 349, 698, 1397, 2794, 5588],
        "7": [46, 92, 185, 370, 740, 1480, 2960, 5920],
        "8": [49, 98, 196, 392, 784, 1568, 3136, 6272],
        "9": [52, 104, 208, 415, 831, 1661, 3322, 6645],
        "10": [55, 110, 220, 440, 880, 1760, 3520, 7040],
        "11": [58, 117, 233, 466, 932, 1865, 3729, 7459],
        "12": [62, 123, 247, 494, 988, 1976, 3951, 7902]
    },
    highList: [
        'high', '1', 'on'
    ],
    lowList: [
        'low', '0', 'off'
    ],
    BlockState: {
    },
    blocks: {}
}

Entry.ArduinoExt.getBlocks = function () {
    return {
        "arduino_ext_get_analog_value": {
            "color": "#00979D",
            "fontColor": "#fff",
            "skeleton": "basic_string_field",
            "statements": [],
            "params": [
                {
                    "type": "Block",
                    "accept": "string"
                }
            ],
            "events": {},
            "def": {
                "params": [
                    {
                        "type": "arduino_ext_analog_list"
                    }
                ],
                "type": "arduino_ext_get_analog_value"
            },
            "paramsKeyMap": {
                "PORT": 0
            },
            "class": "ArduinoExtGet",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var port = script.getValue("PORT", script);
                var ANALOG = Entry.hw.portData.ANALOG;
                if (port[0] === "A")
                    port = port.substring(1)
                return ANALOG ? ANALOG[port] || 0 : 0;
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.analogRead(%1)",
                    blockType: "param",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}
        },
        "arduino_ext_get_analog_value_map": {
            "color": "#00979D",
            "fontColor": "#fff",
            "skeleton": "basic_string_field",
            "statements": [],
            "params": [
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                }
            ],
            "events": {},
            "def": {
                "params": [
                    {
                        "type": "arduino_ext_get_analog_value",
                        "params": [
                            {
                                "type": "arduino_ext_analog_list"
                            }
                        ]
                    },
                    {
                        "type": "number",
                        "params": [ "0" ]
                    },
                    {
                        "type": "number",
                        "params": [ "1023" ]
                    },
                    {
                        "type": "number",
                        "params": [ "0" ]
                    },
                    {
                        "type": "number",
                        "params": [ "100" ]
                    }
                ],
                "type": "arduino_ext_get_analog_value_map"
            },
            "paramsKeyMap": {
                "PORT": 0,
                "VALUE2": 1,
                "VALUE3": 2,
                "VALUE4": 3,
                "VALUE5": 4
            },
            "class": "ArduinoExtGet",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var result = script.getValue("PORT", script);
                var ANALOG = Entry.hw.portData.ANALOG;
                var value2 = script.getNumberValue("VALUE2", script);
                var value3 = script.getNumberValue("VALUE3", script);
                var value4 = script.getNumberValue("VALUE4", script);
                var value5 = script.getNumberValue("VALUE5", script);

                if (value2 > value3) {
                    var swap = value2;
                    value2 = value3;
                    value3 = swap;
                }
                if (value4 > value5) {
                    var swap = value4;
                    value4 = value5;
                    value5 = swap;
                }
                result -= value2;
                result = result * ((value5 - value4) / (value3 - value2));
                result += value4;
                result = Math.min(value5, result);
                result = Math.max(value4, result);

                return result
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.map(%1, %2, %3, %4, %5)",
                    blockType: "param",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}
        },
        "arduino_ext_get_ultrasonic_value": {
            "color": "#00979D",
            "fontColor": "#fff",
            "skeleton": "basic_string_field",
            "statements": [],
            "params": [
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                }
            ],
            "events": {},
            "def": {
                "params": [{
                    type: 'arduino_get_port_number',
                    params: [ '2' ],
                }, {
                    type: 'arduino_get_port_number',
                    params: [ '4' ],
                }],
                "type": "arduino_ext_get_ultrasonic_value"
            },
            "paramsKeyMap": {
                "PORT1": 0,
                "PORT2": 1,
            },
            "class": "ArduinoExtGet",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var port1 = script.getNumberValue("PORT1", script);
                var port2 = script.getNumberValue("PORT2", script);

                if(!Entry.hw.sendQueue['SET']) {
                    Entry.hw.sendQueue['SET'] = {};
                }
                delete Entry.hw.sendQueue['SET'][port1];
                delete Entry.hw.sendQueue['SET'][port2];

                if(!Entry.hw.sendQueue['GET']) {
                    Entry.hw.sendQueue['GET'] = {};
                }
                Entry.hw.sendQueue['GET'][Entry.ArduinoExt.sensorTypes.ULTRASONIC] = {
                    port: [port1, port2],
                    time: new Date().getTime()
                };
                return Entry.hw.portData.ULTRASONIC || 0;
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.ultrasonicRead(%1, %2)",
                    blockType: "param",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string",
                        },
                        {
                            "type": "Block",
                            "accept": "string",
                        }
                    ]
                }

            ]}
        },
        "arduino_ext_get_digital": {
            "color": "#00979D",
            "fontColor": "#fff",
            "skeleton": "basic_boolean_field",
            "params": [{
                "type": "Block",
                "accept": "string"
            }],
            "events": {},
            "def": {
                "params": [
                    {
                        "type": "arduino_get_port_number"
                    }
                ],
                "type": "arduino_ext_get_digital"
            },
            "paramsKeyMap": {
                "PORT": 0
            },
            "class": "ArduinoExtGet",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var port = script.getNumberValue("PORT", script);
                var DIGITAL = Entry.hw.portData.DIGITAL;
                if(!Entry.hw.sendQueue['GET']) {
                    Entry.hw.sendQueue['GET'] = {};
                }
                Entry.hw.sendQueue['GET'][Entry.ArduinoExt.sensorTypes.DIGITAL] = {
                    port: port,
                    time: new Date().getTime()
                };
                return (DIGITAL) ? DIGITAL[port] || 0 : 0;
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.digitalRead(%1)",
                    keyOption: "ext",
                    blockType: "param",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}
        },
        "arduino_get_digital_toggle": {
            "color": "#00979D",
            "skeleton": "basic_string_field",
            "statements": [],
            "params": [
                {
                    "type": "Dropdown",
                    "options": [
                        [Lang.Blocks.ARDUINO_on,"on"],
                        [Lang.Blocks.ARDUINO_off,"off"]
                    ],
                    "value": "on",
                    "fontSize": 11,
                    'arrowColor': EntryStatic.ARROW_COLOR_HW
                }
            ],
            "events": {},
            "def": {
                "params": [ null ]
            },
            "paramsKeyMap": {
                "OPERATOR": 0
            },
            "func": function (sprite, script) {
                return script.getStringField("OPERATOR");
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "%1",
                    textParams: [
                        {
                            "type": "Dropdown",
                            "options": [
                                [Lang.Blocks.ARDUINO_on,"on"],
                                [Lang.Blocks.ARDUINO_off,"off"]
                            ],
                            "value": "on",
                            "fontSize": 11,
                            'arrowColor': EntryStatic.ARROW_COLOR_HW,
                            converter: Entry.block.converters.returnStringValueUpperCase,
                            codeMap: "Entry.CodeMap.Arduino.arduino_get_digital_toggle[0]"
                        }
                    ],
                    keyOption: "arduino_get_digital_toggle"
                }
            ]}
        },
        "arduino_ext_toggle_led": {
            "color": "#00979D",
            "skeleton": "basic",
            "statements": [],
            "params": [
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Indicator",
                    "img": "block_icon/hardware_03.png",
                    "size": 12
                }
            ],
            "events": {},
            "def": {
                "params": [
                    {
                        "type": "arduino_get_port_number"
                    },
                    {
                        "type": "arduino_get_digital_toggle",
                        "params": [ "on" ],
                    },
                    null
                ],
                "type": "arduino_ext_toggle_led"
            },
            "paramsKeyMap": {
                "PORT": 0,
                "VALUE": 1
            },
            "class": "ArduinoExt",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var port = script.getNumberValue("PORT");
                var value = script.getValue("VALUE");

                if(typeof value === 'string') {
                    value = value.toLowerCase();
                }
                if(Entry.ArduinoExt.highList.indexOf(value) > -1) {
                    value = 255;
                } else if(Entry.ArduinoExt.lowList.indexOf(value) > -1) {
                    value = 0;
                } else {
                    throw new Error();
                }
                if(!Entry.hw.sendQueue['SET']) {
                    Entry.hw.sendQueue['SET'] = {};
                }
                Entry.hw.sendQueue['SET'][port] = {
                    type: Entry.ArduinoExt.sensorTypes.DIGITAL,
                    data: value,
                    time: new Date().getTime()
                };
                return script.callReturn();
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.digitalWrite(%1, %2)",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}

        },
        "arduino_ext_digital_pwm": {
            "color": "#00979D",
            "skeleton": "basic",
            "statements": [],
            "params": [
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Block",
                    "accept": "string"
                },
                {
                    "type": "Indicator",
                    "img": "block_icon/hardware_03.png",
                    "size": 12
                }
            ],
            "events": {},
            "def": {
                "params": [
                    {
                        "type": "arduino_get_pwm_port_number"
                    },
                    {
                        "type": "text",
                        "params": [ "255" ]
                    },
                    null
                ],
                "type": "arduino_ext_digital_pwm"
            },
            "paramsKeyMap": {
                "PORT": 0,
                "VALUE": 1
            },
            "class": "ArduinoExt",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var port = script.getNumberValue("PORT");
                var value = script.getNumberValue("VALUE");
                value = Math.round(value);
                value = Math.max(value, 0);
                value = Math.min(value, 255);
                if(!Entry.hw.sendQueue['SET']) {
                    Entry.hw.sendQueue['SET'] = {};
                }
                Entry.hw.sendQueue['SET'][port] = {
                    type: Entry.ArduinoExt.sensorTypes.PWM,
                    data: value,
                    time: new Date().getTime()
                };
                return script.callReturn();
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.analogWrite(%1, %2)",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}
        },
        "arduino_ext_tone_list": {
            "color": "#00979D",
            "skeleton": "basic_string_field",
            "statements": [],
            "template": "%1",
            "params": [
                {
                    "type": "Dropdown",
                    "options": [
                        [Lang.Blocks.silent, "0"],
                        [Lang.Blocks.do_name, "C"],
                        [Lang.Blocks.do_sharp_name, "CS"],
                        [Lang.Blocks.re_name, "D"],
                        [Lang.Blocks.re_sharp_name, "DS"],
                        [Lang.Blocks.mi_name, "E"],
                        [Lang.Blocks.fa_name, "F"],
                        [Lang.Blocks.fa_sharp_name, "FS"],
                        [Lang.Blocks.sol_name, "G"],
                        [Lang.Blocks.sol_sharp_name, "GS"],
                        [Lang.Blocks.la_name, "A"],
                        [Lang.Blocks.la_sharp_name, "AS"],
                        [Lang.Blocks.si_name, "B"]
                    ],
                    "value": "C",
                    "fontSize": 11
                }
            ],
            "events": {},
            "def": {
                "params": [ null ]
            },
            "paramsKeyMap": {
                "NOTE": 0
            },
            "func": function (sprite, script) {
                return script.getField("NOTE");
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "%1",
                    textParams: [
                        {
                            "type": "Dropdown",
                            "options": [
                                [Lang.Blocks.silent, "0"],
                                [Lang.Blocks.do_name, "C"],
                                [Lang.Blocks.do_sharp_name, "CS"],
                                [Lang.Blocks.re_name, "D"],
                                [Lang.Blocks.re_sharp_name, "DS"],
                                [Lang.Blocks.mi_name, "E"],
                                [Lang.Blocks.fa_name, "F"],
                                [Lang.Blocks.fa_sharp_name, "FS"],
                                [Lang.Blocks.sol_name, "G"],
                                [Lang.Blocks.sol_sharp_name, "GS"],
                                [Lang.Blocks.la_name, "A"],
                                [Lang.Blocks.la_sharp_name, "AS"],
                                [Lang.Blocks.si_name, "B"]
                            ],
                            "value": "C",
                            "fontSize": 11,
                            converter: Entry.block.converters.returnStringValueUpperCase
                        }
                    ],
                    keyOption: "arduino_ext_tone_list"
                }
            ]}
        },
        "arduino_ext_tone_value": {
            "color": "#00979D",
            "skeleton": "basic_string_field",
            "statements": [],
            "template": "%1",
            "params": [
                {
                    "type": "Block",
                    "accept": "string"
                }
            ],
            "events": {},
            "def": {
                "params": [
                    {
                        "type": "arduino_ext_tone_list"
                    }
                ],
                "type": "arduino_ext_tone_value"
            },
            "paramsKeyMap": {
                "NOTE": 0
            },
            "func": function (sprite, script) {
                return script.getNumberValue("NOTE");
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "%1",
                    keyOption: "arduino_ext_tone_value"
                }
            ]}
        },
        "arduino_ext_octave_list": {
            "color": "#00979D",
            "skeleton": "basic_string_field",
            "statements": [],
            "template": "%1",
            "params": [
                {
                    "type": "Dropdown",
                    "options": [
                        ["1", "1"],
                        ["2", "2"],
                        ["3", "3"],
                        ["4", "4"],
                        ["5", "5"],
                        ["6", "6"]
                    ],
                    "value": "3",
                    "fontSize": 11
                }
            ],
            "events": {},
            "def": {
                "params": [ null ]
            },
            "paramsKeyMap": {
                "OCTAVE": 0
            },
            "func": function (sprite, script) {
                return script.getField("OCTAVE");
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "%1",
                    keyOption: "arduino_ext_octave_list"
                }
            ]}
        },
        "arduino_ext_set_tone": {
            "color": "#00979D",
            "skeleton": "basic",
            "statements": [],
            "params": [{
                "type": "Block",
                "accept": "string"
            }, {
                "type": "Block",
                "accept": "string"
            }, {
                "type": "Block",
                "accept": "string"
            }, {
                "type": "Block",
                "accept": "string"
            }, {
                "type": "Indicator",
                "img": "block_icon/hardware_03.png",
                "size": 12
            }],
            "events": {},
            "def": {
                "params": [{
                        "type": "arduino_get_port_number",
                        "value": 4
                    },
                    {
                        "type": "arduino_ext_tone_list"
                    },
                    {
                        "type": "arduino_ext_octave_list"
                    },
                    {
                        "type": "text",
                        "params": [ "1" ]
                    },
                    null
                ],
                "type": "arduino_ext_set_tone"
            },
            "paramsKeyMap": {
                "PORT": 0,
                "NOTE": 1,
                "OCTAVE": 2,
                "DURATION": 3
            },
            "class": "ArduinoExt",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var sq = Entry.hw.sendQueue;
                var port = script.getNumberValue("PORT", script);

                if (!script.isStart) {
                    var note = script.getValue("NOTE", script);
                    if(!Entry.Utils.isNumber(note))
                        note = Entry.ArduinoExt.toneTable[note];

                    if(note < 0) {
                        note = 0;
                    } else if(note > 12) {
                        note = 12;
                    }

                    var duration = script.getNumberValue("DURATION", script);

                    if(duration < 0) {
                        duration = 0;
                    }

                    if(!sq['SET']) {
                        sq['SET'] = {};
                    }

                    if(duration === 0) {
                        sq['SET'][port] = {
                            type: Entry.ArduinoExt.sensorTypes.TONE,
                            data: 0,
                            time: new Date().getTime()
                        };
                        return script.callReturn();
                    }

                    var octave = script.getNumberValue("OCTAVE", script) - 1;
                    if(octave < 0) {
                        octave = 0;
                    } else if(octave > 5) {
                        octave = 5;
                    }

                    var value = 0;

                    if(note != 0) {
                        value = Entry.ArduinoExt.toneMap[note][octave];
                    }

                    duration = duration * 1000;
                    script.isStart = true;
                    script.timeFlag = 1;

                    sq['SET'][port] = {
                        type: Entry.ArduinoExt.sensorTypes.TONE,
                        data: {
                            value: value,
                            duration: duration
                        },
                        time: new Date().getTime()
                    };

                    setTimeout(function() {
                        script.timeFlag = 0;
                    }, duration + 32);
                    return script;
                } else if (script.timeFlag == 1) {
                    return script;
                } else {
                    delete script.timeFlag;
                    delete script.isStart;
                    sq['SET'][port] = {
                        type: Entry.ArduinoExt.sensorTypes.TONE,
                        data: 0,
                        time: new Date().getTime()
                    };
                    Entry.engine.isContinue = false;
                    return script.callReturn();
                }
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.tone(%1, %2, %3, %4)",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}
        },
        "arduino_ext_set_servo": {
            "color": "#00979D",
            "skeleton": "basic",
            "statements": [],
            "params": [{
                "type": "Block",
                "accept": "string"
            }, {
                "type": "Block",
                "accept": "string"
            }, {
                "type": "Indicator",
                "img": "block_icon/hardware_03.png",
                "size": 12
            }],
            "events": {},
            "def": {
                "params": [{
                        "type": "arduino_get_port_number"
                    },
                    null
                ],
                "type": "arduino_ext_set_servo"
            },
            "paramsKeyMap": {
                "PORT": 0,
                "VALUE": 1
            },
            "class": "ArduinoExt",
            "isNotFor": [ "ArduinoExt" ],
            "func": function (sprite, script) {
                var sq = Entry.hw.sendQueue;
                var port = script.getNumberValue("PORT", script);
                var value = script.getNumberValue("VALUE", script);
                value = Math.min(180, value);
                value = Math.max(0, value);

                if(!sq['SET']) {
                    sq['SET'] = {};
                }
                sq['SET'][port] = {
                    type: Entry.ArduinoExt.sensorTypes.SERVO_PIN,
                    data: value,
                    time: new Date().getTime()
                };

                return script.callReturn();
            },
            "syntax": {"js": [], "py": [
                {
                    syntax: "Arduino.servomotorWrite(%1, %2)",
                    textParams: [
                        {
                            "type": "Block",
                            "accept": "string"
                        },
                        {
                            "type": "Block",
                            "accept": "string"
                        }
                    ]
                }
            ]}
        },
    }
};

Entry.ArduinoNano = $.extend(true, {}, Entry.ArduinoExt, {
    name: 'ArduinoNano',
});