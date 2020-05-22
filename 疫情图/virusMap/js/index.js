/**
 * 国外数据：https://view.inews.qq.com/g2/getOnsInfo?name=disease_foreign
 * 国内数据：https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5
 */

var foreignData = null
var chinaData = null
//  ajax请求JSONP数据

$.when($.ajax({
        url: "https://view.inews.qq.com/g2/getOnsInfo?name=disease_foreign",
        dataType: "jsonp",
        success: function (data) {
            foreignData = JSON.parse(data.data)
            console.log(JSON.parse(data.data))
        }
    }),
    $.ajax({
        url: "https://view.inews.qq.com/g2/getOnsInfo?name=disease_h5",
        dataType: 'jsonp',
        success: function (data) {
            chinaData = JSON.parse(data.data)
            console.log(JSON.parse(data.data))
        }
    })
).then(function () {
    title()
    brief()
    // 绘制世界疫情图
    map()
    // 疫情趋势
    tendency()
    // 昨日新增top10
    top10()
})

function title() {
    $(".brief .brief_header p").text("更新时间 - " + foreignData.globalStatis.lastUpdateTime)
}

function brief() {
    var htmlStr =
        `<li>
        <div class="allConfirm">
            <div class="number">${foreignData.globalStatis.confirm}</div>
            <div class="item">累计确诊</div>
            <div class="change"><span>昨日</span><b>+${foreignData.globalStatis.confirmAdd}</b></div>
        </div>
    </li>
    <li>
        <div class="nowConfirm">
            <div class="number">${foreignData.globalStatis.nowConfirm}</div>
            <div class="item">现有确诊</div>
            <div class="change"><span>昨日</span><b>+${foreignData.globalStatis.nowConfirmAdd}</b></div>
        </div>
    </li>
    <li>
        <div class="deadConfirm">
            <div class="number">${foreignData.globalStatis.dead}</div>
            <div class="item">死亡人数</div>
            <div class="change"><span>昨日</span><b>+${foreignData.globalStatis.deadAdd}</b></div>
        </div>
    </li>
    <li>
        <div class="cureConfirm">
            <div class="number">${foreignData.globalStatis.heal}</div>
            <div class="item">治愈人数</div>
            <div class="change"><span>昨日</span><b>+${foreignData.globalStatis.healAdd}</b></div>
        </div>
    </li>`
    $(".brief_body").html(htmlStr)
}

function map() {
    // 初始化Echarts图标
    var virusDatas = [];
    // 遍历数据  获取目的信息
    $.each(foreignData.foreignList, function (i, v) {
        virusDatas[i] = {};
        virusDatas[i].name = v.name
        virusDatas[i].value = v.confirm
    })
    // 加入中国数据
    virusDatas.push({
        name: "中国",
        value: chinaData.chinaTotal.confirm
    })
    console.log(virusDatas)
    var myChart = echarts.init(document.querySelector(".brief .map_info"))
    // 设置配置项
    var option = {
        title: {
            text: '默认标题',
        },
        tooltip: {
            formatter: function (param) {
                // console.log(param);
                return param.name + " : " + (param.value ? param.value : 0)
            }
        },
        visualMap: {
            type: 'piecewise',
            pieces: [{
                    max: 0,
                    label: '0',
                    color: '#fff'
                },
                {
                    min: 50,
                    max: 499,
                    label: '1-499',
                    color: '#fff7ba'
                },
                {
                    min: 500,
                    max: 4999,
                    label: '500-4999',
                    color: '#fff7ba'
                },
                {
                    min: 5000,
                    max: 9999,
                    label: '5000-9999',
                    color: '#ffc24b'
                },
                {
                    min: 10000,
                    max: 100000,
                    label: '10000-100000',
                    color: '#ff7c20'
                },
                {
                    min: 100000,
                    max: 500000,
                    label: '100000-500000',
                    color: '#e2482b'
                },
                {
                    min: 500000,
                    label: '500000以上',
                    color: '#b93e26'
                },
            ],
            itemWidth: 10,
            itemHeight: 10,
            inverse: true
        },
        series: [{
            name: '',
            type: 'map',
            mapType: 'world',
            nameMap: nameMap,
            data: virusDatas,
            itemStyle: {
                emphasis: {
                    areaColor: '#c9ffff',
                    label: {
                        show: false
                    }
                }
            },
            // 地图的位置和容器的位置是中心对齐
            layoutCenter: ['center', 'center'],
            // 设置地图的缩放
            layoutSize: "180%"
        }]
    };
    myChart.setOption(option);
    // 现有确诊
    $(".brief .map_tab span").eq(0).click(function () {
        fn("confirm")
    })
    $(".brief .map_tab span").eq(1).click(function () {
        fn("nowConfirm")
    })

    function fn(key) {
        $.each(foreignData.foreignList, function (i, v) {
            virusDatas[i].value = v[key]
        })
        // 加入中国数据
        virusDatas[virusDatas.length - 1].value = chinaData.chinaTotal[key]
        console.log(virusDatas)
        option.series[0].data = virusDatas
        myChart.setOption(option)
    }
    $(".map_tab span").click(function () {
        $(this).addClass("cur").siblings().removeClass("cur")
    })
}

