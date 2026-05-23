/**
 * ECharts 黑金奢华主题配置
 */
export const goldTheme = {
  color: ['#D4AF37', '#C5A55A', '#B76E79', '#06D6A0', '#7C8DB5', '#FFD166', '#8B7355'],
  backgroundColor: 'transparent',
  textStyle: {
    color: '#A09B8C'
  },
  title: {
    textStyle: {
      color: '#F0E6D3',
      fontWeight: 600
    },
    subtextStyle: {
      color: '#5E5A52'
    }
  },
  line: {
    itemStyle: {
      borderWidth: 2
    },
    lineStyle: {
      width: 2
    },
    symbolSize: 6,
    symbol: 'circle',
    smooth: true
  },
  bar: {
    itemStyle: {
      barBorderWidth: 0,
      barBorderRadius: [4, 4, 0, 0]
    }
  },
  pie: {
    itemStyle: {
      borderWidth: 2,
      borderColor: '#12121A'
    }
  },
  categoryAxis: {
    axisLine: {
      show: true,
      lineStyle: {
        color: 'rgba(212, 175, 55, 0.2)'
      }
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#5E5A52'
    },
    splitLine: {
      show: false
    }
  },
  valueAxis: {
    axisLine: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLabel: {
      color: '#5E5A52'
    },
    splitLine: {
      lineStyle: {
        color: 'rgba(212, 175, 55, 0.08)',
        type: 'dashed'
      }
    }
  },
  legend: {
    textStyle: {
      color: '#A09B8C'
    }
  },
  tooltip: {
    backgroundColor: 'rgba(26, 26, 36, 0.95)',
    borderColor: 'rgba(212, 175, 55, 0.2)',
    borderWidth: 1,
    textStyle: {
      color: '#F0E6D3'
    },
    extraCssText: 'backdrop-filter: blur(8px); box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);'
  },
  grid: {
    containLabel: true
  }
}

/**
 * 注册金色主题到 ECharts
 */
export function registerGoldTheme(echarts: any) {
  echarts.registerTheme('gold', goldTheme)
}