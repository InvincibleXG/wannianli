/* ============================================
   万年历 - 核心应用逻辑
   ============================================ */

(function () {
  'use strict';

  // ========================================
  // 状态管理
  // ========================================
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth() + 1;
  let currentDay = new Date().getDate();

  // ========================================
  // DOM 元素
  // ========================================
  const $ = (id) => document.getElementById(id);
  const els = {
    year: $('year'),
    month: $('month'),
    day: $('day'),
    type: $('type'),
    queryBtn: $('queryBtn'),
    prevYear: $('prevYear'),
    prevMonth: $('prevMonth'),
    goToday: $('goToday'),
    nextMonth: $('nextMonth'),
    nextYear: $('nextYear'),
    // 阳历
    solarDate: $('solarDate'),
    weekday: $('weekday'),
    xingzuo: $('xingzuo'),
    isLeapYear: $('isLeapYear'),
    dayOfYear: $('dayOfYear'),
    weekOfYear: $('weekOfYear'),
    // 农历
    lunarYear: $('lunarYear'),
    lunarDate: $('lunarDate'),
    yearGanzhi: $('yearGanzhi'),
    monthGanzhi: $('monthGanzhi'),
    dayGanzhi: $('dayGanzhi'),
    shengxiao: $('shengxiao'),
    nayin: $('nayin'),
    wuxing: $('wuxing'),
    // 节气
    currentJieqi: $('currentJieqi'),
    jieqiList: $('jieqiList'),
    // 八字
    bzYear: $('bzYear'),
    bzMonth: $('bzMonth'),
    bzDay: $('bzDay'),
    bzTime: $('bzTime'),
    shishenList: $('shishenList'),
    // 宜忌
    yiList: $('yiList'),
    jiList: $('jiList'),
    xishen: $('xishen'),
    fushen: $('fushen'),
    caishen: $('caishen'),
    chong: $('chong'),
    sha: $('sha'),
    // 星宿
    xingxiu: $('xingxiu'),
    pengzu: $('pengzu'),
    // 节日
    festivalList: $('festivalList'),
    // 日历
    monthGrid: $('monthGrid'),
  };

  // ========================================
  // 初始化
  // ========================================
  function init() {
    // 设置默认值
    els.year.value = currentYear;
    els.month.value = currentMonth;
    updateDayOptions();
    els.day.value = currentDay;

    // 绑定事件
    els.queryBtn.addEventListener('click', handleQuery);
    els.year.addEventListener('input', updateDayOptions);
    els.month.addEventListener('change', updateDayOptions);
    els.prevYear.addEventListener('click', () => navigate(-1, 0));
    els.prevMonth.addEventListener('click', () => navigate(0, -1));
    els.nextMonth.addEventListener('click', () => navigate(0, 1));
    els.nextYear.addEventListener('click', () => navigate(1, 0));
    els.goToday.addEventListener('click', goToday);

    // 回车查询
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleQuery();
    });

    // 初始查询
    handleQuery();
  }

  // ========================================
  // 更新日期选项
  // ========================================
  function updateDayOptions() {
    const year = parseInt(els.year.value) || currentYear;
    const month = parseInt(els.month.value) || currentMonth;
    const daysInMonth = new Date(year, month, 0).getDate();

    const sel = els.day;
    const prevDay = parseInt(sel.value) || 1;
    sel.innerHTML = '<option value="">请选择</option>';

    for (let d = 1; d <= daysInMonth; d++) {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      if (d === prevDay) opt.selected = true;
      sel.appendChild(opt);
    }
  }

  // ========================================
  // 事件处理
  // ========================================
  function handleQuery() {
    const year = parseInt(els.year.value);
    const month = parseInt(els.month.value);
    const day = parseInt(els.day.value);
    const type = els.type.value;

    if (!year || !month || !day) {
      alert('请选择完整的日期');
      return;
    }

    currentYear = year;
    currentMonth = month;
    currentDay = day;

    try {
      let solar;
      if (type === 'solar') {
        solar = Solar.fromYmd(year, month, day);
      } else {
        const lunar = Lunar.fromYmd(year, month, day);
        solar = lunar.getSolar();
      }
      updateDisplay(solar);
    } catch (e) {
      alert('日期无效: ' + e.message);
    }
  }

  function navigate(yearDelta, monthDelta) {
    let y = currentYear + yearDelta;
    let m = currentMonth + monthDelta;

    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }

    // 边界检查
    if (y < 1000 || y > 2100) return;

    const maxDay = new Date(y, m, 0).getDate();
    const d = Math.min(currentDay, maxDay);

    els.year.value = y;
    els.month.value = m;
    updateDayOptions();
    els.day.value = d;

    currentYear = y;
    currentMonth = m;
    currentDay = d;

    try {
      const solar = Solar.fromYmd(y, m, d);
      updateDisplay(solar);
    } catch (e) {
      alert('日期无效: ' + e.message);
    }
  }

  function goToday() {
    const now = new Date();
    els.year.value = now.getFullYear();
    els.month.value = now.getMonth() + 1;
    updateDayOptions();
    els.day.value = now.getDate();

    currentYear = now.getFullYear();
    currentMonth = now.getMonth() + 1;
    currentDay = now.getDate();

    const solar = Solar.fromYmd(currentYear, currentMonth, currentDay);
    updateDisplay(solar);
  }

  // ========================================
  // 核心显示逻辑
  // ========================================
  function updateDisplay(solar) {
    const lunar = solar.getLunar();

    // 阳历信息
    updateSolarInfo(solar);
    // 农历信息
    updateLunarInfo(lunar);
    // 节气
    updateJieqi(lunar, solar);
    // 八字
    updateBazi(lunar);
    // 宜忌
    updateYiji(lunar);
    // 星宿彭祖
    updateXingxiu(lunar);
    // 节日
    updateFestivals(solar, lunar);
    // 月历
    updateMonthGrid(solar);
  }

  // ========================================
  // 阳历信息
  // ========================================
  function updateSolarInfo(solar) {
    const weekNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    els.solarDate.textContent = solar.getYear() + '年' + solar.getMonth() + '月' + solar.getDay() + '日';
    els.weekday.textContent = weekNames[solar.getWeek()];
    els.xingzuo.textContent = solar.getXingzuo();
    els.isLeapYear.textContent = solar.isLeapYear() ? '✅ 是闰年' : '❌ 非闰年';

    // 年内第几天
    const dayOfYear = getDayOfYear(solar.getYear(), solar.getMonth(), solar.getDay());
    els.dayOfYear.textContent = '第 ' + dayOfYear + ' 天';

    // 年内第几周
    const weekOfYear = getWeekOfYear(solar.getYear(), solar.getMonth(), solar.getDay());
    els.weekOfYear.textContent = '第 ' + weekOfYear + ' 周';
  }

  function getDayOfYear(year, month, day) {
    const date = new Date(year, month - 1, day);
    const start = new Date(year, 0, 0);
    const diff = date - start;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  function getWeekOfYear(year, month, day) {
    const date = new Date(year, month - 1, day);
    const start = new Date(year, 0, 1);
    const days = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    return Math.ceil((days + start.getDay() + 1) / 7);
  }

  // ========================================
  // 农历信息
  // ========================================
  function updateLunarInfo(lunar) {
    els.lunarYear.textContent = lunar.getYearInChinese() + '年（' + lunar.getShengxiao() + '年）';
    els.lunarDate.textContent = lunar.getMonthInChinese() + '月' + lunar.getDayInChinese();
    
    // 干支
    els.yearGanzhi.textContent = lunar.getYearInGanZhi() + '（' + lunar.getShengxiao() + '）';
    els.monthGanzhi.textContent = lunar.getMonthInGanZhi();
    els.dayGanzhi.textContent = lunar.getDayInGanZhi();
    els.shengxiao.textContent = lunar.getShengxiao();

    // 纳音
    const dayNayin = lunar.getDayNaYin();
    els.nayin.textContent = dayNayin || '-';

    // 五行（八字五行）
    try {
      const baziWuxing = lunar.getBaZiWuXing();
      if (baziWuxing && baziWuxing.length > 0) {
        els.wuxing.textContent = baziWuxing.join(' ');
      } else {
        els.wuxing.textContent = '-';
      }
    } catch (e) {
      els.wuxing.textContent = '-';
    }
  }

  // ========================================
  // 节气信息
  // ========================================
  function updateJieqi(lunar, solar) {
    const jieqi = lunar.getJieQi();

    if (jieqi) {
      els.currentJieqi.textContent = '📖 ' + jieqi + ' · ' + solar.toYmd();
      els.currentJieqi.style.display = 'block';
    } else {
      els.currentJieqi.textContent = '当日无节气';
      els.currentJieqi.style.display = 'block';
    }

    // 本年节气列表 - 通过遍历获取
    try {
      const jieqiList = [];
      let current = lunar.getPrevJie();
      
      // 获取该年的所有节气
      // 从冬至开始（上一个冬至）
      while (current && current.getSolar().getYear() === lunar.getYear()) {
        jieqiList.push(current);
        current = current.getNextJie ? current.getNextJie() : null;
        if (!current) break;
      }
      
      // 如果没有获取到，尝试从当前日期向前后查找
      if (jieqiList.length === 0) {
        const jieqiTable = lunar.getJieQiTable();
        if (jieqiTable && jieqiTable.length > 0) {
          // jieqiTable 返回的是节气名称数组
          // 我们需要手动构建节气对象
          const year = lunar.getYear();
          
          // 从冬至开始遍历
          let testLunar = Lunar.fromYmd(year, 11, 1);
          let jieqiSet = new Set();
          
          for (let m = 11; m <= 12; m++) {
            for (let d = 1; d <= 30; d++) {
              try {
                const test = Lunar.fromYmd(year, m, d);
                const jq = test.getJieQi();
                if (jq && !jieqiSet.has(jq)) {
                  jieqiSet.add(jq);
                  jieqiList.push({
                    name: jq,
                    solar: test.getSolar(),
                    getName: () => jq,
                    getSolar: () => test.getSolar()
                  });
                }
              } catch (e) { /* ignore */ }
            }
          }
          
          for (let m = 1; m <= 10; m++) {
            for (let d = 1; d <= 30; d++) {
              try {
                const test = Lunar.fromYmd(year, m, d);
                const jq = test.getJieQi();
                if (jq && !jieqiSet.has(jq)) {
                  jieqiSet.add(jq);
                  jieqiList.push({
                    name: jq,
                    solar: test.getSolar(),
                    getName: () => jq,
                    getSolar: () => test.getSolar()
                  });
                }
              } catch (e) { /* ignore */ }
            }
          }
        }
      }
      
      if (jieqiList.length > 0) {
        els.jieqiList.innerHTML = '';
        jieqiList.forEach((jq) => {
          const item = document.createElement('div');
          item.className = 'jieqi-item';

          const nameEl = document.createElement('div');
          nameEl.className = 'jieqi-name';
          nameEl.textContent = jq.getName();

          const dateEl = document.createElement('div');
          dateEl.className = 'jieqi-date';
          dateEl.textContent = jq.getSolar().toYmd();

          item.appendChild(nameEl);
          item.appendChild(dateEl);

          // 高亮当前节气
          if (jq.getName() === jieqi) {
            item.style.borderColor = 'var(--accent-color)';
            item.style.background = 'rgba(233, 69, 96, 0.2)';
          }

          els.jieqiList.appendChild(item);
        });
      } else {
        els.jieqiList.innerHTML = '<p style="color:var(--text-secondary);">该年份暂不支持节气数据</p>';
      }
    } catch (e) {
      els.jieqiList.innerHTML = '<p style="color:var(--text-secondary);">该年份暂不支持节气数据</p>';
    }
  }

  // ========================================
  // 八字
  // ========================================
  function updateBazi(lunar) {
    try {
      const bazi = lunar.getBaZi();
      if (bazi && bazi.length >= 4) {
        els.bzYear.textContent = bazi[0];
        els.bzMonth.textContent = bazi[1];
        els.bzDay.textContent = bazi[2];
        els.bzTime.textContent = bazi[3];
      } else {
        els.bzYear.textContent = '-';
        els.bzMonth.textContent = '-';
        els.bzDay.textContent = '-';
        els.bzTime.textContent = '-';
      }

      // 十神
      const shishenGan = lunar.getBaZiShiShenGan();
      const shishenZhi = lunar.getBaZiShiShenZhi();
      
      if (shishenGan && shishenGan.length >= 4) {
        els.shishenList.innerHTML = `
          <span class="shishen-item"><span class="shishen-label">年干:</span><span class="shishen-value">${shishenGan[0]}</span></span>
          <span class="shishen-item"><span class="shishen-label">月干:</span><span class="shishen-value">${shishenGan[1]}</span></span>
          <span class="shishen-item"><span class="shishen-label">日干:</span><span class="shishen-value">${shishenGan[2]}</span></span>
          <span class="shishen-item"><span class="shishen-label">时干:</span><span class="shishen-value">${shishenGan[3]}</span></span>
        `;
      } else {
        els.shishenList.innerHTML = '';
      }
    } catch (e) {
      els.bzYear.textContent = '-';
      els.bzMonth.textContent = '-';
      els.bzDay.textContent = '-';
      els.bzTime.textContent = '-';
      els.shishenList.innerHTML = '';
    }
  }

  // ========================================
  // 宜忌
  // ========================================
  function updateYiji(lunar) {
    const yi = lunar.getDayYi();
    const ji = lunar.getDayJi();

    els.yiList.textContent = yi && yi.length > 0 ? yi.join('、') : '无';
    els.jiList.textContent = ji && ji.length > 0 ? ji.join('、') : '无';

    // 吉神方位
    els.xishen.textContent = lunar.getPositionXiDesc() || '-';
    els.fushen.textContent = lunar.getPositionFuDesc() || '-';
    els.caishen.textContent = lunar.getPositionCaiDesc() || '-';

    // 冲煞
    els.chong.textContent = lunar.getChongDesc() || '-';
    els.sha.textContent = lunar.getSha() || '-';
  }

  // ========================================
  // 星宿 · 彭祖百忌
  // ========================================
  function updateXingxiu(lunar) {
    // 二十八星宿
    const xiu = lunar.getXiu();
    const xiuLuck = lunar.getXiuLuck();
    if (xiu) {
      const luckText = xiuLuck ? '（' + xiuLuck + '）' : '';
      els.xingxiu.textContent = xiu + luckText;
    } else {
      els.xingxiu.textContent = '-';
    }

    // 彭祖百忌
    const pengzuGan = lunar.getPengZuGan();
    const pengzuZhi = lunar.getPengZuZhi();
    if (pengzuGan || pengzuZhi) {
      let text = '彭祖百忌：';
      if (pengzuGan) text += pengzuGan + ' ';
      if (pengzuZhi) text += pengzuZhi;
      els.pengzu.textContent = text;
    } else {
      els.pengzu.textContent = '-';
    }
  }

  // ========================================
  // 节日
  // ========================================
  function updateFestivals(solar, lunar) {
    const festivals = [];

    // 公历节日
    const solarFestivals = solar.getFestivals();
    if (solarFestivals && solarFestivals.length > 0) {
      solarFestivals.forEach((f) => festivals.push('☀️ ' + f));
    }

    // 农历节日
    const lunarFestivals = lunar.getFestivals();
    if (lunarFestivals && lunarFestivals.length > 0) {
      lunarFestivals.forEach((f) => festivals.push('🌙 ' + f));
    }

    // 其他节日
    const otherFestivals = lunar.getOtherFestivals();
    if (otherFestivals && otherFestivals.length > 0) {
      otherFestivals.forEach((f) => festivals.push('📅 ' + f));
    }

    if (festivals.length > 0) {
      els.festivalList.innerHTML = festivals
        .map((f) => `<span class="festival-tag">${f}</span>`)
        .join('');
    } else {
      els.festivalList.innerHTML = '<span style="color:var(--text-secondary)">当日无节日</span>';
    }
  }

  // ========================================
  // 月历网格
  // ========================================
  function updateMonthGrid(solar) {
    const year = solar.getYear();
    const month = solar.getMonth();

    // 当月第一天是周几
    const firstDay = new Date(year, month - 1, 1);
    const startWeek = firstDay.getDay();

    // 当月天数
    const daysInMonth = new Date(year, month, 0).getDate();

    // 上月天数
    const prevMonthDays = new Date(year, month - 1, 0).getDate();

    // 今天
    const today = new Date();
    const todayStr = today.getFullYear() + '-' + today.getMonth() + '-' + today.getDate();

    els.monthGrid.innerHTML = '';

    // 补充上月末尾
    for (let i = startWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthDays - i;
      const prevM = month === 1 ? 12 : month - 1;
      const prevY = month === 1 ? year - 1 : year;
      createDayCell(prevY, prevM, dayNum, true);
    }

    // 当月
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = year === today.getFullYear() && month === today.getMonth() + 1 && d === today.getDate();
      createDayCell(year, month, d, false, isToday);
    }

    // 补充下月开头
    const totalCells = startWeek + daysInMonth;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    const nextM = month === 12 ? 1 : month + 1;
    const nextY = month === 12 ? year + 1 : year;

    for (let d = 1; d <= remaining; d++) {
      createDayCell(nextY, nextM, d, true);
    }
  }

  function createDayCell(year, month, day, isOtherMonth, isToday = false) {
    const cell = document.createElement('div');
    cell.className = 'month-day';
    if (isOtherMonth) cell.classList.add('other-month');
    if (isToday) cell.classList.add('today');

    try {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();

      // 节气标记
      const jieqi = lunar.getJieQi();
      let lunarText = lunar.getDayInChinese();
      if (jieqi) lunarText = jieqi;
      else if (day === 1) lunarText = lunar.getMonthInChinese() + '月';

      cell.innerHTML = `
        <span class="month-day-solar">${day}</span>
        <span class="month-day-lunar">${lunarText}</span>
      `;

      // 点击事件
      cell.addEventListener('click', () => {
        els.year.value = year;
        els.month.value = month;
        updateDayOptions();
        els.day.value = day;

        currentYear = year;
        currentMonth = month;
        currentDay = day;

        updateDisplay(solar);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    } catch (e) {
      cell.innerHTML = `<span class="month-day-solar">${day}</span>`;
    }

    els.monthGrid.appendChild(cell);
  }

  // ========================================
  // 启动
  // ========================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