function tendency() {
    // 获取历史数据
    var globalDailyHistory = foreignData.globalDailyHistory;
    // 设置容器分别保存数据
    var num = [],
        date = [];
    globalDailyHistory.reverse()
    globalDailyHistory.shift()

    $.each(globalDailyHistory, function (i, v) {
        if (num.length < 27 && i % 3 == 0) {
            num.push(v.all.newAddConfirm);
            date.push(v.date)
        }
    })
    console.log(num);
    console.log(date);


    // 初始化echarts实例
    var myChart = echarts.init(document.querySelector(".tendency .map_info"))
    // 设置配置项
    var option = {
        tooltip: {
            trigger: "item",
            formatter: function (param) {
                return param.seriesName + "<br>" + param.marker + " " + param.name + " " + param.value
            }
        },
        title: {
            text: "海外新增确诊趋势"
        },
        legend: {
            icon: "rect",
            itemWidth: 12,
            itemHeight: 12,
            right: 20,
            top: 20,
            orient: 'horizontal',
            textStyle: {
                padding: [3, 0, 0, 0]
            }
        },
        xAxis: {
            type: 'category',
            data: date.reverse(),
            axisLabel: {
                interval: 0,
                rotate: 45,
                fontSize: 10,
                color: "#ccc"
            }
        },
        yAxis: {
            type: 'value',
            min: 0,
            max: 120000,
            axisLine: {
                show: false
            },
            axisLabel: {
                formatter: function (value) {
                    return value.toString()
                }
            },
            axisTick: {
                length: 0
            }
        },
        series: [{
            name: "新增确诊",
            type: 'line',
            data: num.reverse(),
            smooth: true,
            lineStyle: {
                color: "#ff1d00"
            }
        }]
    };
    myChart.setOption(option);
    $(".tendency .map_tab span").eq(0).click(function () {
        var num = [],
            date = [];

        $.each(globalDailyHistory, function (i, v) {
            if (num.length < 27 && i % 3 == 0) {
                num.push(v.all.newAddConfirm);
                date.push(v.date)
            }
        })
        console.log(num);
        console.log(date);


        // 初始化echarts实例
        // var myChart = echarts.init(document.querySelector(".tendency .map_info"))
        // 设置配置项
        var option = {
            tooltip: {
                trigger: "item",
                formatter: function (param) {
                    return param.seriesName + "<br>" + param.marker + " " + param.name + " " + param.value
                }
            },
            title: {
                text: "海外新增确诊趋势"
            },
            legend: {
                icon: "rect",
                itemWidth: 12,
                itemHeight: 12,
                right: 20,
                top: 20,
                orient: 'horizontal',
                textStyle: {
                    padding: [3, 0, 0, 0]
                }
            },
            xAxis: {
                type: 'category',
                data: date.reverse(),
                axisLabel: {
                    interval: 0,
                    rotate: 45,
                    fontSize: 10,
                    color: "#ccc"
                }
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 120000,
                axisLine: {
                    show: false
                },
                axisLabel: {
                    formatter: function (value) {
                        return value.toString()
                    }
                },
                axisTick: {
                    length: 0
                }
            },
            series: [{
                name: "新增确诊",
                type: 'line',
                data: num.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#ff1d00"
                }
            }]
        };

        myChart.clear()
        myChart.setOption(option)
    })
    $(".tendency .map_tab span").eq(1).click(function () {
        // 设置容器保存数据
        var num1 = [],
            num2 = [],
            date = [];

        $.each(globalDailyHistory, function (i, v) {
            if (num1.length < 27 && i % 3 == 0) {
                num1.push(v.all.confirm + v.all.heal + v.all.dead);
                num2.push(v.all.confirm)
                date.push(v.date)
            }
        })
        console.log(num1);
        console.log(num2);
        option.series = [{
                name: "累计确诊",
                type: 'line',
                data: num1.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#c1021b"
                }
            },
            {
                name: "现有确诊",
                type: 'line',
                data: num2.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#264654"
                }
            }
        ];
        option.yAxis.max = 3500000;
        option.yAxis.splitNumber = 8
        option.yAxis.axisLabel.formatter = function (value) {
            return value.toString()
        }
        myChart.clear()
        myChart.setOption(option)
    })
    $(".tendency .map_tab span").eq(2).click(function () {
        // 设置容器保存数据
        var num1 = [],
            num2 = [],
            date = [];
        $.each(globalDailyHistory, function (i, v) {
            if (num1.length < 27 && i % 3 == 0) {
                num1.push(v.all.dead);
                num2.push(v.all.heal)
                date.push(v.date)
            }
        })
        console.log(num1);
        console.log(num2);
        option.series = [{
                name: "死亡数",
                type: 'line',
                data: num1.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#c1021b"
                }
            },
            {
                name: "治愈数",
                type: 'line',
                data: num2.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#264654"
                }
            }
        ];
        option.yAxis.max = 600000;
        option.yAxis.splitNumber = 7
        option.yAxis.axisLabel.formatter = function (value) {
            return value.toString()
        }
        myChart.clear()
        myChart.setOption(option)
    })
    $(".tendency .map_tab span").eq(3).click(function () {
        // 设置容器保存数据
        var num1 = [],
            num2 = [],
            date = [];

        $.each(globalDailyHistory, function (i, v) {
            if (num1.length < 27 && i % 3 == 0) {
                num1.push(v.all.deadRate);
                num2.push(v.all.healRate)
                date.push(v.date)
            }
        })
        console.log(num1);
        console.log(num2);
        option.series = [{
                name: "死亡率",
                type: 'line',
                data: num1.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#c1021b"
                }
            },
            {
                name: "确证率",
                type: 'line',
                data: num2.reverse(),
                smooth: true,
                lineStyle: {
                    color: "#264654"
                }
            }
        ];
        option.yAxis.max = 35;
        option.yAxis.splitNumber = 7
        option.yAxis.axisLabel.formatter = function (value) {
            return value + "%"
        }
        myChart.clear()
        myChart.setOption(option)
    })
}
// 昨日新增top10
function top10() {
    var myChart = echarts.init(document.querySelector(".addTop10 .map_info"))
    var num = []
    var nation = []
    $.each(foreignData.countryAddConfirmRankList, function (i, v) {
        num.push(v.addConfirm)
        nation.push(v.nation)
    })
    var option = {
        title: {
            text: "默认文本"
        },
        xAxis: {
            type: 'category',
            data: nation,
            axisLabel: {
                interval: 0,
                rotate: 45
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            type: 'bar',
            data: num,
            barWidth: 18,
            itemStyle: {
                emphasis: {
                    color: "#ffdf4d"
                }
            }
        }]
    }
    myChart.setOption(option)
}