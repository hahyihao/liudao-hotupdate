/**
 * 六道 - 最终修复版
 */

"ui";

try {
  auto();
} catch (e) {
  try {
    auto.waitFor();
  } catch (e2) {}
}

/** false=通用版六道.js；true=六道OPPO.js（OPPO A72 加固） */
var __LIUDAO_IS_OPPO_BUILD = false;
var __LIUDAO_SCRIPT_PROFILE_KEY = "liudao_script_profile";
var __LIUDAO_CACHED_PROFILE_KEY = "liudao_cached_profile";
var __LIUDAO_PROFILE_HANDOFF_OK_KEY = "liudao_script_profile_handoff_ok";
var __LIUDAO_GENERAL_SCRIPT_URL =
  "https://gitee.com/guardian-of-stability/bring-peace-to-a-country/raw/master/%E5%85%AD%E9%81%93.js";
var __LIUDAO_OPPO_SCRIPT_URL =
  "https://raw.giteeusercontent.com/guardian-of-stability/bring-peace-to-a-country/raw/master/%E5%85%AD%E9%81%93OPPO.js";

function getLiudaoSecureStorage() {
  try {
    return storages.create("SixDaoSecure");
  } catch (e) {
    return null;
  }
}

function getLiudaoScriptProfile() {
  try {
    var st = getLiudaoSecureStorage();
    var p = "";
    if (st) {
      p = String(st.get(__LIUDAO_SCRIPT_PROFILE_KEY, "") || "").trim().toLowerCase();
    }
    if (!p) {
      try {
        p = String(storages.create("liudao_stats_v1").get("floatUiProfile", "general") || "general")
          .trim()
          .toLowerCase();
      } catch (eStats) {}
    }
    if (!p) p = "general";
    return p === "oppo_a72" ? "oppo_a72" : "general";
  } catch (e) {
    return "general";
  }
}

function setLiudaoScriptProfile(profile) {
  var val = profile === "oppo_a72" ? "oppo_a72" : "general";
  try {
    var st = getLiudaoSecureStorage();
    if (st) st.put(__LIUDAO_SCRIPT_PROFILE_KEY, val);
  } catch (e) {}
  try {
    storages.create("liudao_stats_v1").put("floatUiProfile", val);
  } catch (eStats) {}
}

function markLiudaoScriptProfileHandoffPending(profile) {
  try {
    var st = getLiudaoSecureStorage();
    if (!st) return;
    st.put(
      __LIUDAO_PROFILE_HANDOFF_OK_KEY,
      profile === "oppo_a72" ? "oppo_a72" : "general"
    );
  } catch (e) {}
}

function maybeShowLiudaoScriptProfileHandoffSuccessNotice() {
  try {
    var st = getLiudaoSecureStorage();
    if (!st) return;
    var flag = String(st.get(__LIUDAO_PROFILE_HANDOFF_OK_KEY, "") || "")
      .trim()
      .toLowerCase();
    if (!flag) return;
    st.remove(__LIUDAO_PROFILE_HANDOFF_OK_KEY);
    var profile = getLiudaoScriptProfile();
    if (flag === "oppo_a72" && profile === "oppo_a72" && __LIUDAO_IS_OPPO_BUILD) {
      toast("切换成功：OPPO加固模式");
    } else if (flag === "general" && profile === "general" && !__LIUDAO_IS_OPPO_BUILD) {
      toast("切换成功：通用模式");
    }
  } catch (e) {}
}

function scheduleLiudaoScriptProfileHandoffSuccessNotice() {
  try {
    setTimeout(function () {
      maybeShowLiudaoScriptProfileHandoffSuccessNotice();
    }, 400);
  } catch (e) {
    maybeShowLiudaoScriptProfileHandoffSuccessNotice();
  }
}

function fetchLiudaoScriptText(url) {
  if (!url || typeof http === "undefined" || !http.get) return null;
  try {
    var u = String(url);
    var sep = u.indexOf("?") >= 0 ? "&" : "?";
    u = u + sep + "_t=" + Date.now();
    var r = http.get(u, {
      timeout: 20000,
      headers: {
        "Cache-Control": "no-cache, no-store, max-age=0",
        Pragma: "no-cache",
      },
    });
    if (!r || r.statusCode !== 200) return null;
    var txt = String(r.body.string() || "");
    return txt.length > 100 ? txt : null;
  } catch (e) {
    return null;
  }
}

function stopCurrentLiudaoEngineAfterHandoff() {
  try {
    var eng = engines && engines.myEngine ? engines.myEngine() : null;
    if (eng && eng.forceStop) eng.forceStop();
  } catch (eStop) {}
  try {
    exit();
  } catch (eExit) {}
}

function tryLiudaoScriptProfileHandoff(showToast) {
  var profile = getLiudaoScriptProfile();
  if (profile === "oppo_a72" && !__LIUDAO_IS_OPPO_BUILD) {
    if (showToast !== false) {
      try {
        toast("正在加载 OPPO加固模式…");
      } catch (eT) {}
    }
    var codeOppo = fetchLiudaoScriptText(__LIUDAO_OPPO_SCRIPT_URL);
    if (!codeOppo) {
      if (showToast !== false) {
        try {
          toast("OPPO加固模式下载失败，暂用通用版");
        } catch (eT2) {}
      }
      return false;
    }
    try {
      var st = getLiudaoSecureStorage();
      if (st) st.put(__LIUDAO_CACHED_PROFILE_KEY, "oppo_a72");
    } catch (eCp) {}
    markLiudaoScriptProfileHandoffPending("oppo_a72");
    try {
      engines.execScript("六道-OPPO加固", codeOppo);
    } catch (eRun) {
      if (showToast !== false) {
        try {
          toast("OPPO加固模式启动失败");
        } catch (eT3) {}
      }
      return false;
    }
    stopCurrentLiudaoEngineAfterHandoff();
    return true;
  }
  if (profile === "general" && __LIUDAO_IS_OPPO_BUILD) {
    if (showToast !== false) {
      try {
        toast("正在加载通用版…");
      } catch (eT4) {}
    }
    var codeGen = fetchLiudaoScriptText(__LIUDAO_GENERAL_SCRIPT_URL);
    if (!codeGen) {
      if (showToast !== false) {
        try {
          toast("通用版下载失败");
        } catch (eT5) {}
      }
      return false;
    }
    try {
      var st2 = getLiudaoSecureStorage();
      if (st2) st2.put(__LIUDAO_CACHED_PROFILE_KEY, "general");
    } catch (eCp2) {}
    markLiudaoScriptProfileHandoffPending("general");
    try {
      engines.execScript("六道-通用版", codeGen);
    } catch (eRun2) {
      if (showToast !== false) {
        try {
          toast("通用版启动失败");
        } catch (eT6) {}
      }
      return false;
    }
    stopCurrentLiudaoEngineAfterHandoff();
    return true;
  }
  return false;
}

/** 当前进程脚本是否与已选机型一致（勾选记忆 ≠ 实际跑的代码） */
function isLiudaoScriptProfileMatched() {
  var profile = getLiudaoScriptProfile();
  return profile === "oppo_a72" ? !!__LIUDAO_IS_OPPO_BUILD : !__LIUDAO_IS_OPPO_BUILD;
}

/** 从 UI 勾选读出机型（比仅读 storage 更贴近用户眼前选项） */
function readLiudaoScriptProfileFromUi() {
  try {
    if (
      ui.cb_float_profile_oppo_a72 &&
      ui.cb_float_profile_oppo_a72.isChecked &&
      ui.cb_float_profile_oppo_a72.isChecked()
    ) {
      return "oppo_a72";
    }
  } catch (e) {}
  return "general";
}

/**
 * 开机勿在 UI 线程同步下载：易失败且静默，造成「勾着 OPPO 实际跑通用版」。
 * 放到后台线程重试，失败时提示用户。
 */
function scheduleLiudaoScriptProfileHandoffOnBoot() {
  if (isLiudaoScriptProfileMatched()) return;
  try {
    threads.start(function () {
      sleep(280);
      if (isLiudaoScriptProfileMatched()) return;
      if (tryLiudaoScriptProfileHandoff(true)) return;
      sleep(900);
      if (isLiudaoScriptProfileMatched()) return;
      if (tryLiudaoScriptProfileHandoff(true)) return;
      try {
        toast("机型脚本未切换成功，点开始前请检查网络");
      } catch (eTip) {}
    });
  } catch (eBoot) {
    tryLiudaoScriptProfileHandoff(true);
  }
}

scheduleLiudaoScriptProfileHandoffOnBoot();

ui.statusBarColor("#1E88E5");

const COLOR_BG = "#EAF3FF";
const COLOR_CARD = "#F7FBFF";
const COLOR_PRIMARY = "#1E88E5";
const COLOR_FLOAT_BLUE = "#FFD54A";
const COLOR_FLOAT_BLUE_TITLE = "#FFE066";
// 隐藏模式：内置“修罗道采集”开关（标题连点触发）
let __secretTapCount = 0;
let __secretTapFirstMs = 0;
let __xiuluoModeArmed = false;

ui.layout(
  <vertical bg={COLOR_BG}>
    <appbar bg={COLOR_PRIMARY}>
      <toolbar id="toolbar" title="">
        <text
          id="tv_title"
          text="六道V4.3.4"
          textColor="#FFFFFF"
          textSize="18sp"
          textStyle="bold"
          gravity="center"
          layout_gravity="center"
          w="*"
        />
      </toolbar>
    </appbar>

    <vertical layout_weight="1">
      <ScrollView layout_weight="1">
        <vertical padding="12 10 12 12">
          <vertical bg={COLOR_CARD} padding="10" margin="0 0 0 6" elevation="1">
            <text text="验证" textSize="16sp" textStyle="bold" margin="0 0 0 8" />

            <horizontal gravity="center_vertical" padding="0 4">
              <text text="授权码" textSize="14sp" width="56" />
              <input id="inp_license" hint="请输入授权码" layout_weight="1" singleLine="true" />
            </horizontal>
            <horizontal gravity="center" padding="0 4">
              <button id="btn_activate" text="激活" style="Widget.AppCompat.Button.Colored" />
              <button id="btn_detail" text="解锁" marginLeft="8" />
              <button id="btn_query" text="查询" marginLeft="8" />
            </horizontal>
          </vertical>

          <vertical bg={COLOR_CARD} padding="10" margin="0 0 0 6" elevation="1">
            <text text="道册" textSize="16sp" textStyle="bold" margin="0 0 0 8" />
            <horizontal>
              <checkbox id="dc_wendao" text="问道（自寻）" checked="true" layout_weight="1" />
              <checkbox id="dc_huandao" text="换道（库表）" checked="false" layout_weight="1" />
              <checkbox id="dc_jiedao" text="借道（自选）" checked="false" layout_weight="1" />
            </horizontal>
          </vertical>

          <vertical bg={COLOR_CARD} padding="10" margin="0 0 0 6" elevation="1">
            <button id="btn_free" text="火力" />
            <button id="btn_low_control" text="库表" marginTop="8" />
            <button id="btn_soda" text="汽水" marginTop="8" />
          </vertical>

          <vertical bg={COLOR_CARD} padding="12" margin="0 0 0 6" elevation="1">
            <text text="机型" textSize="16sp" textStyle="bold" margin="0 0 0 8" />
            <horizontal>
              <checkbox id="cb_float_profile_general" text="通用" checked="true" layout_weight="1" />
              <checkbox id="cb_float_profile_oppo_a72" text="OPPO" checked="false" layout_weight="1" />
            </horizontal>
          </vertical>

          <vertical bg={COLOR_CARD} padding="10" margin="0 0 0 6" elevation="1">
            <text id="txt_online_title" text="在线" textSize="16sp" textStyle="bold" margin="0 0 0 8" clickable="true" />
            <vertical gravity="center" w="*">
              <horizontal gravity="center">
                <checkbox id="online_h0" text="0 点" w="72dp" checked="true" />
                <checkbox id="online_h1" text="1 点" w="72dp" checked="true" />
                <checkbox id="online_h2" text="2 点" w="72dp" checked="true" />
                <checkbox id="online_h3" text="3 点" w="72dp" checked="true" />
              </horizontal>
              <horizontal gravity="center">
                <checkbox id="online_h4" text="4 点" w="72dp" checked="true" />
                <checkbox id="online_h5" text="5 点" w="72dp" checked="true" />
                <checkbox id="online_h6" text="6 点" w="72dp" checked="true" />
                <checkbox id="online_h7" text="7 点" w="72dp" checked="true" />
              </horizontal>
              <horizontal gravity="center">
                <checkbox id="online_h8" text="8 点" w="72dp" checked="true" />
                <checkbox id="online_h9" text="9 点" w="72dp" checked="true" />
                <checkbox id="online_h10" text="10 点" w="72dp" checked="true" />
                <checkbox id="online_h11" text="11 点" w="72dp" checked="true" />
              </horizontal>
              <horizontal gravity="center">
                <checkbox id="online_h12" text="12 点" w="72dp" checked="true" />
                <checkbox id="online_h13" text="13 点" w="72dp" checked="true" />
                <checkbox id="online_h14" text="14 点" w="72dp" checked="true" />
                <checkbox id="online_h15" text="15 点" w="72dp" checked="true" />
              </horizontal>
              <horizontal gravity="center">
                <checkbox id="online_h16" text="16 点" w="72dp" checked="true" />
                <checkbox id="online_h17" text="17 点" w="72dp" checked="true" />
                <checkbox id="online_h18" text="18 点" w="72dp" checked="true" />
                <checkbox id="online_h19" text="19 点" w="72dp" checked="true" />
              </horizontal>
              <horizontal gravity="center">
                <checkbox id="online_h20" text="20 点" w="72dp" checked="true" />
                <checkbox id="online_h21" text="21 点" w="72dp" checked="true" />
                <checkbox id="online_h22" text="22 点" w="72dp" checked="true" />
                <checkbox id="online_h23" text="23 点" w="72dp" checked="true" />
              </horizontal>
            </vertical>
          </vertical>

          <vertical bg={COLOR_CARD} padding="10" margin="0 0 0 6" elevation="1">
            <text text="任务" textSize="16sp" textStyle="bold" margin="0 0 0 8" />

            <horizontal padding="0 2" gravity="center_vertical">
              <text text="点赞" width="34" />
              <input id="task_like" text="3000" width="70" gravity="center" inputType="number" />
              <text text="次" marginLeft="4" />
              <text text="收藏" marginLeft="18" />
              <input id="task_fav" text="400" width="70" gravity="center" inputType="number" />
              <text text="次" marginLeft="4" />
            </horizontal>

            <horizontal padding="0 2" gravity="center_vertical">
              <text text="评论" width="34" />
              <input id="task_comment" text="400" width="70" gravity="center" inputType="number" />
              <text text="次" marginLeft="4" />
              <text text="分享" marginLeft="18" />
              <input id="task_share" text="200" width="70" gravity="center" inputType="number" />
              <text text="次" marginLeft="4" />
            </horizontal>

            <horizontal padding="0 2" gravity="center_vertical">
              <text text="重启" width="34" />
              <input id="task_restart" text="30" width="70" gravity="center" inputType="number" />
              <text text="次" marginLeft="4" />
            </horizontal>

            <vertical marginTop="8">
              <horizontal>
                <checkbox id="cb_do_like" text="点赞" checked="true" layout_weight="1" />
                <checkbox id="cb_do_fav" text="收藏" checked="true" layout_weight="1" />
                <checkbox id="cb_do_comment" text="评论" checked="false" layout_weight="1" />
              </horizontal>
              <horizontal gravity="center_vertical">
                <checkbox id="cb_do_share" text="分享" checked="true" layout_weight="1" />
                <horizontal layout_weight="1" gravity="center_vertical">
                  <checkbox id="cb_do_interact_stay" text="互动停留" checked="false" />
                  <input id="task_stay_min" text="1" w="40" gravity="center" inputType="number" marginLeft="4" />
                  <text text="～" marginLeft="2" marginRight="2" />
                  <input id="task_stay_max" text="3" w="40" gravity="center" inputType="number" />
                  <text text="秒" marginLeft="2" />
                </horizontal>
                <frame layout_weight="1" w="0" h="1" />
              </horizontal>
            </vertical>
          </vertical>

          <vertical bg={COLOR_CARD} padding="12" margin="0 0 0 10" elevation="1">
            <text text="平台" textSize="16sp" textStyle="bold" margin="0 0 0 8" />
            <horizontal>
              <checkbox id="pf_official" text="正版" checked="true" layout_weight="1" />
              <checkbox id="pf_soda" text="汽水" layout_weight="1" />
            </horizontal>
          </vertical>

        </vertical>
      </ScrollView>

      <button
        id="btn_start"
        text="开始"
        style="Widget.AppCompat.Button.Colored"
        margin="12 8 12 12"
        w="*"
        h="52"
      />
    </vertical>
  </vertical>
);

function bindClick(view, msg) {
  if (!view) return;
  if (typeof view.on === "function") {
    view.on("click", () => toast(msg));
  } else if (typeof view.click === "function") {
    view.click(() => toast(msg));
  }
}

function getDaoceMode() {
  try {
    if (ui.dc_huandao && ui.dc_huandao.isChecked && ui.dc_huandao.isChecked()) return "huandao";
  } catch (e0) {}
  try {
    if (ui.dc_wendao && ui.dc_wendao.isChecked && ui.dc_wendao.isChecked()) return "wendao";
  } catch (e1) {}
  return "wendao";
}

function getDaoForServerApi() {
  var m = "jiedao";
  try { m = getDaoceMode(); } catch (e0) { m = "jiedao"; }
  if (m === "huandao") return "huandao";
  // 当前后端仅实现借道/换道两库；问道暂按借道处理
  return "jiedao";
}

// 点击“开始”时锁定一次道策模式，避免工作线程中读取 UI 勾选状态不稳定
var __daoceModeRunSnapshot = "";
/** 点击「开始」时锁定的 24 小时在线表（true=该时段运行；未勾选=暂停） */
var __onlineScheduleSnapshot = null;
var __ONLINE_SCHEDULE_VER_KEY = "onlineScheduleVersion";
var __ONLINE_SCHEDULE_VER = 3;

function defaultOnlineScheduleAllTrue() {
  var a = [];
  for (var i = 0; i < 24; i++) a.push(true);
  return a;
}

function normalizeOnlineSchedule(arr) {
  var out = defaultOnlineScheduleAllTrue();
  if (!arr || !arr.length) return out;
  for (var i = 0; i < 24; i++) {
    out[i] = arr[i] !== false && arr[i] !== 0 && arr[i] !== "0";
  }
  return out;
}

function migrateOnlineScheduleFromStorage(rawArr) {
  var sch = normalizeOnlineSchedule(rawArr);
  try {
    var ver = Number(__stats.get(__ONLINE_SCHEDULE_VER_KEY, 1)) || 1;
    if (ver >= __ONLINE_SCHEDULE_VER) return sch;
    if (ver === 2) {
      var allFalse = true;
      for (var i = 0; i < 24; i++) {
        if (sch[i]) {
          allFalse = false;
          break;
        }
      }
      if (allFalse) sch = defaultOnlineScheduleAllTrue();
    }
    __stats.put(__ONLINE_SCHEDULE_VER_KEY, __ONLINE_SCHEDULE_VER);
    saveOnlineScheduleToStorage(sch);
  } catch (eMig) {}
  return sch;
}

function saveOnlineScheduleToStorage(schedule) {
  try {
    __stats.put("onlineScheduleHours", JSON.stringify(normalizeOnlineSchedule(schedule)));
    __stats.put(__ONLINE_SCHEDULE_VER_KEY, __ONLINE_SCHEDULE_VER);
  } catch (e) {}
}

function loadOnlineScheduleFromStorage() {
  try {
    var raw = __stats.get("onlineScheduleHours", "");
    if (!raw) return defaultOnlineScheduleAllTrue();
    return migrateOnlineScheduleFromStorage(JSON.parse(String(raw)));
  } catch (e) {
    return defaultOnlineScheduleAllTrue();
  }
}

function readOnlineScheduleFromUi() {
  var a = [];
  for (var h = 0; h < 24; h++) {
    var on = true;
    try {
      var cb = ui["online_h" + h];
      if (cb && cb.isChecked) on = !!cb.isChecked();
    } catch (e0) {
      on = true;
    }
    a.push(on);
  }
  return a;
}

function applyOnlineScheduleToUi(schedule) {
  schedule = normalizeOnlineSchedule(schedule);
  for (var h = 0; h < 24; h++) {
    try {
      var cb = ui["online_h" + h];
      if (cb && cb.setChecked) cb.setChecked(!!schedule[h]);
    } catch (e) {}
  }
}

function bindOnlineScheduleUi() {
  for (var h = 0; h < 24; h++) {
    (function (hour) {
      try {
        var cb = ui["online_h" + hour];
        if (!cb) return;
        if (typeof cb.on === "function") {
          cb.on("check", function () {
            try {
              saveOnlineScheduleToStorage(readOnlineScheduleFromUi());
            } catch (e0) {}
          });
        }
      } catch (e1) {}
    })(h);
  }
}

function initOnlineScheduleUiFromStorage() {
  try {
    applyOnlineScheduleToUi(loadOnlineScheduleFromStorage());
  } catch (e0) {}
  bindOnlineScheduleUi();
}

function snapshotOnlineScheduleForRun() {
  try {
    __onlineScheduleSnapshot = readOnlineScheduleFromUi();
    saveOnlineScheduleToStorage(__onlineScheduleSnapshot);
  } catch (e0) {
    __onlineScheduleSnapshot = loadOnlineScheduleFromStorage();
  }
}

function getOnlineScheduleForRun() {
  if (__onlineScheduleSnapshot && __onlineScheduleSnapshot.length === 24) {
    return __onlineScheduleSnapshot;
  }
  return loadOnlineScheduleFromStorage();
}

function isOnlineHourAllowedNow() {
  var sch = getOnlineScheduleForRun();
  var h = new Date().getHours();
  if (h < 0 || h > 23) return true;
  return !!sch[h];
}

function formatOnlineWaitNextHourZh() {
  var sch = getOnlineScheduleForRun();
  var nowH = new Date().getHours();
  for (var step = 1; step <= 24; step++) {
    var nh = (nowH + step) % 24;
    if (sch[nh]) return nh + "点";
  }
  return "下一在线时段";
}

/** 非在线时段：暂停自动化，微亮保活至下一勾选小时 */
function waitWhileOfflineScheduleBlocking() {
  if (isOnlineHourAllowedNow()) return;
  var logged = false;
  while (!__scriptUserStop && __automationWorkerActive && !isOnlineHourAllowedNow()) {
    if (!logged) {
      logged = true;
      try {
        appendLog("非在线时段，等待到" + formatOnlineWaitNextHourZh());
        toast("非在线时段，已暂停");
        beginQuotaIdleKeepAwake();
      } catch (e0) {}
    }
    try {
      refreshQuotaIdleKeepAwake();
    } catch (e1) {}
    bumpStuckWatchdogHeartbeat();
    sleep(15000);
  }
  if (logged) {
    try {
      endQuotaIdleKeepAwake();
    } catch (e2) {}
    try {
      appendLog("进入在线时段，继续运行");
    } catch (e3) {}
  }
}

function getEffectiveDaoceMode() {
  try {
    if (__daoceModeRunSnapshot) return String(__daoceModeRunSnapshot);
  } catch (e0) {}
  try {
    return getDaoceMode();
  } catch (e1) {}
  return "jiedao";
}

function enforceDaoceSingleSelect(changedId) {
  function setCheckedSafe(v, on) {
    try { if (v && v.setChecked) v.setChecked(!!on); } catch (e) {}
  }
  if (changedId === "dc_jiedao") {
    setCheckedSafe(ui.dc_huandao, false);
    setCheckedSafe(ui.dc_wendao, false);
  } else if (changedId === "dc_huandao") {
    setCheckedSafe(ui.dc_jiedao, false);
    setCheckedSafe(ui.dc_wendao, false);
  } else if (changedId === "dc_wendao") {
    setCheckedSafe(ui.dc_jiedao, false);
    setCheckedSafe(ui.dc_huandao, false);
  }
}

/** 库表：道册自动切到「换道（库表）」 */
function applyDaoceHuandaoForNurture() {
  try {
    if (ui.dc_huandao && ui.dc_huandao.setChecked) {
      ui.dc_huandao.setChecked(true);
      enforceDaoceSingleSelect("dc_huandao");
    }
  } catch (e) {}
}

/** 火力：道册自动切到「问道（自寻）」 */
function applyDaoceWendaoForFire() {
  try {
    if (ui.dc_wendao && ui.dc_wendao.setChecked) {
      ui.dc_wendao.setChecked(true);
      enforceDaoceSingleSelect("dc_wendao");
    }
  } catch (e) {}
}

/** 借道（自选） */
function applyDaoceJiedaoUi() {
  try {
    if (ui.dc_jiedao && ui.dc_jiedao.setChecked) {
      ui.dc_jiedao.setChecked(true);
      enforceDaoceSingleSelect("dc_jiedao");
    }
  } catch (e) {}
}

function applyDaoceModeUi(mode) {
  if (mode === "huandao") applyDaoceHuandaoForNurture();
  else if (mode === "jiedao") applyDaoceJiedaoUi();
  else if (mode === "wendao") applyDaoceWendaoForFire();
}

function setPlatformOfficial() {
  try {
    if (ui.pf_official && ui.pf_official.setChecked) ui.pf_official.setChecked(true);
  } catch (e0) {}
  try {
    if (ui.pf_soda && ui.pf_soda.setChecked) ui.pf_soda.setChecked(false);
  } catch (e1) {}
}

function setPlatformSoda() {
  try {
    if (ui.pf_soda && ui.pf_soda.setChecked) ui.pf_soda.setChecked(true);
  } catch (e0) {}
  try {
    if (ui.pf_official && ui.pf_official.setChecked) ui.pf_official.setChecked(false);
  } catch (e1) {}
}

function enforcePlatformSingleSelect(changedId) {
  function setCheckedSafe(v, on) {
    try {
      if (v && v.setChecked) v.setChecked(!!on);
    } catch (e) {}
  }
  if (changedId === "pf_official") setCheckedSafe(ui.pf_soda, false);
  else if (changedId === "pf_soda") setCheckedSafe(ui.pf_official, false);
}

try {
  if (ui.pf_official && ui.pf_official.on)
    ui.pf_official.on("check", function (checked) {
      if (checked) enforcePlatformSingleSelect("pf_official");
    });
  if (ui.pf_soda && ui.pf_soda.on)
    ui.pf_soda.on("check", function (checked) {
      if (checked) enforcePlatformSingleSelect("pf_soda");
    });
} catch (eBindPf) {}

var __floatProfileUiSync = false;

function enforceFloatProfileSingleSelect(changedId) {
  function setCheckedSafe(v, on) {
    try {
      if (v && v.setChecked) v.setChecked(!!on);
    } catch (e) {}
  }
  if (changedId === "cb_float_profile_oppo_a72") {
    setCheckedSafe(ui.cb_float_profile_general, false);
  } else if (changedId === "cb_float_profile_general") {
    setCheckedSafe(ui.cb_float_profile_oppo_a72, false);
  }
}

function syncFloatProfileCheckboxesFromProfile(profile) {
  var isOppo = profile === "oppo_a72";
  __floatProfileUiSync = true;
  try {
    enforceFloatProfileSingleSelect(
      isOppo ? "cb_float_profile_oppo_a72" : "cb_float_profile_general"
    );
    try {
      if (ui.cb_float_profile_general && ui.cb_float_profile_general.setChecked) {
        ui.cb_float_profile_general.setChecked(!isOppo);
      }
    } catch (eG) {}
    try {
      if (ui.cb_float_profile_oppo_a72 && ui.cb_float_profile_oppo_a72.setChecked) {
        ui.cb_float_profile_oppo_a72.setChecked(isOppo);
      }
    } catch (eO) {}
  } finally {
    __floatProfileUiSync = false;
  }
}

function initFloatProfileCheckboxesFromStorage() {
  syncFloatProfileCheckboxesFromProfile(getLiudaoScriptProfile());
}

function onFloatProfileCheckboxChanged(changedId) {
  if (__floatProfileUiSync) return;
  if (changedId === "cb_float_profile_oppo_a72") {
    enforceFloatProfileSingleSelect("cb_float_profile_oppo_a72");
    setLiudaoScriptProfile("oppo_a72");
    if (!__LIUDAO_IS_OPPO_BUILD) {
      threads.start(function () {
        sleep(200);
        tryLiudaoScriptProfileHandoff(true);
      });
    }
    return;
  }
  if (changedId === "cb_float_profile_general") {
    enforceFloatProfileSingleSelect("cb_float_profile_general");
    setLiudaoScriptProfile("general");
    if (__LIUDAO_IS_OPPO_BUILD) {
      threads.start(function () {
        sleep(200);
        tryLiudaoScriptProfileHandoff(true);
      });
    }
  }
}

try {
  ui.run(function () {
    try {
      initFloatProfileCheckboxesFromStorage();
    } catch (eInitFp) {}
    try {
      scheduleLiudaoScriptProfileHandoffSuccessNotice();
    } catch (eNotice) {}
  });
  if (ui.cb_float_profile_general && ui.cb_float_profile_general.on) {
    ui.cb_float_profile_general.on("check", function (checked) {
      if (checked) onFloatProfileCheckboxChanged("cb_float_profile_general");
    });
  }
  if (ui.cb_float_profile_oppo_a72 && ui.cb_float_profile_oppo_a72.on) {
    ui.cb_float_profile_oppo_a72.on("check", function (checked) {
      if (checked) onFloatProfileCheckboxChanged("cb_float_profile_oppo_a72");
    });
  }
} catch (eBindFloatProfile) {}

try {
  if (ui.dc_jiedao && ui.dc_jiedao.on) ui.dc_jiedao.on("check", function (checked) { if (checked) enforceDaoceSingleSelect("dc_jiedao"); });
  if (ui.dc_huandao && ui.dc_huandao.on) ui.dc_huandao.on("check", function (checked) { if (checked) enforceDaoceSingleSelect("dc_huandao"); });
  if (ui.dc_wendao && ui.dc_wendao.on) ui.dc_wendao.on("check", function (checked) { if (checked) enforceDaoceSingleSelect("dc_wendao"); });
} catch (eBindDc) {}

// 隐蔽触发：2.5 秒内连续点击标题 6 次，切换一次“修罗道模式”启动
try {
  if (ui.tv_title && ui.tv_title.on) {
    ui.tv_title.on("click", function () {
      var now = Date.now();
      if (!__secretTapFirstMs || now - __secretTapFirstMs > 2500) {
        __secretTapFirstMs = now;
        __secretTapCount = 1;
      } else {
        __secretTapCount++;
      }
      if (__secretTapCount >= 6) {
        __secretTapCount = 0;
        __secretTapFirstMs = 0;
        __xiuluoModeArmed = !__xiuluoModeArmed;
        toast(__xiuluoModeArmed ? "修罗道已启动" : "修罗道已关闭");
      }
    });
  }
} catch (eTitle) {}

// ===== 卡密授权（六道）=====
// 授权服务器（默认与取号服务器同 IP，端口 3000 跑 index.js）
var LICENSE_SERVER_IP = "117.72.91.93";
var LICENSE_SERVER_PORT = 3000;
// 客户端版本号（用于服务端强制升级门禁）
var __CLIENT_VER = 20260425;
/**
 * 主人私有授权（勿在授权码框输入，避免旁人看见）：
 * 1. 长按「查询」约 3 秒 → 弹出输入框输入私有码
 * 2. 脚本内只存 SHA256 摘要，不存明文（旁人看脚本/看手机界面都看不到原码）
 * 3. 改私有码：node -e "console.log(require('crypto').createHash('sha256').update('你的私有码').digest('hex'))"
 *    把输出填入 __OWNER_CODE_SHA256
 */
var __OWNER_CODE_SHA256 = "334ca9d1bc6b3ae722b4a6c9c9bece77791307b76b57a227ee1f41eda6970d33";
var __OWNER_LICENSE_PLAN = "owner";
var __OWNER_LICENSE_YEARS = 50;
var __OWNER_ENTRY_HOLD_MS = 3000;

function licenseBaseUrl() {
  return "http://" + LICENSE_SERVER_IP + ":" + LICENSE_SERVER_PORT;
}

function getDeviceIdForLicense() {
  try {
    if (device.getAndroidId) return String(device.getAndroidId() || "");
  } catch (e0) {}
  try {
    if (device.androidId) return String(device.androidId || "");
  } catch (e1) {}
  try {
    return String(device.serial || "");
  } catch (e2) {}
  return "";
}

function getDeviceFingerprintForLicense() {
  var parts = [];
  try { parts.push(String(device.brand || "").trim().toLowerCase()); } catch (e0) { parts.push(""); }
  try { parts.push(String(device.model || "").trim().toLowerCase()); } catch (e1) { parts.push(""); }
  try { parts.push(String(device.product || "").trim().toLowerCase()); } catch (e2) { parts.push(""); }
  try { parts.push(String(device.device || "").trim().toLowerCase()); } catch (e3) { parts.push(""); }
  try {
    var sdk = device.sdkInt || device.sdk || "";
    parts.push(String(sdk).trim().toLowerCase());
  } catch (e4) { parts.push(""); }
  var did = "";
  try { did = getDeviceIdForLicense(); } catch (e5) {}
  parts.push(String(did || "").trim().toLowerCase());
  var raw = parts.join("|");
  raw = raw.replace(/\|{2,}/g, "|");
  return raw;
}

function setLicenseUiEnabled(enabled) {
  try { ui.btn_start.setEnabled(!!enabled); } catch (e0) {}
  try { ui.btn_start.setAlpha(enabled ? 1 : 0.5); } catch (e1) {}
}

function saveLocalActivatedCardCode(code) {
  try { __stats.put("lic_card_code", String(code || "").trim()); } catch (e) {}
}
function loadLocalActivatedCardCode() {
  try { return String(__stats.get("lic_card_code", "") || "").trim(); } catch (e) { return ""; }
}
function saveLocalLicenseExpire(expireAt) {
  try { __stats.put("lic_expire_at", Number(expireAt || 0)); } catch (e) {}
}
function saveLocalLicensePlan(plan) {
  try { __stats.put("lic_plan", String(plan || "").trim()); } catch (e) {}
}
function loadLocalLicensePlan() {
  try { return String(__stats.get("lic_plan", "") || "").trim(); } catch (e) { return ""; }
}
function clearLocalLicenseCache() {
  try { __stats.put("lic_card_code", ""); } catch (e0) {}
  try { __stats.put("lic_expire_at", 0); } catch (e1) {}
  try { __stats.put("lic_plan", ""); } catch (e2) {}
}
function loadLocalLicenseExpire() {
  try { return Number(__stats.get("lic_expire_at", 0) || 0); } catch (e) { return 0; }
}

function normalizePrivateCodeForCompare(code) {
  return String(code || "").trim().toUpperCase().replace(/-/g, "");
}

function sha256HexLower(text) {
  try {
    importClass(java.security.MessageDigest);
    var md = MessageDigest.getInstance("SHA-256");
    var bytes = new java.lang.String(String(text || "")).getBytes("UTF-8");
    var digest = md.digest(bytes);
    var sb = new java.lang.StringBuilder();
    for (var i = 0; i < digest.length; i++) {
      var b = digest[i] & 0xff;
      if (b < 16) sb.append("0");
      sb.append(java.lang.Integer.toHexString(b));
    }
    return String(sb.toString()).toLowerCase();
  } catch (e0) {
    return "";
  }
}

function verifyOwnerPrivateCodeInput(code) {
  try {
    var expect = String(__OWNER_CODE_SHA256 || "").trim().toLowerCase();
    if (!expect) return false;
    var norm = normalizePrivateCodeForCompare(code);
    if (!norm) return false;
    return sha256HexLower(norm) === expect;
  } catch (e1) {
    return false;
  }
}

function isOwnerLicenseActive() {
  if (loadLocalLicensePlan() !== __OWNER_LICENSE_PLAN) return false;
  var exp = loadLocalLicenseExpire();
  return !!(exp && exp > Date.now() + 60 * 1000);
}

function validateOwnerLicenseLocal() {
  if (!isOwnerLicenseActive()) return { ok: false, msg: "owner_expired" };
  return {
    ok: true,
    plan: __OWNER_LICENSE_PLAN,
    expire_at: loadLocalLicenseExpire(),
  };
}

function activateOwnerPrivateCode() {
  var now = Date.now();
  var expireAt = now + __OWNER_LICENSE_YEARS * 365 * 24 * 3600 * 1000;
  saveLocalLicensePlan(__OWNER_LICENSE_PLAN);
  saveLocalLicenseExpire(expireAt);
  saveLocalActivatedCardCode("");
  try {
    if (ui.inp_license) ui.inp_license.setText("");
  } catch (eClr) {}
  return { ok: true, plan: __OWNER_LICENSE_PLAN, expire_at: expireAt };
}

function handleOwnerPrivateCodeInput(code) {
  code = String(code || "").trim();
  if (!code) {
    toast("请输入私有码");
    return;
  }
  if (!verifyOwnerPrivateCodeInput(code)) {
    toast("验证失败");
    return;
  }
  code = "";
  var ownerRet = activateOwnerPrivateCode();
  toast("验证通过，到期：" + formatExpireAt(ownerRet.expire_at || 0));
  setLicenseUiEnabled(true);
}

function promptOwnerPrivateActivateDialog() {
  threads.start(function () {
    var code = null;
    try {
      code = dialogs.rawInput("管理员验证");
    } catch (e0) {
      ui.run(function () {
        try {
          toast("无法打开验证框");
        } catch (e1) {}
      });
      return;
    }
    function deliverInput(text) {
      if (text == null || String(text).trim() === "") return;
      var input = String(text).trim();
      ui.run(function () {
        try {
          handleOwnerPrivateCodeInput(input);
        } catch (e2) {
          try {
            toast("验证异常");
          } catch (e3) {}
        }
      });
    }
    try {
      if (code && typeof code.then === "function") {
        code.then(function (text) {
          deliverInput(text);
        });
        return;
      }
    } catch (eP) {}
    deliverInput(code);
  });
}

function runLicenseQueryTap() {
  if (isOwnerLicenseActive()) {
    toast("授权有效，到期：" + formatExpireAt(loadLocalLicenseExpire()));
    return;
  }
  toast("查询中…");
  threads.start(function () {
    var vr = validateLicenseOnline();
    ui.run(function () {
      if (vr.ok) toast("有效，到期：" + formatExpireAt(vr.expire_at));
      else toast("无效：" + (vr.msg || ""));
    });
  });
}

function formatExpireAt(expireAt) {
  try {
    var t = Number(expireAt || 0);
    if (!t) return "未知";
    var d = new Date(t);
    return (
      d.getFullYear() +
      "-" +
      ("0" + (d.getMonth() + 1)).slice(-2) +
      "-" +
      ("0" + d.getDate()).slice(-2) +
      " " +
      ("0" + d.getHours()).slice(-2) +
      ":" +
      ("0" + d.getMinutes()).slice(-2)
    );
  } catch (e) {
    return "未知";
  }
}

function postJsonSafe(url, payload, timeoutMs) {
  try {
    var r = http.postJson(url, payload, { timeout: timeoutMs || 10000 });
    return { ok: true, resp: r };
  } catch (e) {
    return { ok: false, err: String(e) };
  }
}

function validateLicenseOnline() {
  if (isOwnerLicenseActive()) return validateOwnerLicenseLocal();
  var did = getDeviceIdForLicense();
  if (!did) return { ok: false, msg: "no_device_id" };
  var fp = "";
  try { fp = getDeviceFingerprintForLicense(); } catch (eFp1) {}
  var url = licenseBaseUrl() + "/api/liudao/license/validate";
  var rr = postJsonSafe(url, { device_id: did, device_fp: fp, client_ver: __CLIENT_VER }, 18000);
  if (!rr || rr.ok !== true || !rr.resp) {
    return { ok: false, msg: "net:" + ((rr && rr.err) ? rr.err : ""), transient: true };
  }
  var r = rr.resp;
  if (r.statusCode !== 200) {
    var bodyTxt = "";
    try { bodyTxt = String(r.body.string() || ""); } catch (e0) {}
    var code = r.statusCode;
    var transientHttp =
      code === 408 ||
      code === 429 ||
      code === 500 ||
      code === 502 ||
      code === 503 ||
      code === 504;
    return {
      ok: false,
      msg: "http_" + code + (bodyTxt ? ":" + bodyTxt : ""),
      transient: transientHttp,
    };
  }
  try {
    var j = r.body.json();
    if (j && j.ok === true) {
      saveLocalLicenseExpire(j.expire_at || 0);
      return { ok: true, plan: j.plan, expire_at: j.expire_at || 0 };
    }
    return {
      ok: false,
      msg: (j && j.msg) ? String(j.msg) : "invalid",
      min_client_ver: j && j.min_client_ver ? Number(j.min_client_ver) : 0
    };
  } catch (e2) {
    return { ok: false, msg: "bad_json", transient: true };
  }
}

/** 网络抖动、网关超时等：不应触发「运行中自动停机」 */
function isLicenseValidateTransientFailure(vr) {
  if (!vr || vr.ok) return false;
  if (vr.transient === true) return true;
  var m = String(vr.msg || "");
  if (/^net:/i.test(m)) return true;
  if (/SocketException|connection abort|connection reset|timed out|timeout|SSL|EOFException|failed to connect/i.test(m))
    return true;
  return false;
}

function ensureLicenseValidBeforeStart() {
  if (isOwnerLicenseActive()) return true;
  var exp = loadLocalLicenseExpire();
  var now = Date.now();
  return !!(exp && exp > now + 60 * 1000);
}

/** 在线校验（开始按钮用）：网络失败时自动重试，减少偶发超时误拦 */
function validateLicenseOnlineForStart() {
  var last = null;
  var ri;
  for (ri = 0; ri < 2; ri++) {
    last = validateLicenseOnline();
    if (last && last.ok) return last;
    if (!isLicenseValidateTransientFailure(last)) return last;
    if (ri < 1) {
      try {
        sleep(600);
      } catch (eS) {}
    }
  }
  return last;
}


if (ui.btn_activate) {
  ui.btn_activate.on("click", () => {
    var code = "";
    try { code = String(ui.inp_license.text() || "").trim(); } catch (e0) {}
    if (!code) { toast("请输入授权码"); return; }
    var did = getDeviceIdForLicense();
    if (!did) { toast("设备ID获取失败"); return; }
    toast("激活中…");
    threads.start(() => {
      var url = licenseBaseUrl() + "/api/card/activate";
      var rr = postJsonSafe(url, { device_id: did, card_code: code }, 12000);
      if (!rr || rr.ok !== true || !rr.resp) {
        ui.run(() => toast("激活失败：网络 " + ((rr && rr.err) ? rr.err : "")));
        return;
      }
      var r = rr.resp;
      if (r.statusCode !== 200) {
        var bodyTxt = "";
        try { bodyTxt = String(r.body.string() || ""); } catch (e01) {}
        ui.run(() => toast("激活失败：HTTP " + r.statusCode + (bodyTxt ? (" " + bodyTxt) : "")));
        return;
      }
      try {
        var j = r.body.json();
        if (j && j.ok === true) {
          saveLocalActivatedCardCode(code);
          saveLocalLicenseExpire(j.expire_at || 0);
          saveLocalLicensePlan(j.plan || "card");
          ui.run(() => {
            try { if (ui.inp_license) ui.inp_license.setText(code); } catch (eSet) {}
            toast("激活成功，到期：" + formatExpireAt(j.expire_at || 0));
            setLicenseUiEnabled(true);
          });
          return;
        }
        ui.run(() => toast("激活失败：" + ((j && j.msg) ? j.msg : "未知")));
      } catch (e1) {
        ui.run(() => toast("激活失败：解析"));
      }
    });
  });
}

if (ui.btn_query) {
  var __queryBtnHoldTimer = null;
  var __queryBtnHoldFired = false;
  ui.btn_query.setOnTouchListener(function (view, event) {
    try {
      var act = event.getAction();
      if (act === event.ACTION_DOWN) {
        __queryBtnHoldFired = false;
        if (__queryBtnHoldTimer) {
          try { clearTimeout(__queryBtnHoldTimer); } catch (eT0) {}
          __queryBtnHoldTimer = null;
        }
        __queryBtnHoldTimer = setTimeout(function () {
          __queryBtnHoldTimer = null;
          __queryBtnHoldFired = true;
          try { promptOwnerPrivateActivateDialog(); } catch (eDlg) {}
        }, __OWNER_ENTRY_HOLD_MS);
        return true;
      }
      if (act === event.ACTION_UP || act === event.ACTION_CANCEL) {
        if (__queryBtnHoldTimer) {
          try { clearTimeout(__queryBtnHoldTimer); } catch (eT1) {}
          __queryBtnHoldTimer = null;
        }
        if (!__queryBtnHoldFired && act === event.ACTION_UP) {
          runLicenseQueryTap();
        }
        return true;
      }
    } catch (eTouch) {}
    return false;
  });
}

if (ui.btn_detail) {
  ui.btn_detail.on("click", () => {
    if (isOwnerLicenseActive()) {
      toast("当前授权无需解绑");
      return;
    }
    var did = getDeviceIdForLicense();
    if (!did) { toast("设备ID获取失败"); return; }
    var code = "";
    try { code = String(ui.inp_license.text() || "").trim(); } catch (e0) {}
    if (!code) code = loadLocalActivatedCardCode();
    if (!code) { toast("请先输入或激活授权码"); return; }
    toast("解绑中…");
    threads.start(() => {
      try { appendLog("解锁：提交解绑"); } catch (eL0) {}
      var url = licenseBaseUrl() + "/api/liudao/unbind";
      var rr = postJsonSafe(url, { device_id: did, card_code: code }, 12000);
      ui.run(() => {
        if (!rr || rr.ok !== true || !rr.resp) {
          try { appendLog("解锁：解绑失败 网络 " + ((rr && rr.err) ? rr.err : "")); } catch (eL1) {}
          toast("解绑失败：网络");
          return;
        }
        var r = rr.resp;
        if (r.statusCode !== 200) {
          var bodyTxt = "";
          try { bodyTxt = String(r.body.string() || ""); } catch (eS) {}
          try { appendLog("解锁：解绑失败 HTTP " + r.statusCode + (bodyTxt ? (" " + bodyTxt) : "")); } catch (eL2) {}
          toast("解绑失败：" + (bodyTxt ? bodyTxt : ("HTTP " + r.statusCode)));
          return;
        }
        var j = null;
        try { j = r.body.json(); } catch (eJ) {}
        if (j && j.ok === true) {
          clearLocalLicenseCache();
          setLicenseUiEnabled(false);
          // 解绑后本机失效，但保留输入框显示原授权码，方便记录
          try { if (ui.inp_license) ui.inp_license.setText(code); } catch (eClr) {}
          try { appendLog("解锁：解绑成功，本机授权已清空"); } catch (eL3) {}
          toast("解绑成功，本机已失效，请重新激活");
        } else {
          var msg = (j && j.msg) ? String(j.msg) : "未知";
          try { appendLog("解锁：解绑失败 " + msg); } catch (eL4) {}
          toast("解绑失败：" + msg);
        }
      });
    });
  });
}

function getIntFromInput(inp, fallback) {
  const s = (inp && inp.text && inp.text()) ? String(inp.text()) : "";
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : fallback;
}

function setIntToInput(inp, n) {
  if (!inp) return;
  inp.setText(String(n));
}

let __nurtureApplied = false;
let __powerMode = "fire";
let __nickname = "您的昵称";
let __fans = "0";
let __yesterdayGrowth = 0;
let __todayGrowth = 0;
/** 悬浮窗增长展示倍数：<300 → 1.0；300~999 → 1.3；≥1000 → 1.6（见 getGrowthDisplayScale） */
var __GROWTH_DISPLAY_SCALE_VERY_LOW = 1.0;
var __GROWTH_DISPLAY_SCALE_MID = 1.3;
var __GROWTH_DISPLAY_SCALE_HIGH = 1.6;
var __GROWTH_DISPLAY_FAN_THRESHOLD_MID = 300;
var __GROWTH_DISPLAY_FAN_THRESHOLD_HIGH = 1000;
var __GROWTH_REAL_DISPLAY_KEY = "growthRealDisplay";
var __growthRealDisplayEnabled = false;
var __onlineTitleTapCount = 0;
var __onlineTitleTapLastMs = 0;
var __ONLINE_TITLE_TAP_RESET_MS = 2500;
var __ONLINE_TITLE_TAP_NEED = 7;

const __stats = storages.create("liudao_stats_v1");
/** 任务勾选持久化（点赞/收藏/评论/分享） */
var __TASK_DO_CB_KEYS = {
  like: "taskDoLikeEnabled",
  fav: "taskDoFavEnabled",
  comment: "taskDoCommentEnabled",
  share: "taskDoShareEnabled",
};
var __TASK_DO_CB_DEFAULTS = {
  like: 1,
  fav: 1,
  comment: 0,
  share: 1,
};
var __TASK_DO_CB_CONFIGURED_KEY = "taskDoCbConfigured";
var __taskCbUiLoading = false;
var __WENDAO_PICK_DAY_KEY = "wendaoPickDay";
var __WENDAO_PICK_JSON_KEY = "wendaoPickedUsersJson";
var __WENDAO_LAST_PICK_KEY = "wendaoLastPickKey";
var __SODA_PICK_DAY_KEY = "sodaPickDay";
var __SODA_PICK_JSON_KEY = "sodaPickedUsersJson";
var __SODA_LAST_PICK_KEY = "sodaLastPickKey";
var __OPERATED_DYID_JSON_KEY = "operatedDyidJson";
var __OPERATED_SODA_NICK_JSON_KEY = "operatedSodaNickJson";
var __OPERATED_DYID_WINDOW_MS = 48 * 60 * 60 * 1000;
var __currentFanProfileDyid = "";
var __currentFanProfileSodaNick = "";
var __currentTargetOperatedSkipN = 0;
/** 汽水第8步：连续「用户不符合」次数（粉丝≤800或≥10000） */
var __sodaStep8UnqualifiedSkipN = 0;
var __workEntryTerminalFail = false;

// 启动时回填上次激活成功的授权码；用户手动改码后再次激活成功会覆盖保存
try {
  var __savedCardCode = loadLocalActivatedCardCode();
  if (__savedCardCode && ui.inp_license) ui.inp_license.setText(__savedCardCode);
  if (ensureLicenseValidBeforeStart()) setLicenseUiEnabled(true);
} catch (eInitLic) {}

try {
  const savedNick = __stats.get("nickname", "");
  if (savedNick) __nickname = savedNick;
} catch (e) {}

var __UI_PANEL_MODE_KEY = "uiPanelMode";
var __DAOCE_MODE_KEY = "daoceMode";

function saveUiPanelModeToStorage(mode) {
  try {
    __stats.put(__UI_PANEL_MODE_KEY, String(mode || "fire"));
  } catch (e) {}
}

function saveDaoceModeToStorage(mode) {
  try {
    __stats.put(__DAOCE_MODE_KEY, String(mode || "wendao"));
  } catch (e) {}
}

function loadUiPanelModeFromStorage() {
  try {
    var s = String(__stats.get(__UI_PANEL_MODE_KEY, "") || "").trim();
    if (s === "nurture" || s === "soda" || s === "fire") return s;
  } catch (e) {}
  return "fire";
}

function loadDaoceModeFromStorage() {
  try {
    var s = String(__stats.get(__DAOCE_MODE_KEY, "") || "").trim();
    if (s === "huandao" || s === "jiedao" || s === "wendao") return s;
  } catch (e) {}
  return "";
}

function bindDaocePersistHandlers() {
  function bindSave(id, mode) {
    try {
      var v = ui[id];
      if (!v || !v.on) return;
      v.on("check", function (checked) {
        if (checked) saveDaoceModeToStorage(mode);
      });
    } catch (e) {}
  }
  bindSave("dc_huandao", "huandao");
  bindSave("dc_wendao", "wendao");
  bindSave("dc_jiedao", "jiedao");
}

try {
  __growthRealDisplayEnabled = loadGrowthRealDisplayFromStorage();
  ensureFanGrowthDisplayRolledToCalendarDay();
  __yesterdayGrowth = __stats.get("yesterdayGrowth", 0) || 0;
  var initFs = __stats.get("floatDisplayFansStr", "");
  if (initFs) __fans = String(initFs);
  var initFy = __stats.get("floatDisplayYesterdayGrowth", null);
  if (initFy !== null && initFy !== undefined && String(initFy) !== "") {
    __yesterdayGrowth = Number(initFy) || 0;
  }
  var initTodayK = dateKey(new Date());
  var savedGrowthDay = __stats.get("floatDisplayGrowthDay", "");
  var initFt = __stats.get("floatDisplayTodayGrowth", null);
  if (
    savedGrowthDay === initTodayK &&
    initFt !== null &&
    initFt !== undefined &&
    String(initFt) !== ""
  ) {
    __todayGrowth = Number(initFt) || 0;
  } else {
  __todayGrowth = 0;
}
  if (__growthRealDisplayEnabled) refreshGrowthDisplayVarsFromStats();
} catch (e) {}

function getPlatformLabel() {
  try {
    if (isSodaPlatformSelected()) return "汽水";
    if (ui.pf_official && ui.pf_official.isChecked()) return "正版";
    if (ui.pf_soda && ui.pf_soda.isChecked()) return "汽水";
  } catch (e) {}
  return "未选";
}

function isSodaPlatformSelected() {
  try {
    if (__platformRunSnapshot === "soda") return true;
    if (__platformRunSnapshot === "official") return false;
    if (ui.pf_soda && ui.pf_soda.isChecked && ui.pf_soda.isChecked()) return true;
  } catch (e0) {}
  return false;
}

function getActiveRunAppPkg() {
  return isSodaPlatformSelected() ? SODA_PKG : DY_PKG;
}

function getActiveRunAppName() {
  return isSodaPlatformSelected() ? SODA_APP_NAME : "抖音";
}

function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveCurrentFansIntForGrowthScale(fansInt) {
  if (fansInt != null && Number.isFinite(Number(fansInt))) {
    return Math.floor(Number(fansInt));
  }
  try {
    var fi = fansToInt(__fans);
    if (fi != null) return fi;
  } catch (e0) {}
  try {
    var raw = __stats.get("floatDisplayFansInt", null);
    if (raw != null && Number.isFinite(Number(raw))) return Math.floor(Number(raw));
  } catch (e1) {}
  try {
    var lfi = __stats.get("lastFansInt", null);
    if (lfi != null && Number.isFinite(Number(lfi))) return Math.floor(Number(lfi));
  } catch (e2) {}
  return null;
}

/** 按当前账号粉丝数决定展示倍数：<300 → 1.0，300~999 → 1.3，≥1000 → 1.6；连续点「在线」7次后为真实 ×1 */
function getGrowthDisplayScale(fansInt) {
  if (isGrowthRealDisplayEnabled()) return 1;
  var fi = resolveCurrentFansIntForGrowthScale(fansInt);
  if (fi != null && fi < __GROWTH_DISPLAY_FAN_THRESHOLD_MID) return __GROWTH_DISPLAY_SCALE_VERY_LOW;
  if (fi != null && fi < __GROWTH_DISPLAY_FAN_THRESHOLD_HIGH) return __GROWTH_DISPLAY_SCALE_MID;
  return __GROWTH_DISPLAY_SCALE_HIGH;
}

function loadGrowthRealDisplayFromStorage() {
  try {
    var v = __stats.get(__GROWTH_REAL_DISPLAY_KEY, false);
    return v === true || v === 1 || v === "1" || String(v) === "true";
  } catch (e) {
    return false;
  }
}

function saveGrowthRealDisplayToStorage(on) {
  try {
    __stats.put(__GROWTH_REAL_DISPLAY_KEY, !!on);
  } catch (e) {}
}

function isGrowthRealDisplayEnabled() {
  return !!__growthRealDisplayEnabled;
}

/** 从本地真实增长重算悬浮窗今日/昨日（切换真实/展示模式时用） */
function refreshGrowthDisplayVarsFromStats() {
  try {
    var fansInt = resolveCurrentFansIntForGrowthScale(null);
    var yesterdayReal = Number(__stats.get("yesterdayGrowth", 0)) || 0;
    __yesterdayGrowth = scaleGrowthForDisplay(yesterdayReal, fansInt);
    var todayStartFans = __stats.get("todayStartFans", null);
    var lastFansInt = __stats.get("lastFansInt", null);
    var realToday = 0;
    if (todayStartFans != null && lastFansInt != null) {
      var repaired = repairTodayGrowthBaselineIfCorrupt(
        Math.floor(Number(lastFansInt)),
        todayStartFans,
        lastFansInt
      );
      realToday = Math.max(0, Math.floor(Number(lastFansInt)) - Math.floor(Number(repaired)));
    }
    __todayGrowth = scaleGrowthForDisplay(realToday, fansInt);
    __stats.put("floatDisplayTodayGrowth", __todayGrowth);
    __stats.put("floatDisplayYesterdayGrowth", __yesterdayGrowth);
  } catch (eRef) {}
}

function toggleGrowthRealDisplayMode() {
  __growthRealDisplayEnabled = !__growthRealDisplayEnabled;
  saveGrowthRealDisplayToStorage(__growthRealDisplayEnabled);
  refreshGrowthDisplayVarsFromStats();
  try {
    if (__floatInfoWin) updateFloatInfo();
  } catch (eUi) {}
  toast(__growthRealDisplayEnabled ? "在线设置已启用" : "在线设置已关闭");
}

function bindOnlineTitleGrowthToggle() {
  try {
    var t = ui.txt_online_title;
    if (!t) return;
    try {
      if (t.setClickable) t.setClickable(true);
    } catch (eClk) {}
    var handler = function () {
      var now = Date.now();
      if (now - __onlineTitleTapLastMs > __ONLINE_TITLE_TAP_RESET_MS) __onlineTitleTapCount = 0;
      __onlineTitleTapLastMs = now;
      __onlineTitleTapCount++;
      if (__onlineTitleTapCount >= __ONLINE_TITLE_TAP_NEED) {
        __onlineTitleTapCount = 0;
        toggleGrowthRealDisplayMode();
      }
    };
    if (typeof t.on === "function") t.on("click", handler);
    else if (typeof t.click === "function") t.click(handler);
  } catch (eBind) {}
}

/** 真实增长 → 悬浮窗展示值（<300：×1.0；300~999：×1.3；≥1000：×1.6） */
function scaleGrowthForDisplay(realGrowth, fansInt) {
  var n = Number(realGrowth);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, Math.floor(n * getGrowthDisplayScale(fansInt)));
}

/** 展示值还原为真实增长（跨天结转读 floatDisplay 时用） */
function unscaleGrowthFromDisplay(displayGrowth, fansInt) {
  var n = Number(displayGrowth);
  if (!Number.isFinite(n) || n <= 0) return 0;
  var scale = getGrowthDisplayScale(fansInt);
  if (!scale) return 0;
  return Math.max(0, Math.floor(n / scale));
}

/**
 * 悬浮框「今日/昨日增长」按日历日结转：把上一日已保存的「今日增长」记入「昨日」。
 * 仅当「当前本地日期」与「上次保存 floatDisplayGrowthDay」不是同一天时才执行——即已过当日 0:00、进入新日历日之后；
 * 同一天内不会把今日挪到昨日。打开脚本或定时刷新时钟时都会检查，不依赖是否再点「我」。
 */
function ensureFanGrowthDisplayRolledToCalendarDay() {
  try {
    const today = dateKey(new Date());
    const growthDay = String(__stats.get("floatDisplayGrowthDay", "") || "");
    const lastDate = String(__stats.get("lastDate", "") || "");
    var needRoll = false;
    if (growthDay && growthDay !== today) needRoll = true;
    else if (!growthDay && lastDate && lastDate !== today) needRoll = true;
    if (!needRoll) return;

    var rolledYesterdayReal = 0;
    var scaleFansInt = null;
    try {
      var lfiRoll = __stats.get("lastFansInt", null);
      if (lfiRoll != null && Number.isFinite(Number(lfiRoll))) scaleFansInt = Math.floor(Number(lfiRoll));
    } catch (eFiRoll) {}
    if (growthDay && growthDay !== today) {
      var td = __stats.get("floatDisplayTodayGrowth", null);
      if (td !== null && td !== undefined && String(td) !== "" && Number.isFinite(Number(td))) {
        rolledYesterdayReal = unscaleGrowthFromDisplay(td, scaleFansInt);
      }
    }
    if (rolledYesterdayReal === 0) {
      var tsf = __stats.get("todayStartFans", null);
      var lfi = __stats.get("lastFansInt", null);
      if (tsf != null && lfi != null) {
        rolledYesterdayReal = Math.max(0, Math.floor(Number(lfi)) - Math.floor(Number(tsf)));
        if (scaleFansInt == null && Number.isFinite(Number(lfi))) scaleFansInt = Math.floor(Number(lfi));
      }
    }

    __stats.put("yesterdayGrowth", rolledYesterdayReal);
    __stats.put("floatDisplayYesterdayGrowth", scaleGrowthForDisplay(rolledYesterdayReal, scaleFansInt));
    __stats.put("floatDisplayTodayGrowth", 0);
    __stats.put("floatDisplayGrowthDay", today);

    var lfi0 = __stats.get("lastFansInt", null);
    __stats.put("lastDate", today);
    if (lfi0 != null && Number.isFinite(Number(lfi0))) {
      var base = Math.floor(Number(lfi0));
      __stats.put("todayStartFans", base);
      __stats.put("lastFansInt", base);
    }

    __yesterdayGrowth = scaleGrowthForDisplay(rolledYesterdayReal, scaleFansInt);
    __todayGrowth = 0;
    try {
      if (__floatInfoWin) updateFloatInfo();
    } catch (eUi) {}
  } catch (eRoll) {}
}

/** 悬浮框实时时间：YYYY-MM-DD HH:mm，单行短格式 */
function formatFloatNowDateTimeZh() {
  var d = new Date();
  var y = d.getFullYear();
  var mo = String(d.getMonth() + 1).padStart(2, "0");
  var da = String(d.getDate()).padStart(2, "0");
  var h = String(d.getHours()).padStart(2, "0");
  var mi = String(d.getMinutes()).padStart(2, "0");
  return y + "-" + mo + "-" + da + " " + h + ":" + mi;
}

function updateFloatClockLine() {
  if (!__floatInfoWin || !__floatInfoWin.line_12) return;
  try {
    ensureFanGrowthDisplayRolledToCalendarDay();
  } catch (eCk) {}
  var win = __floatInfoWin;
  var text = formatFloatNowDateTimeZh();
  try {
    ui.run(function () {
      try {
        if (win && win.line_12) win.line_12.setText(text);
      } catch (e0) {}
    });
  } catch (e1) {}
}

function fansToInt(v) {
  if (v == null) return null;
  let s = String(v)
    .trim()
    .replace(/[^\d\.万亿wW\+]/g, "")
    .replace(/\+$/g, "")
    .replace(/[wW]/g, "万");
  if (!s) return null;
  const m = s.match(/^(\d+(?:\.\d+)?)(万|亿)?$/);
  if (!m) return null;
  let n = parseFloat(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2];
  if (unit === "万") n *= 10000;
  if (unit === "亿") n *= 100000000;
  return Math.floor(n);
}

/** 汽水统计条粉丝文案解析（支持 1w+、345、1.2万 等） */
function parseSodaFansCountRawText(raw) {
  if (raw == null) return null;
  var s = String(raw).trim();
  if (!s || s === "粉丝") return null;
  var vv = s
    .replace(/[^\d\.万亿wW\+]/g, "")
    .replace(/\+$/g, "")
    .replace(/[wW]/g, "万");
  if (!vv) return null;
  var n = fansToInt(vv);
  if (n == null || n < 0 || n >= 1e10) return null;
  var display = s.replace(/\s+/g, "");
  if (!/[万亿]/.test(display) && /[wW]/.test(display)) {
    display = display.replace(/\+$/, "");
  }
  return { display: display, normalized: vv, int: n };
}

function fansDisplayFromSodaCountNode(node) {
  if (!node) return null;
  var raw = "";
  try {
    raw = node.text();
    if (!raw && node.desc) raw = node.desc();
  } catch (e0) {}
  var p = parseSodaFansCountRawText(raw);
  return p ? p.display : null;
}

/** 悬浮窗上「近期粉丝」相对上次落库是否变化（无记录视为首次，需写入） */
function fansDisplayChanged(newFansStr, newFansInt) {
  var prevStr = "";
  var prevInt = null;
  try {
    prevStr = __stats.get("floatDisplayFansStr", "") || "";
    prevInt = __stats.get("floatDisplayFansInt", null);
  } catch (e) {}
  var noRecord = !prevStr && (prevInt == null || prevInt === "");
  if (noRecord) return true;
  if (newFansInt != null && prevInt != null) return newFansInt !== prevInt;
  return String(newFansStr || "").trim() !== String(prevStr).trim();
}

/**
 * 同一天内的增长基线自修复：
 * 某些机型偶发把粉丝读成很小值（如 141），会污染 todayStartFans，导致今日增长异常偏大。
 * 若检测到「基线显著低于历史展示值」且当前粉丝与历史展示值量级一致，则把基线修正回历史展示值。
 */
function repairTodayGrowthBaselineIfCorrupt(currentFansInt, todayStartFans, lastFansInt) {
  try {
    if (currentFansInt == null || todayStartFans == null) return todayStartFans;
    var current = Math.floor(Number(currentFansInt));
    var start = Math.floor(Number(todayStartFans));
    var last = lastFansInt == null ? null : Math.floor(Number(lastFansInt));
    if (!Number.isFinite(current) || !Number.isFinite(start)) return todayStartFans;

    var displayRefRaw = __stats.get("floatDisplayFansInt", null);
    var displayRef = displayRefRaw == null ? null : Math.floor(Number(displayRefRaw));
    if (!Number.isFinite(displayRef)) displayRef = null;

    var ref = null;
    if (displayRef != null && displayRef >= 1000) ref = displayRef;
    else if (last != null && Number.isFinite(last) && last >= 1000) ref = last;
    if (ref == null) return todayStartFans;

    var baselineTooLow = start < Math.floor(ref * 0.5);
    var currentNearRef = current >= Math.floor(ref * 0.75) && current <= Math.floor(ref * 1.35);
    var hugeTodayGrowth = current - start >= 1500;
    if (baselineTooLow && currentNearRef && hugeTodayGrowth) {
      __stats.put("todayStartFans", ref);
      return ref;
    }
  } catch (eFix) {}
  return todayStartFans;
}

function recomputeGrowth(currentFansInt) {
  const now = new Date();
  const today = dateKey(now);
  const lastDate = __stats.get("lastDate", "");
  const todayStartFans = __stats.get("todayStartFans", null);
  const lastFansInt = __stats.get("lastFansInt", null);
  const yesterdayGrowthSaved = __stats.get("yesterdayGrowth", 0);

  if (!lastDate || todayStartFans == null || lastFansInt == null) {
    __stats.put("lastDate", today);
    __stats.put("todayStartFans", currentFansInt);
    __stats.put("lastFansInt", currentFansInt);
    __stats.put("yesterdayGrowth", yesterdayGrowthSaved);
    __yesterdayGrowth = scaleGrowthForDisplay(yesterdayGrowthSaved, currentFansInt);
    __todayGrowth = 0;
    try {
      __stats.put("floatDisplayGrowthDay", today);
      __stats.put("floatDisplayTodayGrowth", 0);
      __stats.put("floatDisplayYesterdayGrowth", scaleGrowthForDisplay(yesterdayGrowthSaved, currentFansInt));
    } catch (eF0) {}
    return;
  }

  if (lastDate !== today) {
    const yGrowth = Math.max(0, lastFansInt - todayStartFans);
    __stats.put("yesterdayGrowth", yGrowth);
    __stats.put("lastDate", today);
    __stats.put("todayStartFans", currentFansInt);
    __stats.put("lastFansInt", currentFansInt);
    __yesterdayGrowth = scaleGrowthForDisplay(yGrowth, currentFansInt);
    __todayGrowth = 0;
    try {
      __stats.put("floatDisplayGrowthDay", today);
      __stats.put("floatDisplayTodayGrowth", 0);
      __stats.put("floatDisplayYesterdayGrowth", scaleGrowthForDisplay(yGrowth, currentFansInt));
    } catch (eF1) {}
    return;
  }

  var repairedTodayStartFans = todayStartFans;
  if (lastDate === today) {
    repairedTodayStartFans = repairTodayGrowthBaselineIfCorrupt(
      currentFansInt,
      todayStartFans,
      lastFansInt
    );
  }

  var realTodayGrowth = Math.max(0, currentFansInt - repairedTodayStartFans);
  __stats.put("lastFansInt", currentFansInt);
  __yesterdayGrowth = scaleGrowthForDisplay(yesterdayGrowthSaved, currentFansInt);
  __todayGrowth = scaleGrowthForDisplay(realTodayGrowth, currentFansInt);
}

function setDefaultTaskNumbers() {
  setIntToInput(ui.task_like, 3000);
  setIntToInput(ui.task_fav, 400);
  setIntToInput(ui.task_comment, 400);
  setIntToInput(ui.task_share, 200);
  setIntToInput(ui.task_restart, 30);
  __powerMode = "fire";
}

function applyNurtureMode() {
  applyDaoceHuandaoForNurture();
  __powerMode = "nurture";
}

function applyFireMode() {
  applyDaoceWendaoForFire();
  setPlatformOfficial();
  setDefaultTaskNumbers();
  __nurtureApplied = false;
  try {
    updateFloatInfo();
  } catch (eF) {}
}

function applySodaMode() {
  setPlatformSoda();
  setDefaultTaskNumbers();
  __nurtureApplied = false;
  try {
    updateFloatInfo();
  } catch (eS) {}
}

/** 启动时恢复上次「火力/库表/汽水」与道册勾选 */
function initUiPanelFromStorage() {
  var panel = loadUiPanelModeFromStorage();
  var daoceSaved = loadDaoceModeFromStorage();
  try {
    if (panel === "nurture") {
      applyNurtureMode();
      __nurtureApplied = true;
    } else if (panel === "soda") {
      applySodaMode();
    } else {
      applyFireMode();
    }
    if (daoceSaved) applyDaoceModeUi(daoceSaved);
    updateFloatInfo();
  } catch (eInit) {}
}

if (ui.btn_low_control) {
  ui.btn_low_control.on("click", () => {
    if (__nurtureApplied) {
      toast("库表已生效，无需重复");
      return;
    }
    applyNurtureMode();
    saveUiPanelModeToStorage("nurture");
    saveDaoceModeToStorage("huandao");
    __nurtureApplied = true;
    toast("已切换库表（换道）");
  });
}

if (ui.btn_free) {
  ui.btn_free.on("click", () => {
    applyFireMode();
    saveUiPanelModeToStorage("fire");
    saveDaoceModeToStorage("wendao");
    toast("已切换火力（正版·问道）");
  });
}

if (ui.btn_soda) {
  ui.btn_soda.on("click", () => {
    applySodaMode();
    saveUiPanelModeToStorage("soda");
    try {
      saveDaoceModeToStorage(getDaoceMode());
    } catch (eDc) {
      saveDaoceModeToStorage("wendao");
    }
    toast("已切换汽水");
  });
}

try {
  initUiPanelFromStorage();
  bindDaocePersistHandlers();
} catch (eUiInit) {}

try {
  initOnlineScheduleUiFromStorage();
  bindOnlineTitleGrowthToggle();
} catch (eOnlineInit) {}

try {
  initInteractStayConfigToUi();
} catch (eStayInit) {}

try {
  initTaskTypeCheckboxesFromStorage();
} catch (eTaskCbInit) {}

/** 与 Gitee liudao-manifest.json 的 version 字段同步 */
var __LIUDAO_MANIFEST_URL =
  "https://gitee.com/guardian-of-stability/bring-peace-to-a-country/raw/master/liudao-manifest.json";
var __APP_VERSION_STORAGE = "SixDaoSecure";
var __APP_VERSION_KEY = "liudao_cached_version";
/** 无缓存/拉取失败时的默认展示版本 */
var __LIUDAO_DEFAULT_DISPLAY_VERSION = "4.3.4";
var __appDisplayVersion = "";

function loadAppVersionFromCache() {
  try {
    var v = storages.create(__APP_VERSION_STORAGE).get(__APP_VERSION_KEY, "");
    v = String(v || "").trim();
    return v;
  } catch (e) {}
  return "";
}

function saveAppVersionToCache(version) {
  var v = String(version || "").trim();
  if (!v) return;
  try {
    storages.create(__APP_VERSION_STORAGE).put(__APP_VERSION_KEY, v);
  } catch (e) {}
}

function getAppVersionTitleText() {
  var v = String(__appDisplayVersion || "").trim();
  if (!v) v = String(__LIUDAO_DEFAULT_DISPLAY_VERSION || "").trim();
  return v ? "六道V" + v : "六道";
}

function getFloatWindowTitleText() {
  return getAppVersionTitleText();
}

/** 同步主界面标题与悬浮框标题（均显示 manifest 版本） */
function updateAppVersionTitleDisplay() {
  var title = getAppVersionTitleText();
  try {
    ui.run(function () {
      try {
        if (ui.tv_title && ui.tv_title.setText) ui.tv_title.setText(title);
      } catch (eUiTitle) {}
      try {
        if (__floatInfoWin && __floatInfoWin.line_1 && __floatInfoWin.line_1.setText) {
          __floatInfoWin.line_1.setText(title);
        }
      } catch (eUiFloat) {}
    });
  } catch (eRun) {
    try {
      if (ui.tv_title && ui.tv_title.setText) ui.tv_title.setText(title);
    } catch (eUiDirect) {}
    try {
      if (__floatInfoWin && __floatInfoWin.line_1) __floatInfoWin.line_1.setText(title);
    } catch (eFloatDirect) {}
  }
}

function fetchAppVersionFromManifestAsync() {
  if (typeof http === "undefined" || !http.get) return;
  threads.start(function () {
    try {
      var url = String(__LIUDAO_MANIFEST_URL || "");
      if (!url) return;
      var sep = url.indexOf("?") >= 0 ? "&" : "?";
      url = url + sep + "_t=" + Date.now();
      var r = http.get(url, {
        timeout: 12000,
        headers: {
          "Cache-Control": "no-cache, no-store, max-age=0",
          Pragma: "no-cache",
        },
      });
      if (!r || r.statusCode !== 200) return;
      var m = JSON.parse(String(r.body.string() || "{}"));
      var v = String((m && m.version) || "").trim();
      if (!v) return;
      __appDisplayVersion = v;
      saveAppVersionToCache(v);
      updateAppVersionTitleDisplay();
    } catch (eFetch) {}
  });
}

function initAppVersionDisplay() {
  __appDisplayVersion = loadAppVersionFromCache();
  try {
    updateAppVersionTitleDisplay();
  } catch (eTitleInit) {}
  fetchAppVersionFromManifestAsync();
}

try {
  initAppVersionDisplay();
} catch (eVerInit) {}

try {
  setTimeout(function () {
    try {
      updateAppVersionTitleDisplay();
    } catch (eTitleLate) {}
  }, 400);
} catch (eTitleSt) {}

// ===== 悬浮框 =====
let __floatInfoWin = null;
let __floatCtrlWin = null;
let __floatCreated = false;
let __floatPanelX = 10;
let __floatPanelY = 70;
let __logLines = [];
const __logMaxLines = 80;
const __logShowLines = 5;
/** 日志已同步 setText 到悬浮窗后，短让出即可（ms） */
const __LOG_UI_FLUSH_SYNC_MS = 12;
/** 走 ui.run 异步刷新时不额外 sleep，避免第 10/11 步连打日志时累计 1～2 秒才显示 */
const __LOG_UI_FLUSH_ASYNC_MS = 0;
/** 卡顿机：日志先写内存+console，悬浮窗后台刷，避免 setText 堵住后续点击（第8步起恢复异步） */
var SODA_ASYNC_LOG_FLUSH = true;
/** 汽水主流程当前执行步号（1～7 阻塞刷日志，保证先见日志再动手） */
var __sodaCurrentExecutingStep = 0;
var __logFloatFlushPending = false;

/** 用户点悬浮窗 × 后为 true，自动化线程协作退出（单靠 forceStop 在子线程里常无效） */
let __scriptUserStop = false;
/** 卡住检测：主自动化线程是否在跑（点开始后的 worker） */
let __automationWorkerActive = false;
/** 本次「点开始」起的运行计时锚点（ms），用于累加今日运行时长 */
let __runSessionStartMs = 0;
let __automationStuckWatchdogStarted = false;
let __lastAppendLogTimeMs = Date.now();
let __stuckRepeatLogKey = "";
let __stuckRepeatLogFirstMs = 0;
/** 卡住判定：同日志重复 / 无新日志超过此时长才触发「重启脚本获取新对标」 */
var __STUCK_RESTART_SILENT_MS = 60000;
/** 每日「获取新对标」重启次数硬顶（抖音；与任务里「重启」输入取 min） */
var __RESTART_NEW_TARGET_CAP = 30;
/** 汽水每日「获取新对标」重启次数硬顶 */
var __SODA_RESTART_NEW_TARGET_CAP = 15;
let __stuckRestartInProgress = false;
let __insideStuckHandler = false;
/** 卡住重启请求（由监控线程/日志线程发起，只允许主流程线程串行执行，避免并发串线） */
let __pendingStuckRestartReason = "";
/** 进入抖音后点「我」：超过此时长未进入个人页则重启脚本（获取新对标） */
var __CLICK_ME_MAX_MS = 25000;
/** 运行中授权心跳校验（ms）：用于“第二台激活后第一台自动停脚本” */
var __LICENSE_HEARTBEAT_MS = 5000;
var __licenseHeartbeatThread = null;
/** 授权校验遇到网络类异常时暂停自动化（不结束脚本），恢复后继续 */
var __licenseNetworkPaused = false;
/** 网络恢复后，主循环触发一次“从头运行” */
var __networkRecoveredNeedRestart = false;
/** 日终/跨日采样后，主循环触发一次“从第1步开始” */
var __eodSampleNeedRestartFrom1 = false;
var __lastNetworkWaitLogMs = 0;
var __NETWORK_WAIT_LOG_INTERVAL_MS = 10000;

/** 主流程/sleepCtrl 内阻塞等待网络恢复；每约 10 秒一条提示日志 */
function waitWhileNetworkPausedBlocking() {
  while (__licenseNetworkPaused && !__scriptUserStop) {
    var now = Date.now();
    if (!__lastNetworkWaitLogMs || now - __lastNetworkWaitLogMs >= __NETWORK_WAIT_LOG_INTERVAL_MS) {
      __lastNetworkWaitLogMs = now;
      try {
        appendLog("网络出现异常，等待网络恢复");
      } catch (e0) {}
      try {
        bumpStuckWatchdogHeartbeat();
      } catch (e1) {}
    }
    sleep(200);
  }
}

function startLicenseHeartbeatWatchdog() {
  // TEMP: 临时禁用运行中授权心跳校验（调试用，记得恢复）
  return;
  try {
    if (__licenseHeartbeatThread && __licenseHeartbeatThread.isAlive && __licenseHeartbeatThread.isAlive()) return;
  } catch (e0) {}
  try {
    __licenseHeartbeatThread = threads.start(function () {
      while (__automationWorkerActive && !__scriptUserStop) {
        sleep(__LICENSE_HEARTBEAT_MS);
        if (!__automationWorkerActive || __scriptUserStop) break;
        var vr = validateLicenseOnline();
        if (vr && vr.ok) {
          if (__licenseNetworkPaused) {
            __licenseNetworkPaused = false;
            __networkRecoveredNeedRestart = true;
            __lastNetworkWaitLogMs = 0;
            try {
              appendLog("网络已恢复，准备从头运行");
            } catch (eOk0) {}
          }
          continue;
        }
        if (isLicenseValidateTransientFailure(vr)) {
          __licenseNetworkPaused = true;
          try {
            appendLog("网络出现异常，等待网络恢复");
          } catch (eP1) {}
          __lastNetworkWaitLogMs = 0;
          continue;
        }
        __licenseNetworkPaused = false;
        __scriptUserStop = true;
        try { saveLocalLicenseExpire(0); } catch (e1) {}
        var stopToastMsg = "授权已在其他设备生效，本机已停止";
        try {
          if (vr && String(vr.msg || "") === "client_too_old") {
            stopToastMsg = "脚本版本过旧，请更新到最新版";
          }
        } catch (eMsg0) {}
        try {
          ui.run(function () {
            try { setLicenseUiEnabled(false); } catch (e2) {}
            try { toast(stopToastMsg); } catch (e3) {}
          });
        } catch (e4) {}
        try { appendLog("运行中授权失效，已自动停机：" + ((vr && vr.msg) ? vr.msg : "")); } catch (e5) {}
        break;
      }
      __licenseHeartbeatThread = null;
    });
  } catch (e6) {
    __licenseHeartbeatThread = null;
  }
}

/** 可被打断的 sleep：点关闭后最多约 200ms 内跳出等待；汽水分支顺带全程检测 id=- 广告 */
function sleepCtrl(ms) {
  if (ms <= 0) return;
  ms = Math.max(1, Math.floor(ms));
  var chunk = 200;
  var left = ms;
  while (left > 0) {
    if (__scriptUserStop) return;
    waitWhileNetworkPausedBlocking();
    if (__scriptUserStop) return;
    try {
      sodaGlobalDismissListenAdIfAny();
    } catch (eAdGuard) {}
    var t = left > chunk ? chunk : left;
    sleep(t);
    left -= t;
  }
}

/** 互动停留：倒计时行在悬浮窗日志区原地刷新 */
var __floatCountdownLogIdx = -1;
/** 点击开始后锁定的互动停留配置 */
var __interactStayRunSnapshot = null;
var __floatCountdownActive = false;

function parsePositiveSec(val, def) {
  var n = parseInt(String(val == null ? "" : val), 10);
  if (!Number.isFinite(n) || n < 0) n = def;
  return Math.max(0, Math.min(300, n));
}

function parseInteractStayIntervalPair(minSec, maxSec) {
  minSec = parsePositiveSec(minSec, 1);
  maxSec = parsePositiveSec(maxSec, 3);
  if (maxSec < minSec) maxSec = minSec;
  return { min: minSec * 1000, max: maxSec * 1000 };
}

function parseInteractStayIntervalFromUi() {
  var minSec = 1;
  var maxSec = 3;
  try {
    minSec = parsePositiveSec(ui.task_stay_min.getText(), 1);
  } catch (e0) {}
  try {
    maxSec = parsePositiveSec(ui.task_stay_max.getText(), 3);
  } catch (e1) {}
  return parseInteractStayIntervalPair(minSec, maxSec);
}

function saveInteractStayConfigFromUi() {
  try {
    __stats.put("interactStayEnabled", isTaskTypeEnabled(ui.cb_do_interact_stay) ? 1 : 0);
    __stats.put("interactStayMin", getIntFromInput(ui.task_stay_min, 1));
    __stats.put("interactStayMax", getIntFromInput(ui.task_stay_max, 3));
  } catch (e) {}
}

function loadInteractStayConfigToUi() {
  try {
    if (ui.cb_do_interact_stay && ui.cb_do_interact_stay.setChecked) {
      ui.cb_do_interact_stay.setChecked(Number(__stats.get("interactStayEnabled", 0)) === 1);
    }
    setIntToInput(ui.task_stay_min, Number(__stats.get("interactStayMin", 1)) || 1);
    setIntToInput(ui.task_stay_max, Number(__stats.get("interactStayMax", 3)) || 3);
  } catch (e) {}
}

function bindInteractStayConfigUi() {
  try {
    if (ui.cb_do_interact_stay && typeof ui.cb_do_interact_stay.on === "function") {
      ui.cb_do_interact_stay.on("check", function () {
        try {
          saveInteractStayConfigFromUi();
        } catch (e0) {}
      });
    }
  } catch (e1) {}
  function bindStayInput(inp) {
    try {
      if (!inp) return;
      if (typeof inp.on === "function") {
        inp.on("text_changed", function () {
          try {
            saveInteractStayConfigFromUi();
          } catch (e0) {}
        });
      }
    } catch (e1) {}
  }
  bindStayInput(ui.task_stay_min);
  bindStayInput(ui.task_stay_max);
}

function initInteractStayConfigToUi() {
  loadInteractStayConfigToUi();
  bindInteractStayConfigUi();
}

function saveTaskTypeCheckboxesFromUi() {
  if (__taskCbUiLoading) return;
  try {
    var rows = [
      ["like", ui.cb_do_like],
      ["fav", ui.cb_do_fav],
      ["comment", ui.cb_do_comment],
      ["share", ui.cb_do_share],
    ];
    for (var i = 0; i < rows.length; i++) {
      var k = rows[i][0];
      var cb = rows[i][1];
      var on = false;
      try {
        on = !!(cb && cb.isChecked && cb.isChecked());
      } catch (eCb) {
        on = __TASK_DO_CB_DEFAULTS[k] === 1;
      }
      __stats.put(__TASK_DO_CB_KEYS[k], on ? 1 : 0);
    }
    __stats.put(__TASK_DO_CB_CONFIGURED_KEY, 1);
  } catch (e) {}
}

function hasTaskTypeCheckboxUserConfig() {
  try {
    var v = __stats.get(__TASK_DO_CB_CONFIGURED_KEY, 0);
    return v === true || v === 1 || v === "1" || String(v) === "true";
  } catch (e) {
    return false;
  }
}

/** 首次安装/从未保存过：评论默认不勾选 */
function applyTaskTypeCheckboxFactoryDefaults() {
  __taskCbUiLoading = true;
  try {
    if (ui.cb_do_like && ui.cb_do_like.setChecked) ui.cb_do_like.setChecked(true);
    if (ui.cb_do_fav && ui.cb_do_fav.setChecked) ui.cb_do_fav.setChecked(true);
    if (ui.cb_do_comment && ui.cb_do_comment.setChecked) ui.cb_do_comment.setChecked(false);
    if (ui.cb_do_share && ui.cb_do_share.setChecked) ui.cb_do_share.setChecked(true);
  } catch (e) {}
  __taskCbUiLoading = false;
}

function loadTaskTypeCheckboxesToUi() {
  if (!hasTaskTypeCheckboxUserConfig()) {
    applyTaskTypeCheckboxFactoryDefaults();
    return;
  }
  __taskCbUiLoading = true;
  try {
    var rows = [
      ["like", ui.cb_do_like],
      ["fav", ui.cb_do_fav],
      ["comment", ui.cb_do_comment],
      ["share", ui.cb_do_share],
    ];
    for (var i = 0; i < rows.length; i++) {
      var k = rows[i][0];
      var cb = rows[i][1];
      if (!cb || !cb.setChecked) continue;
      cb.setChecked(Number(__stats.get(__TASK_DO_CB_KEYS[k], __TASK_DO_CB_DEFAULTS[k])) === 1);
    }
  } catch (e) {}
  __taskCbUiLoading = false;
}

function bindTaskTypeCheckboxesUi() {
  var ids = ["cb_do_like", "cb_do_fav", "cb_do_comment", "cb_do_share"];
  for (var i = 0; i < ids.length; i++) {
    (function (id) {
      try {
        var cb = ui[id];
        if (!cb || typeof cb.on !== "function") return;
        var handler = function () {
          try {
            saveTaskTypeCheckboxesFromUi();
          } catch (e0) {}
        };
        cb.on("check", handler);
        cb.on("click", handler);
      } catch (e1) {}
    })(ids[i]);
  }
}

function initTaskTypeCheckboxesFromStorage() {
  loadTaskTypeCheckboxesToUi();
  bindTaskTypeCheckboxesUi();
}

function snapshotInteractStayForRun() {
  try {
    __interactStayRunSnapshot = {
      enabled: isTaskTypeEnabled(ui.cb_do_interact_stay),
      pair: parseInteractStayIntervalFromUi(),
    };
    saveInteractStayConfigFromUi();
    saveTaskTypeCheckboxesFromUi();
  } catch (e0) {
    __interactStayRunSnapshot = { enabled: false, pair: parseInteractStayIntervalPair(1, 3) };
  }
}

function isInteractStayEnabledForRun() {
  if (__interactStayRunSnapshot) return !!__interactStayRunSnapshot.enabled;
  try {
    return isTaskTypeEnabled(ui.cb_do_interact_stay);
  } catch (e) {
    return false;
  }
}

function getInteractStayIntervalForRun() {
  if (__interactStayRunSnapshot && __interactStayRunSnapshot.pair) {
    return __interactStayRunSnapshot.pair;
  }
  return parseInteractStayIntervalFromUi();
}

function toWholeSecMs(ms) {
  ms = Math.max(0, Math.floor(ms || 0));
  if (ms <= 0) return 0;
  return Math.max(1000, Math.round(ms / 1000) * 1000);
}

function pickIntervalMs(pair) {
  var minSec = Math.floor((pair.min || 0) / 1000);
  var maxSec = Math.floor((pair.max || pair.min || 0) / 1000);
  if (maxSec < minSec) maxSec = minSec;
  var sec = minSec + Math.floor(Math.random() * (maxSec - minSec + 1));
  return toWholeSecMs(sec * 1000);
}

function updateFloatCountdownLog(msg) {
  var s = normalizeLogText(msg);
  if (!s) return;
  if (__floatCountdownLogIdx >= 0 && __floatCountdownLogIdx < __logLines.length) {
    __logLines[__floatCountdownLogIdx] = s;
  } else {
    pushLogLine(s);
    __floatCountdownLogIdx = __logLines.length - 1;
  }
  try {
    updateFloatLogOnly();
  } catch (e0) {}
}

function clearFloatCountdownLog() {
  __floatCountdownLogIdx = -1;
}

function sleepCtrlCountdown(label, ms) {
  label = String(label || "互动停留").trim();
  ms = toWholeSecMs(ms);
  if (ms <= 0) return;
  var startAt = Date.now();
  var endAt = startAt + ms;
  var totalSec = ms / 1000;
  var lastShown = -1;
  __floatCountdownLogIdx = -1;
  __floatCountdownActive = true;
  try {
    while (!__scriptUserStop) {
      waitWhileNetworkPausedBlocking();
      if (__scriptUserStop) break;
      try {
        sodaGlobalDismissListenAdIfAny();
      } catch (eAd) {}
      var now = Date.now();
      if (now >= endAt) break;
      var elapsedSec = Math.floor((now - startAt) / 1000);
      var secLeft = totalSec - elapsedSec;
      if (secLeft < 1) secLeft = 1;
      if (secLeft !== lastShown) {
        lastShown = secLeft;
        updateFloatCountdownLog(label + " 剩余 " + secLeft + " 秒");
        try {
          updateFloatClockLine();
        } catch (eClkCd) {}
      }
      try {
        bumpStuckWatchdogHeartbeat();
      } catch (eHb) {}
      var step = endAt - now;
      sleep(Math.min(200, step > 0 ? step : 1));
    }
  } finally {
    __floatCountdownActive = false;
    clearFloatCountdownLog();
  }
}

function interactStayActLabel(act) {
  if (act === "like") return "点赞停留";
  if (act === "fav") return "收藏停留";
  if (act === "comment") return "评论停留";
  if (act === "share") return "分享停留";
  return "互动停留";
}

/** 第11步：互动完成后、返回前停留（勾选互动停留则随机倒计时，否则沿用原固定等待） */
function runStep11InteractStayBeforeBack(act) {
  if (isInteractStayEnabledForRun()) {
    var ms = pickIntervalMs(getInteractStayIntervalForRun());
    if (ms > 0) sleepCtrlCountdown(interactStayActLabel(act), ms);
    return;
  }
  if (act === "like" || act === "comment") {
    var beforeBackMs = isSodaPlatformSelected()
      ? typeof SODA_STEP11_BEFORE_BACK_MS === "number"
        ? SODA_STEP11_BEFORE_BACK_MS
        : 350
      : typeof PACE_9_11.step11BeforeBack === "number" && PACE_9_11.step11BeforeBack > 0
        ? PACE_9_11.step11BeforeBack
        : 2000;
    sleepCtrl(beforeBackMs);
  }
}

function persistAutomationRunTimeDelta() {
  if (__runSessionStartMs <= 0) return;
  var delta = Date.now() - __runSessionStartMs;
  if (delta < 200) return;
  ensureTaskCountDayRolled();
  try {
    var prev = Number(__stats.get("runTimeMsToday", 0)) || 0;
    __stats.put("runTimeMsToday", prev + delta);
  } catch (e) {}
}

function beginAutomationRunTimeSession() {
  ensureTaskCountDayRolled();
  __runSessionStartMs = Date.now();
}

function endAutomationRunTimeSession() {
  persistAutomationRunTimeDelta();
  __runSessionStartMs = 0;
}

/** 今日已累计 + 当前未落库会话（用于悬浮窗展示） */
function getRunTimeMsTodayForDisplay() {
  ensureTaskCountDayRolled();
  var base = 0;
  try {
    base = Number(__stats.get("runTimeMsToday", 0)) || 0;
  } catch (e0) {}
  if (__automationWorkerActive && __runSessionStartMs > 0) {
    return base + (Date.now() - __runSessionStartMs);
  }
  return base;
}

/** 例：02小时08分钟（时、分均两位补零；百小时以上小时数不强行两位） */
function formatRunDurationHoursMinutesZh(ms) {
  ms = Math.max(0, Math.floor(Number(ms) || 0));
  var totalMin = Math.floor(ms / 60000);
  var h = Math.floor(totalMin / 60);
  var m = totalMin % 60;
  var hs = h < 10 ? "0" + h : String(h);
  var ms = m < 10 ? "0" + m : String(m);
  return hs + "小时" + ms + "分钟";
}

/** 点悬浮窗「×」：关窗、通知自动化停止，并尝试结束脚本引擎/子线程 */
function stopEntireScriptAfterClosingFloat() {
  __scriptUserStop = true;
  try { endQuotaIdleKeepAwake(); } catch (eQa) {}
  try {
    endAutomationRunTimeSession();
  } catch (eRt) {}
  var ctrlWin = __floatCtrlWin;
  var infoWin = __floatInfoWin;
  __floatCtrlWin = null;
  __floatInfoWin = null;
  try {
    ctrlWin && ctrlWin.close();
  } catch (e0) {}
  try {
    infoWin && infoWin.close();
  } catch (e1) {}
  try {
    if (typeof threads !== "undefined" && threads.shutDownAll) threads.shutDownAll();
  } catch (eSd) {}
  try {
    if (typeof engines !== "undefined" && engines.myEngine) {
      var eng = engines.myEngine();
      if (eng && eng.forceStop) eng.forceStop();
    }
  } catch (e2) {}
  try {
    exit();
  } catch (e3) {}
}

/**
 * 刷新悬浮窗日志区。优先在当前线程直接 setText（floaty 上常能立刻生效），失败再 ui.run。
 * @returns {"sync"|"async"|"none"}
 */
function updateFloatLogOnly() {
  if (!__floatInfoWin || !__floatInfoWin.log) return "none";
  const logView = __floatInfoWin.log;
    const start = Math.max(0, __logLines.length - __logShowLines);
  const logText = __logLines.slice(start).join("\n");
  try {
    logView.setText(logText);
    return "sync";
  } catch (eDirect) {}
  try {
    ui.run(function () {
      try {
        logView.setText(logText);
      } catch (e0) {}
    });
  } catch (e1) {}
  return "async";
}

function updateFloatInfo() {
  if (!__floatInfoWin) return;
  ensureTaskCountDayRolled();
  const T = getDailyActionTargets();
  const like = T.like;
  const fav = T.fav;
  const comment = T.comment;
  const share = T.share;
  const restart = T.restart;
  const isSoda = isSodaPlatformSelected();
  const total = isSoda ? like + comment : like + fav + comment + share;
  const done = getTaskDoneSnapshot();
  const sumDone = isSoda
    ? done.like + done.comment
    : done.like + done.fav + done.comment + done.share;
    const start = Math.max(0, __logLines.length - __logShowLines);
  const logText = __logLines.slice(start).join("\n");
  const w = __floatInfoWin;
  const nick = __nickname || "您的昵称";
  const fans = __fans || "0";
  const yest = __yesterdayGrowth;
  const today = __todayGrowth;
  const plat = getPlatformLabel();
  const clockStr = formatFloatNowDateTimeZh();
  const runTodayStr =
    "已运行" + formatRunDurationHoursMinutesZh(getRunTimeMsTodayForDisplay());
  try {
    ui.run(function () {
      try {
        if (w.line_2) w.line_2.setText(nick);
        if (w.line_3) w.line_3.setText("近期粉丝 " + fans);
        if (w.line_4) w.line_4.setText("昨日增长 " + yest);
        if (w.line_5) w.line_5.setText("今日增长 " + today);
        if (w.line_6) w.line_6.setText("运行平台 " + plat);
        if (w.line_7) w.line_7.setText("总体比例 " + sumDone + "/" + total);
        if (w.line_8) w.line_8.setText("点赞 " + done.like + "/" + like);
        if (w.line_9) {
          if (isSoda) {
            try {
              w.line_9.setVisibility(8);
            } catch (eHide9) {
              w.line_9.setText("");
            }
          } else {
            try {
              w.line_9.setVisibility(0);
            } catch (eShow9) {}
            w.line_9.setText("收藏 " + done.fav + "/" + fav);
          }
        }
        if (w.line_10) w.line_10.setText("评论 " + done.comment + "/" + comment);
        if (w.line_11) {
          if (isSoda) {
            try {
              w.line_11.setVisibility(8);
            } catch (eHide11) {
              w.line_11.setText("");
            }
          } else {
            try {
              w.line_11.setVisibility(0);
            } catch (eShow11) {}
            w.line_11.setText("分享 " + done.share + "/" + share);
          }
        }
        if (w.line_12) w.line_12.setText(clockStr);
        if (w.line_13) w.line_13.setText(runTodayStr);
        if (w.log) w.log.setText(logText);
      } catch (e0) {}
    });
  } catch (e2) {}
}

/** 仅刷新「过久无日志」计时，不打字（避免与 appendLog 重复计同一文案触发卡住重启） */
function bumpStuckWatchdogHeartbeat() {
  try {
    __lastAppendLogTimeMs = Date.now();
  } catch (eHb) {}
}

function shouldSodaAsyncLogFlush(msg) {
  if (typeof SODA_ASYNC_LOG_FLUSH === "boolean" && !SODA_ASYNC_LOG_FLUSH) return false;
  if (!isSodaPlatformSelected()) return false;
  if (isSodaEarlyStepSyncLogPhase()) return false;
  if (isSodaStep7SyncLog(msg)) return false;
  return true;
}

function setSodaExecutingStep(stepN) {
  __sodaCurrentExecutingStep =
    typeof stepN === "number" && stepN > 0 ? Math.floor(stepN) : 0;
}

/** 汽水第1～7步：须先刷出悬浮窗日志再执行点击/滑动 */
function isSodaEarlyStepSyncLogPhase() {
  return (
    isSodaPlatformSelected() &&
    __sodaCurrentExecutingStep > 0 &&
    __sodaCurrentExecutingStep <= 7
  );
}

function sodaEarlyStepLogFlushMs() {
  return typeof SODA_EARLY_STEP_LOG_FLUSH_MS === "number" && SODA_EARLY_STEP_LOG_FLUSH_MS > 0
    ? SODA_EARLY_STEP_LOG_FLUSH_MS
    : 55;
}

/** 第6→7步关键日志：须阻塞刷悬浮窗，避免动作做完才显示 */
function isSodaStep7SyncLog(msg) {
  if (!msg || !isSodaPlatformSelected()) return false;
  var s = String(msg);
  if (s.indexOf("进入：") === 0) return true;
  if (s.indexOf("O点") === 0) return true;
  if (/抖音关注|关注列表|已进入关注|查找抖音|双击抖音|点用户页关注|点我页关注|关注页未|关注不可用|点关注多次|抖音关注列表首行|未找到抖音关注|双击后未出现|第7步/.test(s)) {
    return true;
  }
  return false;
}

/** 日志侧效：卡住检测、静默重启计时（与是否刷悬浮窗无关） */
function applyAppendLogSideEffects(s) {
  function shouldSkipRepeatRestartForLog(txt) {
    if (!txt) return false;
    if (txt === "网络出现异常，等待网络恢复") return true;
    if (txt === "网络已恢复，准备从头运行") return true;
    if (txt === "网络恢复重启，从第1步开始") return true;
    if (txt.indexOf("非在线时段") === 0) return true;
    if (txt === "进入在线时段，继续运行") return true;
    if (/停留 剩余 \d+ 秒$/.test(txt)) return true;
    return false;
  }
  var now = Date.now();
  if (!__insideStuckHandler && __automationWorkerActive) {
    if (!__stuckRestartInProgress) {
      if (shouldSkipRepeatRestartForLog(s)) {
        __stuckRepeatLogKey = "";
        __stuckRepeatLogFirstMs = 0;
      } else if (s === __stuckRepeatLogKey) {
        if (now - __stuckRepeatLogFirstMs >= __STUCK_RESTART_SILENT_MS) {
          __stuckRepeatLogKey = "";
          __stuckRepeatLogFirstMs = 0;
          tryStuckRestartForRepeatedOrSilent("同一提示持续过久，重启脚本获取新对标");
        }
      } else {
        __stuckRepeatLogKey = s;
        __stuckRepeatLogFirstMs = now;
      }
    }
  }
  try {
    if (__pendingStuckRestartReason && __pendingStuckRestartReason.indexOf("过久无日志") >= 0) {
      __pendingStuckRestartReason = "";
    }
  } catch (eClrPending) {}
  __lastAppendLogTimeMs = now;
}

function normalizeLogText(msg) {
  return String(msg == null ? "" : msg)
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

function pushLogLine(s) {
  __logLines.push(s);
  if (__logLines.length > __logMaxLines) {
    __logLines = __logLines.slice(__logLines.length - __logMaxLines);
  }
  console.log(s);
}

/**
 * 卡顿机友好：先 console + 内存，悬浮窗后台刷，主线程不等待 setText。
 * 汽水分支关键路径统一走此函数，保证「先见日志再动手」。
 */
function appendLogProgress(msg) {
  var s = normalizeLogText(msg);
  if (!s) return;
  if (typeof SODA_VERBOSE_LOG === "boolean" && !SODA_VERBOSE_LOG && isSodaProgressDetailLog(s)) return;
  applyAppendLogSideEffects(s);
  pushLogLine(s);
  if (isSodaEarlyStepSyncLogPhase()) {
    flushFloatLogBlockingForce(sodaEarlyStepLogFlushMs());
    return;
  }
  appendLogFloatFlushAsync();
}

function appendLog(msg) {
  var s = normalizeLogText(msg);
  if (!s) return;
  if (typeof SODA_VERBOSE_LOG === "boolean" && !SODA_VERBOSE_LOG && isSodaProgressDetailLog(s)) return;
  if (shouldSodaAsyncLogFlush(s)) {
    appendLogProgress(s);
    return;
  }
  applyAppendLogSideEffects(s);
  pushLogLine(s);
  if (s.indexOf("进入：") === 0) {
    flushFloatLogBlockingForce(SODA_ENTER_LOG_FLUSH_MS);
    return;
  }
  if (isSodaEarlyStepSyncLogPhase()) {
    flushFloatLogBlockingForce(sodaEarlyStepLogFlushMs());
    return;
  }
  if (isSodaPlatformSelected() && isSodaStep7SyncLog(s)) {
    flushFloatLogBlockingForce(SODA_STEP7_LOG_FLUSH_MS);
    return;
  }
  var how = updateFloatLogOnly();
  var flush = how === "sync" ? __LOG_UI_FLUSH_SYNC_MS : how === "async" ? __LOG_UI_FLUSH_ASYNC_MS : 0;
  if (s.indexOf("进入：") === 0) {
    flush = Math.max(flush, how === "async" ? 120 : 48);
  }
  if (__floatInfoWin && flush > 0) sleep(flush);
}

/** 关键路径日志：只写 console + 内存，不刷悬浮窗，避免 ui.run 卡住后续点击 */
function appendLogFast(msg) {
  var s = normalizeLogText(msg);
  if (!s) return;
  if (typeof SODA_VERBOSE_LOG === "boolean" && !SODA_VERBOSE_LOG && isSodaProgressDetailLog(s)) return;
  applyAppendLogSideEffects(s);
  pushLogLine(s);
  if (shouldSodaAsyncLogFlush(s)) appendLogFloatFlushAsync();
}

function appendLogFloatFlushAsync() {
  if (!__floatInfoWin) return;
  if (__logFloatFlushPending) return;
  __logFloatFlushPending = true;
  try {
    threads.start(function () {
      try {
        updateFloatLogOnly();
      } catch (eF) {}
      try {
        sleep(8);
      } catch (eSl) {}
      __logFloatFlushPending = false;
      try {
        if (__floatInfoWin && __logLines.length > 0) updateFloatLogOnly();
      } catch (eF2) {}
    });
  } catch (eTh) {
    __logFloatFlushPending = false;
    try {
      updateFloatLogOnly();
    } catch (eF2) {}
  }
}

/** 阻塞刷新悬浮窗日志区（自动化线程里 ui.run 需 sleep 等待，否则下一行日志才显示） */
function flushFloatLogBlockingForce(blockMs) {
  blockMs = blockMs == null ? 100 : Math.max(0, Math.floor(blockMs));
  if (!__floatInfoWin || !__floatInfoWin.log) {
    if (blockMs > 0) sleep(blockMs);
    return;
  }
  var start = Math.max(0, __logLines.length - __logShowLines);
  var logText = __logLines.slice(start).join("\n");
  var logView = __floatInfoWin.log;
  var needUiWait = false;
  try {
    logView.setText(logText);
  } catch (eDirect) {
    needUiWait = true;
    try {
      ui.run(function () {
        try {
          logView.setText(logText);
        } catch (eUi) {}
      });
    } catch (eRun) {}
  }
  var waitMs = needUiWait ? Math.max(blockMs, 120) : Math.max(blockMs, 40);
  if (waitMs > 0) sleep(waitMs);
}

// ===== 程序流程 =====
const DY_PKG = "com.ss.android.ugc.aweme";
/** 汽水音乐包名（汽水分支停/启应用用；若你机子包名不同可改此处） */
const SODA_PKG = "com.luna.music";
const SODA_APP_NAME = "汽水音乐";
/** 汽水广告：整段「等广告结束」绝对最长（ms），到点强制继续 */
const SODA_SPLASH_ABSOLUTE_MAX_MS = 25000;
/** 汽水广告：已点「跳过」后从开等起最多再等（ms） */
const SODA_LAUNCH_SPLASH_MAX_MS = 5000;
/** 汽水广告：未点「跳过」且已见跳过钮时最多等待（ms，仍受绝对最长约束） */
const SODA_SPLASH_NO_SKIP_MAX_MS = 28000;
/** 汽水广告：全程未见跳过钮（无开屏广告）时最多等待（ms，仍受绝对最长约束） */
const SODA_SPLASH_NO_AD_MAX_MS = 25000;
/** 汽水等开屏广告：轮询间隔（ms） */
const SODA_SPLASH_POLL_MS = 150;
/** 汽水等开屏：单次 UI 探测线程预算（ms），防 findOne 在卡顿机阻塞数十秒 */
const SODA_SPLASH_UI_PROBE_BUDGET_MS = 180;
/** @deprecated 已改为见底部「我的」即结束，不再强制最短等待 */
const SODA_SPLASH_MIN_JUDGE_MS = 0;
/** 汽水主界面就绪后短暂稳定（ms） */
const SODA_LAUNCH_POST_READY_MS = 180;
/** 点「跳过」后：跳过钮消失且底部栏出现即继续（ms） */
const SODA_SPLASH_POST_SKIP_READY_MS = 600;
/** 点「跳过」后：跳过钮已消失的最长兜底（ms），避免空等底部栏无障碍 */
const SODA_SPLASH_POST_SKIP_FORCE_MS = 700;
/** 广告刚结束：点「我的」后等进入我页（ms） */
const SODA_POST_SPLASH_MY_ENTER_MS = 2500;
/** 汽水点「我的」超时（ms，比抖音 25s 短；广告后应几秒内进我页） */
const SODA_CLICK_ME_MAX_MS = 6000;
/** 广告结束到可点「我的」：短等底部栏就绪（ms，仅非 launch 直点时用） */
const SODA_POST_SPLASH_HOME_READY_MS = 400;
/** 点「我的」后轻量确认进入我页（ms） */
const SODA_MY_PROFILE_ENTER_POLL_MS = 50;
/** 进入我页后同步昵称/粉丝前短等（ms） */
const SODA_ME_SYNC_SETTLE_MS = 80;
/** 点我页粉丝后等进入粉丝页（ms） */
const SODA_FANS_PAGE_ENTER_WAIT_MS = 2200;
/** 进入粉丝页/展开列表后短稳（ms） */
const SODA_FANS_PAGE_SETTLE_MS = 120;
/** 双击抖音粉丝后等列表展开（ms） */
const SODA_DY_FANS_EXPAND_WAIT_MS = 1000;
/** 汽水「我」页统计条「粉丝」标签（TextView，可点） */
const SODA_ME_FANS_TAB_ID = "com.luna.music:id/gl3";
/** 汽水「我」页统计条粉丝数（TextView，如 345；与 gl3「粉丝」同列；新机「我」页亦可能为 gle） */
const SODA_ME_FANS_COUNT_ID = "com.luna.music:id/gl2";
/** 汽水「我」页统计条「关注」标签（TextView，可点） */
const SODA_ME_FOLLOW_TAB_ID = "com.luna.music:id/gk_";
/** 汽水「我」页统计条关注数（TextView，如 3650） */
const SODA_ME_FOLLOW_COUNT_ID = "com.luna.music:id/gk=";
/** 汽水「我」页昵称（TextView，如 卡瓦尼-13） */
const SODA_ME_NICKNAME_ID = "com.luna.music:id/glk";
/** 汽水「我」页昵称备选（新机与用户主页同 id glq） */
const SODA_ME_NICKNAME_ALT_ID = "com.luna.music:id/glq";
/** 汽水底部导航「我的」Tab（FrameLayout，text 常为空，须用 id 点） */
const SODA_NAV_TAB_ME_ID = "com.luna.music:id/navigation_tab_me";
/** 汽水底部导航「我的」Tab 内层（LinearLayout b=o，自身不可点） */
const SODA_NAV_TAB_ME_INNER_ID = "com.luna.music:id/b=o";
/** 汽水底部「我的」坐标兜底（无 id/无障碍时，按屏宽比例） */
var SODA_NAV_TAB_ME_TAP_X_RATIO = 0.9;
var SODA_NAV_TAB_ME_TAP_Y_RATIO = 0.955;
/** 汽水粉丝页标题「抖音粉丝 1w+」（双击展开列表） */
const SODA_FANS_PAGE_TITLE_ID = "com.luna.music:id/tv_title";
/** 汽水粉丝页区块标题右侧箭头（eud：向下=折叠，向上=已展开） */
const SODA_FANS_SECTION_CHEVRON_ID = "com.luna.music:id/eud";
/** 汽水粉丝/关注页标题双击间隔（ms） */
const SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS = 480;
/** 汽水关注页「抖音关注」标题双击间隔（略长，便于分出关注列表） */
const SODA_FOLLOWING_TITLE_DOUBLE_TAP_GAP_MS = 620;
/** 汽水关注列表行昵称（TextView，如 默默。） */
const SODA_FOLLOWING_LIST_NICK_ID = "com.luna.music:id/gi8";
/** 汽水粉丝列表行容器（FrameLayout，可点） */
const SODA_FANS_LIST_ROW_ID = "com.luna.music:id/k3o";
/** 汽水粉丝列表行容器备选（新机 FrameLayout k8=，抖音粉丝区同款布局） */
const SODA_FANS_LIST_ROW_ALT_ID = "com.luna.music:id/k8=";
/** 汽水粉丝/关注列表行昵称备选（新机 TextView gja） */
const SODA_FOLLOWING_LIST_NICK_ALT_ID = "com.luna.music:id/gja";
/** 汽水粉丝列表底部「加载更多」（TextView kkv/kpn，自身不可点，需坐标/父节点点击） */
const SODA_FANS_LIST_LOAD_MORE_ID = "com.luna.music:id/kkv";
/** 汽水粉丝列表底部「加载更多」备选（新机 TextView kpn） */
const SODA_FANS_LIST_LOAD_MORE_ALT_ID = "com.luna.music:id/kpn";
var SODA_FANS_LOAD_MORE_AFTER_CLICK_MS = 850;
/** 汽水用户主页统计条「粉丝」标签 */
const SODA_PROFILE_FANS_TAB_ID = "com.luna.music:id/gk+";
/** 汽水用户主页统计条「粉丝」标签备选（新机 glf） */
const SODA_PROFILE_FANS_TAB_ALT_ID = "com.luna.music:id/glf";
/** 汽水用户主页统计条粉丝数（如 2240） */
const SODA_PROFILE_FANS_COUNT_ID = "com.luna.music:id/gk-";
/** 汽水用户主页统计条粉丝数备选（新机 gle，如 7825） */
const SODA_PROFILE_FANS_COUNT_ALT_ID = "com.luna.music:id/gle";
/** 汽水用户主页统计条粉丝列容器 */
const SODA_PROFILE_FANS_LAYOUT_ID = "com.luna.music:id/gf5";
/** 汽水用户主页统计条粉丝列容器备选（新机 gf-，含 gle+glf） */
const SODA_PROFILE_FANS_LAYOUT_ALT_ID = "com.luna.music:id/gf-";
/** 汽水用户主页昵称（TextView glq，如 幸福美满） */
const SODA_PROFILE_NICKNAME_ID = "com.luna.music:id/glq";
/** 汽水用户主页昵称行容器（LinearLayout glr，含 glq） */
const SODA_PROFILE_NICKNAME_LAYOUT_ID = "com.luna.music:id/glr";
/** 汽水作品播放页左侧评论按钮 ImageView */
const SODA_WORK_COMMENT_BTN_ID = "com.luna.music:id/he+";
const SODA_WORK_COMMENT_BTN_ID_HEX = "0x7f0a33a3";
/** 汽水作品播放页底部操作栏容器 ViewGroup（hn3，自身不可点） */
const SODA_WORK_PLAYER_ACTION_BAR_ID = "com.luna.music:id/hn3";
const SODA_WORK_PLAYER_ACTION_BAR_ID_HEX = "0x7f0a3505";
/** 汽水作品播放页视频红心赞 ImageView（he=，clickable） */
const SODA_WORK_VIDEO_LIKE_BTN_ID = "com.luna.music:id/he=";
const SODA_WORK_VIDEO_LIKE_BTN_ID_HEX = "0x7f0a33a0";
/** 汽水点击视频后「免费时长已耗尽」等激励广告遮罩（FrameLayout id=-） */
const SODA_WORK_VIDEO_LISTEN_AD_ID = "com.luna.music:id/-";
const SODA_WORK_VIDEO_LISTEN_AD_ID_HEX = "0x7f0a0029";
/** @deprecated 请用 SODA_WORK_VIDEO_LIKE_BTN_ID */
const SODA_WORK_LIKE_BTN_ID = SODA_WORK_VIDEO_LIKE_BTN_ID;
const SODA_WORK_LIKE_BTN_ID_HEX = SODA_WORK_VIDEO_LIKE_BTN_ID_HEX;
/** @deprecated 请用 SODA_WORK_VIDEO_LIKE_BTN_ID */
const SODA_WORK_MUSIC_FAVORITE_BTN_ID = SODA_WORK_VIDEO_LIKE_BTN_ID;
const SODA_WORK_MUSIC_FAVORITE_BTN_ID_HEX = SODA_WORK_VIDEO_LIKE_BTN_ID_HEX;
/** 汽水评论浮层右侧发送按钮（纸飞机图标 TextView） */
const SODA_COMMENT_SEND_BTN_ID = "com.luna.music:id/b8r";
const SODA_COMMENT_SEND_BTN_ID_HEX = "0x7f0a1279";
/** 汽水用户主页：右滑进视频页的锚点条（ghw，bounds 底边下方执行右→左滑） */
const SODA_PROFILE_SWIPE_ANCHOR_ID = "com.luna.music:id/ghw";
const SODA_PROFILE_SWIPE_ANCHOR_ID_HEX = "0x7f0a2d93";
/** 汽水视频栏空态文案 TextView（暂无内容，bounds 约屏高下区） */
const SODA_PROFILE_EMPTY_TEXT_ID = "com.luna.music:id/aog";
const SODA_PROFILE_EMPTY_TEXT_ID_HEX = "0x7f0a0901";
/** 汽水视频栏私密文案 TextView（该用户已设置为私密状态） */
const SODA_PROFILE_PRIVATE_TEXT_ID = "com.luna.music:id/aoh";
const SODA_PROFILE_PRIVATE_TEXT_ID_HEX = "0x7f0a0902";
/** 汽水用户主页歌曲栏「播放全部」圆形播放按钮（右滑一次仍见 apc 则非视频栏） */
const SODA_PROFILE_SONGS_PLAY_ALL_BTN_ID = "com.luna.music:id/apc";
const SODA_PROFILE_SONGS_PLAY_ALL_BTN_ID_HEX = "0x7f0a0925";
/** 汽水 Paddle OCR 是否已在后台预热（避免首次 OCR 兜底卡 60s+） */
var __sodaPaddleOcrWarmed = false;
/** 汽水用户主页：点「视频」Tab 后内容区稳定等待（ms） */
var SODA_PROFILE_VIDEO_TAB_SETTLE_MS = 40;
var SODA_PROFILE_PRE_WORK_GRID_WAIT_MS = 30;
var SODA_PROFILE_VIDEO_PAGE_LOAD_MS = 400;
var SODA_PROFILE_VIDEO_PAGE_POLL_MS = 30;
var SODA_PROFILE_EMPTY_GRACE_MS = 90;
var SODA_PROFILE_POST_PAINT_WAIT_MS = 30;
var SODA_PROFILE_VIDEO_GRID_FINDONE_MS = 22;
var SODA_PROFILE_POST_PAINT_WAIT_CACHED_MS = 0;
var SODA_STEP10_AFTER_CLICK_WORK_MS = 90;
var SODA_WAIT_ENTER_PLAYER_MS = 360;
var SODA_WAIT_ENTER_PLAYER_POLL_MS = 32;
/** 汽水：点击作品后进播放页，再执行点赞/评论前的短等（ms） */
var SODA_STEP11_BEFORE_ACTION_MS = 45;
/** 汽水第9步：点粉丝行后进主页的短等待（ms） */
var SODA_STEP9_AFTER_OPEN_PROFILE_MS = 40;
/** 汽水第9步：进主页后最多等多久即视为已进入（ms） */
var SODA_STEP9_ENTER_CONFIRM_MS = 420;
/** 汽水第7步：关注列表分段 findOne（ms，与第9步快路径一致） */
var SODA_STEP7_ROW_FINDONE_MS = 35;
/** 汽水第7步：第6步已展开列表后的短停稳（ms） */
var SODA_STEP7_LIST_SETTLE_MS = 80;
/** 汽水第7步：点关注行后进主页确认（ms，与第9步一致） */
var SODA_STEP7_ENTER_CONFIRM_MS = 420;
/** 汽水第8步：连续多少次「用户不符合」视为对标不好并重启换对标 */
var SODA_STEP8_UNQUALIFIED_BAD_BENCHMARK_N = 6;
/** 汽水第5步：粉丝列表下滑后停稳（ms，比第11步连跑略短） */
var SODA_STEP5_LIST_SCROLL_MS = 420;
/** 汽水第5步：分段 findOne 采集行（ms，与第9/11步快路径一致） */
var SODA_STEP5_ROW_FINDONE_MS = 35;
/** 汽水第5步：随机选人最多尝试次数（不必整屏逐个试） */
var SODA_STEP5_PICK_TRY_MAX = 5;
/** 汽水进主页后：目标在约 2s 内执行右滑（仅作节奏参考，各段等待已收紧） */
var SODA_PROFILE_PRE_SWIPE_TARGET_MS = 2000;
/** 汽水右滑进视频页：相对 ghw 锚点底边再下移（px 与屏高比例取较大值） */
var SODA_PROFILE_SWIPE_BELOW_ANCHOR_MIN_PX = 188;
var SODA_PROFILE_SWIPE_BELOW_ANCHOR_RATIO = 0.108;
/** 汽水粉丝列表点行：昵称区横向偏移（行宽比例，偏右避开左侧悬浮窗×） */
var SODA_FOLLOWER_ROW_TAP_X_BIAS = 0.44;
/** 汽水粉丝列表 gi8 昵称区参考 bounds（252,334,744,395 @常见分辨率） */
var SODA_FOLLOWER_ROW_NICK_REF = { l0: 252, t0: 334, r0: 744, b0: 395 };
/** 汽水连跑：返回后进下一粉丝前的紧凑节奏（ms） */
var SODA_NEXT_FOLLOWER_LEAD_IN_MS = 80;
var SODA_NEXT_FOLLOWER_LIST_WAIT_MS = 450;
/** 汽水第11步连跑：返回后进下一粉丝（轻量，不走双击展开最长 3.8s） */
var SODA_AFTER_STEP11_LIST_POLL_MS = 600;
var SODA_AFTER_STEP11_LEAD_IN_MS = 0;
var SODA_AFTER_STEP11_PROFILE_BACK_MS = 50;
var SODA_AFTER_STEP11_RECOVER_STEP_MS = 30;
/** 第11步返回后：恢复粉丝列表总预算 / 快速展开等待 / 连跑下滑间隔 */
var SODA_AFTER_STEP11_READY_BUDGET_MS = 450;
var SODA_AFTER_STEP11_EXPAND_WAIT_MS = 200;
/** 第11步连跑：粉丝列表下滑后等待停稳再点用户（ms） */
var SODA_AFTER_STEP11_SCROLL_MS = 1000;
/** 汽水粉丝列表：最多下滑几屏，仍无可换粉丝则重启获取新对标（首屏不计入） */
var SODA_FAN_LIST_SCROLL_SWIPES = 3;
/** 第11步返回后：粉丝行分段 findOne 超时（ms/段），主线程采集，不走子线程 */
var SODA_AFTER_STEP11_ROW_FINDONE_MS = 35;
/** 第11步连跑：点行后进主页确认预算（比第9步更短） */
var SODA_STEP11_ENTER_CONFIRM_MS = 260;
var SODA_STEP11_BEFORE_BACK_MS = 80;
/** 汽水出作品页：返回×2 合计约 380ms；返回×3 再 +400ms */
var SODA_STEP11_WORK_EXIT_LEAD_IN_MS = 80;
var SODA_STEP11_WORK_EXIT_BACK1_MS = 80;
var SODA_STEP11_WORK_EXIT_BACK2_MS = 180;
var SODA_STEP11_WORK_EXIT_BACK3_MS = 400;

/** 汽水动作日志后等待悬浮窗刷出（ms），确保先见日志再动手 */
var SODA_ACTION_LOG_FLUSH_MS = 12;
/** 第6→7步状态/动作日志：阻塞刷悬浮窗（ms） */
var SODA_STEP7_LOG_FLUSH_MS = 60;
/** 汽水第1～7步：阻塞刷悬浮窗（ms），先见日志再点击 */
var SODA_EARLY_STEP_LOG_FLUSH_MS = 55;
/** 「汽水进入」日志：刷悬浮窗后短等（ms）；点击仍走 tapSodaFollowingNickByText 即时 find */
var SODA_ENTER_LOG_FLUSH_MS = 80;
/** false=不打印汽水过程明细（第N步、点按/滑动等），仅保留进入用户、互动结果、失败提示 */
var SODA_VERBOSE_LOG = true;

/** 汽水进入用户：写日志 + toast + 阻塞刷悬浮窗，再执行点击 */
function appendSodaEnterUserLog(nick, waitMs) {
  var display = normalizeFollowerNicknameForLog(nick) || (nick ? String(nick).trim() : "") || "目标粉丝";
  var s = normalizeLogText("进入：" + display);
  if (!s) return;
  applyAppendLogSideEffects(s);
  pushLogLine(s);
  try {
    toast(s);
  } catch (eToast) {}
  flushFloatLogBlockingForce(waitMs == null ? SODA_ENTER_LOG_FLUSH_MS : waitMs);
}

/** 汽水关注列表：两昵称是否同一用户（含截断/日志省略） */
function sodaFollowingNickTextMatches(want, live) {
  want = normalizeFollowerNicknameForLog(want) || String(want || "").trim();
  live = normalizeFollowerNicknameForLog(live) || String(live || "").trim();
  if (!want || !live) return false;
  if (want === live) return true;
  if (live.indexOf(want) >= 0 || want.indexOf(live) >= 0) return true;
  var n = Math.min(want.length, live.length, 12);
  if (n >= 4 && want.slice(0, n) === live.slice(0, n)) return true;
  return false;
}

/** 关注列表节点是否在可视列表带内（排除 RecyclerView 屏外残留节点） */
function isSodaFollowingListNodeVisibleOnScreen(node) {
  if (!node) return false;
  try {
    var b = node.bounds();
    var band = followerListYBand();
    var yMin = sodaDouyinFollowingListYMin();
    if (b.bottom <= yMin + 6 || b.top >= band.yMax - 6) return false;
    if (b.height() < 14 || b.width() < 36) return false;
    return true;
  } catch (e) {
    return false;
  }
}

/** 汽水用户主页昵称 TextView（id=glq） */
function findSodaProfileNicknameTextNode(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 120;
  try {
    var node = id(SODA_PROFILE_NICKNAME_ID).packageName(SODA_PKG).findOne(t);
    if (node) return node;
    node = idMatches(/.*:id\/glq$/).packageName(SODA_PKG).findOne(Math.min(t, 100));
    if (node) return node;
  } catch (e0) {}
  return null;
}

/** 汽水粉丝用户主页：读昵称（优先 glq，用于已操作判定与点击校验） */
function readSodaProfileNicknameForOperateGate(quick) {
  var sodaQuick = quick !== false;
  var tMain = sodaQuick ? 80 : 160;
  try {
    var node = findSodaProfileNicknameTextNode(tMain);
    if (node) {
      var nick = normalizeFollowerNicknameForLog(String(node.text() || "").trim());
      if (nick) return nick;
    }
  } catch (eGlq) {}
  try {
    var layout = id(SODA_PROFILE_NICKNAME_LAYOUT_ID).packageName(SODA_PKG).findOne(sodaQuick ? 60 : 120);
    if (layout) {
      var child = layout.findOne(className("android.widget.TextView"), sodaQuick ? 40 : 80);
      if (child) {
        var nick2 = normalizeFollowerNicknameForLog(String(child.text() || "").trim());
        if (nick2) return nick2;
      }
    }
  } catch (eGlr) {}
  return readSodaCurrentProfileNicknameQuick();
}

function clearSodaFanProfileOperateContext() {
  __currentFanProfileSodaNick = "";
  __currentFanProfileDyid = "";
}

/** 汽水用户主页：读当前展示昵称（用于点击后校验） */
function readSodaCurrentProfileNicknameQuick() {
  if (!stillOnSodaUserProfilePageQuick()) return "";
  try {
    var glq = findSodaProfileNicknameTextNode(100);
    if (glq) {
      var fromGlq = normalizeFollowerNicknameForLog(String(glq.text() || "").trim());
      if (fromGlq) return fromGlq;
    }
  } catch (eGlq0) {}
  try {
    var fansN = findSodaProfileFansCountNode(160);
    if (fansN) {
      var fb = fansN.bounds();
      var sw = device.width;
      var yMax = Math.max(Math.floor(device.height * 0.08), fb.top - 6);
      var yMin = Math.max(Math.floor(device.height * 0.08), yMax - Math.floor(device.height * 0.2));
      var coll = className("android.widget.TextView")
        .packageName(SODA_PKG)
        .boundsInside(Math.floor(sw * 0.08), yMin, Math.floor(sw * 0.88), yMax)
        .find();
      if (coll && coll.size) {
        var best = "";
        var bestTop = 1e9;
        for (var i = 0; i < coll.size(); i++) {
          var n = coll.get(i);
          var t = normalizeFollowerNicknameForLog(String(n.text() || "").trim());
          if (!t) continue;
          try {
            var b = n.bounds();
            if (b.top < bestTop) {
              bestTop = b.top;
              best = t;
            }
          } catch (eB) {}
        }
        if (best) return best;
      }
    }
  } catch (eFans) {}
  try {
    var sw2 = device.width;
    var coll2 = className("android.widget.TextView")
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(sw2 * 0.12), Math.floor(device.height * 0.08), Math.floor(sw2 * 0.72), Math.floor(device.height * 0.22))
      .find();
    if (coll2 && coll2.size) {
      var best2 = "";
      var bestTop2 = 1e9;
      for (var j = 0; j < coll2.size(); j++) {
        var n2 = coll2.get(j);
        var t2 = normalizeFollowerNicknameForLog(String(n2.text() || "").trim());
        if (!t2) continue;
        try {
          var b2 = n2.bounds();
          if (b2.top < bestTop2) {
            bestTop2 = b2.top;
            best2 = t2;
          }
        } catch (eB2) {}
      }
      if (best2) return best2;
    }
  } catch (eHdr) {}
  return "";
}

/** 按昵称在关注列表找「当前屏可见」昵称节点（find 全量 + 取最靠上一行） */
function findLiveSodaFollowingNickTvForTap(want, yMin, yMax) {
  want = normalizeFollowerNicknameForLog(want) || String(want || "").trim();
  if (!want) return null;
  var sw = device.width;
  var rowH = sodaNativeFanListRowHeightPx();
  var maxNickH = Math.max(48, Math.floor(rowH * 0.42));
  var best = null;
  var bestTop = 1e9;
  function consider(tv) {
    if (!tv) return;
    try {
      if (!isSodaFollowingListNodeVisibleOnScreen(tv)) return;
      var b = tv.bounds();
      if (b.centerY() < yMin || b.centerY() > yMax) return;
      if (b.height() > maxNickH) return;
      var live = String(tv.text() || "").trim();
      if (!sodaFollowingNickTextMatches(want, live)) return;
      if (b.top < bestTop) {
        bestTop = b.top;
        best = tv;
      }
    } catch (e) {}
  }
  try {
    var coll = text(want).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
    if (coll && coll.size) {
      for (var i = 0; i < coll.size(); i++) consider(coll.get(i));
    }
  } catch (e0) {}
  if (!best) {
    try {
      var coll2 = textContains(want).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
      if (coll2 && coll2.size) {
        for (var j = 0; j < coll2.size(); j++) consider(coll2.get(j));
      }
    } catch (e1) {}
  }
  if (!best) {
    try {
      var nickColl = findSodaFansListNickNodesInBounds(yMin, yMax);
      if (nickColl && nickColl.size) {
        for (var k = 0; k < nickColl.size(); k++) consider(nickColl.get(k));
      }
    } catch (e2) {}
  }
  return best;
}

/** 点击前：按昵称即时定位可见行 + 校验 live 昵称 */
function resolveSodaFollowingClickTarget(nick, candRowOpt) {
  var want = normalizeFollowerNicknameForLog(nick) || String(nick || "").trim();
  if (!want) return null;
  var yMin = sodaDouyinFollowingListYMin();
  var yMax = followerListYBand().yMax;
  var nickTv = findLiveSodaFollowingNickTvForTap(want, yMin, yMax);
  var row = null;
  var liveNick = want;
  if (nickTv) {
    row = resolveSodaK3oRowFromGi8Nick(nickTv);
    row = resolveSodaFollowerListClickRow(row || nickTv);
    liveNick =
      normalizeFollowerNicknameForLog(String(nickTv.text() || "").trim()) || String(nickTv.text() || "").trim();
  }
  if ((!row || !isSodaFollowingListNodeVisibleOnScreen(row)) && candRowOpt) {
    try {
      var verifyTv = findSodaFansListNickTvOnRow(candRowOpt);
      if (verifyTv && isSodaFollowingListNodeVisibleOnScreen(candRowOpt)) {
        var vNick =
          normalizeFollowerNicknameForLog(String(verifyTv.text() || "").trim()) ||
          String(verifyTv.text() || "").trim();
        if (sodaFollowingNickTextMatches(want, vNick)) {
          row = resolveSodaFollowerListClickRow(candRowOpt);
          nickTv = verifyTv;
          if (vNick) liveNick = vNick;
        }
      }
    } catch (eCand) {}
  }
  if (!row || !isSodaFollowingListNodeVisibleOnScreen(row)) return null;
  try {
    var rb = row.bounds();
    if (rb.height() > Math.floor(device.height * 0.22)) return null;
  } catch (eRb) {
    return null;
  }
  return { row: row, nickTv: nickTv, nick: liveNick || want };
}

/** 按昵称在关注列表即时查找可见行并点击（点 k3o/k8= 行，勿点昵称小区域防错位） */
function tapSodaFollowingNickByText(nick, candRowOpt) {
  var target = resolveSodaFollowingClickTarget(nick, candRowOpt);
  if (!target || !target.row) return false;
  var xBias =
    typeof SODA_FOLLOWER_ROW_TAP_X_BIAS === "number" ? SODA_FOLLOWER_ROW_TAP_X_BIAS : 0.44;
  return pressFollowerRowNicknameFallback(target.row, xBias);
}

function isSodaProgressDetailLog(txt) {
  if (!txt || !isSodaPlatformSelected()) return false;
  if (/失败|未能|不可用|终止|超时|超过|未选|无可|不符合|未读到|未找到|未展开|未进|未连|停止|错误/.test(txt)) return false;
  if (/^进入：|^更新昵称|^更新近期粉丝|^取号:|^对标不好|^重启脚本|^点赞|^评论|^发送/.test(txt)) return false;
  return true;
}

/** 汽水过程动作/状态：阻塞刷悬浮窗后再继续（第6→7步等关键路径） */
function appendSodaLogBlocking(msg, waitMs) {
  var s = normalizeLogText(msg);
  if (!s) return;
  if (typeof SODA_VERBOSE_LOG === "boolean" && !SODA_VERBOSE_LOG && isSodaProgressDetailLog(s)) return;
  applyAppendLogSideEffects(s);
  pushLogLine(s);
  if (waitMs == null && isSodaEarlyStepSyncLogPhase()) {
    waitMs = sodaEarlyStepLogFlushMs();
  }
  flushFloatLogBlockingForce(
    waitMs == null ? (isSodaStep7SyncLog(s) ? SODA_STEP7_LOG_FLUSH_MS : SODA_ACTION_LOG_FLUSH_MS) : waitMs
  );
}

/** 汽水动作：先打日志并阻塞刷悬浮窗，再动手 */
function appendSodaActionLog(msg) {
  if (SODA_VERBOSE_LOG && msg) appendSodaLogBlocking(String(msg));
  try {
    sodaGlobalDismissListenAdIfAny();
  } catch (eAdG0) {}
}
/** 点击开始后锁定平台，避免运行中 UI 勾选变化导致串线 */
var __platformRunSnapshot = "";
/**
 * 第9～11步节奏说明：
 * - nextFollowerLeadIn / followerListScroll：粉丝列表下滑与点「下一行」，宜留足，勿过紧。
 * - step9AfterOpenProfile / step10LeadIn / step10NoEntryBack：已进入用户主页后～作品区判定/已赞过返回，可略紧。
 */
const PACE_9_11 = {
  step9LeadIn: 260,
  step9AfterOpenProfile: 430,
  step9CoordFallback: 1500,
  step10LeadIn: 40,
  step10AllGraphicBack: 550,
  step10NoEntryBack: 220,
  step10AfterEnterWork: 750,
  nextFollowerLeadIn: 260,
  /** 粉丝列表每下滑一屏后等待（ms） */
  followerListScroll: 1200,
  /**
   * 正版：找下一粉丝时最多下滑几屏；滑满仍无新行则请求「重启获取新对标」。
   * （首屏扫描不计入；实际滑动次数 = 本值）
   */
  fanListScrollSwipesBeforeRestart: 5,
  step11BeforeAction: 80,
  /** 点赞/评论完成后，执行返回前等待（ms） */
  step11BeforeBack: 2000,
  step11Back1: 260,
  step11Back2: 320,
  step11ShareSheet: 1050,
  /** 第11步出作品页：返回前短等 / 各次 back 间隔（汽水×3、问道×2 共用前两段） */
  step11WorkExitLeadIn: 120,
  step11WorkExitBack1: 450,
  step11WorkExitBack2: 520,
  step11WorkExitBack3: 480,
};
let __startStep = 1;
let __flowStart = 1;
let __flowEnd = 11;
/** 连续运行模式下的轮次序号：0=首轮（允许执行第1步停抖音），>0 轮默认跳过第1步 */
let __continuousRoundIndex = 0;
/** 点粉丝后等待超时且页面未变化（已 back 一次）：下一轮删号重搜走「静默」路径：不打无列表/未知号日志、不做返回×2，直接第6步取号重搜 */
let __fansTapNoNavigationReselect = false;
/** 本轮流程已点过的粉丝（防 RecyclerView 复用/索引错乱导致重复点同一人） */
let __followerVisitedNicks = {};
/** 汽水第7步最近一次进入的抖音关注用户 visitKey（第8步换人时跳过） */
let __lastSodaFollowingVisitKey = "";
/** 无作品点赞入口时是否已按过一次返回（避免粉丝循环里多次 back） */
let __noWorkLikeEntryDidBack = false;
/** 汽水：无视频/私密页已 back 一次，第10步 gate 应换下一个粉丝 */
let __sodaNoVideoSkipToNext = false;
/** 汽水：点击视频后遇激励广告弹窗，返回后强制随机点赞/评论 */
let __sodaForceLikeOrCommentAfterAd = false;
/** 汽水全程广告 id=- 上次已返回时间（防抖） */
let __sodaLastListenAdDismissMs = 0;
/** 汽水第11步连跑：tryPick 是否扫到过有效粉丝行 */
let __sodaLastPickSawValidRows = false;
/** 汽水：本轮回合已因「当前屏无可换粉丝」触发过重启（避免外层重复重启） */
let __sodaFanListNoNewFanRestartDone = false;
var SODA_LISTEN_AD_DISMISS_COOLDOWN_MS = 900;
/** 激励广告 id=- 返回后等待再衔接原动作（ms） */
var SODA_LISTEN_AD_AFTER_BACK_MS = 1000;
/** 当前对标账号在库中的原始行（用于无粉丝列表时删行重搜） */
let __currentTargetDbLine = null;
/** 最近一次“点击作品”时间戳（用于限制进入作品后到点赞的最长等待） */
let __lastWorkClickTs = 0;
try {
  __startStep = __stats.get("startStep", 1) || 1;
  if (__startStep < 1) __startStep = 1;
  if (__startStep > 15) __startStep = 1;
  const savedFe = __stats.get("flowEnd", null);
  var feParsed = savedFe != null ? parseInt(String(savedFe), 10) : NaN;
  var feValid =
    feParsed === 10 ||
    feParsed === 11 ||
    (feParsed >= 12 && feParsed <= 15);
  if (feValid) {
    __flowEnd = feParsed;
  } else if (savedFe != null) {
    /* 存储里曾出现 1117 等非法值，会导致 runFlowFrom 里 maxStep===11 永远不成立 */
    __flowEnd =
      __startStep <= 9
        ? 11
        : __startStep === 10
          ? 10
          : __startStep === 11
            ? 11
            : __startStep >= 12 && __startStep <= 15
              ? __startStep
              : 11;
    try {
      __stats.put("flowEnd", __flowEnd);
    } catch (eFixFe) {}
  } else {
    if (__startStep <= 9) __flowEnd = 11;
    else if (__startStep === 10) __flowEnd = 10;
    else __flowEnd = __startStep;
  }
  const savedFs = __stats.get("flowStart", null);
  var fsParsed = savedFs != null ? parseInt(String(savedFs), 10) : NaN;
  if (savedFs != null && fsParsed >= 1 && fsParsed <= 15) __flowStart = fsParsed;
  else if (__startStep === 10) __flowStart = 10;
  else __flowStart = __startStep <= 9 ? __startStep : 1;
  /* 旧版选 10 存的是 flowStart=1、flowEnd=10（实为从第 1 步跑到第 10 步）；现改为与 1～9 一致：从第 10 步单步调试 */
  try {
    if (__startStep === 10 && __flowStart === 1 && __flowEnd === 10) {
      __flowStart = 10;
      __stats.put("flowStart", __flowStart);
    }
  } catch (eMig) {}
} catch (e) {}

/**
 * 选 1～9：从第 N 步起跑且不重复前序，主流程跑到第 11 步（进作品 + 按比例随机动作）。
 * 选 10：汽水从第 10 步进作品并继续第 11 步互动；其他平台仅从第 10 步。
 */
function setStartStep(step) {
  var st = parseInt(String(step), 10);
  if (!Number.isFinite(st) || st < 1) st = 1;
  if (isSodaPlatformSelected()) {
    if (st > 11) st = 11;
    __startStep = st;
    if (st === 11) {
      __flowStart = 1;
      __flowEnd = 11;
    } else if (st <= 9) {
      __flowStart = st;
      __flowEnd = 11;
    } else if (st === 10) {
      __flowStart = 10;
      __flowEnd = 11;
    } else {
      __flowStart = st;
      __flowEnd = 10;
    }
    try {
      __stats.put("startStep", st);
      __stats.put("flowStart", __flowStart);
      __stats.put("flowEnd", __flowEnd);
    } catch (eSoda) {}
    return;
  }
  if (st > 15) st = 15;
  __startStep = st;
  if (st <= 9) {
    __flowStart = st;
    __flowEnd = 11;
  } else if (st === 10) {
    __flowStart = 10;
    __flowEnd = 10;
  } else if (st === 11) {
    __flowStart = 1;
    __flowEnd = 11;
  } else {
    // 调试步 12~15：从当前页直接执行对应单项，不再先跑 1~10
    __flowStart = st;
    __flowEnd = st;
  }
  try {
    __stats.put("startStep", st);
    __stats.put("flowStart", __flowStart);
    __stats.put("flowEnd", __flowEnd);
  } catch (e) {}
}

function chooseStartStepDialog() {
  var isSoda = false;
  var isWendao = false;
  try {
    isSoda = isSodaPlatformSelected();
  } catch (eSoda) {}
  try {
    isWendao = getDaoceMode() === "wendao";
  } catch (eMode) {}
  const items = isSoda
    ? [
        "1 从停止汽水开始",
        "2 从启动汽水开始",
        "3 从点击「我的」开始",
        "4 从点击「我页粉丝」开始（汽水）",
        "5 从个人粉丝列表前3页随机开始（汽水）",
        "6 从点击关注开始（汽水）",
        "7 从关注列表首行开始（汽水）",
        "8 从点击粉丝开始（汽水）",
        "9 从粉丝列表首行开始（汽水）",
        "10 从随机进入作品开始（汽水）",
        "11 进入作品后随机一个动作（汽水）",
      ]
    : [
        "1 从停止抖音开始",
        "2 从启动抖音开始",
        "3 从点击“我”开始",
        isWendao ? "4 从点击“我页粉丝”开始（问道）" : "4 从点击“首页”开始",
        isWendao ? "5 从个人粉丝列表前3页随机开始（问道）" : "5 从点击“搜索”开始",
        isWendao ? "6 从点击关注开始（问道）" : "6 从录入对标账号开始",
        isWendao ? "7 从关注列表首行开始（问道）" : "7 从点击抖音号结果开始",
        isWendao ? "8 从点击粉丝开始（问道+换道）" : "8 从点击粉丝开始",
        "9 从粉丝列表首行开始",
        "10 从随机进入作品开始",
        "11 进入作品后随机一个动作（按火力/库表次数比例）",
        "12 （调试）仅作品内点赞",
        "13 （调试）仅作品内收藏",
        "14 （调试）仅分享并点推荐",
        "15 （调试）评论全流程（点框→拉文案→发送）",
      ];
  const applyIdx = (idx) => {
    if (typeof idx !== "number" || idx < 0) return;
    setStartStep(idx + 1);
    appendLog("起点=" + (idx + 1));
  };
  const title = isSoda
    ? `选择汽水调试起点（当前：${__startStep}）`
    : `选择调试起点（当前：${__startStep}）`;

  try {
    const ret = dialogs.select(title, items);
    if (ret && typeof ret.then === "function") ret.then(applyIdx);
    else if (typeof ret === "number") applyIdx(ret);
  } catch (e) {}
}

function clickNode(node) {
  if (!node) return false;
  let n = node;
  for (let i = 0; i < 3 && n; i++, n = n.parent()) {
    try {
      if (n.clickable && n.clickable() && n.click && n.click()) return true;
    } catch (e) {}
  }
  try {
    const b = node.bounds();
    return press(b.centerX(), b.centerY(), 60);
  } catch (e) {
    return false;
  }
}

function forceStopApp(packageName, appName) {
  appendLog(`停${appName}…`);
  try {
    app.openAppSetting(packageName);
  } catch (e) {
    appendLog("开应用信息失败");
    return false;
  }
  sleepCtrl(2500);

  var stopBtn = null;
  var i;
  for (i = 0; i < 10; i++) {
    if (__scriptUserStop) return false;
  try {
    stopBtn =
        text("结束运行").findOne(300) ||
        text("强行停止").findOne(300) ||
        text("强制停止").findOne(300);
      if (stopBtn) break;
    } catch (eFind) {}
    sleepCtrl(300);
  }

  if (stopBtn) {
    if (!clickNode(stopBtn)) {
      try {
        var b0 = stopBtn.bounds();
        click(b0.centerX(), b0.centerY());
      } catch (_) {}
    }
    sleepCtrl(2000);
  appendLog("确认弹窗");
  try {
      // 关键修复：MIUI 常同时出现「取消/确定」，不能因为看到了取消就放弃点确定。
      var okBtn = null;
      var j;
      for (j = 0; j < 4; j++) {
        if (__scriptUserStop) break;
        try {
          okBtn =
            text("确定").findOne(500) ||
            text("确认").findOne(500) ||
            text("继续").findOne(500) ||
            text("强行停止").findOne(500) ||
            text("强制停止").findOne(500) ||
            textMatches(/.*确定.*|.*确认.*|.*继续.*|.*强行停止.*|.*强制停止.*/).findOne(500);
        } catch (eOk) {}
        if (okBtn) break;
        sleepCtrl(400);
      }
      if (okBtn) {
        appendLog("点确定");
        if (!clickNode(okBtn)) {
          try {
            var bo = okBtn.bounds();
            click(bo.centerX(), bo.centerY());
          } catch (_) {}
        }
        sleepCtrl(900);
      }
    } catch (eDlg) {}
    sleepCtrl(1000);
  } else {
    appendLog("未找到强停");
    sleepCtrl(2000);
  }

  try {
    appendLog("返回");
    back();
    sleepCtrl(500);
  } catch (eBk) {}

  appendLog(appName + "已停止");
  return true;
}

function launchDouyin() {
  appendLog("开抖音…");
  let ok = false;
  try { ok = app.launchApp("抖音"); } catch (e) {}
  if (!ok) {
    try { ok = app.launchPackage(DY_PKG); } catch (e) {}
  }
  appendLog(ok ? "已启动" : "启动失败");
  sleepCtrl(8000);
  return ok;
}

function launchSodaApp() {
  appendLog("开汽水…");
  var ok = false;
  try {
    ok = app.launchApp(SODA_APP_NAME);
  } catch (e0) {}
  if (!ok) {
    try {
      ok = app.launchPackage(SODA_PKG);
    } catch (e1) {}
  }
  appendLog(ok ? "汽水已启动" : "汽水启动失败");
  __sodaSplashSkipClickedAt = 0;
  __sodaSplashSkipSeen = false;
  __sodaSplashWaitFinishedAt = 0;
  __sodaMyTabClickedAfterSplash = false;
  if (ok) waitSodaSplashAdDismissed(SODA_SPLASH_ABSOLUTE_MAX_MS);
  return ok;
}

/** 启动等待期间后台预热 Paddle OCR，避免点「我的」兜底 OCR 首次耗时过长 */
function warmSodaPaddleOcrIfNeeded() {
  if (__sodaPaddleOcrWarmed) return;
  if (!isProfileFansPaddleOcrAvailable()) return;
  try {
    threads.start(function () {
      var img = null;
      var cropped = null;
      try {
        if (!ensureScreenCaptureReady(2500)) return;
        img = captureScreenOnceForWorkGridProbe(1500);
        if (!img) return;
        var w = device.width;
        var h = device.height;
        var cropTop = Math.floor(h * 0.84);
        var cropH = Math.max(40, h - cropTop);
        try {
          if (typeof images !== "undefined" && images.clip) {
            cropped = images.clip(img, 0, cropTop, w, cropH);
          }
        } catch (eClip) {}
        runProfileFansPaddleOcrSafe(cropped || img);
        __sodaPaddleOcrWarmed = true;
      } catch (eW) {
      } finally {
        try {
          if (cropped && cropped.recycle) cropped.recycle();
        } catch (eR0) {}
        try {
          if (img && img.recycle) img.recycle();
        } catch (eR1) {}
      }
    });
  } catch (eTh) {}
}

function pickSodaBottomMyTabFromColl(coll, w, h) {
  if (!coll || !coll.size || coll.size() < 1) return null;
  var yMin = Math.floor(h * 0.76);
  var best = null;
  var bestScore = -1e9;
  var i;
  for (i = 0; i < coll.size(); i++) {
    var n = coll.get(i);
    try {
      var b = n.bounds();
      if (b.centerY() < yMin) continue;
      var score = b.centerX();
      if (b.centerX() >= Math.floor(w * 0.72)) score += 10000;
      if (score > bestScore) {
        bestScore = score;
        best = n;
      }
    } catch (eB) {}
  }
  return best;
}

/** 汽水底部「我的」Tab 可点击节点（优先 navigation_tab_me；text 常为空） */
function resolveSodaBottomMyTabClickNode(node) {
  if (!node) return null;
  try {
    if (node.clickable && node.clickable()) return node;
  } catch (e0) {}
  var cur = node;
  var depth = 0;
  for (depth = 0; depth < 4 && cur; depth++) {
    try {
      if (cur.clickable && cur.clickable()) return cur;
      cur = cur.parent ? cur.parent() : null;
    } catch (eP) {
      cur = null;
    }
  }
  return node;
}

function clickSodaBottomMyTabNode(node) {
  node = resolveSodaBottomMyTabClickNode(node);
  if (!node) return false;
  try {
    if (clickNode(node)) return true;
  } catch (e0) {}
  try {
    var b = node.bounds();
    click(b.centerX(), b.centerY());
    return true;
  } catch (e1) {}
  return false;
}

/** 汽水底部导航「我的」节点（id 优先；部分机型 text 为空） */
function findSodaBottomMyTabNode(timeoutMs) {
  var w = device.width;
  var h = device.height;
  var yMin = Math.floor(h * 0.76);
  var xRight = Math.floor(w * 0.68);
  var tMain =
    typeof timeoutMs === "number" && timeoutMs > 0 ? Math.min(timeoutMs, 120) : 80;
  var node = null;
  try {
    node = id(SODA_NAV_TAB_ME_ID).packageName(SODA_PKG).findOne(tMain);
    if (node) return resolveSodaBottomMyTabClickNode(node);
  } catch (eId0) {}
  try {
    node = idMatches(/.*:id\/navigation_tab_me$/).packageName(SODA_PKG).findOne(tMain);
    if (node) return resolveSodaBottomMyTabClickNode(node);
  } catch (eId1) {}
  try {
    node = text("我的").packageName(SODA_PKG).boundsInside(xRight, yMin, w, h).findOne(tMain);
    if (node) return resolveSodaBottomMyTabClickNode(node);
  } catch (e0) {}
  try {
    node = desc("我的").packageName(SODA_PKG).boundsInside(xRight, yMin, w, h).findOne(tMain);
    if (node) return resolveSodaBottomMyTabClickNode(node);
  } catch (e1) {}
  try {
    var inner = id(SODA_NAV_TAB_ME_INNER_ID).packageName(SODA_PKG).findOne(tMain);
    if (!inner) inner = idMatches(/.*:id\/b=o$/).packageName(SODA_PKG).findOne(tMain);
    if (inner) {
      node = resolveSodaBottomMyTabClickNode(inner);
      if (node) return node;
    }
  } catch (eIn) {}
  try {
    var coll = className("android.widget.FrameLayout")
      .clickable(true)
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(w * 0.72), yMin, w, h)
      .find();
    node = pickSodaBottomMyTabFromColl(coll, w, h);
    if (node) return node;
  } catch (eFr) {}
  return null;
}

/** 汽水主界面是否就绪（底部导航已出现，广告结束） */
function detectSodaMainHomeReadyFast() {
  return detectSodaMainHomeReadySplashLight();
}

/** 等开屏广告专用：单次总耗时控制在约 120ms 内 */
function detectSodaMainHomeReadySplashLight() {
  try {
    var w = device.width;
    var h = device.height;
    var yMin = Math.floor(h * 0.72);
    var xRight = Math.floor(w * 0.68);
    if (
      id(SODA_NAV_TAB_ME_ID).packageName(SODA_PKG).findOne(40) ||
      idMatches(/.*:id\/navigation_tab_me$/).packageName(SODA_PKG).findOne(40)
    ) {
      return true;
    }
    if (
      text("我的").packageName(SODA_PKG).boundsInside(xRight, yMin, w, h).findOne(50) ||
      desc("我的").packageName(SODA_PKG).boundsInside(xRight, yMin, w, h).findOne(40)
    ) {
      return true;
    }
    if (
      text("首页").packageName(SODA_PKG).boundsInside(0, yMin, w, h).findOne(40) &&
      (text("我的").packageName(SODA_PKG).boundsInside(0, yMin, w, h).findOne(40) ||
        text("听歌").packageName(SODA_PKG).boundsInside(0, yMin, w, h).findOne(40))
    ) {
      return true;
    }
  } catch (e0) {}
  return false;
}

function detectSodaMainHomeReady() {
  return detectSodaMainHomeReadyFast();
}

function findSodaSplashSkipNodeFast() {
  try {
    var w = device.width;
    var h = device.height;
    var skip =
      text("跳过").packageName(SODA_PKG).findOne(30) ||
      textMatches(/跳过/).packageName(SODA_PKG).findOne(30) ||
      desc("跳过").findOne(30) ||
      textContains("跳过")
        .boundsInside(Math.floor(w * 0.5), 0, w, Math.floor(h * 0.24))
        .findOne(30);
    if (skip) return skip;
  } catch (e0) {}
  try {
    var closeX =
      text("×").findOne(30) ||
      text("关闭").packageName(SODA_PKG).findOne(30) ||
      desc("关闭").findOne(30);
    if (closeX) return closeX;
  } catch (e1) {}
  return null;
}

var __sodaSplashUiProbeThread = null;

/** 开屏等待专用：UI 探测放子线程并限时，主线程不被 findOne 拖死 */
function sodaSplashUiProbeWithBudget(probeFn, budgetMs) {
  var budget =
    typeof budgetMs === "number" && budgetMs > 0
      ? budgetMs
      : typeof SODA_SPLASH_UI_PROBE_BUDGET_MS === "number"
        ? SODA_SPLASH_UI_PROBE_BUDGET_MS
        : 180;
  try {
    if (__sodaSplashUiProbeThread && __sodaSplashUiProbeThread.isAlive()) return null;
  } catch (eAlive) {}
  var box = { result: null, finished: false };
  try {
    __sodaSplashUiProbeThread = threads.start(function () {
      try {
        box.result = probeFn();
      } catch (eP) {
        box.result = null;
      }
      box.finished = true;
    });
  } catch (eStart) {
    return null;
  }
  var endAt = Date.now() + budget;
  while (!box.finished && Date.now() < endAt) {
    sleep(12);
  }
  if (!box.finished) return null;
  return box.result;
}

function sodaSplashProbeSkipNode() {
  return sodaSplashUiProbeWithBudget(findSodaSplashSkipNodeFast);
}

function sodaSplashProbeHomeReady() {
  return sodaSplashUiProbeWithBudget(detectSodaMainHomeReadySplashLight) === true;
}

function findSodaSplashSkipNode() {
  return findSodaSplashSkipNodeFast();
}

var __sodaSplashSkipLastMs = 0;
var __sodaSplashSkipClickedAt = 0;
var __sodaSplashSkipSeen = false;
var __sodaSplashWaitFinishedAt = 0;
var __sodaMyTabClickedAfterSplash = false;

function sodaSplashWaitRecentlyDone() {
  return __sodaSplashWaitFinishedAt > 0 && Date.now() - __sodaSplashWaitFinishedAt < 30000;
}

/** 开屏/广告结束：页面上出现底部「我的」即视为结束，交由第3步点击 */
function detectSodaMyTabVisibleForSplashEnd() {
  var probed = sodaSplashUiProbeWithBudget(function () {
    try {
      if (findSodaBottomMyTabNode(100)) return true;
      var w = device.width;
      var h = device.height;
      var yMin = Math.floor(h * 0.72);
      if (text("我的").packageName(SODA_PKG).boundsInside(0, yMin, w, h).findOne(80)) return true;
      if (desc("我的").packageName(SODA_PKG).boundsInside(0, yMin, w, h).findOne(60)) return true;
      if (
        id(SODA_NAV_TAB_ME_ID).packageName(SODA_PKG).findOne(60) ||
        idMatches(/.*:id\/navigation_tab_me$/).packageName(SODA_PKG).findOne(60)
      ) {
        return true;
      }
    } catch (e0) {}
    return false;
  }, SODA_SPLASH_UI_PROBE_BUDGET_MS);
  return probed === true;
}

function sodaMarkSplashEndedForStep3() {
  __sodaSplashWaitFinishedAt = Date.now();
  if (isSodaEarlyStepSyncLogPhase()) {
    appendSodaLogBlocking("广告已结束");
  } else {
    appendLogProgress("广告已结束");
  }
}

/** @deprecated 广告结束改由第3步点「我的」，此处仅记结束时间 */
function sodaMarkSplashEndedAndTapMyTab(forcedQuick) {
  sodaMarkSplashEndedForStep3();
}

function sodaSplashWaitDeadlineMs(fromT0) {
  var t0 = typeof fromT0 === "number" ? fromT0 : Date.now();
  var absMax =
    t0 +
    (typeof SODA_SPLASH_ABSOLUTE_MAX_MS === "number" && SODA_SPLASH_ABSOLUTE_MAX_MS > 0
      ? SODA_SPLASH_ABSOLUTE_MAX_MS
      : 25000);
  var rel;
  if (__sodaSplashSkipClickedAt > 0) {
    rel = __sodaSplashSkipClickedAt + SODA_LAUNCH_SPLASH_MAX_MS;
  } else if (__sodaSplashSkipSeen) {
    rel = t0 + SODA_SPLASH_NO_SKIP_MAX_MS;
  } else {
    rel = t0 + (typeof SODA_SPLASH_NO_AD_MAX_MS === "number" ? SODA_SPLASH_NO_AD_MAX_MS : 25000);
  }
  return Math.min(absMax, rel);
}

function sodaSplashWaitTimedOut(fromT0) {
  return Date.now() >= sodaSplashWaitDeadlineMs(fromT0);
}

function sodaSplashMinJudgeMs() {
  return typeof SODA_SPLASH_MIN_JUDGE_MS === "number" && SODA_SPLASH_MIN_JUDGE_MS > 0
    ? SODA_SPLASH_MIN_JUDGE_MS
    : 10000;
}

/** 是否已过「最短判定等待」，未到则不因底部栏出现而判广告结束 */
function sodaSplashJudgeMinElapsedSatisfied(elapsedMs) {
  return elapsedMs >= sodaSplashMinJudgeMs();
}

function sodaSplashCanEndWithoutSkip(elapsedMs) {
  if (__sodaSplashSkipClickedAt > 0) return false;
  if (!sodaSplashJudgeMinElapsedSatisfied(elapsedMs)) return false;
  if (!detectSodaMainHomeReadySplashLight()) return false;
  if (__sodaSplashSkipSeen) return false;
  return true;
}

function getSodaSplashWaitBudgetMs() {
  var abs =
    typeof SODA_SPLASH_ABSOLUTE_MAX_MS === "number" && SODA_SPLASH_ABSOLUTE_MAX_MS > 0
      ? SODA_SPLASH_ABSOLUTE_MAX_MS
      : 25000;
  if (__sodaSplashSkipClickedAt > 0) return Math.min(abs, SODA_LAUNCH_SPLASH_MAX_MS);
  if (__sodaSplashSkipSeen) return Math.min(abs, SODA_SPLASH_NO_SKIP_MAX_MS);
  return Math.min(abs, typeof SODA_SPLASH_NO_AD_MAX_MS === "number" ? SODA_SPLASH_NO_AD_MAX_MS : 25000);
}

function sodaSplashCanEndWithoutSkipProbed(elapsedMs) {
  if (__sodaSplashSkipClickedAt > 0) return false;
  if (!sodaSplashJudgeMinElapsedSatisfied(elapsedMs)) return false;
  if (!sodaSplashProbeHomeReady()) return false;
  if (__sodaSplashSkipSeen) return false;
  return true;
}

function detectSodaSplashEndedAfterSkip() {
  if (!__sodaSplashSkipClickedAt) return false;
  var elapsed = Date.now() - __sodaSplashSkipClickedAt;
  if (elapsed < 250) return false;
  if (sodaSplashProbeSkipNode()) return false;
  if (sodaSplashProbeHomeReady()) return true;
  if (elapsed >= SODA_SPLASH_POST_SKIP_FORCE_MS) return true;
  return false;
}

/** 广告：尝试点「跳过」/关闭 */
function tryDismissSodaSplashAdOnce() {
  if (Date.now() - __sodaSplashSkipLastMs < 350) return false;
  var node = sodaSplashProbeSkipNode();
  if (!node) return false;
  __sodaSplashSkipSeen = true;
  appendSodaActionLog("点跳过广告");
  var clicked = false;
  try {
    clicked = clickNode(node);
  } catch (e0) {}
  if (!clicked) {
    try {
      var b = node.bounds();
      click(b.centerX(), b.centerY());
      clicked = true;
    } catch (e1) {}
  }
  if (clicked) {
    __sodaSplashSkipLastMs = Date.now();
    __sodaSplashSkipClickedAt = Date.now();
  }
  return clicked;
}

function noteSodaSplashSkipSeenIfAny() {
  if (__sodaSplashSkipSeen) return true;
  try {
    if (sodaSplashProbeSkipNode()) {
      __sodaSplashSkipSeen = true;
      return true;
    }
  } catch (e0) {}
  return false;
}

/**
 * 轮询等待汽水广告结束：见到底部「我的」即结束，交第3步点「我的」；仍尝试点「跳过」加速；整段最长 absMax 强制继续。
 * @returns {boolean}
 */
function waitSodaSplashAdDismissed(maxMs) {
  var absMaxMs =
    typeof maxMs === "number" && maxMs > 0
      ? maxMs
      : typeof SODA_SPLASH_ABSOLUTE_MAX_MS === "number" && SODA_SPLASH_ABSOLUTE_MAX_MS > 0
        ? SODA_SPLASH_ABSOLUTE_MAX_MS
        : 25000;
  var t0 = Date.now();
  var pollMs =
    typeof SODA_SPLASH_POLL_MS === "number" && SODA_SPLASH_POLL_MS > 0 ? SODA_SPLASH_POLL_MS : 150;
  if (detectSodaMyTabVisibleForSplashEnd()) {
    sodaMarkSplashEndedForStep3();
    return true;
  }
  appendLogProgress("等广告结束");
  while (Date.now() - t0 < absMaxMs && !__scriptUserStop) {
    sleepCtrl(pollMs);
    if (detectSodaMyTabVisibleForSplashEnd()) {
      sodaMarkSplashEndedForStep3();
      return true;
    }
    tryDismissSodaSplashAdOnce();
  }
  sodaMarkSplashEndedForStep3();
  return false;
}

function tapSodaBottomMyTabCoord() {
  try {
    var node = findSodaBottomMyTabNode(80);
    if (node && clickSodaBottomMyTabNode(node)) return true;
  } catch (eN) {}
  try {
    var w = device.width;
    var h = device.height;
    var xRatio =
      typeof SODA_NAV_TAB_ME_TAP_X_RATIO === "number" ? SODA_NAV_TAB_ME_TAP_X_RATIO : 0.9;
    var yRatio =
      typeof SODA_NAV_TAB_ME_TAP_Y_RATIO === "number" ? SODA_NAV_TAB_ME_TAP_Y_RATIO : 0.955;
    click(Math.floor(w * xRatio), Math.floor(h * yRatio));
    return true;
  } catch (eTap) {
    return false;
  }
}

/** 广告结束后立刻点「我的」：仅坐标连点 */
function clickSodaMyTabImmediateAfterSplash() {
  try {
    tapSodaBottomMyTabCoord();
    sleep(60);
    tapSodaBottomMyTabCoord();
  } catch (eTap) {}
  return true;
}

function waitSodaMyProfileAfterClickMs(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : SODA_POST_SPLASH_MY_ENTER_MS;
  var t0 = Date.now();
  var retapAt = t0 + 280;
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    if (detectSodaMyProfileLikelyFast()) return true;
    if (Date.now() >= retapAt) {
      retapAt = Date.now() + 320;
      try {
        tapSodaMyTabForEnter(true);
      } catch (eRt) {}
    }
    sleepCtrl(SODA_MY_PROFILE_ENTER_POLL_MS);
  }
  return detectSodaMyProfileLikelyFast();
}

/** 汽水「我」页轻量判定（禁止走 detectMeProfileLikely，避免读昵称/OCR 卡十几秒） */
function detectSodaMyProfileLikelyFast() {
  try {
    if (id(SODA_ME_NICKNAME_ID).packageName(SODA_PKG).findOne(60)) return true;
    if (id(SODA_ME_NICKNAME_ALT_ID).packageName(SODA_PKG).findOne(60)) return true;
    if (id(SODA_PROFILE_NICKNAME_ID).packageName(SODA_PKG).findOne(60)) return true;
    if (id(SODA_ME_FANS_TAB_ID).packageName(SODA_PKG).findOne(50)) return true;
    if (id(SODA_ME_FANS_COUNT_ID).packageName(SODA_PKG).findOne(50)) return true;
    if (id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(50)) return true;
    if (id(SODA_PROFILE_FANS_COUNT_ID).packageName(SODA_PKG).findOne(50)) return true;
    if (id(SODA_PROFILE_FANS_COUNT_ALT_ID).packageName(SODA_PKG).findOne(50)) return true;
    if (id(SODA_PROFILE_FANS_LAYOUT_ID).packageName(SODA_PKG).findOne(50)) return true;
    if (id(SODA_PROFILE_FANS_LAYOUT_ALT_ID).packageName(SODA_PKG).findOne(50)) return true;
    var w = device.width;
    var h = device.height;
    var y0 = Math.floor(h * 0.22);
    var y1 = Math.floor(h * 0.44);
    if (text("粉丝").packageName(SODA_PKG).boundsInside(0, y0, w, y1).findOne(50)) return true;
    if (text("获赞").packageName(SODA_PKG).boundsInside(0, y0, w, y1).findOne(50)) return true;
    if (text("关注").packageName(SODA_PKG).boundsInside(0, y0, w, y1).findOne(50)) return true;
  } catch (e0) {}
  return false;
}

/** 汽水点底部「我的」：id/节点优先，坐标兜底 */
function tapSodaMyTabForEnter(silent) {
  if (!silent) appendSodaLogBlocking("点我的");
  var ok = false;
  try {
    var node = findSodaBottomMyTabNode(100);
    if (node) ok = clickSodaBottomMyTabNode(node);
  } catch (eFind) {}
  if (!ok) {
    try {
      ok = tapSodaBottomMyTabCoord();
    } catch (eTap) {}
  }
  if (!ok) {
    try {
      sleep(40);
      ok = tapSodaBottomMyTabCoord();
    } catch (eTap2) {}
  }
  return ok;
}

function waitSodaPostSplashHomeReady(maxMs) {
  if (!sodaSplashWaitRecentlyDone()) return true;
  var budget =
    typeof maxMs === "number" && maxMs > 0
      ? maxMs
      : typeof SODA_POST_SPLASH_HOME_READY_MS === "number"
        ? SODA_POST_SPLASH_HOME_READY_MS
        : 1200;
  var t0 = Date.now();
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    if (detectSodaMainHomeReadySplashLight()) return true;
    sleepCtrl(60);
  }
  return detectSodaMainHomeReadySplashLight();
}

/** 汽水点底部「我的」：坐标优先，节点 findOne 限时 */
function clickSodaMyTabSingleTry() {
  tapSodaMyTabForEnter(true);
  var node = findSodaBottomMyTabNode(120);
  if (node) {
    try {
      clickNode(node);
    } catch (eN) {}
  }
  var t0 = Date.now();
  while (Date.now() - t0 < 1200 && !__scriptUserStop) {
    if (detectSodaMyProfileLikelyFast()) return true;
    sleepCtrl(120);
  }
  tapSodaMyTabForEnter(true);
  t0 = Date.now();
  while (Date.now() - t0 < 900 && !__scriptUserStop) {
    if (detectSodaMyProfileLikelyFast()) return true;
    sleepCtrl(120);
  }
  return false;
}

function detectSodaMyProfileLikely() {
  return detectSodaMyProfileLikelyFast();
}

/** OCR 识别底部导航栏「我的」Tab */
function isOcrSodaBottomMyTabLabel(item, w, h) {
  if (!item) return false;
  var t = String(item.text || "").replace(/\s+/g, "");
  if (!t || (t !== "我的" && t.indexOf("我的") < 0)) return false;
  if (isOcrFloatOrScriptNoise(t)) return false;
  if (isOcrItemInFloatPanelZone(item, w, h)) return false;
  return item.cy >= Math.floor(h * 0.78) && item.cx >= Math.floor(w * 0.45);
}

function waitSodaMyProfileEntered(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : 1600;
  var t0 = Date.now();
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    if (detectSodaMyProfileLikelyFast()) return true;
    sleepCtrl(SODA_MY_PROFILE_ENTER_POLL_MS);
  }
  return false;
}

/**
 * OCR 点击汽水底部「我的」（无 id、无障碍点不到时）。
 * @returns {boolean}
 */
function clickSodaMyTabByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  appendSodaActionLog("O点我的");
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.76);
    var cropH = Math.max(80, h - cropTop);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, 0, cropTop, w, cropH);
        if (cropped) {
          ocrImg = cropped;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return false;
    var picked = null;
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      if (!isOcrSodaBottomMyTabLabel(items[ji], w, h)) continue;
      if (!picked || items[ji].cx > picked.cx) picked = items[ji];
    }
    if (!picked) {
      for (ji = 0; ji < items.length; ji++) {
        var t1 = items[ji].text;
        if (t1 !== "我" || items[ji].cy < Math.floor(h * 0.82)) continue;
        if (items[ji].cx < Math.floor(w * 0.78)) continue;
        if (isOcrItemInFloatPanelZone(items[ji], w, h)) continue;
        if (!picked || items[ji].cx > picked.cx) picked = items[ji];
      }
    }
    if (!picked) return false;
    var tapX = Math.max(8, Math.min(w - 8, picked.cx));
    var tapY = Math.max(8, Math.min(h - 8, picked.cy));
    try {
      click(tapX, tapY);
    } catch (eC0) {
      try {
        press(tapX, tapY, 90);
      } catch (eC1) {
        return false;
      }
    }
    return true;
  } catch (eTap) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

/** 汽水「我」页读取昵称（优先 glk） */
function getNicknameFromSodaMePage() {
  function pickNickText(n) {
    if (!n) return null;
    try {
      var t = n.text ? n.text() : "";
      if (!t && n.desc) t = n.desc();
      t = t ? String(t).trim() : "";
      if (!t) return null;
      if (t.length > 32) return null;
      if (/^\d+(?:\.\d+)?(?:万|亿|w|W)?$/.test(t)) return null;
      if (/^(编辑资料|编辑主页|添加朋友|关注|粉丝|获赞|作品|私密|直播|听歌|歌单|我的|首页|推荐|搜索|领时长)$/.test(t)) return null;
      if (/^[\d\.\s,，万亿wW\+]+$/.test(t)) return null;
      return t;
    } catch (e0) {
      return null;
    }
  }
  try {
    var node =
      id(SODA_ME_NICKNAME_ALT_ID).packageName(SODA_PKG).findOne(600) ||
      id(SODA_PROFILE_NICKNAME_ID).packageName(SODA_PKG).findOne(500) ||
      id(SODA_ME_NICKNAME_ID).packageName(SODA_PKG).findOne(500);
    if (!node) node = idMatches(/.*:id\/glq$/).packageName(SODA_PKG).findOne(400);
    if (!node) node = idMatches(/.*:id\/glk$/).packageName(SODA_PKG).findOne(400);
    var vId = pickNickText(node);
    if (vId) return vId;
  } catch (eId) {}
  try {
    var layout =
      id(SODA_PROFILE_NICKNAME_LAYOUT_ID).packageName(SODA_PKG).findOne(320) ||
      idMatches(/.*:id\/glr$/).packageName(SODA_PKG).findOne(280);
    if (layout) {
      var child = layout.findOne(className("android.widget.TextView"), 200);
      var vLay = pickNickText(child);
      if (vLay) return vLay;
    }
  } catch (eLay) {}
  try {
    var sw = device.width;
    var sh = device.height;
    var coll = className("android.widget.TextView")
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(sw * 0.12), Math.floor(sh * 0.22), Math.floor(sw * 0.75), Math.floor(sh * 0.38))
      .find();
    if (coll && coll.size && coll.size() > 0) {
      var best = null;
      var bestTop = 1e9;
      var i;
      for (i = 0; i < coll.size(); i++) {
        var n = coll.get(i);
        var t = pickNickText(n);
        if (!t) continue;
        try {
          var b = n.bounds();
          if (b.top < bestTop) {
            bestTop = b.top;
            best = t;
          }
        } catch (eB) {}
      }
      if (best) return best;
    }
  } catch (eZone) {}
  return null;
}

/** 汽水「我」页 OCR 读粉丝数（统计条偏下时兜底） */
function readSodaMePageFansCountByOcr(maxBudgetMs) {
  if (!isProfileFansPaddleOcrAvailable()) return null;
  var budget = typeof maxBudgetMs === "number" && maxBudgetMs > 0 ? maxBudgetMs : 2800;
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(Math.min(budget, 2600))) return null;
    img = captureScreenOnceForWorkGridProbe(Math.min(budget, 2200));
    if (!img) return null;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.22);
    var cropH = Math.max(100, Math.floor(h * 0.22));
    var cropLeft = Math.floor(w * 0.08);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft - Math.floor(w * 0.06), cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return null;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      items.push({
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      });
    }
    if (!items.length) return null;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var colFans = null;
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      if (isOcrSodaMePageFansLabel(items[ji], w, h)) {
        if (!colFans || items[ji].cx > colFans.cx) colFans = items[ji];
      }
    }
    if (!colFans) return null;
    var fansCx = colFans.cx;
    var fansCy = colFans.cy;
    var best = null;
    var bestScore = 1e9;
    for (ji = 0; ji < items.length; ji++) {
      var nt = items[ji].text;
      if (!nt || nt === "粉丝" || nt === "获赞" || nt === "关注") continue;
      var p = parseSodaFansCountRawText(nt);
      if (!p) continue;
      var nr = items[ji];
      var isLeft = nr.right <= colFans.right + 8 && nr.cx < fansCx && Math.abs(nr.cy - fansCy) <= rowTol;
      var isAbove =
        nr.cy < fansCy - 2 &&
        nr.bottom <= fansCy + 8 &&
        Math.abs(nr.cx - fansCx) <= Math.floor(w * 0.14);
      if (!isLeft && !isAbove) continue;
      var dist = isAbove
        ? Math.abs(nr.cy - fansCy) * 1.1 + Math.abs(nr.cx - fansCx) * 0.2
        : Math.abs(nr.cx - fansCx) + Math.abs(nr.cy - fansCy) * 0.3;
      if (dist < bestScore) {
        bestScore = dist;
        best = p.display;
      }
    }
    return best;
  } catch (eOcr) {
    return null;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

/** 汽水「我」页读取粉丝数（gk-/gk+、gle/glf/gf-、gl2/gl3、「粉丝」同组、OCR 兜底） */
function getFansFromSodaMePage() {
  function bestFansFromLabelParent(labelFans) {
    if (!labelFans) return null;
    var p = labelFans.parent();
    if (!p) return null;
    var best = null;
    var bestInt = -1;
    var cc = 0;
    try {
      cc = p.childCount();
    } catch (eCc) {
      cc = 0;
    }
    for (var ci = 0; ci < cc; ci++) {
      var ch = null;
      try {
        ch = p.child(ci);
      } catch (eCh) {
        ch = null;
      }
      var v = fansDisplayFromSodaCountNode(ch);
      if (!v) continue;
      var iv = fansToInt(v);
      if (iv == null) continue;
      if (iv > bestInt) {
        bestInt = iv;
        best = v;
      }
    }
    return best;
  }
  try {
    var nGk = id(SODA_PROFILE_FANS_COUNT_ID).packageName(SODA_PKG).findOne(500);
    if (!nGk) nGk = idMatches(/.*:id\/gk-$/).packageName(SODA_PKG).findOne(400);
    var vGk = fansDisplayFromSodaCountNode(nGk);
    if (vGk) return vGk;
  } catch (eGk) {}
  try {
    var nGle =
      id(SODA_PROFILE_FANS_COUNT_ALT_ID).packageName(SODA_PKG).findOne(500) ||
      idMatches(/.*:id\/gle$/).packageName(SODA_PKG).findOne(400);
    var vGle = fansDisplayFromSodaCountNode(nGle);
    if (vGle) return vGle;
  } catch (eGleMe) {}
  try {
    var layoutMe =
      id(SODA_PROFILE_FANS_LAYOUT_ID).packageName(SODA_PKG).findOne(320) ||
      id(SODA_PROFILE_FANS_LAYOUT_ALT_ID).packageName(SODA_PKG).findOne(280) ||
      idMatches(/.*:id\/gf5$/).packageName(SODA_PKG).findOne(280) ||
      idMatches(/.*:id\/gf-$/).packageName(SODA_PKG).findOne(280);
    var fromLayMe = sodaProfileFansCountFromStatsLayout(layoutMe);
    if (fromLayMe != null) return String(fromLayMe);
  } catch (eLayMe) {}
  try {
    var nGl2 = id(SODA_ME_FANS_COUNT_ID).packageName(SODA_PKG).findOne(500);
    if (!nGl2) nGl2 = idMatches(/.*:id\/gl2$/).packageName(SODA_PKG).findOne(400);
    var vGl2 = fansDisplayFromSodaCountNode(nGl2);
    if (vGl2) return vGl2;
  } catch (eGl2) {}
  try {
    var labelFans =
      id(SODA_PROFILE_FANS_TAB_ID).packageName(SODA_PKG).findOne(320) ||
      id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(300) ||
      id(SODA_ME_FANS_TAB_ID).packageName(SODA_PKG).findOne(280) ||
      idMatches(/.*:id\/gk\+$/).packageName(SODA_PKG).findOne(260) ||
      idMatches(/.*:id\/glf$/).packageName(SODA_PKG).findOne(240) ||
      idMatches(/.*:id\/gl3$/).packageName(SODA_PKG).findOne(220);
    if (!labelFans) {
      try {
        var h = device.height;
        var sw = device.width;
        labelFans = text("粉丝")
          .packageName(SODA_PKG)
          .boundsInside(Math.floor(sw * 0.35), Math.floor(h * 0.26), sw - 8, Math.floor(h * 0.42))
          .findOne(320);
      } catch (eLblPkg) {}
    }
    var fromPar = bestFansFromLabelParent(labelFans);
    if (fromPar) return fromPar;
  } catch (ePar) {}
  try {
    var sw2 = device.width;
    var sh2 = device.height;
    var coll = className("android.widget.TextView")
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(sw2 * 0.42), Math.floor(sh2 * 0.28), Math.floor(sw2 * 0.72), Math.floor(sh2 * 0.42))
      .find();
    if (coll && coll.size) {
      var bestZone = null;
      var bestZoneInt = -1;
      for (var zi = 0; zi < coll.size(); zi++) {
        var zn = coll.get(zi);
        var zv = fansDisplayFromSodaCountNode(zn);
        if (!zv) continue;
        var ziv = fansToInt(zv);
        if (ziv == null) continue;
        if (ziv > bestZoneInt) {
          bestZoneInt = ziv;
          bestZone = zv;
        }
      }
      if (bestZone) return bestZone;
    }
  } catch (eZone) {}
  try {
    var vOcrS = readSodaMePageFansCountByOcr(2800);
    if (vOcrS) return vOcrS;
  } catch (eOcrS) {}
  try {
    var vOcr = readProfileFansCountByOcr(2800);
    if (vOcr != null) return String(vOcr);
  } catch (eOcr) {}
  return null;
}

/** 汽水「我」页内嵌运营条（非弹窗，勿关） */
function isOcrSodaMyPageInlinePromoText(txt) {
  if (!txt) return false;
  var t = String(txt).replace(/\s+/g, "");
  if (t.indexOf("领时长") >= 0) return true;
  if (/VIP.*畅听|享全天VIP|歌曲畅听/.test(t)) return true;
  return false;
}

/** OCR 识别汽水「我」页居中弹窗广告文案（非页内横幅） */
function isOcrSodaMyPageModalAdText(txt) {
  if (!txt) return false;
  if (isOcrSodaMyPageInlinePromoText(txt)) return false;
  var t = String(txt).replace(/\s+/g, "");
  if (/看视频.*全天免费听/.test(t)) return true;
  if (t.indexOf("去看视频") >= 0) return true;
  if (/\+?\d+分钟/.test(t) && t.indexOf("分钟") >= 0) return true;
  if (t.indexOf("今日畅听") >= 0) return true;
  return false;
}

function isOcrSodaMyPageModalTitleText(txt) {
  if (!txt) return false;
  var t = String(txt).replace(/\s+/g, "");
  return /看视频.*全天免费听/.test(t);
}

function isOcrSodaMyPageAdCloseText(txt) {
  if (!txt) return false;
  var t = String(txt).replace(/\s+/g, "");
  return t === "×" || t === "x" || t === "X" || t === "关闭" || t === "跳过";
}

function isOcrSodaMyPageModalAdZoneItem(item, w, h) {
  if (!item) return false;
  return item.cy >= Math.floor(h * 0.40) && item.cy <= Math.floor(h * 0.72);
}

/** 仅识别居中弹窗广告，忽略「看视频享VIP/领时长」等页内横幅 */
function detectSodaMyPageModalAdLikelyByA11y() {
  try {
    if (text("去看视频").packageName(SODA_PKG).findOne(120)) return true;
    if (textContains("看视频全天免费听").packageName(SODA_PKG).findOne(120)) return true;
    var has60 =
      !!textContains("+60分钟").packageName(SODA_PKG).findOne(120) ||
      !!textContains("60分钟").packageName(SODA_PKG).findOne(120);
    var hasToday = !!textContains("今日畅听").packageName(SODA_PKG).findOne(120);
    if (has60 && hasToday) return true;
  } catch (e0) {}
  try {
    if (text("去看视频").findOne(120)) return true;
    if (textContains("看视频全天免费听").findOne(120)) return true;
    var has60b =
      !!textContains("+60分钟").findOne(120) || !!textContains("60分钟").findOne(120);
    var hasTodayB = !!textContains("今日畅听").findOne(120);
    if (has60b && hasTodayB) return true;
  } catch (e1) {}
  return false;
}

/** 截屏 OCR 汽水「我」页中部弹窗区域 */
function captureSodaMyPageAdOcrItems() {
  if (!isProfileFansPaddleOcrAvailable()) return null;
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return null;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return null;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.34);
    var cropH = Math.max(120, Math.floor(h * 0.46));
    var cropLeft = Math.floor(w * 0.05);
    var cropW = w - cropLeft - Math.floor(w * 0.05);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, cropW, cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return { items: [], w: w, h: h };
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    return { items: items, w: w, h: h };
  } catch (eCap) {
    return null;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

function sodaMyPageModalAdPresentInOcrItems(items, w, h) {
  if (!items || !items.length) return false;
  var hasGoWatch = false;
  var hasModalTitle = false;
  var has60min = false;
  var hasTodayListen = false;
  var hasClose = false;
  var i;
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    if (!isOcrSodaMyPageModalAdZoneItem(it, w, h)) continue;
    var t = it.text;
    if (isOcrSodaMyPageAdCloseText(t)) hasClose = true;
    if (isOcrSodaMyPageInlinePromoText(t)) continue;
    if (t.indexOf("去看视频") >= 0) hasGoWatch = true;
    if (isOcrSodaMyPageModalTitleText(t)) hasModalTitle = true;
    if (/\+?\d+分钟/.test(t) && t.indexOf("分钟") >= 0) has60min = true;
    if (t.indexOf("今日畅听") >= 0) hasTodayListen = true;
  }
  if (hasClose) return true;
  if (hasGoWatch) return true;
  if (hasModalTitle) return true;
  if (has60min && hasTodayListen) return true;
  return false;
}

function pickSodaMyPageModalTitleAnchor(items, w, h) {
  var best = null;
  var bestScore = -1e9;
  var i;
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    if (!isOcrSodaMyPageModalAdZoneItem(it, w, h)) continue;
    if (!isOcrSodaMyPageModalTitleText(it.text)) continue;
    var score = it.cy;
    if (score > bestScore) {
      bestScore = score;
      best = it;
    }
  }
  return best;
}

function sodaMyPageModalAdCloseTapFromTitle(anchor, w, h) {
  if (!anchor) return null;
  var tapX = Math.min(w - 12, Math.max(anchor.right + Math.floor(w * 0.06), Math.floor(w * 0.88)));
  var tapY = Math.max(12, Math.min(h - 12, anchor.top + Math.floor((anchor.bottom - anchor.top) * 0.35)));
  return { x: tapX, y: tapY };
}

function pickSodaMyPageAdCloseByOcr(items, w, h) {
  if (!items || !items.length) return null;
  var i;
  for (i = 0; i < items.length; i++) {
    var it = items[i];
    if (!isOcrSodaMyPageAdCloseText(it.text)) continue;
    if (it.cx < Math.floor(w * 0.62)) continue;
    if (!isOcrSodaMyPageModalAdZoneItem(it, w, h)) continue;
    return { x: it.cx, y: it.cy };
  }
  return null;
}

/**
 * OCR 关闭汽水「我」页居中弹窗广告（须识别到 × 或弹窗标题，不盲打坐标）。
 * @returns {boolean|null} true=已点击关闭，false=未检测到弹窗，null=检测到但无可靠关闭点
 */
function clickSodaMyPageAdCloseByOcr() {
  var scan = captureSodaMyPageAdOcrItems();
  if (!scan) return null;
  var items = scan.items;
  var w = scan.w;
  var h = scan.h;
  if (!sodaMyPageModalAdPresentInOcrItems(items, w, h)) return false;
  var closeTap = pickSodaMyPageAdCloseByOcr(items, w, h);
  if (!closeTap) {
    closeTap = sodaMyPageModalAdCloseTapFromTitle(pickSodaMyPageModalTitleAnchor(items, w, h), w, h);
  }
  if (!closeTap) return null;
  appendSodaActionLog("O关广告");
  try {
    click(closeTap.x, closeTap.y);
  } catch (eC0) {
    try {
      press(closeTap.x, closeTap.y, 90);
    } catch (eC1) {
      return null;
    }
  }
  return true;
}

function sodaMyPageModalAdStillPresentQuick() {
  if (detectSodaMyPageModalAdLikelyByA11y()) return true;
  var scan = captureSodaMyPageAdOcrItems();
  if (!scan) return false;
  return sodaMyPageModalAdPresentInOcrItems(scan.items, scan.w, scan.h);
}

/** 汽水「我」页：若有居中弹窗广告则 OCR 点关闭（忽略页内「领时长」横幅） */
function dismissSodaMyPageAdIfAny() {
  var hasAd = detectSodaMyPageModalAdLikelyByA11y();
  if (!hasAd) {
    var scan0 = captureSodaMyPageAdOcrItems();
    if (scan0) hasAd = sodaMyPageModalAdPresentInOcrItems(scan0.items, scan0.w, scan0.h);
  }
  if (!hasAd) return true;
  appendLog("关闭广告");
  for (var ai = 0; ai < 3 && !__scriptUserStop; ai++) {
    var clicked = clickSodaMyPageAdCloseByOcr();
    if (clicked === true) sleepCtrl(650);
    if (!sodaMyPageModalAdStillPresentQuick()) {
      if (clicked === true) appendLog("广告已关闭");
      return true;
    }
    sleepCtrl(380);
  }
  if (!sodaMyPageModalAdStillPresentQuick()) return true;
  appendLog("弹窗广告未能关闭，继续");
  return true;
}

/** 汽水「我」页：弹窗广告仅无障碍快检，无弹窗则跳过 OCR */
function dismissSodaMyPageAdIfAnyQuick() {
  try {
    if (!detectSodaMyPageModalAdLikelyByA11y()) return true;
  } catch (e0) {
    return true;
  }
  return dismissSodaMyPageAdIfAny();
}

function getNicknameFromSodaMePageFast() {
  function pickNickText(n) {
    if (!n) return null;
    try {
      var t = n.text ? n.text() : "";
      if (!t && n.desc) t = n.desc();
      t = t ? String(t).trim() : "";
      if (!t || t.length > 32) return null;
      if (/^\d+(?:\.\d+)?(?:万|亿|w|W)?$/.test(t)) return null;
      if (/^(编辑资料|编辑主页|添加朋友|关注|粉丝|获赞|作品|私密|直播|听歌|歌单|我的|首页|推荐|搜索|领时长)$/.test(t)) return null;
      return t;
    } catch (e0) {
      return null;
    }
  }
  try {
    var node =
      id(SODA_ME_NICKNAME_ALT_ID).packageName(SODA_PKG).findOne(160) ||
      id(SODA_PROFILE_NICKNAME_ID).packageName(SODA_PKG).findOne(160) ||
      id(SODA_ME_NICKNAME_ID).packageName(SODA_PKG).findOne(160);
    if (!node) {
      node =
        idMatches(/.*:id\/glq$/).packageName(SODA_PKG).findOne(100) ||
        idMatches(/.*:id\/glk$/).packageName(SODA_PKG).findOne(100);
    }
    var vId = pickNickText(node);
    if (vId) return vId;
  } catch (eId) {}
  try {
    var layout = id(SODA_PROFILE_NICKNAME_LAYOUT_ID).packageName(SODA_PKG).findOne(100);
    if (layout) {
      var child = layout.findOne(className("android.widget.TextView"), 80);
      var vLay = pickNickText(child);
      if (vLay) return vLay;
    }
  } catch (eLay) {}
  return null;
}

/** 汽水「我」页读粉丝数（快路径：gk-/gk+/gf5、gle/glf/gf-、gl2/gl3，不 OCR） */
function getFansFromSodaMePageFast() {
  var tMain = 160;
  var tAlt = 100;
  try {
    var nGk =
      id(SODA_PROFILE_FANS_COUNT_ID).packageName(SODA_PKG).findOne(tMain) ||
      idMatches(/.*:id\/gk-$/).packageName(SODA_PKG).findOne(tAlt);
    var vGk = fansDisplayFromSodaCountNode(nGk);
    if (vGk) return vGk;
  } catch (eGk) {}
  try {
    var nGle =
      id(SODA_PROFILE_FANS_COUNT_ALT_ID).packageName(SODA_PKG).findOne(tMain) ||
      idMatches(/.*:id\/gle$/).packageName(SODA_PKG).findOne(tAlt);
    var vGle = fansDisplayFromSodaCountNode(nGle);
    if (vGle) return vGle;
  } catch (eGle) {}
  try {
    var layout =
      id(SODA_PROFILE_FANS_LAYOUT_ID).packageName(SODA_PKG).findOne(120) ||
      id(SODA_PROFILE_FANS_LAYOUT_ALT_ID).packageName(SODA_PKG).findOne(100) ||
      idMatches(/.*:id\/gf5$/).packageName(SODA_PKG).findOne(100) ||
      idMatches(/.*:id\/gf-$/).packageName(SODA_PKG).findOne(100);
    var fromLay = sodaProfileFansCountFromStatsLayout(layout);
    if (fromLay != null) return String(fromLay);
  } catch (eLay) {}
  try {
    var nGl2 = id(SODA_ME_FANS_COUNT_ID).packageName(SODA_PKG).findOne(tMain);
    if (!nGl2) nGl2 = idMatches(/.*:id\/gl2$/).packageName(SODA_PKG).findOne(tAlt);
    var vGl2 = fansDisplayFromSodaCountNode(nGl2);
    if (vGl2) return vGl2;
  } catch (eGl2) {}
  try {
    var labelFans =
      id(SODA_PROFILE_FANS_TAB_ID).packageName(SODA_PKG).findOne(120) ||
      id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(120) ||
      id(SODA_ME_FANS_TAB_ID).packageName(SODA_PKG).findOne(120) ||
      idMatches(/.*:id\/gk\+$/).packageName(SODA_PKG).findOne(90) ||
      idMatches(/.*:id\/glf$/).packageName(SODA_PKG).findOne(90) ||
      idMatches(/.*:id\/gl3$/).packageName(SODA_PKG).findOne(90);
    if (labelFans) {
      var p = labelFans.parent();
      if (p) {
        var fromPar = sodaProfileFansCountFromStatsLayout(p);
        if (fromPar != null) return String(fromPar);
        var cc = p.childCount();
        for (var ci = 0; ci < cc; ci++) {
          var ch = p.child(ci);
          var v = fansDisplayFromSodaCountNode(ch);
          if (v) return v;
        }
      }
    }
  } catch (ePar) {}
  return null;
}

/** 汽水进入「我的」后同步昵称、近期粉丝与今日/昨日增长（与正版「我」页逻辑一致） */
function applySodaMyTabNicknameAndFansAfterEntered() {
  dismissSodaMyPageAdIfAnyQuick();
  sleep(typeof SODA_ME_SYNC_SETTLE_MS === "number" ? SODA_ME_SYNC_SETTLE_MS : 80);
  var nick = null;
  var nickT0 = Date.now();
  while (!nick && Date.now() - nickT0 < 500 && !__scriptUserStop) {
    nick = getNicknameFromSodaMePageFast();
    if (!nick) sleepCtrl(40);
  }
  if (!nick) {
    try {
      nick = getNicknameFromSodaMePage();
    } catch (eNickFull) {
      nick = null;
    }
  }
  var nickChanged = false;
  if (nick) {
    nickChanged = String(__nickname || "") !== String(nick || "");
    __nickname = nick;
    try {
      __stats.put("nickname", nick);
    } catch (eNickSave) {}
    if (nickChanged) appendLogProgress("更新昵称:" + nick);
  }
  var fans = getFansFromSodaMePageFast();
  if (!fans) {
    var fansT0 = Date.now();
    while (!fans && Date.now() - fansT0 < 800 && !__scriptUserStop) {
      fans = getFansFromSodaMePageFast();
      if (!fans) sleepCtrl(40);
    }
  }
  if (!fans) {
    try {
      fans = getFansFromSodaMePage();
    } catch (eFansFull) {
      fans = null;
    }
  }
  if (fans) {
    __fans = fans;
    var fansParsed = parseSodaFansCountRawText(fans);
    var fansInt = fansParsed ? fansParsed.int : fansToInt(fans);
    if (fansInt != null) recomputeGrowth(fansInt);
    try {
      __stats.put("floatDisplayFansStr", fans);
      if (fansInt != null) __stats.put("floatDisplayFansInt", fansInt);
      __stats.put("floatDisplayYesterdayGrowth", __yesterdayGrowth);
      __stats.put("floatDisplayTodayGrowth", __todayGrowth);
      __stats.put("floatDisplayGrowthDay", dateKey(new Date()));
    } catch (eG0) {}
    if (fansDisplayChanged(fans, fansInt)) {
      appendLogProgress("更新近期粉丝:" + fans);
    }
  } else {
    appendLog("未读到粉丝数");
    try {
      if (!__stats.get("floatDisplayFansStr", "")) {
        __fans = "0";
        appendLog("粉丝未读到，按0显示");
      }
    } catch (eF) {
      __fans = "0";
      appendLog("粉丝未读到，按0显示");
    }
  }
  updateFloatInfoAsync();
  appendLogFloatFlushAsync();
}

function updateFloatInfoAsync() {
  if (!__floatInfoWin) return;
  try {
    threads.start(function () {
      try {
        updateFloatInfo();
      } catch (eF) {}
    });
  } catch (eTh) {
    try {
      updateFloatInfo();
    } catch (eF2) {}
  }
}

/** 汽水第3步：底部点「我的」（超时轮询；超时全量重启） */
function clickMyTabForSodaWith25sRestart(allowRecoveryRestart) {
  if (allowRecoveryRestart === undefined) allowRecoveryRestart = true;
  var tappedAtSplash = __sodaMyTabClickedAfterSplash;
  __sodaMyTabClickedAfterSplash = false;
  if (!tappedAtSplash) {
    if (!sodaSplashWaitRecentlyDone()) waitSodaPostSplashHomeReady();
    sleepCtrl(80);
    tapSodaMyTabForEnter(false);
  }
  try {
    threads.start(function () {
      try {
        warmSodaPaddleOcrIfNeeded();
      } catch (eW) {}
    });
  } catch (eW2) {}
  if (waitSodaMyProfileAfterClickMs(SODA_POST_SPLASH_MY_ENTER_MS)) {
    appendLogProgress("已进入我的");
    sleepCtrl(typeof SODA_ME_SYNC_SETTLE_MS === "number" ? SODA_ME_SYNC_SETTLE_MS : 80);
    applySodaMyTabNicknameAndFansAfterEntered();
    return true;
  }
  clickSodaMyTabSingleTry();
  var t0 = Date.now();
  var meMax =
    typeof SODA_CLICK_ME_MAX_MS === "number" && SODA_CLICK_ME_MAX_MS > 0
      ? SODA_CLICK_ME_MAX_MS
      : 6000;
  var fastPhaseMs = 1800;
  var lastRetapMs = t0;
  while (Date.now() - t0 < meMax && !__scriptUserStop) {
    var elapsed = Date.now() - t0;
    if (detectSodaMyProfileLikelyFast()) {
      appendLogProgress("已进入我的");
      sleepCtrl(typeof SODA_ME_SYNC_SETTLE_MS === "number" ? SODA_ME_SYNC_SETTLE_MS : 80);
      applySodaMyTabNicknameAndFansAfterEntered();
      return true;
    }
    if (Date.now() - lastRetapMs >= 450) {
      lastRetapMs = Date.now();
      try {
        tapSodaMyTabForEnter(true);
      } catch (eRt) {}
    }
    if (elapsed > fastPhaseMs) {
      try {
        if (clickSodaMyTabByOcr() && waitSodaMyProfileEntered(1200)) {
          appendLogProgress("已进入我的");
          sleepCtrl(typeof SODA_ME_SYNC_SETTLE_MS === "number" ? SODA_ME_SYNC_SETTLE_MS : 80);
          applySodaMyTabNicknameAndFansAfterEntered();
          return true;
        }
      } catch (eOcr) {}
    }
    sleepCtrl(elapsed <= fastPhaseMs ? 60 : 100);
  }
  appendLog("点我的超过" + Math.floor(meMax / 1000) + "秒");
  if (
    allowRecoveryRestart &&
    !__insideStuckHandler &&
    !__stuckRestartInProgress &&
    __flowEnd >= 3
  ) {
    appendLog("点我的超时，全量重启");
    var reEnd = __flowEnd >= 6 ? __flowEnd : 11;
    return runFlowSteps1Through9ForInjectedRestart(reEnd, false);
  }
  return false;
}

function clickMyTabForSoda() {
  return clickMyTabForSodaWith25sRestart(true);
}

/** 汽水第4步：我页点粉丝 */
function isOcrSodaMePageFansLabel(item, w, h) {
  if (!item) return false;
  if (String(item.text || "").trim() !== "粉丝") return false;
  if (isOcrItemInFloatPanelZone(item, w, h)) return false;
  if (item.cy >= Math.floor(h * 0.72)) return false;
  return (
    item.cy >= Math.floor(h * 0.24) &&
    item.cy <= Math.floor(h * 0.44) &&
    item.cx >= Math.floor(w * 0.48)
  );
}

function detectSodaFansListExpandedLikely() {
  if (sodaHasDouyinFansSectionOnPage()) {
    return detectSodaDouyinFansListExpandedLikely();
  }
  try {
    var title =
      id(SODA_FANS_PAGE_TITLE_ID).packageName(SODA_PKG).findOne(100) ||
      idMatches(/.*:id\/tv_title$/).packageName(SODA_PKG).findOne(80);
    if (title) {
      var chevronState = readSodaFansPageTitleChevronExpanded(title);
      if (chevronState === false) return false;
      if (chevronState === true) return countSodaNativeFansListValidRows(1) >= 1;
    }
  } catch (eChev) {}
  return countSodaNativeFansListValidRows(1) >= 1;
}

function detectSodaFansPageEnteredLikely() {
  if (detectSodaFansListExpandedLikely()) return true;
  try {
    if (id(SODA_FANS_PAGE_TITLE_ID).packageName(SODA_PKG).findOne(80)) return true;
  } catch (e0) {}
  try {
    if (idMatches(/.*:id\/tv_title$/).packageName(SODA_PKG).findOne(70)) return true;
  } catch (e1) {}
  try {
    if (textContains("抖音粉丝").packageName(SODA_PKG).findOne(80)) return true;
  } catch (e2) {}
  try {
    var h = device.height;
    var sw = device.width;
    if (
      textMatches(/.*粉丝.*/)
        .packageName(SODA_PKG)
        .boundsInside(0, Math.floor(h * 0.12), sw, Math.floor(h * 0.32))
        .findOne(80)
    ) {
      return true;
    }
  } catch (e3) {}
  return false;
}

function waitSodaFansPageEntered(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : SODA_FANS_PAGE_ENTER_WAIT_MS;
  var t0 = Date.now();
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    if (detectSodaFansPageEnteredLikely()) return true;
    sleepCtrl(55);
  }
  return detectSodaFansPageEnteredLikely();
}

function waitSodaFansListExpanded(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : SODA_DY_FANS_EXPAND_WAIT_MS;
  var t0 = Date.now();
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    if (detectSodaFansListExpandedLikely()) return true;
    sleepCtrl(70);
  }
  return detectSodaFansListExpandedLikely();
}

function doubleTapAt(x, y, gapMs) {
  var gap = typeof gapMs === "number" && gapMs > 0 ? gapMs : SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS;
  try {
    click(x, y);
  } catch (e0) {
    try {
      press(x, y, 90);
    } catch (e1) {
      return false;
    }
  }
  sleepCtrl(gap);
  try {
    click(x, y);
  } catch (e2) {
    try {
      press(x, y, 90);
    } catch (e3) {
      return false;
    }
  }
  return true;
}

function doubleClickSodaNode(node, gapMs) {
  if (!node) return false;
  try {
    var b = node.bounds();
    return doubleTapAt(b.centerX(), b.centerY(), gapMs);
  } catch (eB) {}
  try {
    if (clickNode(node)) {
      sleepCtrl(typeof gapMs === "number" && gapMs > 0 ? gapMs : SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
      return clickNode(node);
    }
  } catch (eC) {}
  return false;
}

/** 汽水粉丝页可双击区域：优先「抖音粉丝」标题（双区块页勿取顶部汽水粉丝） */
function findSodaFansPageTitleTapNode() {
  try {
    var dyTitle = getSodaDouyinFansTitleNode();
    if (dyTitle) return sodaDouyinFansTitleTapNode(dyTitle);
  } catch (eDy0) {}
  try {
    var title =
      id(SODA_FANS_PAGE_TITLE_ID).packageName(SODA_PKG).findOne(120) ||
      idMatches(/.*:id\/tv_title$/).packageName(SODA_PKG).findOne(90) ||
      textContains("抖音粉丝").packageName(SODA_PKG).findOne(100);
    if (title) {
      try {
        var p = title.parent();
        if (p && p.clickable()) return p;
        var pp = p && p.parent ? p.parent() : null;
        if (pp && pp.clickable()) return pp;
      } catch (eP) {}
      return title;
    }
  } catch (e0) {}
  return null;
}

/** 汽水粉丝页：双击「抖音粉丝」标题展开粉丝列表 */
function expandSodaFansListByDoubleTapTitle() {
  if (sodaHasDouyinFansSectionOnPage()) {
    return expandSodaDouyinFansListByDoubleTapTitle();
  }
  appendSodaActionLog("双击粉丝标题");
  var node = findSodaFansPageTitleTapNode();
  if (node) {
    var chevronState = readSodaFansPageTitleChevronExpanded(node);
    if (chevronState === true && detectSodaFansListExpandedLikely()) {
      appendLogProgress("粉丝列表已展开");
      return true;
    }
  }
  var tapNode = (node && findSodaFansSectionHeaderClickRow(node)) || node;
  if (tapNode && doubleClickSodaNode(tapNode, SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS)) {
    sleepCtrl(150);
    if (waitSodaFansListExpanded(SODA_DY_FANS_EXPAND_WAIT_MS)) {
      appendLogProgress("粉丝列表已展开");
      return true;
    }
  }
  var w = device.width;
  var h = device.height;
  doubleTapAt(Math.floor(w * 0.5), Math.floor(h * 0.205), SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
  sleepCtrl(150);
  if (waitSodaFansListExpanded(SODA_DY_FANS_EXPAND_WAIT_MS)) {
    appendLogProgress("粉丝列表已展开");
    return true;
  }
  appendLog("双击后未出现粉丝列表");
  return false;
}

function sodaFansPageEnteredAndListReady() {
  if (!waitSodaFansPageEntered(SODA_FANS_PAGE_ENTER_WAIT_MS) && !detectSodaFansListExpandedLikely()) return false;
  appendLogProgress("已进入粉丝页");
  if (detectSodaFansListExpandedLikely()) {
    appendLogProgress("粉丝列表已展开");
    sleepCtrl(typeof SODA_FANS_PAGE_SETTLE_MS === "number" ? SODA_FANS_PAGE_SETTLE_MS : 120);
    return true;
  }
  return expandSodaFansListByDoubleTapTitle();
}

/** 从用户粉丝页或用户主页返回到关注列表（换人前） */
function ensureBackToSodaFollowingListFromFansOrProfile() {
  try {
    if (detectSodaFansPageEnteredLikely() && !stillOnSodaUserProfilePageQuick()) {
      try {
        back();
      } catch (eBk0) {}
      sleepCtrl(480);
    }
  } catch (e0) {}
  try {
    if (stillOnSodaUserProfilePageQuick()) {
      try {
        back();
      } catch (eBk1) {}
      sleepCtrl(480);
    }
  } catch (e1) {}
}

/** 汽水用户主页粉丝页：进入后双击 tv_title「抖音粉丝」展开列表 */
function sodaTargetProfileFansPageExpandListReady() {
  if (sodaHasDouyinFansSectionOnPage()) {
    if (detectSodaDouyinFansListExpandedLikely()) {
      appendLog("用户粉丝列表已展开");
      sleepCtrl(400);
      return true;
    }
    return expandSodaDouyinFansListByDoubleTapTitle();
  }
  if (detectSodaFansListExpandedLikely()) {
    appendLog("用户粉丝列表已展开");
    sleepCtrl(400);
    return true;
  }
  appendSodaActionLog("用户粉丝页双击标题");
  var node = findSodaFansPageTitleTapNode();
  if (node && doubleClickSodaNode(node, SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS)) {
    sleepCtrl(520);
    if (waitSodaFansListExpanded(3800)) {
      appendLog("用户粉丝列表已展开");
      return true;
    }
  }
  var w = device.width;
  var h = device.height;
  doubleTapAt(Math.floor(w * 0.5), Math.floor(h * 0.21), SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
  sleepCtrl(520);
  if (waitSodaFansListExpanded(3800)) {
    appendLog("用户粉丝列表已展开");
    return true;
  }
  appendLog("用户粉丝页双击后未出现列表");
  return false;
}

function detectSodaFansListLikely() {
  if (detectSodaFansListExpandedLikely()) return true;
  try {
    if (textContains("我的粉丝").findOne(160)) return true;
  } catch (e0) {}
  try {
    var h = device.height;
    var headerFans = text("粉丝")
      .boundsInside(0, 0, device.width, Math.floor(h * 0.22))
      .findOne(120);
    if (headerFans && !detectSodaMyProfileLikely()) return true;
  } catch (e1) {}
  try {
    var rows = collectSodaFollowerListRowsDeduped();
    if (rows && rows.length > 0) return true;
  } catch (e2) {}
  try {
    var hasFollowTab = !!textMatches(/^关注\s*\d*$/).findOne(80) || !!text("关注").findOne(80);
    var hasFansTab = !!textMatches(/^粉丝\s*\d*$/).findOne(80) || !!text("粉丝").findOne(80);
    if (hasFollowTab && hasFansTab) return true;
  } catch (e3) {}
  return false;
}

function waitSodaFansListEntered(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : 3600;
  var t0 = Date.now();
  var okHits = 0;
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    sleepCtrl(220);
    if (detectSodaFansListLikely()) {
      okHits++;
      if (okHits >= 2) return true;
    } else {
      okHits = 0;
    }
  }
  return false;
}

function pressSodaFansTabNode(node) {
  if (!node) return false;
  try {
    if (clickNode(node)) return true;
  } catch (e0) {}
  try {
    var b = node.bounds();
    click(b.centerX(), b.centerY());
    return true;
  } catch (e1) {}
  try {
    var p = node.parent ? node.parent() : null;
    if (p && clickNode(p)) return true;
    if (p) {
      var bp = p.bounds();
      click(bp.centerX(), bp.centerY());
      return true;
    }
  } catch (e2) {}
  return false;
}

function clickSodaFansTabById() {
  var node = null;
  try {
    node = id(SODA_ME_FANS_TAB_ID).packageName(SODA_PKG).findOne(140);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/gl3$/).packageName(SODA_PKG).findOne(100);
    } catch (e1) {}
  }
  if (!node) {
    try {
      var list = text("粉丝").packageName(SODA_PKG).find();
      if (list && list.size) {
        var w = device.width;
        var h = device.height;
        var best = null;
        var bestScore = -1e9;
        for (var i = 0; i < list.size(); i++) {
          var n = list.get(i);
          try {
            var b = n.bounds();
            var cy = b.centerY();
            if (cy < Math.floor(h * 0.18) || cy > Math.floor(h * 0.62)) continue;
            var score = cy;
            if (b.centerX() >= Math.floor(w * 0.45)) score += 1000;
            if (score > bestScore) {
              bestScore = score;
              best = n;
            }
          } catch (eB) {}
        }
        node = best;
      }
    } catch (e2) {}
  }
  return pressSodaFansTabNode(node);
}

/**
 * OCR 点击汽水「我」页统计条「粉丝」（无 id / 点不到时）。
 * @returns {boolean}
 */
function clickSodaFansTabByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  appendSodaActionLog("O点粉丝");
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.12);
    var cropH = Math.max(100, Math.floor(h * 0.48) - cropTop);
    var cropLeft = Math.floor(w * 0.12);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft - Math.floor(w * 0.06), cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return false;
    var picked = null;
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      var tGlue = items[ji].text;
      var mGlue = tGlue.match(/^(\d+(?:\.\d+)?(?:万|亿)?)粉丝$/);
      if (mGlue && isOcrSodaMePageFansLabel({ text: "粉丝", cx: items[ji].cx, cy: items[ji].cy, left: items[ji].left, top: items[ji].top }, w, h)) {
        picked = items[ji];
        break;
      }
      if (isOcrSodaMePageFansLabel(items[ji], w, h)) {
        if (!picked || items[ji].cx > picked.cx) picked = items[ji];
      }
    }
    if (!picked) return false;
    var tapX = picked.cx;
    var tapY = picked.cy;
    var fansCx = picked.cx;
    var fansCy = picked.cy;
    var frL = picked.left;
    var frR = picked.right;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var ni;
    for (ni = 0; ni < items.length; ni++) {
      var nt = items[ni].text;
      if (!nt || nt === "粉丝" || nt === "关注" || nt === "获赞") continue;
      if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
      var nr = items[ni];
      var isAbove = nr.cy < fansCy - 4 && nr.bottom <= fansCy + 8 && Math.abs(nr.cx - fansCx) <= Math.floor(w * 0.12);
      if (isAbove) {
        tapY = Math.floor((nr.cy + fansCy) / 2);
      }
      var isLeft = nr.right <= frR + 10 && nr.cx < fansCx && Math.abs(nr.cy - fansCy) <= rowTol;
      if (isLeft) {
        tapX = Math.floor((nr.left + frR) / 2);
      }
    }
    tapX = Math.max(8, Math.min(w - 8, tapX));
    tapY = Math.max(8, Math.min(h - 8, tapY));
    try {
      click(tapX, tapY);
    } catch (eC0) {
      try {
        press(tapX, tapY, 90);
      } catch (eC1) {
        return false;
      }
    }
    return true;
  } catch (eTap) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

function isOcrSodaMePageFollowLabel(item, w, h) {
  if (!item) return false;
  if (String(item.text || "").trim() !== "关注") return false;
  if (isOcrItemInFloatPanelZone(item, w, h)) return false;
  if (item.cy >= Math.floor(h * 0.72)) return false;
  return (
    item.cy >= Math.floor(h * 0.18) &&
    item.cy <= Math.floor(h * 0.58) &&
    item.cx >= Math.floor(w * 0.22) &&
    item.cx <= Math.floor(w * 0.58)
  );
}

function clickSodaFollowTabById() {
  var node = null;
  try {
    node = id(SODA_ME_FOLLOW_TAB_ID).findOne(650);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/gk_$/).findOne(450);
    } catch (e1) {}
  }
  if (!node) {
    try {
      var list = text("关注").packageName(SODA_PKG).find();
      if (list && list.size) {
        var w = device.width;
        var h = device.height;
        var best = null;
        var bestScore = -1e9;
        for (var i = 0; i < list.size(); i++) {
          var n = list.get(i);
          try {
            var b = n.bounds();
            var cy = b.centerY();
            if (cy < Math.floor(h * 0.18) || cy > Math.floor(h * 0.62)) continue;
            var score = -b.centerX();
            if (b.centerX() <= Math.floor(w * 0.55)) score += 10000;
            if (score > bestScore) {
              bestScore = score;
              best = n;
            }
          } catch (eB) {}
        }
        node = best;
      }
    } catch (e2) {}
  }
  return pressSodaFansTabNode(node);
}

/**
 * OCR 点击汽水「我」页统计条「关注」（无 id / 点不到时）。
 * @returns {boolean}
 */
function clickSodaFollowTabByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  appendSodaActionLog("O点关注");
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.12);
    var cropH = Math.max(100, Math.floor(h * 0.48) - cropTop);
    var cropLeft = Math.floor(w * 0.12);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft - Math.floor(w * 0.06), cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return false;
    var picked = null;
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      var tGlue = items[ji].text;
      var mGlue = tGlue.match(/^(\d+(?:\.\d+)?(?:万|亿)?)关注$/);
      if (mGlue && isOcrSodaMePageFollowLabel({ text: "关注", cx: items[ji].cx, cy: items[ji].cy, left: items[ji].left, top: items[ji].top }, w, h)) {
        picked = items[ji];
        break;
      }
      if (isOcrSodaMePageFollowLabel(items[ji], w, h)) {
        if (!picked || items[ji].cx < picked.cx) picked = items[ji];
      }
    }
    if (!picked) return false;
    var tapX = picked.cx;
    var tapY = picked.cy;
    var followCx = picked.cx;
    var followCy = picked.cy;
    var frL = picked.left;
    var frR = picked.right;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var ni;
    for (ni = 0; ni < items.length; ni++) {
      var nt = items[ni].text;
      if (!nt || nt === "关注" || nt === "粉丝" || nt === "获赞") continue;
      if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
      var nr = items[ni];
      var isAbove = nr.cy < followCy - 4 && nr.bottom <= followCy + 8 && Math.abs(nr.cx - followCx) <= Math.floor(w * 0.12);
      if (isAbove) {
        tapY = Math.floor((nr.cy + followCy) / 2);
      }
      var isLeft = nr.right <= frR + 10 && nr.cx < followCx && Math.abs(nr.cy - followCy) <= rowTol;
      if (isLeft) {
        tapX = Math.floor((nr.left + frR) / 2);
      }
    }
    tapX = Math.max(8, Math.min(w - 8, tapX));
    tapY = Math.max(8, Math.min(h - 8, tapY));
    try {
      click(tapX, tapY);
    } catch (eC0) {
      try {
        press(tapX, tapY, 90);
      } catch (eC1) {
        return false;
      }
    }
    return true;
  } catch (eTap) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

function detectSodaFollowingPageEnteredLikely() {
  if (detectSodaFollowingListExpandedLikely()) return true;
  try {
    if (getSodaDouyinFollowingTitleNode()) return true;
  } catch (e0) {}
  try {
    if (textContains("抖音关注").packageName(SODA_PKG).findOne(200)) return true;
  } catch (e1) {}
  return false;
}

function waitSodaFollowingPageEntered(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : 3600;
  var t0 = Date.now();
  var okHits = 0;
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    sleepCtrl(220);
    if (detectSodaFollowingPageEnteredLikely()) {
      okHits++;
      if (okHits >= 2) return true;
    } else {
      okHits = 0;
    }
  }
  return false;
}

/** 是否为「抖音关注」标题（排除汽水关注/纯关注） */
function isSodaDouyinFollowingTitleText(tt) {
  if (!tt) return false;
  return String(tt).trim().indexOf("抖音关注") >= 0;
}

/** 当前屏查找 tv_title「抖音关注」（不滑动；多标题时取最靠下的一条） */
function getSodaDouyinFollowingTitleNode() {
  var best = null;
  var bestCy = -1;
  function considerNode(n) {
    if (!n) return;
    var tt = "";
    try {
      tt = String(n.text() || "");
    } catch (eT) {}
    if (!isSodaDouyinFollowingTitleText(tt)) return;
    try {
      var cy = n.bounds().centerY();
      if (cy > bestCy) {
        bestCy = cy;
        best = n;
      }
    } catch (eB) {
      if (!best) best = n;
    }
  }
  try {
    var coll = id(SODA_FANS_PAGE_TITLE_ID).packageName(SODA_PKG).find();
    if (!coll || !coll.size) {
      coll = idMatches(/.*:id\/tv_title$/).packageName(SODA_PKG).find();
    }
    if (coll && coll.size) {
      for (var i = 0; i < coll.size(); i++) {
        considerNode(coll.get(i));
      }
    }
  } catch (e0) {}
  if (best) return best;
  try {
    var h = device.height;
    var sw = device.width;
    var byTextColl = textContains("抖音关注")
      .packageName(SODA_PKG)
      .boundsInside(0, Math.floor(h * 0.12), sw, h - 8)
      .find();
    if (byTextColl && byTextColl.size) {
      for (var j = 0; j < byTextColl.size(); j++) {
        considerNode(byTextColl.get(j));
      }
    }
  } catch (e1) {}
  return best;
}

function getSodaFollowingPageTitleTextNode() {
  return getSodaDouyinFollowingTitleNode();
}

function detectSodaFollowingPageTitleVisible() {
  try {
    return !!getSodaDouyinFollowingTitleNode();
  } catch (e0) {}
  return false;
}

/** 关注页下滑以露出下方「抖音关注」区块（先点「加载更多」若有） */
function scrollSodaFollowingPageDown() {
  clickSodaFansListLoadMoreIfVisible(160);
  var w = device.width;
  var h = device.height;
  try {
    swipe(Math.floor(w * 0.5), Math.floor(h * 0.72), Math.floor(w * 0.5), Math.floor(h * 0.36), 430);
    return true;
  } catch (e0) {
    return false;
  }
}

/** 查找「抖音关注」标题：当前屏没有则下滑，最多 maxScrollDown 次 */
function findSodaDouyinFollowingTitleNode(maxScrollDown) {
  maxScrollDown = maxScrollDown == null ? 3 : maxScrollDown;
  for (var pass = 0; pass <= maxScrollDown && !__scriptUserStop; pass++) {
    if (clickSodaFansListLoadMoreIfVisible(120)) sleepCtrl(200);
    var node = getSodaDouyinFollowingTitleNode();
    if (node) return node;
    if (pass >= maxScrollDown) break;
    appendLog("下滑查找抖音关注");
    scrollSodaFollowingPageDown();
    sleepCtrl(520);
  }
  return null;
}

/** 抖音关注列表有效行起始 Y（标题下方，避免点到汽水关注行） */
function sodaDouyinFollowingListYMin() {
  var band = followerListYBand();
  var yMin = band.yMin;
  try {
    var title = getSodaDouyinFollowingTitleNode();
    if (title) {
      var tb = title.bounds();
      yMin = Math.max(yMin, tb.bottom + 8);
    }
  } catch (eB) {}
  return yMin;
}

function collectSodaDouyinFollowingListRowsStrict() {
  var band = followerListYBand();
  var yMin = sodaDouyinFollowingListYMin();
  var raw = [];
  var sw = device.width;
  try {
    var nickColl = findSodaFansListNickNodesInBounds(yMin, band.yMax);
    if (nickColl && nickColl.size) {
      for (var i = 0; i < nickColl.size(); i++) {
        var tv = nickColl.get(i);
        try {
          var tb = tv.bounds();
          if (tb.centerY() < yMin || tb.centerY() > band.yMax) continue;
          var t = String(tv.text() || "").trim();
          if (!t || t.length > 48) continue;
          if (/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音关注)$/.test(t)) continue;
          var row = tv.parent();
          if (row) raw.push(row);
          else raw.push(tv);
        } catch (eTv) {}
      }
    }
  } catch (e0) {}
  if (raw.length === 0) return [];
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

function detectSodaDouyinFollowingListExpandedLikely() {
  if (!getSodaDouyinFollowingTitleNode()) return false;
  if (detectSodaDouyinFollowingListExpandedFast()) return true;
  try {
    var rows = collectSodaDouyinFollowingListRowsStrict();
    if (rows && rows.length >= 1) return true;
  } catch (e0) {}
  var yMin = sodaDouyinFollowingListYMin();
  var band = followerListYBand();
  try {
    var k3coll = findSodaFansListRowNodesInBounds(yMin, band.yMax, false);
    if (k3coll && k3coll.size) {
      for (var ki = 0; ki < k3coll.size(); ki++) {
        var row = k3coll.get(ki);
        try {
          var rb = row.bounds();
          if (rb.centerY() >= yMin && rb.centerY() <= band.yMax) return true;
        } catch (eRb) {}
      }
    }
  } catch (e1) {}
  return false;
}

/** 汽水抖音关注列表已展开（快路径：首行 findOne，不整树 collect） */
function detectSodaDouyinFollowingListExpandedFast() {
  try {
    if (!getSodaDouyinFollowingTitleNode()) return false;
  } catch (e0) {
    return false;
  }
  var band = followerListYBand();
  var yMin = sodaDouyinFollowingListYMin();
  var findMs = typeof SODA_STEP7_ROW_FINDONE_MS === "number" ? SODA_STEP7_ROW_FINDONE_MS : 35;
  try {
    var row = findOneSodaFansListRowInBounds(yMin, yMin + sodaNativeFanListRowHeightPx() + 10, findMs);
    if (row && isSodaFollowingListNodeVisibleOnScreen(row)) return true;
  } catch (e1) {}
  try {
    var nick = findOneSodaFansListNickInBounds(yMin, band.yMax, findMs);
    if (nick) {
      var t = String(nick.text() || "").trim();
      if (t && t.length <= 48 && !/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音关注)$/.test(t)) {
        return true;
      }
    }
  } catch (e2) {}
  return false;
}

/** 是否为「抖音粉丝」标题（排除上方汽水粉丝区） */
function isSodaDouyinFansTitleText(tt) {
  if (!tt) return false;
  return String(tt).trim().indexOf("抖音粉丝") >= 0;
}

/** 标题行右侧 eud 箭头：true=已展开(向上)，false=折叠(向下)，null=未读到 */
function readSodaFansChevronExpandedState(chevronNode) {
  if (!chevronNode) return null;
  try {
    var txt = String(chevronNode.text() || "").trim();
    var desc = String(chevronNode.desc() || "").trim();
    var combined = txt + desc;
    // Material Icons: expand_less(向上) / expand_more(向下)
    if (txt.indexOf("\uE5CE") >= 0 || /expand_less|收起|向上|已展开/i.test(combined)) return true;
    if (txt.indexOf("\uE5CF") >= 0 || /expand_more|展开|向下|折叠/i.test(combined)) return false;
    if (/^[\^︿∧⌃▲△↑]$/.test(txt)) return true;
    if (/^[vV∨︾⌄▼▽↓]$/.test(txt)) return false;
    if (/[\u2227\u005E\u25B2\u25B4\u1403]/.test(txt) && !/[\u2228\u25BC\u25BE\u1401]/.test(txt)) return true;
    if (/[\u2228\u0056\u25BC\u25BE\u1401]/.test(txt)) return false;
  } catch (e0) {}
  return null;
}

/** 取与 tv_title 同一行的 eud 箭头（双区块页各区块各有一个 eud） */
function findSodaFansSectionChevronForTitle(titleNode) {
  if (!titleNode) return null;
  try {
    var tb = titleNode.bounds();
    var rowTop = tb.top - 14;
    var rowBot = tb.bottom + 14;
    var sw = device.width;
    var coll =
      id(SODA_FANS_SECTION_CHEVRON_ID)
        .packageName(SODA_PKG)
        .boundsInside(Math.floor(sw * 0.55), rowTop, sw, rowBot + 8)
        .find() ||
      idMatches(/.*:id\/eud$/).packageName(SODA_PKG).boundsInside(Math.floor(sw * 0.55), rowTop, sw, rowBot + 8).find();
    if (coll && coll.size) {
      var best = null;
      var bestDy = 1e9;
      for (var i = 0; i < coll.size(); i++) {
        var c = coll.get(i);
        try {
          var cb = c.bounds();
          var dy = Math.abs(cb.centerY() - tb.centerY());
          if (dy < bestDy) {
            bestDy = dy;
            best = c;
          }
        } catch (eB) {}
      }
      if (best && bestDy <= Math.max(40, Math.floor(device.height * 0.032))) return best;
    }
    var cur = titleNode.parent();
    for (var d = 0; d < 8 && cur; d++) {
      try {
        var c2 = cur.findOne(id(SODA_FANS_SECTION_CHEVRON_ID));
        if (c2) return c2;
        c2 = cur.findOne(idMatches(/.*:id\/eud$/));
        if (c2) return c2;
      } catch (eP) {}
      try {
        cur = cur.parent();
      } catch (eUp) {
        cur = null;
      }
    }
  } catch (e0) {}
  return null;
}

function readSodaDouyinFansSectionChevronExpanded() {
  var title = getSodaDouyinFansTitleNode();
  if (!title) return null;
  return readSodaFansChevronExpandedState(findSodaFansSectionChevronForTitle(title));
}

function readSodaFansPageTitleChevronExpanded(titleNode) {
  if (!titleNode) return null;
  return readSodaFansChevronExpandedState(findSodaFansSectionChevronForTitle(titleNode));
}

/** 抖音粉丝区标题行可点容器（宽 FrameLayout，含 tv_title + eud） */
function findSodaFansSectionHeaderClickRow(titleNode) {
  var title = titleNode || getSodaDouyinFansTitleNode();
  if (!title) return null;
  try {
    var cur = title;
    var sw = device.width;
    var sh = device.height;
    for (var d = 0; d < 10 && cur; d++) {
      try {
        if (cur.clickable && cur.clickable()) {
          var b = cur.bounds();
          if (b.width() >= Math.floor(sw * 0.55) && b.height() >= 36 && b.height() <= Math.floor(sh * 0.14)) {
            return cur;
          }
        }
      } catch (eC) {}
      try {
        cur = cur.parent();
      } catch (eUp) {
        cur = null;
      }
    }
  } catch (e0) {}
  return null;
}

/** 当前屏查找 tv_title「抖音粉丝」（多标题时取最靠下的一条） */
function getSodaDouyinFansTitleNode() {
  var best = null;
  var bestCy = -1;
  function considerNode(n) {
    if (!n) return;
    var tt = "";
    try {
      tt = String(n.text() || "");
    } catch (eT) {}
    if (!isSodaDouyinFansTitleText(tt)) return;
    try {
      var cy = n.bounds().centerY();
      if (cy > bestCy) {
        bestCy = cy;
        best = n;
      }
    } catch (eB) {
      if (!best) best = n;
    }
  }
  try {
    var coll = id(SODA_FANS_PAGE_TITLE_ID).packageName(SODA_PKG).find();
    if (!coll || !coll.size) {
      coll = idMatches(/.*:id\/tv_title$/).packageName(SODA_PKG).find();
    }
    if (coll && coll.size) {
      for (var i = 0; i < coll.size(); i++) {
        considerNode(coll.get(i));
      }
    }
  } catch (e0) {}
  if (best) return best;
  try {
    var h = device.height;
    var sw = device.width;
    var byTextColl = textContains("抖音粉丝")
      .packageName(SODA_PKG)
      .boundsInside(0, Math.floor(h * 0.12), sw, h - 8)
      .find();
    if (byTextColl && byTextColl.size) {
      for (var j = 0; j < byTextColl.size(); j++) {
        considerNode(byTextColl.get(j));
      }
    }
  } catch (e1) {}
  return best;
}

/** 用户粉丝页是否含「汽水粉丝 + 抖音粉丝」双区块（勿把上方汽水粉丝行当目标列表） */
function sodaHasDouyinFansSectionOnPage() {
  if (__sodaStep11FastEnter) {
    try {
      return !!textContains("抖音粉丝").packageName(SODA_PKG).findOne(30);
    } catch (eFast) {}
    return false;
  }
  if (getSodaDouyinFansTitleNode()) return true;
  try {
    if (textContains("抖音粉丝").packageName(SODA_PKG).findOne(250)) return true;
  } catch (e0) {}
  try {
    if (textContains("没有更多了").packageName(SODA_PKG).findOne(200)) return true;
  } catch (e1) {}
  return false;
}

/** 用户粉丝页下滑以露出下方「抖音粉丝」区块 */
function scrollSodaTargetProfileFansPageDown() {
  return scrollSodaFollowerListDown();
}

/** 查找「抖音粉丝」标题：当前屏没有则下滑，最多 maxScrollDown 次 */
function findSodaDouyinFansTitleNode(maxScrollDown) {
  maxScrollDown = maxScrollDown == null ? 5 : maxScrollDown;
  for (var pass = 0; pass <= maxScrollDown && !__scriptUserStop; pass++) {
    var node = getSodaDouyinFansTitleNode();
    if (node) return node;
    if (pass >= maxScrollDown) break;
    appendLog("下滑查找抖音粉丝");
    scrollSodaTargetProfileFansPageDown();
    sleepCtrl(520);
  }
  return null;
}

/** 抖音粉丝列表有效行起始 Y（标题下方；首行 k3o 常与标题略重叠，勿用 bottom+8 过严） */
function sodaDouyinFansListYMin() {
  var band = sodaFollowerListYBand();
  var yMin = band.yMin;
  var sh = device.height;
  try {
    var title = getSodaDouyinFansTitleNode();
    if (title) {
      var tb = title.bounds();
      yMin = Math.max(yMin, tb.bottom - Math.floor(sh * 0.045));
    }
  } catch (eB) {}
  return yMin;
}

function isValidSodaDouyinFansListRowNode(n) {
  if (!n) return false;
  try {
    var b = n.bounds();
    var sh = device.height;
    var sw = device.width;
    var band = sodaFollowerListYBand();
    var yMin = sodaDouyinFansListYMin();
    if (b.centerY() < yMin - 4 || b.centerY() > band.yMax) return false;
    if (b.height() < Math.max(72, Math.floor(sh * 0.042))) return false;
    if (b.width() < sw * 0.32) return false;
    return sodaFollowerRowHasNickname(n);
  } catch (e) {
    return false;
  }
}

function collectSodaDouyinFansListRowsStrict() {
  var band = sodaFollowerListYBand();
  var yMin = sodaDouyinFansListYMin();
  var raw = [];
  var sw = device.width;
  try {
    var rowColl = findSodaFansListRowNodesInBounds(yMin, band.yMax, true);
    if (rowColl && rowColl.size) {
      for (var k = 0; k < rowColl.size(); k++) {
        var rowN = rowColl.get(k);
        try {
          var rb = rowN.bounds();
          if (rb.centerY() < yMin || rb.centerY() > band.yMax) continue;
          if (!isValidSodaDouyinFansListRowNode(rowN)) continue;
          raw.push(rowN);
        } catch (eR) {}
      }
    }
  } catch (eK) {}
  if (raw.length === 0) {
    try {
      var nickColl = findSodaFansListNickNodesInBounds(yMin, band.yMax);
      if (nickColl && nickColl.size) {
        for (var ni = 0; ni < nickColl.size(); ni++) {
          var tv = nickColl.get(ni);
          try {
            var tb = tv.bounds();
            if (tb.centerY() < yMin || tb.centerY() > band.yMax) continue;
            var t = String(tv.text() || "").trim();
            if (!t || t.length > 48) continue;
            if (/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音粉丝|回关)$/.test(t)) continue;
            var rowP = resolveSodaFollowerListClickRow(tv.parent());
            if (rowP && isValidSodaDouyinFansListRowNode(rowP)) raw.push(rowP);
          } catch (eTv) {}
        }
      }
    } catch (eNick) {}
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

function detectSodaDouyinFansListHasVisibleRows() {
  var yMin = sodaDouyinFansListYMin();
  var band = sodaFollowerListYBand();
  var sw = device.width;
  try {
    var followBack = text("回关")
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(sw * 0.55), yMin, sw, band.yMax)
      .findOne(80);
    if (followBack) return true;
  } catch (eFb) {}
  try {
    var k3coll = findSodaFansListRowNodesInBounds(yMin, band.yMax, false);
    if (k3coll && k3coll.size) {
      for (var ki = 0; ki < k3coll.size(); ki++) {
        var row = k3coll.get(ki);
        try {
          var rb = row.bounds();
          if (rb.centerY() >= yMin && rb.centerY() <= band.yMax && isValidSodaDouyinFansListRowNode(row)) {
            return true;
          }
        } catch (eRb) {}
      }
    }
  } catch (e1) {}
  try {
    var nickColl = findSodaFansListNickNodesInBounds(yMin, band.yMax);
    if (nickColl && nickColl.size) {
      for (var ni = 0; ni < nickColl.size(); ni++) {
        var tv = nickColl.get(ni);
        try {
          var tb = tv.bounds();
          if (tb.centerY() < yMin || tb.centerY() > band.yMax) continue;
          var t = String(tv.text() || "").trim();
          if (!t || t.length > 48) continue;
          if (/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音粉丝|回关)$/.test(t)) continue;
          var rowResolved = resolveSodaFollowerListClickRow(tv.parent());
          if (rowResolved && isValidSodaDouyinFansListRowNode(rowResolved)) return true;
        } catch (eTv) {}
      }
    }
  } catch (eNickFast) {}
  return false;
}

function detectSodaDouyinFansListExpandedLikely() {
  if (!getSodaDouyinFansTitleNode() && !textContains("抖音粉丝").packageName(SODA_PKG).findOne(80)) {
    return false;
  }
  var chevronState = readSodaDouyinFansSectionChevronExpanded();
  if (chevronState === false) return false;
  if (chevronState === true) return true;
  return detectSodaDouyinFansListHasVisibleRows();
}

function waitSodaDouyinFansListExpanded(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : 4000;
  var t0 = Date.now();
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    if (detectSodaDouyinFansListExpandedLikely()) return true;
    sleepCtrl(120);
  }
  return detectSodaDouyinFansListExpandedLikely();
}

function sodaDouyinFansTitleTapNode(titleNode) {
  var row = findSodaFansSectionHeaderClickRow(titleNode);
  if (row) return row;
  var title = titleNode || getSodaDouyinFansTitleNode();
  if (!title) return null;
  try {
    var p = title.parent();
    if (p && p.clickable()) return p;
    var pp = p && p.parent ? p.parent() : null;
    if (pp && pp.clickable()) return pp;
  } catch (eP) {}
  return title;
}

/** 用户粉丝页：下滑查找并双击「抖音粉丝」展开列表（不点上方汽水粉丝） */
function expandSodaDouyinFansListByDoubleTapTitle() {
  if (readSodaDouyinFansSectionChevronExpanded() !== false && detectSodaDouyinFansListExpandedLikely()) {
    appendLogProgress("抖音粉丝列表已展开");
    return true;
  }
  appendSodaActionLog("打开抖音粉丝");
  var titleNode = findSodaDouyinFansTitleNode(5);
  if (!titleNode) {
    appendLog("未找到抖音粉丝");
    return false;
  }
  sleepCtrl(80);
  titleNode = getSodaDouyinFansTitleNode() || titleNode;
  var tapNode = findSodaFansSectionHeaderClickRow(titleNode) || sodaDouyinFansTitleTapNode(titleNode);
  var tapped = false;
  if (tapNode) tapped = doubleClickSodaNode(tapNode, SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
  if (!tapped) {
    try {
      var b = titleNode.bounds();
      doubleTapAt(b.centerX(), b.centerY(), SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
      tapped = true;
    } catch (eTap) {
      var w = device.width;
      var h = device.height;
      doubleTapAt(Math.floor(w * 0.5), Math.floor(h * 0.62), SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
      tapped = true;
    }
  }
  if (!tapped) {
    appendLog("双击后未出现抖音粉丝列表");
    return false;
  }
  sleepCtrl(150);
  var expandWait =
    typeof SODA_DY_FANS_EXPAND_WAIT_MS === "number" && SODA_DY_FANS_EXPAND_WAIT_MS > 0
      ? SODA_DY_FANS_EXPAND_WAIT_MS
      : 1000;
  if (waitSodaDouyinFansListExpanded(expandWait) || detectSodaDouyinFansListExpandedLikely()) {
    appendLogProgress("抖音粉丝列表已展开");
    return true;
  }
  appendLog("双击后未出现抖音粉丝列表");
  return false;
}

function detectSodaFollowingListExpandedLikely() {
  return detectSodaDouyinFollowingListExpandedLikely();
}

function waitSodaFollowingListExpanded(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : 4000;
  var t0 = Date.now();
  var okHits = 0;
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    sleepCtrl(220);
    if (detectSodaFollowingListExpandedLikely()) {
      okHits++;
      if (okHits >= 2) return true;
    } else {
      okHits = 0;
    }
  }
  return false;
}

/** 汽水「抖音关注」tv_title 双击坐标（偏左点文字，勿点整行宽父容器中心） */
function sodaDouyinFollowingTitleTapCoords(titleNode) {
  var title = titleNode;
  if (!title) title = getSodaDouyinFollowingTitleNode();
  var w = device.width;
  var h = device.height;
  if (!title) {
    return { x: Math.floor(w * 0.17), y: Math.floor(h * 0.93) };
  }
  try {
    var b = title.bounds();
    var tapX = Math.min(b.right - 6, Math.max(b.left + 8, b.left + Math.floor(b.width() * 0.38)));
    var tapY = Math.floor((b.top + b.bottom) / 2);
    tapX = Math.max(8, Math.min(w - 8, tapX));
    tapY = Math.max(8, Math.min(h - 8, tapY));
    return { x: tapX, y: tapY };
  } catch (eB) {}
  return { x: Math.floor(w * 0.17), y: Math.floor(h * 0.93) };
}

function sodaFollowingTitleDoubleTapPoint(titleNode) {
  return sodaDouyinFollowingTitleTapCoords(titleNode);
}

function doubleTapSodaDouyinFollowingTitle(titleNode) {
  var pt = sodaDouyinFollowingTitleTapCoords(titleNode);
  return doubleTapAt(pt.x, pt.y, SODA_FOLLOWING_TITLE_DOUBLE_TAP_GAP_MS);
}

function findSodaDouyinFollowingTitleTapNode(titleNode) {
  return titleNode || getSodaDouyinFollowingTitleNode();
}

function findSodaFollowingPageTitleTapNode() {
  return findSodaDouyinFollowingTitleTapNode(null);
}

/** OCR 双击汽水关注页「抖音关注」标题（无 id 时兜底） */
function doubleTapSodaFollowingTitleByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  appendSodaActionLog("O双击抖音关注");
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.55);
    var cropH = Math.max(100, Math.floor(h * 0.38));
    var cropLeft = Math.floor(w * 0.04);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft - Math.floor(w * 0.06), cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var picked = null;
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || txt.indexOf("抖音关注") < 0) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      if (!picked || item.cy > picked.cy) picked = item;
    }
    if (!picked) return false;
    var ocrTapX = Math.max(8, picked.cx - Math.floor(w * 0.06));
    doubleTapAt(ocrTapX, picked.cy, SODA_FOLLOWING_TITLE_DOUBLE_TAP_GAP_MS);
    return true;
  } catch (eOcr) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

/** 汽水关注页：查找并双击「抖音关注」展开抖音关注列表（非汽水关注） */
function expandSodaFollowingListByDoubleTapTitle() {
  appendLog("查找抖音关注");
  var titleNode = findSodaDouyinFollowingTitleNode(3);
  if (!titleNode) {
    appendLog("未找到抖音关注");
    return false;
  }
  sleepCtrl(300);
  titleNode = getSodaDouyinFollowingTitleNode() || titleNode;
  appendSodaActionLog("双击抖音关注");
  var gap = SODA_FOLLOWING_TITLE_DOUBLE_TAP_GAP_MS;
  var pt = sodaDouyinFollowingTitleTapCoords(titleNode);
  if (doubleTapSodaDouyinFollowingTitle(titleNode)) {
    sleepCtrl(550);
    if (waitSodaFollowingListExpanded(4500)) {
      appendLog("抖音关注列表已展开");
      return true;
    }
  }
  try {
    press(pt.x, pt.y, 95);
    sleepCtrl(gap);
    press(pt.x, pt.y, 95);
  } catch (ePress) {}
  sleepCtrl(550);
  if (waitSodaFollowingListExpanded(4500)) {
    appendLog("抖音关注列表已展开");
    return true;
  }
  if (doubleTapSodaFollowingTitleByOcr()) {
    sleepCtrl(550);
    if (waitSodaFollowingListExpanded(4500)) {
      appendLog("抖音关注列表已展开");
      return true;
    }
  }
  appendLog("双击后未出现抖音关注列表");
  return false;
}

/** 点用户页关注进入后：必须先展开抖音关注列表再执行第7步 */
function ensureSodaFollowingListExpandedAfterFollowTap() {
  if (detectSodaFollowingListExpandedLikely()) {
    appendLog("抖音关注列表已展开");
    sleepCtrl(350);
    return true;
  }
  sleepCtrl(450);
  return expandSodaFollowingListByDoubleTapTitle();
}

/** 汽水第7步：列表已由第6步展开时快确认（无 350ms 固定等待） */
function ensureSodaFollowingListReadyForStep7() {
  if (detectSodaDouyinFollowingListExpandedFast() || detectSodaFollowingListExpandedLikely()) {
    var settle = typeof SODA_STEP7_LIST_SETTLE_MS === "number" ? SODA_STEP7_LIST_SETTLE_MS : 80;
    if (settle > 0) sleepCtrl(settle);
    return true;
  }
  sleepCtrl(120);
  return expandSodaFollowingListByDoubleTapTitle();
}

function sodaFollowingPageEnteredAndListReady() {
  if (!waitSodaFollowingPageEntered(3600) && !detectSodaFollowingPageTitleVisible()) return false;
  appendLog("已进入关注页");
  return ensureSodaFollowingListExpandedAfterFollowTap();
}

/** 汽水第6步：我页点「关注」并双击标题展开列表 */
function clickFollowOnMePageForSoda() {
  dismissSodaMyPageAdIfAny();
  if (detectSodaFollowingPageEnteredLikely() && !detectSodaMyProfileLikely()) {
    if (detectSodaFollowingListExpandedLikely()) {
      appendLog("抖音关注列表已展开");
      sleepCtrl(400);
      return true;
    }
    return expandSodaFollowingListByDoubleTapTitle();
  }
  appendSodaActionLog("点我页关注");
  if (clickSodaFollowTabById() && sodaFollowingPageEnteredAndListReady()) {
    sleepCtrl(600);
    return true;
  }
  try {
    if (clickSodaFollowTabByOcr() && sodaFollowingPageEnteredAndListReady()) {
      sleepCtrl(600);
      return true;
    }
  } catch (eOcr) {}
  try {
    appendSodaActionLog("点我页关注(坐标)");
    click(Math.floor(device.width * 0.46), Math.floor(device.height * 0.31));
    if (sodaFollowingPageEnteredAndListReady()) {
      sleepCtrl(600);
      return true;
    }
  } catch (eCoord) {}
  appendLog("点我页关注失败");
  return false;
}

/** 汽水关注列表行采集（优先 gi8 昵称；allowFanFallback 为 false 时不混用粉丝列表行） */
function collectSodaFollowingListRowsDedupedInner(allowFanFallback) {
  var band = followerListYBand();
  var raw = [];
  var sw = device.width;
  try {
    var nickColl = id(SODA_FOLLOWING_LIST_NICK_ID).packageName(SODA_PKG).find();
    if (!nickColl || !nickColl.size) {
      nickColl = idMatches(/.*:id\/gi8$/).packageName(SODA_PKG).find();
    }
    if (nickColl && nickColl.size) {
      for (var i = 0; i < nickColl.size(); i++) {
        var tv = nickColl.get(i);
        try {
          var tb = tv.bounds();
          if (tb.centerY() < band.yMin || tb.centerY() > band.yMax) continue;
          var t = String(tv.text() || "").trim();
          if (!t || t.length > 48) continue;
          if (/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音关注)$/.test(t)) continue;
          var row = tv.parent();
          if (row) raw.push(row);
          else raw.push(tv);
        } catch (eTv) {}
      }
    }
  } catch (e0) {}
  if (raw.length === 0) {
    try {
      var frameColl = className("android.widget.FrameLayout")
        .packageName(SODA_PKG)
        .boundsInside(Math.floor(sw * 0.04), band.yMin, sw - 8, band.yMax)
        .find();
      if (frameColl && frameColl.size) {
        for (var fi = 0; fi < frameColl.size(); fi++) {
          var fr = frameColl.get(fi);
          try {
            var fb = fr.bounds();
            if (fb.width() < sw * 0.42 || fb.height() < 32) continue;
            raw.push(fr);
          } catch (eFr) {}
        }
      }
    } catch (e1) {}
  }
  if (raw.length === 0) {
    if (allowFanFallback) return collectSodaFollowerListRowsDeduped();
    return [];
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

function collectSodaFollowingListRowsDeduped() {
  return collectSodaFollowingListRowsDedupedInner(true);
}

function collectSodaFollowingListRowsStrict() {
  return collectSodaFollowingListRowsDedupedInner(false);
}

function findSodaFollowingListFirstRowNode() {
  var band = sodaFollowerListYBand();
  var rowYMin = sodaDouyinFollowingListYMin();
  var findMs = typeof SODA_STEP7_ROW_FINDONE_MS === "number" ? SODA_STEP7_ROW_FINDONE_MS : 35;
  try {
    var rowFast = findOneSodaFansListRowInBounds(
      rowYMin,
      rowYMin + sodaNativeFanListRowHeightPx() + 8,
      findMs
    );
    if (rowFast && isSodaFollowingListNodeVisibleOnScreen(rowFast) && sodaFollowerRowHasNickname(rowFast)) {
      return resolveSodaFollowerListClickRow(rowFast) || rowFast;
    }
  } catch (eFast) {}
  try {
    var coll = findSodaFansListRowNodesInBounds(rowYMin - 4, band.yMax, true);
    if (coll && coll.size) {
      var best = null;
      var bestTop = 1e9;
      for (var i = 0; i < coll.size(); i++) {
        var n = coll.get(i);
        try {
          var b = n.bounds();
          if (b.top < rowYMin - 4 || b.centerY() > band.yMax) continue;
          if (!isSodaFollowingListNodeVisibleOnScreen(n)) continue;
          if (!sodaFollowerRowHasNickname(n)) continue;
          if (b.top < bestTop) {
            bestTop = b.top;
            best = n;
          }
        } catch (eB) {}
      }
      if (best) return resolveSodaFollowerListClickRow(best) || best;
    }
  } catch (e0) {}
  try {
    var nickColl = findSodaFansListNickNodesInBounds(rowYMin - 4, band.yMax);
    if (nickColl && nickColl.size) {
      var bestTv = null;
      var bestTvTop = 1e9;
      for (var j = 0; j < nickColl.size(); j++) {
        var tv = nickColl.get(j);
        try {
          var tb = tv.bounds();
          if (tb.top < rowYMin - 4 || tb.centerY() > band.yMax) continue;
          var t = String(tv.text() || "").trim();
          if (!t || t.length > 48 || /^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音关注)$/.test(t)) {
            continue;
          }
          if (tb.top < bestTvTop) {
            bestTvTop = tb.top;
            var rowResolved = resolveSodaFollowerListClickRow(tv.parent());
            bestTv = rowResolved || tv.parent() || tv;
          }
        } catch (eT) {}
      }
      if (bestTv) return bestTv;
    }
  } catch (e1) {}
  var rows = collectSodaDouyinFollowingListRowsStrict();
  if (rows && rows.length) return rows[0];
  return null;
}

/** 汽水第7步：抖音关注列表点首行用户（判断逻辑对齐第9步快路径） */
function clickFirstFollowingInListForSoda() {
  if (__scriptUserStop) return false;
  appendSodaLogBlocking("第7步选关注用户");
  if (!ensureSodaFollowingListReadyForStep7()) return false;
  appendSodaActionLog("抖音关注列表首行");
  var nickB = sodaFollowerRowNicknameBounds();
  var l0 = nickB.l0,
    t0 = nickB.t0,
    r0 = nickB.r0,
    b0 = nickB.b0;
  __followerVisitedNicks = {};
  __lastSodaFollowingVisitKey = "";
  __noWorkLikeEntryDidBack = false;
  var node = findSodaFollowingListFirstRowNode();
  var nickBefore = extractFollowerNicknameFromRow(node, l0, t0, r0, b0);
  var visitKey0 = followerRowVisitKey(node, nickBefore);
  if (node) appendSodaEnterUserLog(nickBefore);
  if (node && tryClickFollowerRowNode(node, l0, t0, r0, b0, "进入：", nickBefore, true)) {
    if (visitKey0) {
      __followerVisitedNicks[visitKey0] = 1;
      __lastSodaFollowingVisitKey = String(visitKey0);
    }
    return true;
  }
  if (waitForSodaProfileEnteredQuick(320)) {
    if (visitKey0) {
      __followerVisitedNicks[visitKey0] = 1;
      __lastSodaFollowingVisitKey = String(visitKey0);
    }
    return true;
  }
  try {
    var bandTap = sodaFollowerListYBand();
    var dyMin = sodaDouyinFollowingListYMin();
    var cxTap = Math.floor(device.width * 0.48);
    var cyTap = dyMin + Math.floor((bandTap.yMax - dyMin) * 0.06);
    var ptTap = nudgeTapAwayFromFloatClose(cxTap, cyTap);
    appendSodaActionLog("抖音关注列表首行(坐标)");
    click(ptTap.x, ptTap.y);
    sleepCtrl(600);
    var confirmMs =
      typeof SODA_STEP7_ENTER_CONFIRM_MS === "number"
        ? SODA_STEP7_ENTER_CONFIRM_MS
        : SODA_STEP9_ENTER_CONFIRM_MS;
    if (waitForSodaProfileEnteredQuick(confirmMs)) {
      if (visitKey0) {
        __followerVisitedNicks[visitKey0] = 1;
        __lastSodaFollowingVisitKey = String(visitKey0);
      }
      return true;
    }
  } catch (eTap) {}
  appendLog("抖音关注列表首行失败");
  return false;
}

function isOcrSodaProfileFansLabel(item, w, h) {
  if (!item) return false;
  if (String(item.text || "").trim() !== "粉丝") return false;
  if (isOcrItemInFloatPanelZone(item, w, h)) return false;
  if (item.cy >= Math.floor(h * 0.72)) return false;
  return (
    item.cy >= Math.floor(h * 0.20) &&
    item.cy <= Math.floor(h * 0.42) &&
    item.cx >= Math.floor(w * 0.48)
  );
}

function stillOnSodaUserProfilePageQuick() {
  try {
    if (
      detectSodaFansPageEnteredLikely() &&
      !id(SODA_PROFILE_FANS_TAB_ID).packageName(SODA_PKG).findOne(80) &&
      !id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(60)
    ) {
      return false;
    }
  } catch (e0) {}
  try {
    if (id(SODA_PROFILE_FANS_TAB_ID).packageName(SODA_PKG).findOne(120)) return true;
    if (id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(100)) return true;
    if (idMatches(/.*:id\/glf$/).packageName(SODA_PKG).findOne(80)) return true;
  } catch (e1) {}
  try {
    if (id(SODA_PROFILE_FANS_COUNT_ID).packageName(SODA_PKG).findOne(120)) return true;
    if (id(SODA_PROFILE_FANS_COUNT_ALT_ID).packageName(SODA_PKG).findOne(100)) return true;
    if (idMatches(/.*:id\/gle$/).packageName(SODA_PKG).findOne(80)) return true;
  } catch (e2) {}
  try {
    if (textContains("抖音关注").packageName(SODA_PKG).findOne(120)) return false;
  } catch (e3) {}
  return false;
}

/** 点用户页粉丝后等待进列表；超时仍停在主页则 back 一次并置 __fansTapNoNavigationReselect */
function waitSodaTargetProfileFansEnterOrTimeout(timeoutMs) {
  var budget = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 3200;
  var t0 = Date.now();
  var okHits = 0;
  while (Date.now() - t0 < budget && !__scriptUserStop) {
    sleepCtrl(280);
    var entered =
      (detectSodaFansPageEnteredLikely() || detectSodaFansListExpandedLikely()) &&
      !stillOnSodaUserProfilePageQuick();
    if (entered) {
      okHits++;
      if (okHits >= 2) return true;
    } else {
      okHits = 0;
    }
  }
  if (stillOnSodaUserProfilePageQuick() || !detectSodaFansPageEnteredLikely()) {
    appendLog("点粉丝无跳页，返回");
    try {
      back();
    } catch (eBk) {}
    sleepCtrl(420);
    __fansTapNoNavigationReselect = true;
    return false;
  }
  return detectSodaFansPageEnteredLikely();
}

function waitSodaTargetProfileFansListAfterTap(maxMs) {
  return waitSodaTargetProfileFansEnterOrTimeout(maxMs);
}

function clickSodaProfileFansTabById() {
  var node = null;
  try {
    node = id(SODA_PROFILE_FANS_TAB_ID).packageName(SODA_PKG).findOne(650);
  } catch (e0) {}
  if (!node) {
    try {
      node = id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(450);
    } catch (e0b) {}
  }
  if (!node) {
    try {
      node = idMatches(/.*:id\/gk\+$/).packageName(SODA_PKG).findOne(450);
    } catch (e1) {}
  }
  if (!node) {
    try {
      node = idMatches(/.*:id\/glf$/).packageName(SODA_PKG).findOne(380);
    } catch (e1b) {}
  }
  if (!node) {
    try {
      node = id(SODA_PROFILE_FANS_LAYOUT_ID).packageName(SODA_PKG).findOne(400);
    } catch (e2) {}
  }
  if (!node) {
    try {
      node = id(SODA_PROFILE_FANS_LAYOUT_ALT_ID).packageName(SODA_PKG).findOne(350);
    } catch (e2b) {}
  }
  if (!node) {
    try {
      node = idMatches(/.*:id\/gf-$/).packageName(SODA_PKG).findOne(280);
    } catch (e2c) {}
  }
  if (!node) {
    try {
      var w = device.width;
      var h = device.height;
      var list = text("粉丝").packageName(SODA_PKG).find();
      if (list && list.size) {
        var best = null;
        var bestScore = -1e9;
        for (var i = 0; i < list.size(); i++) {
          var n = list.get(i);
          try {
            var b = n.bounds();
            var cy = b.centerY();
            if (cy < Math.floor(h * 0.18) || cy > Math.floor(h * 0.45)) continue;
            var score = b.centerX();
            if (b.centerX() >= Math.floor(w * 0.52)) score += 10000;
            if (score > bestScore) {
              bestScore = score;
              best = n;
            }
          } catch (eB) {}
        }
        node = best;
      }
    } catch (e3) {}
  }
  return pressSodaFansTabNode(node);
}

/** OCR 点击汽水用户主页统计条「粉丝」 */
function clickSodaProfileFansTabByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  appendSodaActionLog("O点用户粉丝");
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.14);
    var cropH = Math.max(100, Math.floor(h * 0.32) - cropTop);
    var cropLeft = Math.floor(w * 0.08);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft - Math.floor(w * 0.06), cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return false;
    var picked = null;
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      var tGlue = items[ji].text;
      var mGlue = tGlue.match(/^(\d+(?:\.\d+)?(?:万|亿)?)粉丝$/);
      if (mGlue && isOcrSodaProfileFansLabel({ text: "粉丝", cx: items[ji].cx, cy: items[ji].cy }, w, h)) {
        picked = items[ji];
        break;
      }
      if (isOcrSodaProfileFansLabel(items[ji], w, h)) {
        if (!picked || items[ji].cx > picked.cx) picked = items[ji];
      }
    }
    if (!picked) return false;
    var tapX = picked.cx;
    var tapY = picked.cy;
    var fansCx = picked.cx;
    var fansCy = picked.cy;
    var frL = picked.left;
    var frR = picked.right;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var ni;
    for (ni = 0; ni < items.length; ni++) {
      var nt = items[ni].text;
      if (!nt || nt === "粉丝" || nt === "关注" || nt === "获赞") continue;
      if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
      var nr = items[ni];
      var isAbove = nr.cy < fansCy - 4 && nr.bottom <= fansCy + 8 && Math.abs(nr.cx - fansCx) <= Math.floor(w * 0.12);
      if (isAbove) {
        tapY = Math.floor((nr.cy + fansCy) / 2);
      }
      var isLeft = nr.right <= frR + 10 && nr.cx < fansCx && Math.abs(nr.cy - fansCy) <= rowTol;
      if (isLeft) {
        tapX = Math.floor((nr.left + frR) / 2);
      }
    }
    tapX = Math.max(8, Math.min(w - 8, tapX));
    tapY = Math.max(8, Math.min(h - 8, tapY));
    try {
      click(tapX, tapY);
    } catch (eC0) {
      try {
        press(tapX, tapY, 90);
      } catch (eC1) {
        return false;
      }
    }
    return true;
  } catch (eTap) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

function tryTapSodaProfileFansOnce() {
  if (clickSodaProfileFansTabById()) return true;
  try {
    if (clickSodaProfileFansTabByOcr()) return true;
  } catch (eOcr) {}
  try {
    var w = device.width;
    var h = device.height;
    appendSodaActionLog("点用户粉丝(坐标)");
    click(Math.floor(w * 0.69), Math.floor(h * 0.28));
    return true;
  } catch (eCoord) {}
  return false;
}

function markSodaCurrentFollowingProfileVisited() {
  if (__lastSodaFollowingVisitKey) {
    __followerVisitedNicks[String(__lastSodaFollowingVisitKey)] = 1;
    return;
  }
  try {
    var band = followerListYBand();
    var sw = device.width;
    var coll = className("android.widget.TextView")
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(sw * 0.12), Math.floor(device.height * 0.08), Math.floor(sw * 0.72), Math.floor(device.height * 0.22))
      .find();
    if (coll && coll.size) {
      var best = null;
      var bestTop = 1e9;
      for (var i = 0; i < coll.size(); i++) {
        var n = coll.get(i);
        var t = "";
        try {
          t = String(n.text() || "").trim();
        } catch (eT) {}
        if (!t || t.length > 48) continue;
        if (/^(关注|粉丝|获赞|作品|编辑资料|私信|抖音号|推荐|搜索|我的|首页)$/.test(t)) continue;
        if (/^[\d\.\s,，万亿wW\+]+$/.test(t)) continue;
        try {
          var b = n.bounds();
          if (b.top < bestTop) {
            bestTop = b.top;
            best = t;
          }
        } catch (eB) {}
      }
      if (best) {
        var k = normalizeFollowerNickKey(best) || best;
        if (k) {
          __followerVisitedNicks[String(k)] = 1;
          __lastSodaFollowingVisitKey = String(k);
        }
      }
    }
  } catch (e0) {}
}

/** 从行节点上找昵称 TextView（gi8/gja） */
function findSodaFansListNickTvOnRow(row) {
  if (!row) return null;
  try {
    var tv =
      row.findOne(id(SODA_FOLLOWING_LIST_NICK_ID), 40) ||
      row.findOne(id(SODA_FOLLOWING_LIST_NICK_ALT_ID), 40) ||
      row.findOne(idMatches(/.*:id\/gi8$/), 30) ||
      row.findOne(idMatches(/.*:id\/gja$/), 30);
    if (tv) {
      var t = String(tv.text() || "").trim();
      if (
        t &&
        t.length <= 48 &&
        !/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音粉丝|抖音关注|回关)$/.test(t)
      ) {
        return tv;
      }
    }
  } catch (e) {}
  return null;
}

/** 点击前按昵称重新定位 TextView（扫描到点击之间列表可能已滚动/复用） */
function refreshSodaFollowingNickTvBeforeTap(nickTv, nick) {
  if (nickTv) {
    try {
      var live = String(nickTv.text() || "").trim();
      var want = normalizeFollowerNicknameForLog(nick) || String(nick || "").trim();
      if (live && want && (live === want || normalizeFollowerNicknameForLog(live) === want)) {
        return nickTv;
      }
    } catch (e0) {}
  }
  var want2 = normalizeFollowerNicknameForLog(nick) || String(nick || "").trim();
  if (!want2) return nickTv;
  var band = followerListYBand();
  var yMin = sodaDouyinFollowingListYMin();
  try {
    var tv = text(want2)
      .packageName(SODA_PKG)
      .boundsInside(0, yMin, device.width, band.yMax)
      .findOne(160);
    if (tv) return tv;
  } catch (e1) {}
  try {
    var tv2 = textContains(want2)
      .packageName(SODA_PKG)
      .boundsInside(0, yMin, device.width, band.yMax)
      .findOne(120);
    if (tv2) return tv2;
  } catch (e2) {}
  return nickTv;
}

/**
 * 汽水抖音关注列表：点选候选人进主页（与第9步 tryClickFollowerRowNode 快路径一致）。
 */
function tryClickSodaFollowingRowCandidate(cand, l0, t0, r0, b0) {
  if (!cand) return false;
  var nick = cand.nick || "";
  if (!nick && cand.nickTv) {
    nick =
      normalizeFollowerNicknameForLog(String(cand.nickTv.text() || "").trim()) ||
      String(cand.nickTv.text() || "").trim();
  }
  var row = cand.row;
  if (!row && cand.nickTv) row = cand.nickTv.parent ? cand.nickTv.parent() : null;
  if (!row && nick) {
    var target = resolveSodaFollowingClickTarget(nick, cand.row);
    if (target) {
      row = target.row;
      nick = target.nick || nick;
    }
  }
  if (!row) return false;
  appendSodaEnterUserLog(nick);
  if (tryClickFollowerRowNode(row, l0, t0, r0, b0, "进入：", nick, true)) {
    var actualNick = readSodaCurrentProfileNicknameQuick();
    if (actualNick) {
      if (!sodaFollowingNickTextMatches(nick, actualNick)) {
        appendLog("实际进入：" + actualNick);
      }
      cand.nick = actualNick;
      cand.vk = followerRowVisitKey(row, actualNick) || String(actualNick);
      __lastSodaFollowingVisitKey = String(cand.vk);
    }
    return true;
  }
  if (waitForSodaProfileEnteredQuick(320)) {
    var vkUse = cand.vk || followerRowVisitKey(row, nick);
    if (vkUse) __lastSodaFollowingVisitKey = String(vkUse);
    return true;
  }
  return false;
}

/** 汽水：在抖音关注列表分段找下一个未访问用户（避免全树 .find 后才打进入日志） */
function findNextUnvisitedSodaFollowingCandidate(l0, t0, r0, b0) {
  var band = followerListYBand();
  var yMin = sodaDouyinFollowingListYMin();
  var yMax = band.yMax;
  var rowH = sodaNativeFanListRowHeightPx();
  var yCursor = yMin;
  for (var pass = 0; pass < 16 && yCursor < yMax - 16; pass++) {
    var yHi = Math.min(yMax, yCursor + rowH + 6);
    var row = findOneSodaFansListRowInBounds(yCursor, yHi, 45);
    if (!row) {
      yCursor += Math.floor(rowH * 0.5);
      continue;
    }
    try {
      var rb = row.bounds();
      if (!isValidSodaFollowerListRowNode(row) || !isSodaFollowingListNodeVisibleOnScreen(row)) {
        yCursor = rb.bottom + 4;
        continue;
      }
      var nickTv = findSodaFansListNickTvOnRow(row);
      if (!nickTv || !isSodaFollowingListNodeVisibleOnScreen(nickTv)) {
        yCursor = rb.bottom + 4;
        continue;
      }
      var t = String(nickTv.text() || "").trim();
      if (!t || t.length > 48 || /^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音关注)$/.test(t)) {
        yCursor = rb.bottom + 4;
        continue;
      }
      var nick = normalizeFollowerNicknameForLog(t) || t;
      var vk = followerRowVisitKey(row, nick);
      if (!vk || __followerVisitedNicks[vk]) {
        yCursor = rb.bottom + 4;
        continue;
      }
      return {
        row: row,
        nick: nick,
        vk: vk,
        nickTv: nickTv,
      };
    } catch (eRow) {
      yCursor += Math.floor(rowH * 0.5);
    }
  }
  return null;
}

/** 汽水：在抖音关注列表选下一个未访问用户（skipEnsureBack=true 表示调用方已 back 一次） */
function pickNextSodaDouyinFollowingRowInList(skipEnsureBack) {
  if (__scriptUserStop) return false;
  if (!skipEnsureBack) {
    try {
      ensureBackToSodaFollowingListFromFansOrProfile();
    } catch (eBk) {}
    try {
      if (collectSodaFollowingListRowsDeduped().length === 0 && stillOnSodaUserProfilePageQuick()) {
        try {
          back();
        } catch (eBkPf) {}
        sleepCtrl(520);
      }
    } catch (eRowPf) {}
  } else if (stillOnSodaUserProfilePageQuick()) {
    try {
      back();
    } catch (eBk1) {}
    sleepCtrl(480);
  }
  try {
    if (!detectSodaDouyinFollowingListExpandedFast() && !detectSodaFollowingListExpandedLikely()) {
      expandSodaFollowingListByDoubleTapTitle();
      sleepCtrl(200);
    }
  } catch (eExp) {}
  sleepCtrl(typeof SODA_NEXT_FOLLOWER_LEAD_IN_MS === "number" ? SODA_NEXT_FOLLOWER_LEAD_IN_MS : 80);
  var nickB7 = sodaFollowerRowNicknameBounds();
  var l0 = nickB7.l0,
    t0 = nickB7.t0,
    r0 = nickB7.r0,
    b0 = nickB7.b0;
  var maxScrollPasses = 80;
  for (var pass = 0; pass < maxScrollPasses; pass++) {
    if (__scriptUserStop) return false;
    if (pass > 0) {
      appendLog("抖音关注列表下滑");
      scrollSodaFollowerListDown();
      sleepCtrl(PACE_9_11.followerListScroll);
    }
    var candInfo = findNextUnvisitedSodaFollowingCandidate(l0, t0, r0, b0);
    if (candInfo) {
      if (tryClickSodaFollowingRowCandidate(candInfo, l0, t0, r0, b0)) {
        var vkUse = candInfo.vk || followerRowVisitKey(candInfo.row, candInfo.nick);
        if (vkUse) {
          __followerVisitedNicks[vkUse] = 1;
          __lastSodaFollowingVisitKey = String(vkUse);
        }
        __noWorkLikeEntryDidBack = false;
        return true;
      }
      continue;
    }
    var rows = collectSodaDouyinFollowingListRowsStrict();
    if (!rows.length) continue;
    for (var i = 0; i < rows.length; i++) {
      var cand = rows[i];
      var nick = extractFollowerNicknameFromRow(cand, l0, t0, r0, b0);
      var vk = followerRowVisitKey(cand, nick);
      if (!vk) continue;
      if (__followerVisitedNicks[vk]) continue;
      if (
        tryClickSodaFollowingRowCandidate(
          { row: cand, nick: nick, nickTv: findSodaFansListNickTvOnRow(cand) },
          l0,
          t0,
          r0,
          b0
        )
      ) {
        __followerVisitedNicks[vk] = 1;
        __lastSodaFollowingVisitKey = String(vk);
        __noWorkLikeEntryDidBack = false;
        return true;
      }
    }
  }
  appendLog("抖音关注列表无可换用户");
  return false;
}

/** 汽水第7步换人：第8步已 back 一次回到关注列表，选下一个未访问用户 */
function clickNextFollowingInListForSodaAfterStep8Back() {
  return pickNextSodaDouyinFollowingRowInList(true);
}

/** 汽水：关注列表点下一个未访问用户（第8步无跳页换人） */
function clickNextFollowingInListForSoda() {
  return pickNextSodaDouyinFollowingRowInList(false);
}

/** 汽水第8步单次：用户主页点「粉丝」并等待进列表 */
function clickFansOnTargetProfileForSodaOnce() {
  appendSodaActionLog("点用户页粉丝");
  if (!tryTapSodaProfileFansOnce()) {
    appendLog("点用户页粉丝失败");
    __fansTapNoNavigationReselect = true;
    return false;
  }
  __fansTapNoNavigationReselect = false;
  if (waitSodaTargetProfileFansEnterOrTimeout(3200)) {
    appendLog("已进入用户粉丝页");
    sleepCtrl(450);
    if (!sodaTargetProfileFansPageExpandListReady()) {
      appendLog("用户粉丝列表未展开，返回换人");
      ensureBackToSodaFollowingListFromFansOrProfile();
      return false;
    }
    sleepCtrl(400);
    return true;
  }
  return false;
}

/**
 * 汽水第8步：粉丝 800～10000 才点粉丝；无跳页则换关注列表下一用户（最多 12 次）
 * 连续 6 名不符合 → 对标不好，重启获取新对标
 */
function runSodaStep8ClickFansWithReselect(maxRounds, maxStep) {
  maxRounds = maxRounds == null ? 12 : maxRounds;
  var badN =
    typeof SODA_STEP8_UNQUALIFIED_BAD_BENCHMARK_N === "number"
      ? SODA_STEP8_UNQUALIFIED_BAD_BENCHMARK_N
      : 6;
  for (var t = 0; t < maxRounds && !__scriptUserStop; t++) {
    var fansN = null;
    try {
      fansN = readSodaTargetProfileFansCountInt();
    } catch (eF0) {
      fansN = null;
    }
    if (!(typeof fansN === "number" && Number.isFinite(fansN))) {
      appendLog("未读到粉丝数，返回换下一个");
      markSodaCurrentFollowingProfileVisited();
      try {
        back();
      } catch (eB0) {}
      sleepCtrl(500);
      if (!clickNextFollowingInListForSodaAfterStep8Back()) return false;
      sleepCtrl(520);
      continue;
    }
    if (fansN <= 800 || fansN >= 10000) {
      appendLog("用户不符合，返回");
      __sodaStep8UnqualifiedSkipN++;
      if (__sodaStep8UnqualifiedSkipN >= badN) {
        return sodaRestartForBadBenchmarkFromStep8(maxStep);
      }
      markSodaCurrentFollowingProfileVisited();
      try {
        back();
      } catch (eB1) {}
      sleepCtrl(500);
      if (!clickNextFollowingInListForSodaAfterStep8Back()) return false;
      sleepCtrl(520);
      continue;
    }
    resetSodaStep8UnqualifiedSkipCounter();
    appendLogProgress("用户符合，点粉丝");
    __fansTapNoNavigationReselect = false;
    var okFansTap = false;
    try {
      okFansTap = clickFansOnTargetProfileForSodaOnce();
    } catch (e0) {
      okFansTap = false;
    }
    if (okFansTap && !__fansTapNoNavigationReselect) return true;
    appendLog("点粉丝未进页，换下一个");
    markSodaCurrentFollowingProfileVisited();
    sleepCtrl(520);
    if (!clickNextFollowingInListForSodaAfterStep8Back()) return false;
    sleepCtrl(520);
  }
  appendLog("第8步多次换人仍失败");
  return false;
}

/** 汽水第8步：用户主页点「粉丝」 */
function clickFansOnTargetProfileForSoda() {
  return runSodaStep8ClickFansWithReselect(12);
}

function findSodaFansListFirstRowNode() {
  var band = sodaFollowerListYBand();
  var rowYMin = sodaHasDouyinFansSectionOnPage() ? sodaDouyinFansListYMin() : band.yMin;
  try {
    var coll = findSodaFansListRowNodesInBounds(rowYMin - 4, band.yMax, true);
    if (coll && coll.size) {
      var best = null;
      var bestTop = 1e9;
      for (var i = 0; i < coll.size(); i++) {
        var n = coll.get(i);
        try {
          var b = n.bounds();
          if (b.top < rowYMin - 4 || b.centerY() > band.yMax) continue;
          if (!isValidSodaFollowerListRowNodeForContext(n)) continue;
          if (b.top < bestTop) {
            bestTop = b.top;
            best = n;
          }
        } catch (eB) {}
      }
      if (best) return best;
    }
  } catch (e0) {}
  try {
    var nickColl = findSodaFansListNickNodesInBounds(rowYMin - 4, band.yMax);
    if (nickColl && nickColl.size) {
      var bestTv = null;
      var bestTvTop = 1e9;
      for (var j = 0; j < nickColl.size(); j++) {
        var tv = nickColl.get(j);
        try {
          var tb = tv.bounds();
          if (tb.top < rowYMin - 4 || tb.centerY() > band.yMax) continue;
          var rowResolved = resolveSodaFollowerListClickRow(tv.parent());
          if (!rowResolved) continue;
          if (tb.top < bestTvTop) {
            bestTvTop = tb.top;
            bestTv = rowResolved;
          }
        } catch (eT) {}
      }
      if (bestTv) return bestTv;
    }
  } catch (e1) {}
  var rows = collectSodaFollowerListRowsDeduped();
  if (rows && rows.length) return rows[0];
  return null;
}

/** 汽水第9步：用户粉丝列表点首行 */
function clickFirstFollowerInListForSoda() {
  if (__scriptUserStop) return false;
  if (!detectSodaFansListExpandedLikely()) {
    if (!sodaTargetProfileFansPageExpandListReady() && !expandSodaFansListByDoubleTapTitle()) {
      return false;
    }
  }
  appendSodaActionLog("粉丝列表首行");
  var nickB = sodaFollowerRowNicknameBounds();
  var l0 = nickB.l0,
    t0 = nickB.t0,
    r0 = nickB.r0,
    b0 = nickB.b0;
  __followerVisitedNicks = {};
  __noWorkLikeEntryDidBack = false;
  var node = findSodaFansListFirstRowNode();
  var nickBefore = extractFollowerNicknameFromRow(node, l0, t0, r0, b0);
  var visitKey0 = followerRowVisitKey(node, nickBefore);
  if (node) appendSodaEnterUserLog(nickBefore);
  if (node && tryClickFollowerRowNode(node, l0, t0, r0, b0, "进入：", nickBefore, true)) {
    if (visitKey0) __followerVisitedNicks[visitKey0] = 1;
    return true;
  }
  // 首行已点开但确认超时：勿再按列表坐标兜底（会误点主页头像/封面区，常见 518×378）
  if (waitForSodaProfileEnteredQuick(320)) {
    if (visitKey0) __followerVisitedNicks[visitKey0] = 1;
    return true;
  }
  try {
    var w = device.width;
    var h = device.height;
    appendSodaActionLog("粉丝列表首行(坐标)");
    var bandTap = sodaFollowerListYBand();
    var cxTap = Math.floor(device.width * 0.48);
    var cyTap = bandTap.yMin + Math.floor((bandTap.yMax - bandTap.yMin) * 0.06);
    var ptTap = nudgeTapAwayFromFloatClose(cxTap, cyTap);
    click(ptTap.x, ptTap.y);
    sleepCtrl(600);
    if (waitForSodaProfileEnteredQuick(SODA_STEP9_ENTER_CONFIRM_MS)) {
      if (visitKey0) __followerVisitedNicks[visitKey0] = 1;
      return true;
    }
  } catch (eTap) {}
  appendLog("粉丝列表首行失败");
  return false;
}

/** 汽水用户主页 Tab 栏 Y 带（作品/视频/歌单 | 音乐分享） */
function findSodaProfileVideoTabYBand() {
  var h = device.height;
  var w = device.width;
  var yMin = Math.floor(h * 0.32);
  var yMax = Math.floor(h * 0.72);
  var leftCy = null;
  var leftCx = null;
  var leftLabels = ["作品", "视频", "歌单"];
  var li;
  for (li = 0; li < leftLabels.length; li++) {
    try {
      var ln = text(leftLabels[li]).packageName(SODA_PKG).findOne(120);
      if (!ln) continue;
      var lb = ln.bounds();
      if (lb.centerY() < yMin || lb.centerY() > yMax) continue;
      leftCy = lb.centerY();
      leftCx = lb.centerX();
      break;
    } catch (eL) {}
  }
  if (leftCy == null) {
    try {
      var lw = textMatches(/^作品\s*\d*$/).packageName(SODA_PKG).findOne(120);
      if (lw) {
        var lwb = lw.bounds();
        if (lwb.centerY() >= yMin && lwb.centerY() <= yMax) {
          leftCy = lwb.centerY();
          leftCx = lwb.centerX();
        }
      }
    } catch (eLw) {}
  }
  var shareCy = null;
  try {
    var sh = text("音乐分享").packageName(SODA_PKG).findOne(120);
    if (sh) {
      var shb = sh.bounds();
      if (shb.centerY() >= yMin && shb.centerY() <= yMax) shareCy = shb.centerY();
    }
  } catch (e1) {}
  function packBand(rowCy, lcx) {
    var halfBand = Math.max(28, Math.floor(h * 0.024));
    return {
      yMin: rowCy - halfBand,
      yMax: rowCy + halfBand,
      rowCy: rowCy,
      leftCx: lcx != null ? lcx : Math.floor(w * 0.267),
    };
  }
  if (leftCy != null && shareCy != null) {
    return packBand(Math.round((leftCy + shareCy) / 2), leftCx);
  }
  if (leftCy != null) return packBand(leftCy, leftCx);
  if (shareCy != null) return packBand(shareCy, Math.floor(w * 0.267));
  return packBand(Math.floor(h * 0.48), Math.floor(w * 0.267));
}

function scoreSodaProfileWorksTabNode(n, band, w) {
  try {
    var b = n.bounds();
    var cy = b.centerY();
    var cx = b.centerX();
    var score = -Math.abs(cy - band.rowCy);
    if (cx <= Math.floor(w * 0.55)) score += 900;
    var t = String(n.text ? n.text() : "").replace(/\s+/g, "");
    if (t === "作品" || t === "视频") score += 300;
    if (n.clickable && n.clickable()) score += 120;
    return score;
  } catch (eS) {
    return -1e9;
  }
}

/** 汽水用户主页 Tab 栏内查找「作品/视频」节点（排除悬浮窗区误匹配） */
function findSodaProfileVideoTabNode(bandOpt) {
  var w = device.width;
  var h = device.height;
  var band = bandOpt || findSodaProfileVideoTabYBand();
  function nodeInBand(n) {
    try {
      var cy = n.bounds().centerY();
      return cy >= band.yMin && cy <= band.yMax;
    } catch (e) {
      return false;
    }
  }
  function nodeInFloatZone(n) {
    try {
      var b = n.bounds();
      return isOcrItemInFloatPanelZone({ cx: b.centerX(), cy: b.centerY() }, w, h);
    } catch (e) {
      return true;
    }
  }
  function pickBestFromCollection(coll) {
    if (!coll || !coll.size) return null;
    var best = null;
    var bestScore = -1e9;
    var i;
    for (i = 0; i < coll.size(); i++) {
      var n = coll.get(i);
      if (!nodeInBand(n) || nodeInFloatZone(n)) continue;
      var sc = scoreSodaProfileWorksTabNode(n, band, w);
      if (sc > bestScore) {
        bestScore = sc;
        best = n;
      }
    }
    return best;
  }
  var best = null;
  var bestScore = -1e9;
  var labels = ["作品", "视频"];
  var ti;
  for (ti = 0; ti < labels.length; ti++) {
    try {
      var picked = pickBestFromCollection(text(labels[ti]).packageName(SODA_PKG).find());
      if (picked) {
        var sc0 = scoreSodaProfileWorksTabNode(picked, band, w);
        if (sc0 > bestScore) {
          bestScore = sc0;
          best = picked;
        }
      }
    } catch (e0) {}
  }
  try {
    var pickedW = pickBestFromCollection(textMatches(/^作品\s*\d*$/).packageName(SODA_PKG).find());
    if (pickedW) {
      var scW = scoreSodaProfileWorksTabNode(pickedW, band, w);
      if (scW > bestScore) {
        bestScore = scW;
        best = pickedW;
      }
    }
  } catch (eW) {}
  return best;
}

/** 汽水用户主页右滑锚点 ghw（统计条下方横条） */
function findSodaProfileSwipeAnchorNode(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 120;
  var node = null;
  try {
    node = id(SODA_PROFILE_SWIPE_ANCHOR_ID).packageName(SODA_PKG).findOne(t);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/ghw$/).packageName(SODA_PKG).findOne(t);
    } catch (e1) {}
  }
  return node || null;
}

function isSodaProfileVideoPageLikely() {
  if (detectSodaProfileVideoGridLikely()) return true;
  try {
    if (textContains("说点什么").packageName(SODA_PKG).findOne(120)) return true;
    if (descContains("点赞").packageName(SODA_PKG).findOne(120)) return true;
  } catch (e0) {}
  return false;
}

/** 右滑前轻量判断：避免 detect 网格拖慢进视频页 */
function isSodaProfileVideoPageLikelyQuick() {
  try {
    if (textContains("说点什么").packageName(SODA_PKG).findOne(50)) return true;
    if (descContains("点赞").packageName(SODA_PKG).findOne(50)) return true;
  } catch (e0) {}
  return false;
}

/** 右滑一次后：主页/歌曲栏仍有「播放全部」按钮 → 未到视频栏 */
function detectSodaProfileSongsPlayAllAfterSwipe(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 55;
  try {
    if (id(SODA_PROFILE_SONGS_PLAY_ALL_BTN_ID).packageName(SODA_PKG).findOne(t)) return true;
    if (idMatches(/.*:id\/apc$/).packageName(SODA_PKG).findOne(Math.min(t, 40))) return true;
  } catch (e0) {}
  try {
    if (textContains("播放全部").packageName(SODA_PKG).findOne(t)) return true;
  } catch (e1) {}
  return false;
}

/** 汽水视频栏扫描 Y 带（首行网格 top 常略低于锚点估底，需留 slack） */
function sodaProfileVideoGridScanYBand(wgBand) {
  var band = wgBand || sodaProfileWorkGridYBand();
  var sh = device.height;
  var slack = Math.max(72, Math.floor(sh * 0.045));
  return {
    yMin: Math.max(Math.floor(sh * 0.34), band.yMin - slack),
    yMax: Math.min(band.yMax, Math.floor(sh * 0.92)),
  };
}

/**
 * 汽水视频栏单格 bounds 特征（实测：clickable FrameLayout，宽约 sw/3，无 id/text）
 * 例 @1080×2400：(0,1119,357,1594) (361,1119,718,1594) (722,1119,1079,1594)
 */
function isSodaProfileVideoGridCellBounds(b, sw, yMin, yMax) {
  try {
    var w = b.width();
    var h = b.height();
    var cy = b.centerY();
    if (cy < yMin || cy > yMax) return false;
    if (b.bottom < yMin - 8 || b.top > yMax + 8) return false;
    var colW = sw / 3;
    var minW = Math.floor(colW * 0.58);
    var maxW = Math.ceil(colW * 1.12);
    if (w < minW || w > maxW) return false;
    if (h < Math.floor(sw * 0.22) || h > Math.floor(sw * 0.65)) return false;
    var aspect = w / Math.max(1, h);
    if (aspect < 0.5 || aspect > 1.08) return false;
    return true;
  } catch (e) {
    return false;
  }
}

/** 汽水视频栏网格缓存（避免空态否决/等待轮询重复全树 find） */
var __sodaVideoGridCache = { ts: 0, cells: null };

function invalidateSodaVideoGridCache() {
  __sodaVideoGridCache.ts = 0;
  __sodaVideoGridCache.cells = null;
}

function findSodaProfileVideoGridCellsByA11yCached(wgBand, maxAgeMs) {
  var age = typeof maxAgeMs === "number" && maxAgeMs >= 0 ? maxAgeMs : 500;
  var now = Date.now();
  if (age > 0 && __sodaVideoGridCache.cells && now - __sodaVideoGridCache.ts < age) {
    return __sodaVideoGridCache.cells;
  }
  var cells = findSodaProfileVideoGridCellsByA11y(wgBand);
  __sodaVideoGridCache.ts = now;
  __sodaVideoGridCache.cells = cells;
  return cells;
}

/** 汽水：三列视频格分段 findOne（快路径，避免全树 .find()） */
function findSodaProfileVideoGridCellsByA11yBandScan(wgBand) {
  var out = [];
  var band = sodaProfileVideoGridScanYBand(wgBand);
  var sw = device.width;
  var yMin = band.yMin;
  var yMax = band.yMax;
  var findMs =
    typeof SODA_PROFILE_VIDEO_GRID_FINDONE_MS === "number" && SODA_PROFILE_VIDEO_GRID_FINDONE_MS > 0
      ? SODA_PROFILE_VIDEO_GRID_FINDONE_MS
      : 22;
  function pushCell(b) {
    if (!isSodaProfileVideoGridCellBounds(b, sw, yMin, yMax)) return;
    try {
      var w = b.width();
      var h = b.height();
      var cx = b.centerX();
      var clickY = b.top + Math.floor(h * 0.46);
      for (var k = 0; k < out.length; k++) {
        if (Math.abs(out[k].x - cx) < 40 && Math.abs(out[k].y - clickY) < 64) return;
      }
      out.push({ x: cx, y: clickY, t: b.top, l: b.left });
    } catch (eP) {}
  }
  var colCenters = [Math.floor(sw / 6), Math.floor(sw / 2), Math.floor((5 * sw) / 6)];
  var colHalf = Math.max(Math.floor(sw / 7), 48);
  var rowH = Math.max(Math.floor(sw * 0.42), 280);
  for (var yCursor = yMin; yCursor < yMax - Math.floor(rowH * 0.35) && out.length < 9; ) {
    var yHi = Math.min(yMax, yCursor + rowH + 12);
    for (var ci = 0; ci < 3; ci++) {
      var cx = colCenters[ci];
      try {
        var node = className("android.widget.FrameLayout")
          .clickable(true)
          .packageName(SODA_PKG)
          .boundsInside(Math.max(0, cx - colHalf), yCursor, Math.min(sw, cx + colHalf), yHi)
          .findOne(findMs);
        if (node) pushCell(node.bounds());
      } catch (eBand) {}
    }
    yCursor += Math.floor(rowH * 0.82);
  }
  if (out.length >= 1) {
    if (out.length > 1) {
      out.sort(function (a, b) {
        if (Math.abs(a.t - b.t) > 20) return a.t - b.t;
        return a.l - b.l;
      });
    }
    return out;
  }
  return null;
}

/** 汽水：扫 clickable FrameLayout 三列视频格（与布局审查器实测一致） */
function findSodaProfileVideoGridCellsByA11y(wgBand) {
  var out = [];
  var band = sodaProfileVideoGridScanYBand(wgBand);
  var sw = device.width;
  var yMin = band.yMin;
  var yMax = band.yMax;
  function pushCell(b) {
    if (!isSodaProfileVideoGridCellBounds(b, sw, yMin, yMax)) return;
    try {
      var w = b.width();
      var h = b.height();
      var cx = b.centerX();
      var clickY = b.top + Math.floor(h * 0.46);
      for (var k = 0; k < out.length; k++) {
        if (Math.abs(out[k].x - cx) < 40 && Math.abs(out[k].y - clickY) < 64) return;
      }
      out.push({ x: cx, y: clickY, t: b.top, l: b.left });
    } catch (eP) {}
  }
  try {
    var bandFast = findSodaProfileVideoGridCellsByA11yBandScan(wgBand);
    if (bandFast && bandFast.length) return bandFast;
  } catch (eFast) {}
  try {
    var yScanMin = Math.max(0, yMin - 28);
    var yScanMax = Math.min(device.height, yMax + 28);
    var fr = className("android.widget.FrameLayout")
      .clickable(true)
      .packageName(SODA_PKG)
      .boundsInside(0, yScanMin, sw, yScanMax)
      .find();
    if (fr) {
      for (var j = 0; j < fr.size(); j++) {
        try {
          pushCell(fr.get(j).bounds());
        } catch (eF) {}
      }
    }
  } catch (e0) {}
  if (out.length >= 1) {
    if (out.length > 1) {
      out.sort(function (a, b) {
        if (Math.abs(a.t - b.t) > 20) return a.t - b.t;
        return a.l - b.l;
      });
    }
    return out;
  }
  return null;
}

function sodaScanAndCacheVideoGridCells(wgBand) {
  try {
    var cells = findSodaProfileVideoGridCellsByA11y(wgBand);
    __sodaVideoGridCache.ts = Date.now();
    __sodaVideoGridCache.cells = cells;
    return cells;
  } catch (e0) {
    return null;
  }
}

/** 有视频页：直接用 wait 阶段缓存的格，避免重复全树 find */
function sodaGetWorkCoversReadyForClick(wgBand) {
  if (sodaHasCachedVideoGrid()) return __sodaVideoGridCache.cells;
  var cells = sodaScanAndCacheVideoGridCells(wgBand);
  if (cells && cells.length) return cells;
  if (detectSodaProfileEmptyStateReasonFast(35)) return null;
  return null;
}

/** 汽水视频栏是否已有作品格（不含空态文案判断，用于否决误报） */
function sodaProfileHasVideoGridLikely() {
  try {
    var gridCells = findSodaProfileVideoGridCellsByA11yCached();
    if (gridCells && gridCells.length >= 1) return true;
  } catch (eGrid) {}
  return false;
}

function sodaHasCachedVideoGrid() {
  var c = __sodaVideoGridCache.cells;
  return !!(c && c.length >= 1);
}

/** 快路径：aog/aoh 判空/私密；网格否决只看缓存，不触发全树 find */
function detectSodaProfileEmptyStateReasonFast(timeoutMs) {
  if (sodaHasCachedVideoGrid()) return null;
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 80;
  var priv = findSodaProfileEmptyStateNodeOne(
    SODA_PROFILE_PRIVATE_TEXT_ID,
    SODA_PROFILE_PRIVATE_TEXT_ID_HEX,
    /^该用户已设置为私密状态$|^.*私密状态.*$/,
    t
  );
  if (priv) return "私密";
  var empty = findSodaProfileEmptyStateNodeOne(
    SODA_PROFILE_EMPTY_TEXT_ID,
    SODA_PROFILE_EMPTY_TEXT_ID_HEX,
    /^暂无内容$|^暂无作品$|^暂无视频$|^还没有内容$/,
    t
  );
  if (empty) return "暂无内容";
  return null;
}

/** 汽水：优先用稳定节点 aog/aoh 判空态/私密（比颜色方差更准） */
function findSodaProfileEmptyStateNodeOne(idStr, idHex, textRe, timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 80;
  var sh = device.height;
  var sw = device.width;
  var yMin = Math.floor(sh * 0.28);
  function pickNode(node) {
    if (!node) return null;
    try {
      if (node.visibleToUser && !node.visibleToUser()) return null;
      var tx = String(node.text ? node.text() : "").trim();
      if (!tx) return null;
      if (textRe && !textRe.test(tx)) return null;
      var b = node.bounds();
      if (b.width() < 12 || b.height() < 12) return null;
      if (b.centerY() < yMin) return null;
      if (b.right <= 0 || b.bottom <= 0 || b.left >= sw || b.top >= sh) return null;
      return { node: node, text: tx };
    } catch (eP) {
      return null;
    }
  }
  try {
    var nFast = id(idStr).packageName(SODA_PKG).findOne(t);
    var hitFast = pickNode(nFast);
    if (hitFast) return hitFast;
  } catch (eF0) {}
  var coll = null;
  try {
    coll = id(idStr).packageName(SODA_PKG).find();
  } catch (e0) {}
  if (!coll || !coll.size) {
    try {
      var shortId = String(idStr || "").split("/").pop();
      if (shortId) {
        coll = idMatches(new RegExp(".*:id\\/" + shortId + "$")).packageName(SODA_PKG).find();
      }
    } catch (e1) {}
  }
  if (!coll || !coll.size) return null;
  for (var i = 0; i < coll.size(); i++) {
    var node = null;
    try {
      node = coll.get(i);
    } catch (eG) {
      node = null;
    }
    var hit = pickNode(node);
    if (hit) return hit;
  }
  return null;
}

/** @returns {"暂无内容"|"私密"|null} */
function detectSodaProfileEmptyStateReason(timeoutMs) {
  var fast = detectSodaProfileEmptyStateReasonFast(timeoutMs);
  if (fast) return fast;
  if (sodaHasCachedVideoGrid()) return null;
  if (sodaProfileHasVideoGridLikely()) return null;
  return null;
}

function sodaBackOnceForEmptyProfile(reason) {
  var msg =
    reason === "私密"
      ? "私密状态，返回"
      : reason === "暂无内容"
        ? "暂无内容，返回"
        : "无视频/私密，返回";
  sodaBackOnceForNoVideo(msg);
}

/** 检测到 aog/aoh 或空态文案 → 返回一次并换下一个粉丝 */
function sodaBackIfEmptyProfileDetected(timeoutMs) {
  if (sodaHasCachedVideoGrid()) return false;
  var reason = detectSodaProfileEmptyStateReasonFast(timeoutMs);
  if (reason) {
    sodaBackOnceForEmptyProfile(reason);
    return true;
  }
  if (!detectSodaProfileEmptyContentStateTextOnly(timeoutMs)) return false;
  sodaBackOnceForEmptyProfile("暂无内容");
  return true;
}

/** 汽水视频栏：空态文案兜底（不含 aog/aoh，避免与 reason 重复） */
function detectSodaProfileEmptyContentStateTextOnly(timeoutMs) {
  if (sodaHasCachedVideoGrid()) return false;
  if (detectSodaProfileEmptyStateReasonFast(timeoutMs)) return true;
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 60;
  var sh = device.height;
  var sw = device.width;
  var yMin = Math.floor(sh * 0.30);
  function inContentBand(n) {
    if (!n) return false;
    try {
      if (n.visibleToUser && !n.visibleToUser()) return false;
      var b = n.bounds();
      return b.centerY() >= yMin && b.centerX() >= Math.floor(sw * 0.08) && b.centerX() <= Math.floor(sw * 0.92);
    } catch (eB) {
      return false;
    }
  }
  function hitExact(label, findMs) {
    var ms = typeof findMs === "number" && findMs > 0 ? findMs : t;
    var n = null;
    try {
      n = text(label).packageName(SODA_PKG).findOne(ms);
    } catch (e0) {}
    return inContentBand(n);
  }
  var keys = ["暂无内容", "暂无作品", "暂无视频", "该用户已设置为私密状态", "还没有内容"];
  for (var i = 0; i < keys.length; i++) {
    if (hitExact(keys[i], Math.min(t, 50))) return true;
  }
  return false;
}

/** 汽水视频栏：空态文案（暂无内容/暂无作品等），节点 id 优先，文案兜底 */
function detectSodaProfileEmptyContentState(timeoutMs) {
  if (sodaHasCachedVideoGrid()) return false;
  if (detectSodaProfileEmptyStateReasonFast(timeoutMs)) return true;
  return detectSodaProfileEmptyContentStateTextOnly(timeoutMs);
}

/** 汽水用户主页视频栏：无作品 / 私密 / 空态（须在内容区下半屏，避免加载中误匹配） */
function detectSodaProfileNoWorksOrPrivate(timeoutMs, opts) {
  if (sodaHasCachedVideoGrid()) return false;
  if (detectSodaProfileEmptyStateReasonFast(timeoutMs)) return true;
  if (detectSodaProfileEmptyContentStateTextOnly(timeoutMs)) return true;
  opts = opts || {};
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 120;
  var sh = device.height;
  var sw = device.width;
  var contentYMin = Math.floor(sh * (typeof opts.contentYRatio === "number" ? opts.contentYRatio : 0.38));
  var re =
    /暂无作品|还没有(发布)?作品|暂时没有作品|没有作品|作品为空|还没有内容|暂无内容|暂无视频|没有视频|私密状态|已设置为私密|该用户已设置为私密|该账号已设置私密|对方设置了隐私|由于对方的隐私设置|无法查看|暂不可见|内容不可见|还没有发布|尚未发布|暂无发布/;
  function emptyNodeInContentArea(n) {
    if (!n) return false;
    if (opts.requireContentArea === false) return true;
    try {
      var b = n.bounds();
      return b.centerY() >= contentYMin && b.centerX() >= Math.floor(sw * 0.08) && b.centerX() <= Math.floor(sw * 0.92);
    } catch (eB) {
      return false;
    }
  }
  function scanOnce(findMs) {
    var ms = typeof findMs === "number" && findMs > 0 ? findMs : t;
    try {
      var n0 = textMatches(re).packageName(SODA_PKG).findOne(ms);
      if (emptyNodeInContentArea(n0)) return true;
      n0 = textMatches(re).findOne(ms);
      if (emptyNodeInContentArea(n0)) return true;
    } catch (e0) {}
    return false;
  }
  return scanOnce(t);
}

/** 右滑后轮询：视频栏网格/Tab 已绘制（空态页不算就绪） */
function isSodaVideoPagePaintReady() {
  if (detectSodaProfileEmptyStateReasonFast(40)) return false;
  if (sodaHasCachedVideoGrid()) return true;
  try {
    var sh = device.height;
    var sw = device.width;
    var band = sodaProfileWorkGridYBand();
    var tabYMax = Math.max(Math.floor(sh * 0.55), (band && band.yMin) ? band.yMin + 40 : Math.floor(sh * 0.55));
    var tabYMin = Math.max(0, tabYMax - 140);
    if (text("视频").packageName(SODA_PKG).boundsInside(0, tabYMin, sw, tabYMax).findOne(40)) return true;
    if (text("作品").packageName(SODA_PKG).boundsInside(0, tabYMin, sw, tabYMax).findOne(40)) return true;
  } catch (eT) {}
  return false;
}

function waitForSodaVideoPageAfterSwipe(maxMs) {
  var budget =
    typeof maxMs === "number" && maxMs > 0
      ? maxMs
      : typeof SODA_PROFILE_VIDEO_PAGE_LOAD_MS === "number" && SODA_PROFILE_VIDEO_PAGE_LOAD_MS > 0
        ? SODA_PROFILE_VIDEO_PAGE_LOAD_MS
        : 400;
  var step =
    typeof SODA_PROFILE_VIDEO_PAGE_POLL_MS === "number" && SODA_PROFILE_VIDEO_PAGE_POLL_MS > 0
      ? SODA_PROFILE_VIDEO_PAGE_POLL_MS
      : 30;
  var grace =
    typeof SODA_PROFILE_EMPTY_GRACE_MS === "number" && SODA_PROFILE_EMPTY_GRACE_MS >= 0
      ? SODA_PROFILE_EMPTY_GRACE_MS
      : 90;
  var wgBand = sodaProfileWorkGridYBand();
  var start = Date.now();
  var end = start + budget;
  while (Date.now() < end && !__scriptUserStop) {
    var elapsed = Date.now() - start;
    if (sodaHasCachedVideoGrid()) return "ready";
    var cells = sodaScanAndCacheVideoGridCells(wgBand);
    if (cells && cells.length) return "ready";
    if (elapsed >= grace) {
      var emptyReason = detectSodaProfileEmptyStateReasonFast(35);
      if (emptyReason) return "empty";
    }
    sleep(step);
  }
  if (sodaHasCachedVideoGrid()) return "ready";
  if (detectSodaProfileEmptyStateReasonFast(40)) return "empty";
  return "timeout";
}

/** 汽水：无视频/私密 → 打日志、返回一次、标记换下一个粉丝 */
function sodaBackOnceForNoVideo(logMsg) {
  appendLog(logMsg || "无视频，返回");
  __sodaNoVideoSkipToNext = true;
  __workEntryTerminalFail = true;
  try {
    back();
  } catch (eBk) {}
  sleepCtrl(PACE_9_11.step10NoEntryBack);
}

function isSodaWorkPlayerPageLikely(timeoutMs) {
  return isSodaWorkPlayerPageLikelyFast(timeoutMs);
}

/** 汽水播放页快检（单次 findOne 限时，禁止循环里全树 find） */
function isSodaWorkPlayerPageLikelyFast(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 55;
  if (findSodaWorkVideoLikeHeartNodeFast(t)) return true;
  if (findSodaWorkPlayerActionBarNodeFast(t)) return true;
  try {
    if (textContains("说点什么").packageName(SODA_PKG).findOne(t)) return true;
    if (descContains("点赞").packageName(SODA_PKG).findOne(Math.min(t, 40))) return true;
  } catch (e0) {}
  return false;
}

function findSodaWorkPlayerActionBarNodeFast(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 50;
  try {
    var node = id(SODA_WORK_PLAYER_ACTION_BAR_ID).packageName(SODA_PKG).findOne(t);
    if (node) return node;
    return idMatches(/.*:id\/hn3$/).packageName(SODA_PKG).findOne(Math.min(t, 40));
  } catch (e0) {}
  return null;
}

/** 汽水播放页视频红心赞 ImageView（he=，短限时；卡顿机勿用 .find() 全树扫） */
function findSodaWorkVideoLikeHeartNodeFast(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 55;
  var w = device.width || 1080;
  var h = device.height || 2400;
  var yMin = Math.floor(h * 0.68);
  var xMax = Math.floor(w * 0.28);
  try {
    var node = id(SODA_WORK_VIDEO_LIKE_BTN_ID)
      .packageName(SODA_PKG)
      .boundsInside(0, yMin, xMax, h)
      .findOne(t);
    if (node) return node;
    node = idMatches(/.*:id\/he=$/)
      .packageName(SODA_PKG)
      .boundsInside(0, yMin, xMax, h)
      .findOne(Math.min(t, 45));
    if (node) return node;
  } catch (e0) {}
  try {
    var bar = findSodaWorkPlayerActionBarNodeFast(Math.min(t, 40));
    if (bar) {
      var like = bar.findOne(id(SODA_WORK_VIDEO_LIKE_BTN_ID), Math.min(t, 35));
      if (like) return like;
    }
  } catch (e1) {}
  return null;
}

/** 汽水播放页视频红心赞 ImageView（he=，位于 hn3 操作栏最左；勿点 he8 数字或 hn3 容器） */
function findSodaWorkVideoLikeHeartNode() {
  var node = findSodaWorkVideoLikeHeartNodeFast(70);
  if (node) return node;
  return findSodaWorkVideoLikeHeartNodeFast(45);
}

/** 汽水激励广告遮罩 id=-（全程快检，不阻塞） */
function detectSodaListenAdOverlayById() {
  try {
    if (id(SODA_WORK_VIDEO_LISTEN_AD_ID).packageName(SODA_PKG).findOne(30)) return true;
    if (idMatches(/.*:id\/-$/).packageName(SODA_PKG).findOne(30)) return true;
  } catch (e0) {}
  return false;
}

/** 汽水：点击视频后「免费时长/看N个视频」激励广告（id 或文案） */
function findSodaWorkVideoListenAdNode(maxWaitMs) {
  var budget = typeof maxWaitMs === "number" && maxWaitMs > 0 ? maxWaitMs : 120;
  try {
    var node =
      id(SODA_WORK_VIDEO_LISTEN_AD_ID).packageName(SODA_PKG).findOne(budget) ||
      idMatches(/.*:id\/-$/).packageName(SODA_PKG).findOne(budget);
    if (node) return node;
    node = textContains("免费时长已耗尽").packageName(SODA_PKG).findOne(budget);
    if (node) return node;
    node = textContains("继续免费听").packageName(SODA_PKG).findOne(budget);
    if (node) return node;
  } catch (e0) {}
  return null;
}

function detectSodaWorkVideoListenAdLikely(maxWaitMs) {
  if (detectSodaListenAdOverlayById()) return true;
  return !!findSodaWorkVideoListenAdNode(maxWaitMs);
}

/**
 * 汽水全程：遇到 id=- 广告遮罩则返回一次再继续（markForceLikeOrComment 仅点击视频后那条链路使用）
 * @param {boolean} [markForceLikeOrComment]
 */
function sodaGlobalDismissListenAdIfAny(markForceLikeOrComment) {
  if (__scriptUserStop || !isSodaPlatformSelected()) return false;
  if (
    sodaSplashWaitRecentlyDone() &&
    Date.now() - __sodaSplashWaitFinishedAt < 5000
  ) {
    return false;
  }
  if (!detectSodaListenAdOverlayById()) return false;
  var now = Date.now();
  var cooldown =
    typeof SODA_LISTEN_AD_DISMISS_COOLDOWN_MS === "number" ? SODA_LISTEN_AD_DISMISS_COOLDOWN_MS : 900;
  if (now - __sodaLastListenAdDismissMs < cooldown) return false;
  __sodaLastListenAdDismissMs = now;
  appendLog("广告返回");
  try {
    back();
  } catch (eBk) {}
  sleepCtrl(
    typeof SODA_LISTEN_AD_AFTER_BACK_MS === "number" ? SODA_LISTEN_AD_AFTER_BACK_MS : 1000
  );
  if (markForceLikeOrComment === true) __sodaForceLikeOrCommentAfterAd = true;
  return true;
}

/** 点击视频后若出现激励广告：返回并标记后续随机点赞/评论 */
function dismissSodaWorkVideoListenAdIfAny(maxWaitMs) {
  if (!isSodaPlatformSelected()) return false;
  if (!detectSodaWorkVideoListenAdLikely(maxWaitMs)) return false;
  return sodaGlobalDismissListenAdIfAny(true);
}

function pickSodaForcedLikeOrCommentAfterAd() {
  var canLike = remainingTaskForKind("like") > 0;
  var canComment = remainingTaskForKind("comment") > 0;
  if (canLike && canComment) return Math.random() < 0.5 ? "like" : "comment";
  if (canComment) return "comment";
  if (canLike) return "like";
  return pickWeightedRandomWorkAction();
}

/** 汽水：进用户主页后快速确认（不等抖音号、不全量扫粉丝列表） */
function waitForSodaProfileEnteredQuick(maxMs) {
  var budget = typeof maxMs === "number" && maxMs > 0 ? maxMs : SODA_STEP9_ENTER_CONFIRM_MS;
  var end = Date.now() + budget;
  while (Date.now() < end && !__scriptUserStop) {
    try {
      if (findSodaProfileSwipeAnchorNode(50)) return true;
    } catch (eA) {}
    try {
      if (text("关注").packageName(SODA_PKG).findOne(50)) return true;
      if (text("粉丝").packageName(SODA_PKG).findOne(50)) return true;
      if (text("作品").packageName(SODA_PKG).findOne(50)) return true;
      if (text("视频").packageName(SODA_PKG).findOne(50)) return true;
    } catch (eT) {}
    // 汽水内嵌抖音粉丝主页（与火力 waitForFanProfileEntered 强特征一致，避免点 1xt 行后空等）
    try {
      if (findFanProfileDouyinIdTextNode(50)) return true;
      if (textMatches(/^作品\s*\d*/).findOne(50)) return true;
      if (text("作品").findOne(50)) return true;
      if (text("获赞").findOne(50)) return true;
    } catch (eDy) {}
    sleep(30);
  }
  return false;
}

/** 汽水用户主页：在 ghw 锚点下方右→左滑一次，进入视频页 */
function swipeSodaProfileToVideoPage() {
  if (isSodaProfileVideoPageLikelyQuick()) {
    appendLog("已在视频页");
    return true;
  }
  appendSodaActionLog("右滑进视频页");
  invalidateSodaVideoGridCache();
  var w = device.width;
  var h = device.height;
  var belowAnchor = Math.max(
    typeof SODA_PROFILE_SWIPE_BELOW_ANCHOR_MIN_PX === "number" ? SODA_PROFILE_SWIPE_BELOW_ANCHOR_MIN_PX : 128,
    Math.floor(h * (typeof SODA_PROFILE_SWIPE_BELOW_ANCHOR_RATIO === "number" ? SODA_PROFILE_SWIPE_BELOW_ANCHOR_RATIO : 0.078))
  );
  var swipeY = Math.floor(h * 0.54);
  var anchor = findSodaProfileSwipeAnchorNode(35);
  if (anchor) {
    try {
      var b = anchor.bounds();
      swipeY = b.bottom + belowAnchor;
    } catch (eB) {}
  } else {
    // 锚点 bounds 约 (0,975)-(1080,1107)，在其底边再靠下一些滑动
    swipeY = Math.floor(h * 0.51) + belowAnchor;
  }
  swipeY = Math.max(Math.floor(h * 0.38), Math.min(h - 72, swipeY));
  var x1 = Math.floor(w * 0.88);
  var x2 = Math.floor(w * 0.12);
  try {
    swipe(x1, swipeY, x2, swipeY, 430);
  } catch (e0) {
    try {
      swipe(x1, swipeY, x2, swipeY, 380);
    } catch (e1) {
      appendLog("右滑进视频页失败");
      return false;
    }
  }
  var settleMs =
    typeof SODA_PROFILE_VIDEO_TAB_SETTLE_MS === "number" && SODA_PROFILE_VIDEO_TAB_SETTLE_MS > 0
      ? SODA_PROFILE_VIDEO_TAB_SETTLE_MS
      : 120;
  sleepCtrl(settleMs);
  return true;
}

/** 汽水：右滑后优先用缓存/区域限定扫格（禁止全树 .find） */
function findSodaWorkCoverPositionsByA11y(wgBand) {
  try {
    if (sodaHasCachedVideoGrid()) return __sodaVideoGridCache.cells;
    var gridCells = findSodaProfileVideoGridCellsByA11yCached(wgBand, 0);
    if (gridCells && gridCells.length) return gridCells;
  } catch (eGrid) {}
  return null;
}

function tryFindSodaWorkCoversByA11y(wgBand) {
  try {
    return findSodaWorkCoverPositionsByA11y(wgBand);
  } catch (e0) {}
  return null;
}

/** 火力/汽水共用：作品封面完整识别链（方差 → 无障碍格 → ImageView → 像素兜底） */
function pickWorkCoverPositionsFullChain(wgBand, opts) {
  opts = opts || {};
  var isSoda = opts.soda === true;
  var deadline =
    typeof opts.deadlineMs === "number" && opts.deadlineMs > 0 ? Date.now() + Math.floor(opts.deadlineMs) : 0;
  var skipHeavy = isSoda && opts.skipHeavyPixelPick !== false;
  var skipImageView = isSoda && opts.skipImageViewPick === true;
  function timedOut() {
    return deadline > 0 && Date.now() >= deadline;
  }
  var covers = null;
  if (WORK_GRID_ENABLE_SIMPLE_COVER_PICK && !timedOut()) {
    try {
      covers = findWorkCoverPositionsSimple(
        wgBand,
        isSoda
          ? {
              varianceMin:
                typeof SODA_WORK_COVER_VARIANCE_MIN === "number" && SODA_WORK_COVER_VARIANCE_MIN > 0
                  ? SODA_WORK_COVER_VARIANCE_MIN
                  : 16,
            }
          : null
      );
    } catch (eSimple) {
      covers = null;
    }
  }
  if (covers && covers.length >= 2) {
    return covers;
  }
  if ((!covers || covers.length < 1) && !timedOut()) {
    try {
      covers = isSoda ? findSodaWorkCoverPositionsByA11y(wgBand) : findWorkCoverPositionsByContainerNodes(wgBand);
    } catch (eNodeCover) {
      covers = null;
    }
  }
  if (covers && covers.length > 0 && isSoda && skipImageView && skipHeavy) {
    return covers;
  }
  if ((!covers || covers.length < 1) && !skipImageView && WORK_GRID_ENABLE_IMAGEVIEW_PICK && !timedOut()) {
    try {
      covers = findWorkCoverPositionsByImageView(wgBand);
    } catch (eIv) {
      covers = null;
    }
  }
  if (skipHeavy || timedOut()) {
    return covers && covers.length ? covers : null;
  }
  if ((!covers || covers.length < 1) && WORK_GRID_ENABLE_TEXT_EDGE_PICK && !timedOut()) {
    try {
      covers = findWorkCoverPositionsByTextEdgePixels(wgBand);
    } catch (eEdgePix) {
      covers = null;
    }
  }
  if ((!covers || covers.length < 1) && WORK_GRID_ENABLE_LIKE_NUMBER_PIXEL_PICK && !timedOut()) {
    try {
      covers = findWorkCoverPositionsByLikeNumberPixels(wgBand);
    } catch (eLikePix) {
      covers = null;
    }
  }
  if ((!covers || covers.length < 1) && !timedOut()) {
    try {
      covers = findWorkCoverPositionsByImage(wgBand);
    } catch (eImg) {
      covers = null;
    }
  }
  return covers && covers.length ? covers : null;
}

/** 汽水：快路径识别（三列 FrameLayout 格，不跑方差/截屏/重像素） */
function pickSodaWorkCoverPositionsForClick(wgBand, opts) {
  return sodaGetWorkCoversReadyForClick(wgBand);
}

/** @deprecated 汽水已走 pickSodaWorkCoverPositionsForClick，保留别名 */
function resolveSodaWorkCoversForClick(wgBand) {
  return pickSodaWorkCoverPositionsForClick(wgBand);
}

/** 右滑后轮询：作品格/ImageView 未就绪时短等几拍，避免误判无视频 */
function pollSodaWorkGridAfterSwipe(wgBand) {
  var budget =
    typeof SODA_PROFILE_GRID_POLL_BUDGET_MS === "number" && SODA_PROFILE_GRID_POLL_BUDGET_MS > 0
      ? SODA_PROFILE_GRID_POLL_BUDGET_MS
      : 360;
  var step =
    typeof SODA_PROFILE_GRID_POLL_STEP_MS === "number" && SODA_PROFILE_GRID_POLL_STEP_MS > 0
      ? SODA_PROFILE_GRID_POLL_STEP_MS
      : 55;
  var end = Date.now() + budget;
  var band = wgBand || sodaProfileWorkGridYBand();
  while (Date.now() < end && !__scriptUserStop) {
    if (isSodaVideoPagePaintReady()) return findSodaWorkCoverPositionsByA11y(band);
    var covers = findSodaWorkCoverPositionsByA11y(band);
    if (covers && covers.length) return covers;
    sleep(step);
  }
  return null;
}

/** @deprecated 汽水已改为右滑进视频页，保留别名避免旧调用断裂 */
function clickSodaProfileVideoTab() {
  return swipeSodaProfileToVideoPage();
}

function detectSodaProfileVideoGridLikely() {
  return sodaProfileHasVideoGridLikely();
}

function hasSodaProfileVideoAnchor() {
  if (findSodaProfileVideoTabNode()) return true;
  try {
    if (
      (text("作品").packageName(SODA_PKG).findOne(200) ||
        text("视频").packageName(SODA_PKG).findOne(200) ||
        text("歌单").packageName(SODA_PKG).findOne(200)) &&
      text("音乐分享").packageName(SODA_PKG).findOne(200)
    ) {
      return true;
    }
  } catch (e0) {}
  return detectSodaProfileVideoGridLikely();
}

function sodaProfileWorkGridYBand() {
  var sh = device.height;
  var anchor = findSodaProfileSwipeAnchorNode();
  if (anchor) {
    try {
      var ab = anchor.bounds();
      return {
        yMin: ab.bottom + Math.max(24, Math.floor(sh * 0.02)),
        yMax: Math.floor(sh * 0.92),
      };
    } catch (eA) {}
  }
  var band = findSodaProfileVideoTabYBand();
  var tabBottom = band.rowCy ? band.rowCy + Math.max(24, Math.floor(sh * 0.02)) : 0;
  return {
    yMin: tabBottom || Math.floor(sh * 0.52),
    yMax: Math.floor(sh * 0.92),
  };
}

/** 汽水第10步：右滑进视频页，再随机进入作品（复用火力作品识别） */
function randomClickSodaWorkLikeHeartOrBack() {
  return randomClickWorkLikeHeartOrBack({ soda: true });
}

function tryEnterSodaWorkFromProfile(maxStep) {
  return tryEnterSodaWorkWithProfileOperateGate(maxStep);
}

/** 汽水：粉丝列表是否已有可点行（轻量，禁止全树 collect） */
function detectSodaFansListRowVisibleFast() {
  try {
    if (detectSodaDouyinFansListExpandedLikely()) return true;
  } catch (eDy) {}
  var band = sodaFollowerListYBand();
  var sw = device.width;
  var yLo = band.yMin - 4;
  try {
    var nick = findOneSodaFansListNickInBounds(yLo, band.yMax, 45);
    if (nick) {
      var t = String(nick.text() || "").trim();
      if (t && t.length <= 48 && !/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音粉丝|回关)$/.test(t)) {
        return true;
      }
    }
  } catch (eNick) {}
  try {
    var rowNode = findOneSodaFansListRowInBounds(yLo, band.yMax, 45);
    if (rowNode && isValidSodaFollowerListRowNode(rowNode)) return true;
  } catch (eRow) {}
  return false;
}

/** 汽水：用户粉丝列表是否无有效行 */
function isSodaFollowerListEffectivelyEmpty() {
  try {
    if (detectSodaFansListRowVisibleFast()) return false;
    if (detectSodaFansListExpandedLikely() || detectSodaFansPageEnteredLikely()) {
      return !detectSodaFansListRowVisibleFast();
    }
  } catch (e0) {}
  return true;
}

function isSodaFanListVisibleQuick() {
  if (isSodaNativeFanListForStep11()) return true;
  try {
    if (idMatches(/.*:id\/1xt$/).findOne(25)) return true;
    if (text("回关").findOne(18)) return true;
  } catch (eDy0) {}
  if (detectSodaFansListRowVisibleFast()) return true;
  try {
    if (textContains("抖音粉丝").packageName(SODA_PKG).findOne(60)) return true;
  } catch (e1) {}
  try {
    if (detectSodaFansPageEnteredLikely()) return true;
  } catch (e2) {}
  return false;
}

function expandSodaFansListQuickAfterStep11() {
  if (detectSodaFansListRowVisibleFast()) return true;
  if (sodaHasDouyinFansSectionOnPage()) {
    return expandSodaDouyinFansListByDoubleTapTitle();
  }
  var onFansPage = false;
  try {
    onFansPage = detectSodaFansPageEnteredLikely();
  } catch (e1) {}
  if (!onFansPage) {
    try {
      onFansPage = !!textContains("抖音粉丝").packageName(SODA_PKG).findOne(60);
    } catch (e2) {}
  }
  if (!onFansPage) return false;
  appendSodaActionLog("双击粉丝标题");
  var expandWait =
    typeof SODA_AFTER_STEP11_EXPAND_WAIT_MS === "number" ? SODA_AFTER_STEP11_EXPAND_WAIT_MS : 500;
  var node = findSodaFansPageTitleTapNode();
  if (node && doubleClickSodaNode(node, SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS)) {
    sleepCtrl(140);
    if (waitSodaFansListExpanded(expandWait)) return true;
  }
  try {
    var w = device.width;
    var h = device.height;
    doubleTapAt(Math.floor(w * 0.5), Math.floor(h * 0.205), SODA_FANS_TITLE_DOUBLE_TAP_GAP_MS);
    sleepCtrl(140);
    return waitSodaFansListExpanded(expandWait);
  } catch (e3) {}
  return false;
}

/** 汽水第11步返回后：列表不可见时短恢复（可见时由 tryPick 直接点，不走此函数） */
function prepareSodaFansListForNextFollowerAfterStep11() {
  var budgetMs =
    typeof SODA_AFTER_STEP11_READY_BUDGET_MS === "number" ? SODA_AFTER_STEP11_READY_BUDGET_MS : 600;
  var stepMs =
    typeof SODA_AFTER_STEP11_RECOVER_STEP_MS === "number" ? SODA_AFTER_STEP11_RECOVER_STEP_MS : 35;
  var profileBackMs =
    typeof SODA_AFTER_STEP11_PROFILE_BACK_MS === "number" ? SODA_AFTER_STEP11_PROFILE_BACK_MS : 60;
  var endAt = Date.now() + budgetMs;
  while (Date.now() < endAt && !__scriptUserStop) {
    if (detectSodaFansListRowVisibleFast()) {
      var rowsReady = collectSodaFollowerListRowsDedupedFast(false);
      if (rowsReady && rowsReady.length) return rowsReady;
    }
    var acted = false;
    try {
      if (
        isSodaWorkPlayerPageLikelyFast(25) ||
        stillOnSodaUserProfilePageQuick() ||
        isLikelyOnFanUserProfilePageQuick()
      ) {
        back();
        sleepCtrl(profileBackMs);
        acted = true;
      } else if (!detectSodaFansListRowVisibleFast() && expandSodaFansListQuickAfterStep11()) {
        acted = true;
      }
    } catch (eAct) {}
    if (!acted) sleepCtrl(stepMs);
  }
  if (detectSodaFansListRowVisibleFast()) {
    return collectSodaFollowerListRowsDedupedFast(false);
  }
  return [];
}

/** 汽水第11步连跑：原生汽水粉丝列表（gi8/k3o，用户截图同款） */
function isSodaNativeFanListForStep11() {
  try {
    if (id(SODA_FOLLOWING_LIST_NICK_ID).packageName(SODA_PKG).findOne(22)) return true;
    if (id(SODA_FOLLOWING_LIST_NICK_ALT_ID).packageName(SODA_PKG).findOne(22)) return true;
    if (idMatches(/.*:id\/gi8$/).packageName(SODA_PKG).findOne(20)) return true;
    if (idMatches(/.*:id\/gja$/).packageName(SODA_PKG).findOne(20)) return true;
    if (id(SODA_FANS_LIST_ROW_ID).packageName(SODA_PKG).findOne(20)) return true;
    if (id(SODA_FANS_LIST_ROW_ALT_ID).packageName(SODA_PKG).findOne(20)) return true;
  } catch (e0) {}
  return false;
}

/** 汽水原生粉丝行高度（截图 k3o 232~375 @1920 屏） */
function sodaNativeFanListRowHeightPx() {
  var sh = device.height;
  return Math.max(120, Math.floor(sh * 0.0745));
}

/** gi8/gja 昵称向上找可点 k3o/k8= 行 */
function resolveSodaK3oRowFromGi8Nick(nickTv) {
  if (!nickTv) return null;
  try {
    var cur = nickTv.parent();
    for (var d = 0; d < 6 && cur; d++) {
      if (isSodaFansListRowIdStr(String(cur.id() || ""))) return cur;
      cur = cur.parent();
    }
  } catch (e) {}
  return nickTv.parent();
}

/** 汽水第11步连跑：内嵌抖音粉丝列表（仅 1xt/回关；有 gi8 时绝不是内嵌） */
function isDouyinEmbedFanListForSodaStep11() {
  if (isSodaNativeFanListForStep11()) return false;
  try {
    if (idMatches(/.*:id\/1xt$/).findOne(25)) return true;
    if (text("回关").findOne(18)) return true;
  } catch (e0) {}
  return false;
}

/** 汽水第11步连跑：当前是否为内嵌抖音粉丝列表（与火力 1xt/回关 同款 UI） */
function detectDouyinStyleFanListVisibleInSoda() {
  return isDouyinEmbedFanListForSodaStep11();
}

/** 内嵌抖音粉丝行节点（1xt/root_layout，不走汽水 k3o 校验） */
function isDouyinEmbedFanRowNode(node) {
  if (!node) return false;
  try {
    var cid = String(node.id() || "");
    return cid.indexOf("1xt") >= 0 || cid.indexOf("root_layout") >= 0;
  } catch (e) {}
  return false;
}

/** 汽水第11步：内嵌抖音粉丝行分段 findOne（禁止 .find() 全树，卡顿机可快 10s+） */
function collectDouyinEmbedFanRowsForSodaStep11Fast() {
  var band = followerListYBand();
  var sw = device.width;
  var raw = [];
  var seen = {};
  var findMs =
    typeof SODA_AFTER_STEP11_ROW_FINDONE_MS === "number" ? SODA_AFTER_STEP11_ROW_FINDONE_MS : 35;
  var rowH = Math.max(82, Math.floor(device.height * 0.078));
  var yCursor = band.yMin;
  for (var pass = 0; pass < 14 && yCursor < band.yMax - 16; pass++) {
    var yHi = Math.min(band.yMax, yCursor + rowH + 12);
    var w = null;
    try {
      w = idMatches(/.*:id\/1xt$/).boundsInside(0, yCursor, sw, yHi).findOne(findMs);
      if (!w) {
        w = idMatches(/.*:id\/root_layout$/)
          .boundsInside(0, yCursor, sw, yHi)
          .findOne(Math.min(findMs, 28));
      }
    } catch (e0) {}
    if (w) {
      try {
        var b = w.bounds();
        if (b.width() < sw * 0.38 || b.height() < 20) {
          yCursor += Math.floor(rowH * 0.65);
          continue;
        }
        var key = Math.floor(b.centerX()) + "," + Math.floor(b.centerY());
        if (!seen[key]) {
          seen[key] = 1;
          raw.push(w);
          yCursor = b.bottom + 4;
          continue;
        }
      } catch (e1) {}
    }
    yCursor += Math.floor(rowH * 0.65);
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

/** gi8 分段 findOne（第11步专用，禁止 gi8 .find() 全树） */
function collectSodaFollowerListRowsGi8BandFast() {
  var band = sodaFollowerListYBand();
  var sw = device.width;
  var yLo = band.yMin - 4;
  var yMax = band.yMax;
  if (!__sodaStep11FastEnter) {
    try {
      var title = textContains("抖音粉丝").packageName(SODA_PKG).findOne(40);
      if (title) {
        yLo = Math.max(yLo, title.bounds().bottom - Math.floor(device.height * 0.04));
      }
    } catch (eT) {}
  }
  var raw = [];
  var findMs =
    typeof SODA_AFTER_STEP11_ROW_FINDONE_MS === "number" ? SODA_AFTER_STEP11_ROW_FINDONE_MS : 35;
  var rowH = sodaNativeFanListRowHeightPx();
  var yCursor = yLo;
  for (var pass = 0; pass < 12 && yCursor < yMax - 16; pass++) {
    var yHi = Math.min(yMax, yCursor + rowH + 8);
    var nickTv = null;
    try {
      nickTv = findOneSodaFansListNickInBounds(yCursor, yHi, findMs);
    } catch (eN) {}
    if (nickTv) {
      var row = __sodaStep11FastEnter
        ? resolveSodaK3oRowFromGi8Nick(nickTv)
        : resolveSodaFollowerListClickRow(nickTv.parent());
      if (row) {
        try {
          var rb = row.bounds();
          var t = String(nickTv.text() || "").trim();
          if (t && t.length <= 48) raw.push(row);
          yCursor = rb.bottom + 4;
          continue;
        } catch (eB) {}
      }
    }
    yCursor += Math.floor(rowH * 0.55);
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

/** 汽水粉丝列表：下滑轮数上限（pass0=首屏，pass1..N=下滑 N 屏） */
function sodaFanListMaxScrollPasses() {
  var swipes =
    typeof SODA_FAN_LIST_SCROLL_SWIPES === "number" && SODA_FAN_LIST_SCROLL_SWIPES >= 0
      ? Math.floor(SODA_FAN_LIST_SCROLL_SWIPES)
      : 3;
  return swipes + 1;
}

/** 第11步连跑：下滑前先点「加载更多」kkv（有则点并等待），没有再 swipe */
function sodaStep11ScrollFanListDown() {
  appendLogProgress("粉丝列表下滑");
  var clickedMore = clickSodaFansListLoadMoreIfVisible(140);
  if (!clickedMore) {
    scrollFollowerListDown();
    sleepCtrl(
      typeof SODA_AFTER_STEP11_SCROLL_MS === "number" ? SODA_AFTER_STEP11_SCROLL_MS : 1000
    );
  }
  return clickedMore;
}

/** 汽水第11步连跑：原生 gi8/k3o 列表主路径（分段 findOne + 点 gi8 昵称区） */
function tryClickNextSodaNativeFanRowForStep11Fast() {
  if (!isSodaNativeFanListForStep11()) {
    try {
      if (stillOnSodaUserProfilePageQuick() || isSodaWorkPlayerPageLikelyFast(12)) {
        back();
        sleepCtrl(35);
      }
    } catch (eBk0) {}
    if (!isSodaNativeFanListForStep11()) return false;
  }
  var band = sodaFollowerListYBand();
  var sw = device.width;
  var sh = device.height;
  var findMs = 20;
  var rowH = sodaNativeFanListRowHeightPx();
  var yLo = band.yMin;
  try {
    var ft = text("粉丝")
      .packageName(SODA_PKG)
      .boundsInside(0, Math.floor(sh * 0.05), sw, Math.floor(sh * 0.22))
      .findOne(16);
    if (ft) yLo = Math.max(yLo, ft.bounds().bottom + 2);
  } catch (eTab) {}
  var enterMs =
    typeof SODA_STEP11_ENTER_CONFIRM_MS === "number" ? SODA_STEP11_ENTER_CONFIRM_MS : 260;
  var afterOpenMs = 25;
  function scanAndPickNativeFanRows() {
    var yCursor = yLo;
    for (var ri = 0; ri < 12 && yCursor < band.yMax - 20; ri++) {
      if (__scriptUserStop) return false;
      var yHi = Math.min(band.yMax, yCursor + rowH + 8);
      var nickTv = null;
      try {
        nickTv = findOneSodaFansListNickInBounds(yCursor, yHi, findMs);
      } catch (eN) {}
      if (!nickTv) {
        yCursor += Math.floor(rowH * 0.55);
        continue;
      }
      var nick = String(nickTv.text() || "").trim();
      if (
        !nick ||
        nick.length > 48 ||
        /^(关注|粉丝|获赞|回关|搜索|我的|首页|私信|歌单|收藏)$/.test(nick)
      ) {
        try {
          yCursor = nickTv.bounds().bottom + 4;
        } catch (eY0) {
          yCursor += rowH;
        }
        continue;
      }
      var vk = normalizeFollowerNickKey(nick) || followerRowVisitKey(nickTv, nick);
      if (!vk || __followerVisitedNicks[vk]) {
        try {
          yCursor = nickTv.bounds().bottom + 4;
        } catch (eY1) {
          yCursor += rowH;
        }
        continue;
      }
      appendLogProgress("进入：" + nick);
      var tapped = false;
      try {
        var nb = nickTv.bounds();
        var cx = Math.floor((nb.left + nb.right) / 2);
        var cy = Math.floor((nb.top + nb.bottom) / 2);
        var pt = nudgeTapAwayFromFloatClose(cx, cy);
        click(pt.x, pt.y);
        tapped = true;
      } catch (eTap) {}
      if (!tapped) {
        var k3 = resolveSodaK3oRowFromGi8Nick(nickTv);
        if (k3) {
          try {
            var kb = k3.bounds();
            var xBias =
              typeof SODA_FOLLOWER_ROW_TAP_X_BIAS === "number" ? SODA_FOLLOWER_ROW_TAP_X_BIAS : 0.44;
            click(Math.floor(kb.left + kb.width() * xBias), Math.floor((kb.top + kb.bottom) / 2));
            tapped = true;
          } catch (eK) {}
        }
      }
      if (!tapped) {
        yCursor += rowH;
        continue;
      }
      sleep(afterOpenMs);
      if (waitForSodaProfileEnteredQuick(enterMs)) {
        __followerVisitedNicks[vk] = 1;
        __noWorkLikeEntryDidBack = false;
        return true;
      }
      try {
        back();
        sleepCtrl(35);
      } catch (eBk) {}
      try {
        yCursor = nickTv.bounds().bottom + 4;
      } catch (eY2) {
        yCursor += rowH;
      }
    }
    return false;
  }
  for (var pass = 0; pass < sodaFanListMaxScrollPasses(); pass++) {
    if (__scriptUserStop) return false;
    if (pass > 0) sodaStep11ScrollFanListDown();
    if (scanAndPickNativeFanRows()) return true;
  }
  return false;
}

/** 汽水第11步连跑：统一采集（内嵌抖音分段 1xt；embed 时禁止走 gi8/k3o 慢路径） */
function collectSodaFollowerListRowsUnifiedForStep11() {
  var embed = isDouyinEmbedFanListForSodaStep11();
  if (embed) {
    try {
      var dyFast = collectDouyinEmbedFanRowsForSodaStep11Fast();
      if (dyFast && dyFast.length) return dyFast;
    } catch (eDy) {}
    return [];
  }
  try {
    var gi8 = collectSodaFollowerListRowsGi8BandFast();
    if (gi8 && gi8.length) return gi8;
  } catch (eG) {}
  try {
    var band = scanSodaFollowerListRowsByBand({ maxRows: 6, findMs: 30 });
    if (band && band.length) return band;
  } catch (eB) {}
  return [];
}

/** 汽水第11步连跑：内嵌抖音列表坐标点下一行（零全树采集，卡顿机主路径） */
function tryClickNextDouyinEmbedFanRowCoordFirst() {
  var band = followerListYBand();
  var sw = device.width;
  var sh = device.height;
  var rowH = Math.max(82, Math.floor(sh * 0.078));
  var yStart = Math.floor(sh * 0.24);
  try {
    var fansTab = text("粉丝").findOne(18);
    if (fansTab) yStart = Math.max(yStart, fansTab.bounds().bottom + 4);
  } catch (eTab) {}
  var afterOpenMs = 25;
  var enterMs =
    typeof SODA_STEP11_ENTER_CONFIRM_MS === "number" ? SODA_STEP11_ENTER_CONFIRM_MS : 260;
  var xTap = Math.floor(sw * 0.2);
  for (var pass = 0; pass < sodaFanListMaxScrollPasses(); pass++) {
    if (pass > 0) {
      sodaStep11ScrollFanListDown();
      try {
        var ft2 = text("粉丝").findOne(18);
        if (ft2) yStart = ft2.bounds().bottom + 4;
      } catch (eTab2) {}
    }
    for (var ri = 0; ri < 8; ri++) {
      if (__scriptUserStop) return false;
      var cy = yStart + ri * rowH + Math.floor(rowH * 0.42);
      if (cy > band.yMax - 20) break;
      var vk = "_dyembed_y_" + Math.floor(cy / 36);
      if (__followerVisitedNicks[vk]) continue;
      appendLogProgress("进入：目标粉丝");
      try {
        click(xTap, cy);
      } catch (eTap) {}
      sleep(afterOpenMs);
      if (waitForSodaProfileEnteredQuick(enterMs)) {
        __followerVisitedNicks[vk] = 1;
        __noWorkLikeEntryDidBack = false;
        return true;
      }
      try {
        back();
        sleepCtrl(35);
      } catch (eBk) {}
    }
  }
  return false;
}

/** 汽水第11步连跑：内嵌抖音 loose 采集+点行（坐标失败时兜底） */
function tryClickNextDouyinEmbedFanByLooseCollect(l0, t0, r0, b0) {
  for (var pass = 0; pass < sodaFanListMaxScrollPasses(); pass++) {
    if (__scriptUserStop) return false;
    if (pass > 0) sodaStep11ScrollFanListDown();
    var rows = collectDouyinEmbedFanRowsForSodaStep11Fast();
    if (!rows.length) continue;
    for (var i = 0; i < rows.length; i++) {
      var cand = rows[i];
      var nick = extractFollowerNicknameFromRow(cand, l0, t0, r0, b0);
      var vk = followerRowVisitKey(cand, nick);
      if (!vk || __followerVisitedNicks[vk]) continue;
      if (tryClickFollowerRowNode(cand, l0, t0, r0, b0, "进入：", nick)) {
        __followerVisitedNicks[vk] = 1;
        __noWorkLikeEntryDidBack = false;
        return true;
      }
    }
  }
  return false;
}

/** 汽水第11步连跑：参考火力 clickNextFollowerInList，单路径采集+点行+下滑 */
function clickNextFollowerInListForSodaStep11Fast(l0, t0, r0, b0) {
  if (__scriptUserStop) return false;
  __sodaStep11FastEnter = true;
  try {
    if (isSodaNativeFanListForStep11()) {
      if (tryClickNextSodaNativeFanRowForStep11Fast()) return true;
      appendLog("粉丝列表无可换用户");
      return false;
    }
    var dyEmbed = isDouyinEmbedFanListForSodaStep11();
    if (dyEmbed) {
      l0 = 252;
      t0 = 478;
      r0 = 342;
      b0 = 539;
      if (tryClickNextDouyinEmbedFanRowCoordFirst()) return true;
      if (tryClickNextDouyinEmbedFanByLooseCollect(l0, t0, r0, b0)) return true;
      appendLog("粉丝列表无可换用户");
      return false;
    }
    try {
      if (
        !detectSodaFansListRowVisibleFast() &&
        (stillOnSodaUserProfilePageQuick() || isSodaWorkPlayerPageLikelyFast(15))
      ) {
        back();
        sleepCtrl(40);
      }
    } catch (eBk) {}
    var maxScrollPasses = sodaFanListMaxScrollPasses();
    for (var pass = 0; pass < maxScrollPasses; pass++) {
      if (__scriptUserStop) return false;
      if (pass > 0) sodaStep11ScrollFanListDown();
      var rows = collectSodaFollowerListRowsUnifiedForStep11();
      if (!rows.length) continue;
      for (var i = 0; i < rows.length; i++) {
        var cand = rows[i];
        var nick = extractFollowerNicknameFromRow(cand, l0, t0, r0, b0);
        var vk = followerRowVisitKey(cand, nick);
        if (!vk) continue;
        if (__followerVisitedNicks[vk]) continue;
        if (tryClickFollowerRowNode(cand, l0, t0, r0, b0, "进入：", nick)) {
          __followerVisitedNicks[vk] = 1;
          __noWorkLikeEntryDidBack = false;
          return true;
        }
      }
    }
    if (detectSodaFansListRowVisibleFast()) {
      if (tryClickNextSodaFollowerByCoordScan()) return true;
    }
    appendLog("粉丝列表无可换用户");
    return false;
  } finally {
    __sodaStep11FastEnter = false;
  }
}

/** 汽水：用户粉丝列表点下一个未访问粉丝；opts.afterStep11 为第11步连跑轻量路径 */
function clickNextFollowerInListForSoda(opts) {
  opts = opts || {};
  var afterStep11 = opts.afterStep11 === true;
  if (__scriptUserStop) return false;
  var nickB3 = sodaFollowerRowNicknameBounds();
  var l0 = nickB3.l0,
    t0 = nickB3.t0,
    r0 = nickB3.r0,
    b0 = nickB3.b0;
  if (afterStep11) {
    return clickNextFollowerInListForSodaStep11Fast(l0, t0, r0, b0);
  }
  var leadInMs =
    typeof SODA_NEXT_FOLLOWER_LEAD_IN_MS === "number" ? SODA_NEXT_FOLLOWER_LEAD_IN_MS : 80;
  sleepCtrl(leadInMs);
  var rowsPrefetched = null;
  try {
    var rowsNow = collectSodaFollowerListRowsDeduped();
    if (!rowsNow.length) {
      var listWaitMs =
        typeof SODA_NEXT_FOLLOWER_LIST_WAIT_MS === "number" ? SODA_NEXT_FOLLOWER_LIST_WAIT_MS : 450;
      var waitEnd = Date.now() + listWaitMs;
      while (Date.now() < waitEnd && !__scriptUserStop) {
        rowsNow = collectSodaFollowerListRowsDeduped();
        if (rowsNow.length) break;
        sleepCtrl(100);
      }
    }
    if (!rowsNow.length) {
      if (stillOnSodaUserProfilePageQuick() || isLikelyOnFanUserProfilePageQuick()) {
        try {
          back();
        } catch (eBkPf) {}
        sleepCtrl(280);
        rowsNow = collectSodaFollowerListRowsDeduped();
      }
      if (!rowsNow.length && !detectSodaFansListExpandedLikely()) {
        try {
          sodaTargetProfileFansPageExpandListReady();
        } catch (eExp) {}
        sleepCtrl(220);
      }
    }
    rowsPrefetched = rowsNow;
  } catch (eRowPf) {}
  var scrollWaitMs = PACE_9_11.followerListScroll;
  var maxScrollPasses = sodaFanListMaxScrollPasses();
  for (var pass = 0; pass < maxScrollPasses; pass++) {
    if (__scriptUserStop) return false;
    if (pass > 0) {
      appendLog("粉丝列表下滑");
      scrollSodaFollowerListDown();
      sleepCtrl(scrollWaitMs);
    }
    var rows =
      pass === 0 && rowsPrefetched && rowsPrefetched.length
        ? rowsPrefetched
        : collectSodaFollowerListRowsDeduped();
    if (!rows.length) continue;
    for (var i = 0; i < rows.length; i++) {
      var cand = rows[i];
      var nick = extractFollowerNicknameFromRow(cand, l0, t0, r0, b0);
      var vk = followerRowVisitKey(cand, nick);
      if (!vk) continue;
      if (__followerVisitedNicks[vk]) continue;
      appendSodaEnterUserLog(nick);
      if (tryClickFollowerRowNode(cand, l0, t0, r0, b0, "进入：", nick, true)) {
        __followerVisitedNicks[vk] = 1;
        __noWorkLikeEntryDidBack = false;
        tryCaptureAndUploadFanProfileDouyinId();
        return true;
      }
    }
  }
  appendLog("粉丝列表无可换用户");
  return false;
}

/** 汽水第10步：进门智能逻辑（已操作跳过 / 对标不好全量重启；按主页昵称 glq 判定，无抖音号） */
function tryEnterSodaWorkWithProfileOperateGate(maxStep) {
  var guard = 0;
  while (guard < 18 && !__scriptUserStop) {
    guard++;
    var profileNick = "";
    for (var ni = 0; ni < 3 && !__scriptUserStop; ni++) {
      try {
        profileNick = readSodaProfileNicknameForOperateGate(true);
      } catch (eN0) {
        profileNick = "";
      }
      if (profileNick) break;
      sleepCtrl(120);
    }
    if (profileNick && hasOperatedSodaNickInWindow(profileNick)) {
      __currentTargetOperatedSkipN++;
      if (__currentTargetOperatedSkipN > 10) {
        appendLog("对标不好 更换对标");
        resetCurrentTargetOperatedSkipCounter();
        clearSodaFanProfileOperateContext();
        if (!runFlowSteps1Through9ForInjectedRestart(maxStep, false)) return false;
        resetCurrentTargetOperatedSkipCounter();
        continue;
      }
      appendLog("已操作过，换下一个");
      try {
        back();
      } catch (eBk0) {}
      sleepCtrl(420);
      clearSodaFanProfileOperateContext();
      if (!clickNextFollowerInListForSoda()) return false;
      continue;
    }
    __currentFanProfileSodaNick = profileNick || "";
    __currentFanProfileDyid = "";
    var entered = randomClickSodaWorkLikeHeartOrBack();
    if (__sodaNoVideoSkipToNext) {
      __sodaNoVideoSkipToNext = false;
      clearSodaFanProfileOperateContext();
      if (!clickNextFollowerInListForSoda()) return false;
      continue;
    }
    if (entered) return true;
    if (__sodaNoVideoSkipToNext) {
      __sodaNoVideoSkipToNext = false;
      clearSodaFanProfileOperateContext();
      if (!clickNextFollowerInListForSoda()) return false;
      continue;
    }
    if (!__scriptUserStop && !__workEntryTerminalFail) {
      sleepCtrl(280);
      entered = randomClickSodaWorkLikeHeartOrBack();
    }
    if (__sodaNoVideoSkipToNext) {
      __sodaNoVideoSkipToNext = false;
      clearSodaFanProfileOperateContext();
      if (!clickNextFollowerInListForSoda()) return false;
      continue;
    }
    return entered;
  }
  return false;
}

function randomEnterWorkAfterInjectedRestart() {
  if (isSodaPlatformSelected()) return randomClickSodaWorkLikeHeartOrBack();
  return randomClickWorkLikeHeartOrBack();
}

/** 汽水粉丝列表行 id 是否匹配（k3o / k8= 等） */
function isSodaFansListRowIdStr(cid) {
  if (!cid) return false;
  return cid.indexOf("k3o") >= 0 || cid.indexOf("k8=") >= 0;
}

/** 汽水粉丝列表昵称 id 是否匹配（gi8 / gja 等） */
function isSodaFansListNickIdStr(cid) {
  if (!cid) return false;
  return cid.indexOf("gi8") >= 0 || cid.indexOf("gja") >= 0;
}

/** 汽水粉丝列表：Y 带内 find 全部可点行（k3o → k8= → idMatches） */
function findSodaFansListRowNodesInBounds(yMin, yMax, requireClickable) {
  var sw = device.width;
  var coll = null;
  var opts = requireClickable === false ? {} : { clickable: true };
  function tryFind(rowId, idRe) {
    try {
      var q = id(rowId).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax);
      if (opts.clickable) q = q.clickable(true);
      var c = q.find();
      if (c && c.size()) return c;
    } catch (e0) {}
    if (idRe) {
      try {
        var q2 = idMatches(idRe).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax);
        if (opts.clickable) q2 = q2.clickable(true);
        c = q2.find();
        if (c && c.size()) return c;
      } catch (e1) {}
    }
    return null;
  }
  coll = tryFind(SODA_FANS_LIST_ROW_ID, /.*:id\/k3o$/);
  if (!coll || !coll.size()) coll = tryFind(SODA_FANS_LIST_ROW_ALT_ID, /.*:id\/k8=$/);
  if ((!coll || !coll.size()) && requireClickable !== false) {
    try {
      coll = id(SODA_FANS_LIST_ROW_ID).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
    } catch (eNc0) {}
    if (!coll || !coll.size()) {
      try {
        coll = id(SODA_FANS_LIST_ROW_ALT_ID).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
      } catch (eNc1) {}
    }
    if (!coll || !coll.size()) {
      try {
        coll = idMatches(/.*:id\/k8=$/).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
      } catch (eNc2) {}
    }
  }
  return coll;
}

/** 汽水粉丝列表：Y 带内 findOne 可点行 */
function findOneSodaFansListRowInBounds(yMin, yMax, findMs) {
  var sw = device.width;
  findMs = findMs == null ? 35 : findMs;
  var row = null;
  try {
    row = id(SODA_FANS_LIST_ROW_ID)
      .packageName(SODA_PKG)
      .clickable(true)
      .boundsInside(0, yMin, sw, yMax)
      .findOne(findMs);
  } catch (e0) {}
  if (!row) {
    try {
      row = id(SODA_FANS_LIST_ROW_ALT_ID)
        .packageName(SODA_PKG)
        .clickable(true)
        .boundsInside(0, yMin, sw, yMax)
        .findOne(findMs);
    } catch (e1) {}
  }
  if (!row) {
    try {
      row = idMatches(/.*:id\/k3o$/)
        .packageName(SODA_PKG)
        .clickable(true)
        .boundsInside(0, yMin, sw, yMax)
        .findOne(Math.min(findMs, 50));
    } catch (e2) {}
  }
  if (!row) {
    try {
      row = idMatches(/.*:id\/k8=$/)
        .packageName(SODA_PKG)
        .clickable(true)
        .boundsInside(0, yMin, sw, yMax)
        .findOne(Math.min(findMs, 45));
    } catch (e3) {}
  }
  return row;
}

/** 汽水粉丝列表：Y 带内 find 全部昵称 TextView（gi8 → gja → idMatches） */
function findSodaFansListNickNodesInBounds(yMin, yMax) {
  var sw = device.width;
  var coll = null;
  try {
    coll = id(SODA_FOLLOWING_LIST_NICK_ID).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
  } catch (e0) {}
  if (!coll || !coll.size()) {
    try {
      coll = id(SODA_FOLLOWING_LIST_NICK_ALT_ID)
        .packageName(SODA_PKG)
        .boundsInside(0, yMin, sw, yMax)
        .find();
    } catch (e1) {}
  }
  if (!coll || !coll.size()) {
    try {
      coll = idMatches(/.*:id\/gi8$/).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
    } catch (e2) {}
  }
  if (!coll || !coll.size()) {
    try {
      coll = idMatches(/.*:id\/gja$/).packageName(SODA_PKG).boundsInside(0, yMin, sw, yMax).find();
    } catch (e3) {}
  }
  return coll;
}

/** 汽水粉丝列表：Y 带内 findOne 昵称 TextView */
function findOneSodaFansListNickInBounds(yMin, yMax, findMs) {
  var sw = device.width;
  findMs = findMs == null ? 35 : findMs;
  var nick = null;
  try {
    nick = id(SODA_FOLLOWING_LIST_NICK_ID)
      .packageName(SODA_PKG)
      .boundsInside(0, yMin, sw, yMax)
      .findOne(findMs);
  } catch (e0) {}
  if (!nick) {
    try {
      nick = id(SODA_FOLLOWING_LIST_NICK_ALT_ID)
        .packageName(SODA_PKG)
        .boundsInside(0, yMin, sw, yMax)
        .findOne(findMs);
    } catch (e1) {}
  }
  if (!nick) {
    try {
      nick = idMatches(/.*:id\/gi8$/)
        .packageName(SODA_PKG)
        .boundsInside(0, yMin, sw, yMax)
        .findOne(Math.min(findMs, 50));
    } catch (e2) {}
  }
  if (!nick) {
    try {
      nick = idMatches(/.*:id\/gja$/)
        .packageName(SODA_PKG)
        .boundsInside(0, yMin, sw, yMax)
        .findOne(Math.min(findMs, 45));
    } catch (e3) {}
  }
  return nick;
}

/** 汽水粉丝列表可视 Y 带：须在「关注/粉丝」Tab 下方，避免点到 Tab 区（实测首行 k3o top≈287） */
function sodaFollowerListYBand() {
  var sh = device.height;
  var sw = device.width;
  var yMin = Math.floor(sh * 0.115);
  var tabBottom = 0;
  try {
    var fansTab = text("粉丝")
      .packageName(SODA_PKG)
      .boundsInside(0, Math.floor(sh * 0.06), sw, Math.floor(sh * 0.24))
      .findOne(60);
    if (fansTab) tabBottom = fansTab.bounds().bottom;
  } catch (e0) {}
  if (!tabBottom) {
    try {
      var followTab = text("关注")
        .packageName(SODA_PKG)
        .boundsInside(0, Math.floor(sh * 0.06), sw, Math.floor(sh * 0.24))
        .findOne(80);
      if (followTab) tabBottom = followTab.bounds().bottom;
    } catch (e1) {}
  }
  if (!tabBottom) {
    try {
      var title = id(SODA_FANS_PAGE_TITLE_ID).packageName(SODA_PKG).findOne(80);
      if (title) tabBottom = title.bounds().bottom;
    } catch (e2) {}
  }
  if (tabBottom > 0) yMin = Math.max(yMin, tabBottom + Math.floor(sh * 0.012));
  var reserveBottom = Math.max(88, Math.floor(sh * 0.07));
  return { yMin: yMin, yMax: sh - reserveBottom };
}

function sodaFollowerRowNicknameBounds() {
  var ref = SODA_FOLLOWER_ROW_NICK_REF || { l0: 252, t0: 334, r0: 744, b0: 395 };
  return { l0: ref.l0, t0: ref.t0, r0: ref.r0, b0: ref.b0 };
}

function sodaFollowerRowHasNickname(node) {
  if (!node) return false;
  try {
    var gi8 =
      node.findOne(id(SODA_FOLLOWING_LIST_NICK_ID)) ||
      node.findOne(id(SODA_FOLLOWING_LIST_NICK_ALT_ID)) ||
      node.findOne(idMatches(/.*:id\/gi8$/)) ||
      node.findOne(idMatches(/.*:id\/gja$/));
    if (gi8) {
      var gt = String(gi8.text() || "").trim();
      if (gt && gt.length <= 48 && !/^(关注|粉丝|获赞|回关|搜索|我的|首页)$/.test(gt)) return true;
    }
  } catch (e0) {}
  try {
    var tvs = node.find(className("android.widget.TextView"));
    if (tvs) {
      for (var i = 0; i < tvs.size(); i++) {
        var t = String(tvs.get(i).text() || "").trim();
        if (!t || t.length > 48) continue;
        if (/^(关注|粉丝|获赞|回关|搜索|我的|首页|私信|歌单|收藏)$/.test(t)) continue;
        if (/^[\d\.\s,，万亿wW+\-]+$/.test(t)) continue;
        return true;
      }
    }
  } catch (e1) {}
  return false;
}

/** 汽水粉丝列表有效行：k3o 可点、行高足够、在 Tab 下方且含昵称 */
function isValidSodaFollowerListRowNode(n) {
  if (!n) return false;
  try {
    var b = n.bounds();
    var sh = device.height;
    var sw = device.width;
    var band = sodaFollowerListYBand();
    if (b.top < band.yMin - 4 || b.centerY() > band.yMax) return false;
    if (b.height() < Math.max(80, Math.floor(sh * 0.048))) return false;
    if (b.width() < sw * 0.38) return false;
    return sodaFollowerRowHasNickname(n);
  } catch (e) {
    return false;
  }
}

function isValidSodaFollowerListRowNodeForContext(n) {
  if (sodaHasDouyinFansSectionOnPage()) return isValidSodaDouyinFansListRowNode(n);
  return isValidSodaFollowerListRowNode(n);
}

/** 原生汽水粉丝列表：统计有效 k3o 行（折叠态 gi8 残留不算展开） */
function countSodaNativeFansListValidRows(maxRows) {
  maxRows = maxRows == null ? 2 : maxRows;
  var n = 0;
  try {
    var band = sodaFollowerListYBand();
    var sw = device.width;
    var yLo = band.yMin - 4;
    var yCursor = yLo;
    var rowH = sodaNativeFanListRowHeightPx();
    for (var pass = 0; pass < 10 && n < maxRows && yCursor < band.yMax - 20; pass++) {
      var yHi = Math.min(band.yMax, yCursor + rowH + 8);
      var row = null;
      try {
        row = findOneSodaFansListRowInBounds(yCursor, yHi, 35);
      } catch (eFind) {}
      if (row && isValidSodaFollowerListRowNode(row)) {
        n++;
        try {
          yCursor = row.bounds().bottom + 6;
        } catch (eY) {
          yCursor += rowH;
        }
        continue;
      }
      yCursor += Math.floor(rowH * 0.55);
    }
  } catch (eScan) {}
  if (n >= maxRows) return n;
  try {
    var rows = collectSodaFollowerListRowsDeduped();
    if (rows && rows.length) {
      for (var i = 0; i < rows.length && n < maxRows; i++) {
        if (isValidSodaFollowerListRowNode(rows[i])) n++;
      }
    }
  } catch (eColl) {}
  return n;
}

function resolveSodaFollowerListClickRow(node) {
  if (!node) return null;
  var cur = node;
  var depth = 0;
  for (depth = 0; depth < 8 && cur; depth++) {
    try {
      if (isValidSodaFollowerListRowNodeForContext(cur)) return cur;
      var cid = String(cur.id() || "");
      if (isSodaFansListRowIdStr(cid) && cur.clickable && cur.clickable()) return cur;
    } catch (e0) {}
    try {
      cur = cur.parent();
    } catch (e1) {
      cur = null;
    }
  }
  return isValidSodaFollowerListRowNodeForContext(node) ? node : null;
}

/** 汽水粉丝列表底部「加载更多」节点（id=kkv / kpn，或文案兜底） */
function findSodaFansListLoadMoreNode(maxWaitMs) {
  var budget = typeof maxWaitMs === "number" && maxWaitMs > 0 ? maxWaitMs : 120;
  function loadMoreTextOk(node) {
    if (!node) return false;
    try {
      var t = String(node.text() || "").trim();
      return t === "加载更多" || t.indexOf("加载更多") >= 0;
    } catch (eT) {
      return false;
    }
  }
  function loadMoreInListBand(node) {
    if (!node) return false;
    try {
      var b = node.bounds();
      var h = device.height;
      var w = device.width;
      if (b.centerY() < Math.floor(h * 0.12)) return false;
      if (b.centerY() > Math.floor(h * 0.985)) return false;
      if (b.centerX() < Math.floor(w * 0.08) || b.centerX() > Math.floor(w * 0.92)) return false;
      return true;
    } catch (eB) {
      return false;
    }
  }
  try {
    var node =
      id(SODA_FANS_LIST_LOAD_MORE_ID).packageName(SODA_PKG).text("加载更多").findOne(budget) ||
      id(SODA_FANS_LIST_LOAD_MORE_ALT_ID).packageName(SODA_PKG).text("加载更多").findOne(budget) ||
      idMatches(/.*:id\/kkv$/).packageName(SODA_PKG).text("加载更多").findOne(budget) ||
      idMatches(/.*:id\/kpn$/).packageName(SODA_PKG).text("加载更多").findOne(budget);
    if (node) return node;
    node =
      id(SODA_FANS_LIST_LOAD_MORE_ID).packageName(SODA_PKG).findOne(budget) ||
      id(SODA_FANS_LIST_LOAD_MORE_ALT_ID).packageName(SODA_PKG).findOne(budget) ||
      idMatches(/.*:id\/kkv$/).packageName(SODA_PKG).findOne(budget) ||
      idMatches(/.*:id\/kpn$/).packageName(SODA_PKG).findOne(budget);
    if (loadMoreTextOk(node)) return node;
    var sw = device.width;
    var sh = device.height;
    var yMin = Math.floor(sh * 0.55);
    node = text("加载更多").packageName(SODA_PKG).boundsInside(0, yMin, sw, sh).findOne(budget);
    if (loadMoreInListBand(node)) return node;
    node = textContains("加载更多").packageName(SODA_PKG).boundsInside(0, yMin, sw, sh).findOne(budget);
    if (loadMoreInListBand(node)) return node;
  } catch (e0) {}
  return null;
}

/** 若粉丝列表底部出现「加载更多」，先点击再继续下滑 */
function clickSodaFansListLoadMoreIfVisible(maxWaitMs) {
  if (__scriptUserStop) return false;
  var node = findSodaFansListLoadMoreNode(maxWaitMs);
  if (!node) return false;
  try {
    var b = node.bounds();
    var h = device.height;
    if (b.centerY() < Math.floor(h * 0.12)) return false;
  } catch (eB) {}
  appendSodaActionLog("点加载更多");
  var ok = false;
  try {
    ok = clickNode(node);
  } catch (eC) {
    ok = false;
  }
  if (!ok) {
    try {
      var p = node.parent ? node.parent() : null;
      if (p && p.clickable && p.clickable() && clickNode(p)) ok = true;
    } catch (eP) {}
  }
  if (!ok) {
    try {
      var bb = node.bounds();
      click(bb.centerX(), bb.centerY());
      ok = true;
    } catch (eTap) {}
  }
  if (ok) {
    sleepCtrl(
      typeof SODA_FANS_LOAD_MORE_AFTER_CLICK_MS === "number" ? SODA_FANS_LOAD_MORE_AFTER_CLICK_MS : 850
    );
  }
  return ok;
}

/** 汽水粉丝列表下滑：先点「加载更多」（若有），再 swipe 下滑 */
function scrollSodaFollowerListDown() {
  clickSodaFansListLoadMoreIfVisible(160);
  return scrollFollowerListDown();
}

/** 汽水粉丝列表行采集（优先 k3o 行容器 / gi8 昵称；双区块页仅采抖音粉丝区） */
function collectSodaFollowerListRowsDeduped() {
  if (sodaHasDouyinFansSectionOnPage()) {
    return collectSodaDouyinFansListRowsStrict();
  }
  var band = sodaFollowerListYBand();
  var raw = [];
  var sw = device.width;
  try {
    var rowColl = findSodaFansListRowNodesInBounds(band.yMin - 4, band.yMax, true);
    if (rowColl && rowColl.size) {
      for (var k = 0; k < rowColl.size(); k++) {
        var rowN = rowColl.get(k);
        try {
          var rb = rowN.bounds();
          if (rb.top < band.yMin - 4 || rb.centerY() > band.yMax) continue;
          if (!isValidSodaFollowerListRowNode(rowN)) continue;
          raw.push(rowN);
        } catch (eR) {}
      }
    }
  } catch (eK) {}
  if (raw.length === 0) {
    try {
      var nickColl = findSodaFansListNickNodesInBounds(band.yMin - 4, band.yMax);
      if (nickColl && nickColl.size) {
        for (var ni = 0; ni < nickColl.size(); ni++) {
          var tv = nickColl.get(ni);
          try {
            var tb = tv.bounds();
            if (tb.top < band.yMin - 4 || tb.centerY() > band.yMax) continue;
            var t = String(tv.text() || "").trim();
            if (!t || t.length > 48) continue;
            if (/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音粉丝|回关)$/.test(t)) continue;
            var rowP = resolveSodaFollowerListClickRow(tv.parent());
            if (rowP) raw.push(rowP);
          } catch (eTv) {}
        }
      }
    } catch (eNick) {}
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

/** 从 gi8 昵称节点列表解析可点行（与 collectSodaFollowerListRowsDeduped 昵称分支一致） */
function pushSodaFollowerRowsFromGi8NickColl(nickColl, yMin, yMax, raw, douyinSection) {
  if (!nickColl || !nickColl.size) return;
  for (var ni = 0; ni < nickColl.size(); ni++) {
    var tv = nickColl.get(ni);
    try {
      var tb = tv.bounds();
      if (tb.top < yMin - 4 || tb.centerY() > yMax) continue;
      var t = String(tv.text() || "").trim();
      if (!t || t.length > 48) continue;
      if (/^(关注|粉丝|获赞|推荐|搜索|我的|首页|私信|歌单|收藏|抖音粉丝|回关)$/.test(t)) continue;
      var rowP = resolveSodaFollowerListClickRow(tv.parent());
      if (!rowP) continue;
      if (douyinSection) {
        if (isValidSodaDouyinFansListRowNode(rowP)) raw.push(rowP);
      } else if (isValidSodaFollowerListRowNode(rowP)) {
        raw.push(rowP);
      }
    } catch (eTv) {}
  }
}

/** 仅 gi8 昵称采集（跳过 k3o 全树 .find()，判断与完整采集相同，卡顿机快很多） */
function collectSodaFollowerListRowsGi8Only() {
  var band = sodaFollowerListYBand();
  var douyinSection = sodaHasDouyinFansSectionOnPage();
  var yMin = douyinSection ? sodaDouyinFansListYMin() : band.yMin - 4;
  var yMax = band.yMax;
  var raw = [];
  try {
    var nickColl = findSodaFansListNickNodesInBounds(yMin, yMax);
    pushSodaFollowerRowsFromGi8NickColl(nickColl, yMin, yMax, raw, douyinSection);
  } catch (eGi8) {}
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

/** 汽水粉丝列表：按行带分段 findOne 采集（主线程，避免子线程无障碍拿不到节点） */
function scanSodaFollowerListRowsByBand(opts) {
  opts = opts || {};
  var maxRows = typeof opts.maxRows === "number" && opts.maxRows > 0 ? opts.maxRows : 10;
  var findMs =
    typeof opts.findMs === "number" && opts.findMs > 0
      ? opts.findMs
      : typeof SODA_AFTER_STEP11_ROW_FINDONE_MS === "number"
        ? SODA_AFTER_STEP11_ROW_FINDONE_MS
        : 70;
  var douyinSection = sodaHasDouyinFansSectionOnPage();
  var band = sodaFollowerListYBand();
  var sw = device.width;
  var yLo = douyinSection ? sodaDouyinFansListYMin() : band.yMin - 4;
  var yMax = band.yMax;
  var raw = [];
  var seen = {};
  var rowH = Math.max(82, Math.floor(device.height * 0.078));
  var yCursor = yLo;
  for (var pass = 0; pass < maxRows && yCursor < yMax - 16; pass++) {
    var yHi = Math.min(yMax, yCursor + rowH + 10);
    var row = null;
    try {
      row = findOneSodaFansListRowInBounds(yCursor, yHi, findMs);
    } catch (eR) {}
    if (!row) {
      try {
        var nickTv = findOneSodaFansListNickInBounds(yCursor, yHi, findMs);
        if (nickTv) row = resolveSodaFollowerListClickRow(nickTv.parent());
      } catch (eN) {}
    }
    if (row) {
      try {
        var rb = row.bounds();
        var key = Math.floor(rb.centerX()) + "," + Math.floor(rb.centerY());
        var valid = douyinSection ? isValidSodaDouyinFansListRowNode(row) : isValidSodaFollowerListRowNode(row);
        if (!seen[key] && valid) {
          seen[key] = 1;
          raw.push(row);
          yCursor = rb.bottom + 6;
          continue;
        }
      } catch (eB) {}
    }
    yCursor += Math.floor(rowH * 0.7);
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

/** 汽水第11步连跑：快扫失败但屏上有行时，按参考行高坐标点下一格 */
function tryClickNextSodaFollowerByCoordScan() {
  if (!detectSodaFansListRowVisibleFast()) return false;
  var band = sodaFollowerListYBand();
  var sh = device.height;
  var sw = device.width;
  var ref = SODA_FOLLOWER_ROW_NICK_REF || { l0: 252, t0: 334, r0: 744, b0: 395 };
  var refSh = 1920;
  var scaleY = sh / refSh;
  var rowH = Math.max(Math.floor((ref.b0 - ref.t0) * scaleY), Math.floor(sh * 0.078));
  var yStart = sodaHasDouyinFansSectionOnPage() ? sodaDouyinFansListYMin() : band.yMin;
  var firstCy = Math.max(yStart + Math.floor(rowH * 0.5), Math.floor(((ref.t0 + ref.b0) / 2) * scaleY));
  var xBias =
    typeof SODA_FOLLOWER_ROW_TAP_X_BIAS === "number" ? SODA_FOLLOWER_ROW_TAP_X_BIAS : 0.44;
  var afterOpenMs =
    typeof SODA_STEP9_AFTER_OPEN_PROFILE_MS === "number" ? SODA_STEP9_AFTER_OPEN_PROFILE_MS : 60;
  var enterMs =
    typeof SODA_STEP9_ENTER_CONFIRM_MS === "number" ? SODA_STEP9_ENTER_CONFIRM_MS : 420;
  for (var ri = 0; ri < 8; ri++) {
    if (__scriptUserStop) return false;
    var cy = firstCy + ri * rowH;
    if (cy > band.yMax - 20) break;
    var cx = Math.floor(sw * xBias);
    var pt = nudgeTapAwayFromFloatClose(cx, cy);
    appendLogProgress("进入：目标粉丝");
    try {
      click(pt.x, pt.y);
    } catch (eTap) {}
    sleep(afterOpenMs);
    if (waitForSodaProfileEnteredQuick(enterMs)) {
      __noWorkLikeEntryDidBack = false;
      return true;
    }
    try {
      back();
      sleepCtrl(60);
    } catch (eBk) {}
  }
  return false;
}

/** 汽水第11步连跑：从已采集行里点第一个未访问粉丝（判断与 tryClickFollowerRowNode 一致） */
function tryPickNextUnvisitedFromSodaRows(rows, l0, t0, r0, b0) {
  if (!rows || !rows.length) return false;
  __sodaLastPickSawValidRows = true;
  for (var i = 0; i < rows.length; i++) {
    if (__scriptUserStop) return false;
    var cand = rows[i];
    var nick = extractFollowerNicknameFromRow(cand, l0, t0, r0, b0);
    var vk = followerRowVisitKey(cand, nick);
    if (!vk || __followerVisitedNicks[vk]) continue;
    if (tryClickFollowerRowNode(cand, l0, t0, r0, b0, "进入：", nick)) {
      __followerVisitedNicks[vk] = 1;
      __noWorkLikeEntryDidBack = false;
      tryCaptureAndUploadFanProfileDouyinId();
      return true;
    }
  }
  return false;
}

/** 汽水粉丝列表行采集（第11步连跑：分段扫 → gi8 → 必要时才 k3o 全量 .find()） */
function collectSodaFollowerListRowsDedupedFast(allowFullFallback) {
  var light = scanSodaFollowerListRowsByBand({ maxRows: 10 });
  if (light && light.length) return light;
  var gi8 = collectSodaFollowerListRowsGi8Only();
  if (gi8 && gi8.length) return gi8;
  if (!allowFullFallback || !detectSodaFansListRowVisibleFast()) return [];
  try {
    var full = collectSodaFollowerListRowsDeduped();
    if (full && full.length) return full;
  } catch (eFull) {}
  return [];
}

/** 汽水第11步连跑：分段扫行，命中第一个未访问粉丝即点（判断逻辑与 tryClickFollowerRowNode 一致） */
function tryPickNextUnvisitedSodaFollowerAfterStep11(l0, t0, r0, b0) {
  __sodaLastPickSawValidRows = false;
  var gi8Rows = collectSodaFollowerListRowsGi8Only();
  if (gi8Rows.length && tryPickNextUnvisitedFromSodaRows(gi8Rows, l0, t0, r0, b0)) return true;
  if (gi8Rows.length) __sodaLastPickSawValidRows = true;
  var findMs =
    typeof SODA_AFTER_STEP11_ROW_FINDONE_MS === "number" ? SODA_AFTER_STEP11_ROW_FINDONE_MS : 55;
  var douyinSection = sodaHasDouyinFansSectionOnPage();
  var band = sodaFollowerListYBand();
  var sw = device.width;
  var yLo = douyinSection ? sodaDouyinFansListYMin() : band.yMin - 4;
  var yMax = band.yMax;
  var seen = {};
  var rowH = Math.max(82, Math.floor(device.height * 0.078));
  var yCursor = yLo;
  for (var pass = 0; pass < 10 && yCursor < yMax - 16; pass++) {
    if (__scriptUserStop) return false;
    var yHi = Math.min(yMax, yCursor + rowH + 10);
    var row = null;
    try {
      row = findOneSodaFansListRowInBounds(yCursor, yHi, findMs);
    } catch (eR) {}
    if (!row) {
      try {
        var nickTv = findOneSodaFansListNickInBounds(yCursor, yHi, findMs);
        if (nickTv) row = resolveSodaFollowerListClickRow(nickTv.parent());
      } catch (eN) {}
    }
    if (row) {
      try {
        var rb = row.bounds();
        var posKey = Math.floor(rb.centerX()) + "," + Math.floor(rb.centerY());
        var valid = douyinSection ? isValidSodaDouyinFansListRowNode(row) : isValidSodaFollowerListRowNode(row);
        if (!seen[posKey] && valid) {
          seen[posKey] = 1;
          __sodaLastPickSawValidRows = true;
          yCursor = rb.bottom + 6;
          var nick = extractFollowerNicknameFromRow(row, l0, t0, r0, b0);
          var vk = followerRowVisitKey(row, nick);
          if (vk && !__followerVisitedNicks[vk]) {
            if (tryClickFollowerRowNode(row, l0, t0, r0, b0, "进入：", nick)) {
              __followerVisitedNicks[vk] = 1;
              __noWorkLikeEntryDidBack = false;
              tryCaptureAndUploadFanProfileDouyinId();
              return true;
            }
          }
          continue;
        }
      } catch (eB) {}
    }
    yCursor += Math.floor(rowH * 0.7);
  }
  return false;
}

function clickFansOnMePageForSoda() {
  appendSodaActionLog("点我页粉丝");
  dismissSodaMyPageAdIfAnyQuick();
  var settle = typeof SODA_FANS_PAGE_SETTLE_MS === "number" ? SODA_FANS_PAGE_SETTLE_MS : 120;
  if (clickSodaFansTabById() && sodaFansPageEnteredAndListReady()) {
    sleepCtrl(settle);
    return true;
  }
  try {
    if (clickSodaFansTabByOcr() && sodaFansPageEnteredAndListReady()) {
      sleepCtrl(settle);
      return true;
    }
  } catch (eOcr) {}
  try {
    appendSodaActionLog("点我页粉丝(坐标)");
    click(Math.floor(device.width * 0.6), Math.floor(device.height * 0.34));
    if (sodaFansPageEnteredAndListReady()) {
      sleepCtrl(settle);
      return true;
    }
  } catch (eCoord) {}
  appendLog("点我页粉丝失败");
  return false;
}

/** 汽水用户主页：找粉丝数 TextView（gk- / gle） */
function findSodaProfileFansCountNode(findMs) {
  findMs = findMs == null ? 320 : findMs;
  var ids = [SODA_PROFILE_FANS_COUNT_ID, SODA_PROFILE_FANS_COUNT_ALT_ID];
  for (var i = 0; i < ids.length; i++) {
    try {
      var n = id(ids[i]).packageName(SODA_PKG).findOne(findMs);
      if (n) return n;
    } catch (e0) {}
  }
  try {
    var nGk = idMatches(/.*:id\/gk-$/).packageName(SODA_PKG).findOne(Math.min(findMs, 220));
    if (nGk) return nGk;
  } catch (e1) {}
  try {
    var nGle = idMatches(/.*:id\/gle$/).packageName(SODA_PKG).findOne(Math.min(findMs, 220));
    if (nGle) return nGle;
  } catch (e2) {}
  return null;
}

/** 从统计条容器（gf5/gf-）子节点读粉丝数 */
function sodaProfileFansCountFromStatsLayout(layout) {
  if (!layout) return null;
  var hasFansLbl = false;
  var numVal = null;
  var cc = 0;
  try {
    cc = layout.childCount();
  } catch (eCc) {
    cc = 0;
  }
  for (var ci = 0; ci < cc; ci++) {
    var ch = null;
    try {
      ch = layout.child(ci);
    } catch (eCh) {
      ch = null;
    }
    if (!ch) continue;
    var tb = "";
    try {
      tb = String((ch.text && ch.text()) || (ch.desc && ch.desc()) || "").trim();
    } catch (eTb) {
      tb = "";
    }
    if (tb === "粉丝") hasFansLbl = true;
    else {
      var disp = fansDisplayFromSodaCountNode(ch);
      if (disp) {
        var iv = fansToInt(disp);
        if (iv != null) numVal = iv;
      }
    }
  }
  if (hasFansLbl && numVal != null) return numVal;
  return numVal;
}

/** 汽水用户主页：读粉丝数（兼容 gk- 与 gle/glf/gf-） */
function readSodaProfileFansCountIntFromPage() {
  try {
    var nCount = findSodaProfileFansCountNode(350);
    if (nCount) {
      var disp = fansDisplayFromSodaCountNode(nCount);
      if (disp) {
        var iv = fansToInt(disp);
        if (iv != null) return iv;
      }
    }
  } catch (eCount) {}
  try {
    var labelFans =
      id(SODA_PROFILE_FANS_TAB_ID).packageName(SODA_PKG).findOne(280) ||
      id(SODA_PROFILE_FANS_TAB_ALT_ID).packageName(SODA_PKG).findOne(240) ||
      idMatches(/.*:id\/gk\+$/).packageName(SODA_PKG).findOne(220) ||
      idMatches(/.*:id\/glf$/).packageName(SODA_PKG).findOne(200);
    if (labelFans && labelFans.parent) {
      var fromPar = sodaProfileFansCountFromStatsLayout(labelFans.parent());
      if (fromPar != null) return fromPar;
    }
  } catch (ePar) {}
  try {
    var layout =
      id(SODA_PROFILE_FANS_LAYOUT_ID).packageName(SODA_PKG).findOne(260) ||
      id(SODA_PROFILE_FANS_LAYOUT_ALT_ID).packageName(SODA_PKG).findOne(240) ||
      idMatches(/.*:id\/gf-$/).packageName(SODA_PKG).findOne(220);
    var fromLay = sodaProfileFansCountFromStatsLayout(layout);
    if (fromLay != null) return fromLay;
  } catch (eLay) {}
  try {
    var sw = device.width;
    var sh = device.height;
    var coll = className("android.widget.TextView")
      .packageName(SODA_PKG)
      .boundsInside(Math.floor(sw * 0.42), Math.floor(sh * 0.28), Math.floor(sw * 0.72), Math.floor(sh * 0.42))
      .find();
    if (coll && coll.size) {
      var bestInt = null;
      for (var zi = 0; zi < coll.size(); zi++) {
        var zn = coll.get(zi);
        var zv = fansDisplayFromSodaCountNode(zn);
        if (!zv) continue;
        var ziv = fansToInt(zv);
        if (ziv != null && (bestInt == null || ziv > bestInt)) bestInt = ziv;
      }
      if (bestInt != null) return bestInt;
    }
  } catch (eZone) {}
  return null;
}

/** 汽水：读当前对标用户主页粉丝数（优先 gk-/gle，兜底抖音统计条） */
function readSodaTargetProfileFansCountInt() {
  try {
    var v = readSodaProfileFansCountIntFromPage();
    if (v != null) return v;
  } catch (e0) {}
  try {
    return readFanProfilePageFansCountInt();
  } catch (e1) {}
  return null;
}

/** 汽水：关注列表被隐私拦截（页面未进入关注列表） */
function isSodaFollowingListPrivacyBlockedByText() {
  function matchPrivacyFollowingText(s) {
    s = String(s || "").replace(/\s+/g, "");
    if (!s) return false;
    if (s.indexOf("关注列表不可见") >= 0) return true;
    if (s.indexOf("由于用户隐私设置") >= 0 && s.indexOf("关注") >= 0) return true;
    if (s.indexOf("由于该用户隐私设置") >= 0 && s.indexOf("关注") >= 0) return true;
    if (/隐私/.test(s) && /关注/.test(s) && /(不可见|无法查看|不可查看)/.test(s)) return true;
    return false;
  }
  function scanNode(n) {
    if (!n) return false;
    var s = "";
    try {
      s = (n.text && n.text()) || (n.desc && n.desc()) || "";
    } catch (e0) {}
    return matchPrivacyFollowingText(s);
  }
  try {
    if (textContains("关注列表不可见").packageName(SODA_PKG).findOne(120)) return true;
  } catch (e0) {}
  try {
    if (textContains("关注列表不可见").findOne(120)) return true;
  } catch (e1) {}
  try {
    var coll = textContains("隐私").packageName(SODA_PKG).find();
    if (coll && coll.size) {
      for (var i = 0; i < coll.size(); i++) {
        if (scanNode(coll.get(i))) return true;
      }
    }
  } catch (e2) {}
  try {
    var coll2 = textContains("隐私").find();
    if (coll2 && coll2.size) {
      for (var j = 0; j < coll2.size(); j++) {
        if (scanNode(coll2.get(j))) return true;
      }
    }
  } catch (e3) {}
  return false;
}

function looksLikeSodaFollowingSubListPage() {
  if (isSodaFollowingListPrivacyBlockedByText()) return false;
  if (stillOnSodaUserProfilePageQuick()) return false;
  if (detectSodaFollowingListExpandedLikely()) return true;
  if (detectSodaFollowingPageEnteredLikely()) return true;
  try {
    if (getSodaDouyinFollowingTitleNode()) return true;
  } catch (e0) {}
  try {
    var rows = collectSodaDouyinFollowingListRowsStrict();
    if (rows && rows.length > 0) return true;
  } catch (e1) {}
  return false;
}

/**
 * 汽水第6步：点关注后等待进入关注页（隐私不可见 / 无跳页视为失败）
 */
function waitSodaFollowingListOpenedAfterFollowTap(beforeFp, maxWaitMs) {
  var endAt = Date.now() + (typeof maxWaitMs === "number" && maxWaitMs > 0 ? maxWaitMs : 5200);
  while (Date.now() < endAt && !__scriptUserStop) {
    try {
      if (isSodaFollowingListPrivacyBlockedByText()) {
        appendLog("关注列表不可见，返回");
        try {
          back();
        } catch (eBk0) {}
        sleepCtrl(420);
        return false;
      }
    } catch (ePriv) {}
    try {
      if (looksLikeSodaFollowingSubListPage()) {
        sleepCtrl(320);
        return true;
      }
    } catch (eOk) {}
    if (beforeFp) {
      try {
        var nowFp = getQuickPageFingerprintForBack();
        if (nowFp && nowFp !== beforeFp && !stillOnSodaUserProfilePageQuick()) {
          sleepCtrl(320);
          return true;
        }
      } catch (eFp) {}
    }
    sleepCtrl(260);
  }
  if (isSodaFollowingListPrivacyBlockedByText()) {
    appendLog("关注列表不可见，返回");
    try {
      back();
    } catch (eBk1) {}
    sleepCtrl(420);
    return false;
  }
  return looksLikeSodaFollowingSubListPage();
}

function waitSodaFollowingListOpened(maxWaitMs) {
  return waitSodaFollowingListOpenedAfterFollowTap("", maxWaitMs);
}

/** 汽水：在用户主页点统计条「关注」 */
function clickFollowOnTargetProfileForSoda() {
  appendSodaActionLog("点用户页关注");
  var beforeFp = "";
  try {
    beforeFp = getQuickPageFingerprintForBack();
  } catch (eFp0) {
    beforeFp = "";
  }
  var node = null;
  try {
    node =
      text("关注").packageName(SODA_PKG).findOne(500) ||
      id(SODA_ME_FOLLOW_TAB_ID).packageName(SODA_PKG).findOne(450);
    if (node) {
      try {
        var b = node.bounds();
        if (b.centerY() > device.height * 0.72) node = null;
      } catch (eB) {}
    }
  } catch (eFind) {}
  var ok = false;
  if (node) {
    ok = clickNode(node);
    if (!ok) {
      try {
        var bb = node.bounds();
        click(bb.centerX(), bb.centerY());
        ok = true;
      } catch (eTap) {}
    }
  }
  if (!ok) {
    try {
      var w = device.width;
      var h = device.height;
      appendSodaActionLog("点用户页关注(坐标)");
      click(Math.floor(w * 0.46), Math.floor(h * 0.28));
      ok = true;
    } catch (eCoord) {}
  }
  if (!ok) {
    appendLog("点用户页关注失败");
    return false;
  }
  if (waitSodaFollowingListOpenedAfterFollowTap(beforeFp, 5200)) {
    return ensureSodaFollowingListExpandedAfterFollowTap();
  }
  if (stillOnSodaUserProfilePageQuick()) {
    appendLog("关注页未打开，返回一次");
    try {
      back();
    } catch (eBk) {}
    sleepCtrl(420);
  }
  return false;
}

/** 汽水第6步：用户主页点关注，失败则回到我页粉丝列表重选（最多 12 次） */
function runSodaStep6FollowOnProfileWithRetry(maxRetry) {
  maxRetry = maxRetry == null ? 12 : maxRetry;
  var followOk = clickFollowOnTargetProfileForSoda();
  var retryN = 0;
  while (!followOk && retryN < maxRetry && !__scriptUserStop) {
    appendLog("关注不可用，重选粉丝用户");
    if (!clickRandomFollowerFirst3PagesForSoda()) break;
    followOk = clickFollowOnTargetProfileForSoda();
    retryN++;
  }
  if (!followOk) {
    appendLog("点关注多次失败，继续下一轮");
    return false;
  }
  return true;
}

/** 汽水是否走「我页粉丝种子 → 用户主页关注」链路（完整 1～11 跑法） */
function sodaShouldUseFansSeedChain(cap, s) {
  return cap >= 6 && !(s === 6 && cap === 6);
}

/** 汽水第5步：快路径采集当前屏粉丝行（分段 findOne，参考第9/11步） */
function collectSodaFollowerRowsForStep5Pick() {
  var findMs =
    typeof SODA_STEP5_ROW_FINDONE_MS === "number" && SODA_STEP5_ROW_FINDONE_MS > 0
      ? SODA_STEP5_ROW_FINDONE_MS
      : 35;
  var rows = scanSodaFollowerListRowsByBand({ maxRows: 14, findMs: findMs });
  if (rows && rows.length) return rows;
  rows = collectSodaFollowerListRowsGi8Only();
  if (rows && rows.length) return rows;
  return collectSodaFollowerListRowsDedupedFast(false);
}

/** 汽水第5步：个人粉丝列表前3页内随机选一行（第一页50%/第二页30%/第三页20%；快路径点击，尽量不连选同一人） */
function clickRandomFollowerFirst3PagesForSoda() {
  if (__scriptUserStop) return false;
  if (!detectSodaFansListExpandedLikely()) {
    if (!expandSodaFansListByDoubleTapTitle()) return false;
  }
  appendSodaLogBlocking("粉丝列表随机选人");
  var nickB2 = sodaFollowerRowNicknameBounds();
  var l0 = nickB2.l0,
    t0 = nickB2.t0,
    r0 = nickB2.r0,
    b0 = nickB2.b0;
  var rr = Math.random();
  var downTimes = rr < 0.5 ? 0 : rr < 0.8 ? 1 : 2; // 第一页50%，第二页30%，第三页20%
  var scrollMs =
    typeof SODA_STEP5_LIST_SCROLL_MS === "number" && SODA_STEP5_LIST_SCROLL_MS > 0
      ? SODA_STEP5_LIST_SCROLL_MS
      : 420;
  for (var pass = 0; pass < downTimes; pass++) {
    if (__scriptUserStop) return false;
    scrollSodaFollowerListDown();
    sleepCtrl(scrollMs);
  }
  var rows = collectSodaFollowerRowsForStep5Pick();
  if (!rows || !rows.length) {
    appendLog("粉丝列表无可选用户");
    return false;
  }
  var candidates = [];
  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];
    var nick = extractFollowerNicknameFromRow(row, l0, t0, r0, b0);
    var key = normalizeFollowerNickKey(nick) || followerRowVisitKey(row, nick) || "row_" + i;
    candidates.push({ row: row, key: key, nick: nick });
  }
  var lastPickKey = "";
  try {
    lastPickKey = String(__stats.get(__SODA_LAST_PICK_KEY, "") || "");
  } catch (eLast0) {
    lastPickKey = "";
  }
  var pool = candidates;
  if (lastPickKey && candidates.length > 1) {
    var filtered = [];
    for (var p = 0; p < candidates.length; p++) {
      if (String(candidates[p].key) === lastPickKey) continue;
      filtered.push(candidates[p]);
    }
    if (filtered.length > 0) pool = filtered;
  }
  var order = [];
  for (var j = 0; j < pool.length; j++) order.push(j);
  for (var k = order.length - 1; k > 0; k--) {
    var ri = Math.floor(Math.random() * (k + 1));
    var tmp = order[k];
    order[k] = order[ri];
    order[ri] = tmp;
  }
  var tryMax = Math.min(
    pool.length,
    typeof SODA_STEP5_PICK_TRY_MAX === "number" && SODA_STEP5_PICK_TRY_MAX > 0
      ? SODA_STEP5_PICK_TRY_MAX
      : 5
  );
  for (var m = 0; m < tryMax; m++) {
    var cand = pool[order[m]];
    // skipEnterLog=true：与第9步一致，避免阻塞刷悬浮窗拖慢连点
    if (tryClickFollowerRowNode(cand.row, l0, t0, r0, b0, "进入：", cand.nick, true)) {
      try {
        __stats.put(__SODA_LAST_PICK_KEY, String(cand.key || ""));
      } catch (eLast1) {}
      return true;
    }
  }
  appendLog("粉丝列表随机选择失败");
  return false;
}

/** @deprecated 请用 clickRandomFollowerFirst3PagesForSoda（保留别名供第6步重选等调用） */
function clickFirstUnpickedFollowerInListForSoda() {
  return clickRandomFollowerFirst3PagesForSoda();
}

/** 汽水分支主流程（当前 1～11 步） */
function runSodaFlowFrom(maxStep) {
  if (__scriptUserStop) return;
  var s = __flowStart < 1 ? 1 : __flowStart;
  var cap = maxStep > 11 ? 11 : maxStep;
  if (s === 10 && cap === 10) {
    cap = 11;
    try {
      __flowEnd = 11;
      __stats.put("flowEnd", 11);
    } catch (eCap10) {}
  }
  __step11PrepareNoInjectRemaining = 2;
  ensureTaskCountDayRolled();
  if (isTaskDailyQuotaComplete()) {
    appendLog("今日任务量已达目标，本次不执行");
    return;
  }
  if (s <= 1 && cap >= 1 && __continuousRoundIndex === 0) {
    setSodaExecutingStep(1);
    forceStopApp(SODA_PKG, SODA_APP_NAME);
  }
  if (__scriptUserStop) return;
  if (s <= 2 && cap >= 2) {
    setSodaExecutingStep(2);
    if (!launchSodaApp()) {
      appendLog("启动失败，终止本轮");
      setSodaExecutingStep(0);
      return;
    }
  }
  if (__scriptUserStop) return;
  if (s <= 3 && cap >= 3) {
    setSodaExecutingStep(3);
    if (!clickMyTabForSoda()) {
      appendLog("未能进入我的，终止本轮");
      setSodaExecutingStep(0);
      return;
    }
  }
  if (__scriptUserStop) return;
  var sodaFansSeed = sodaShouldUseFansSeedChain(cap, s);
  if (s <= 4 && cap >= 4 && (cap <= 5 || sodaFansSeed)) {
    setSodaExecutingStep(4);
    if (!clickFansOnMePageForSoda()) {
      appendLog("未能进入粉丝页，终止本轮");
      setSodaExecutingStep(0);
      return;
    }
  }
  if (__scriptUserStop) return;
  if (s <= 5 && cap >= 5 && (cap <= 5 || sodaFansSeed)) {
    setSodaExecutingStep(5);
    if (!clickRandomFollowerFirst3PagesForSoda()) {
      appendLog("未能选中粉丝用户，终止本轮");
      setSodaExecutingStep(0);
      return;
    }
  }
  if (__scriptUserStop) return;
  if (s <= 6 && cap >= 6) {
    setSodaExecutingStep(6);
    if (sodaFansSeed) {
      if (!runSodaStep6FollowOnProfileWithRetry(12)) {
        appendLog("未能进入关注页，终止本轮");
        setSodaExecutingStep(0);
        return;
      }
    } else if (!clickFollowOnMePageForSoda()) {
      appendLog("未能进入关注页，终止本轮");
      setSodaExecutingStep(0);
      return;
    }
  }
  if (__scriptUserStop) return;
  if (s <= 7 && cap >= 7) {
    setSodaExecutingStep(7);
    if (!clickFirstFollowingInListForSoda()) {
      appendLog("未能进入关注用户，终止本轮");
      setSodaExecutingStep(0);
      return;
    }
  }
  setSodaExecutingStep(8);
  if (__scriptUserStop) return;
  if (s <= 8 && cap >= 8) {
    if (!runSodaStep8ClickFansWithReselect(12, maxStep)) {
      appendLog("未能进入用户粉丝页，终止本轮");
      return;
    }
    resetCurrentTargetOperatedSkipCounter();
    resetSodaStep8UnqualifiedSkipCounter();
  }
  if (__scriptUserStop) return;
  if (s <= 9 && cap >= 9) {
    if (!clickFirstFollowerInListForSoda()) {
      appendLog("未能进入粉丝用户，终止本轮");
      return;
    }
  }
  if (__scriptUserStop) return;
  var enteredWork = false;
  if (s <= 10 && cap >= 10) {
    enteredWork = tryEnterSodaWorkWithProfileOperateGate(maxStep);
    if (!enteredWork && cap === 10) {
      appendLog("未能进入作品，终止本轮");
      return;
    }
  }
  if (__scriptUserStop) return;
  if (maxStep === 11) {
    if (enteredWork) {
      if (!prepareSlotForStep11RandomInteraction(maxStep)) {
        if (isTaskDailyQuotaComplete()) return;
        return;
      }
      runRandomSingleWorkInteraction(true);
      if (isTaskDailyQuotaComplete()) return;
    } else if (s === 11) {
      if (!prepareSlotForStep11RandomInteraction(maxStep)) {
        if (isTaskDailyQuotaComplete()) return;
        return;
      }
      runRandomSingleWorkInteraction(true);
    } else if (s < 11) {
      appendLog("未能进入作品，终止本轮");
      return;
    }
    if (__startStep <= 9 && !isTaskDailyQuotaComplete()) {
      var repeated = runSodaFollowerListRepeatSteps10And11(maxStep);
      if (!repeated && !__sodaFanListNoNewFanRestartDone) {
        if (!sodaRestartForFanListNoNewFans(maxStep)) {
          appendLog("第11步后未连上下一粉丝，转下一轮");
        }
      }
    }
    return;
  }
}

function getNicknameFromMePage() {
  /**
   * 「我」页昵称 TextView：
   * - tga：部分新版
   * - thk：OPPO A72 等
   * - thh：华为 nova6 等（text/desc 都可有昵称）
   */
  var DY_ME_NICKNAME_IDS = [
    "com.ss.android.ugc.aweme:id/thh",
    "com.ss.android.ugc.aweme:id/thk",
    "com.ss.android.ugc.aweme:id/tga",
  ];
  function pickNickText(n) {
    if (!n) return null;
    try {
      var t = n.text ? n.text() : "";
      if (!t && n.desc) t = n.desc();
      t = t ? String(t).trim() : "";
      if (!t) return null;
      if (/抖音号[：:·]/.test(t)) return null;
      if (/^抖音号/.test(t)) return null;
      if (t.length > 32) return null;
      if (/^\d+(?:\.\d+)?(?:万|亿)?$/.test(t)) return null;
      if (/^[A-Za-z0-9._-]{8,24}$/.test(t) && !/[\u4e00-\u9fa5]/.test(t)) return null;
      if (
        /^(编辑资料|编辑主页|添加朋友|添加头像|关注|粉丝|获赞|抖音号|作品|私密|直播|我|首页|推荐|搜索)$/.test(
          t
        )
      ) {
        return null;
      }
      // 华为等新版「我」页顶部入口，易被区域兜底当成最上方昵称
      if (/创建\s*AI\s*形象|AI\s*形象|创建AI形象/i.test(t)) return null;
      if (/^添加头像|^设置头像|^更换头像|^点击登录|^登录后查看/.test(t)) return null;
      return t;
    } catch (e0) {
      return null;
    }
  }
  function pickNickFromId(resId, waitMs) {
    try {
      var shortId = String(resId).replace(/^.*:id\//, "");
      var n =
        id(resId).findOne(waitMs > 0 ? waitMs : 320) ||
        idMatches(new RegExp(".*:id\\/" + shortId + "$")).findOne(
          Math.max(120, (waitMs > 0 ? waitMs : 320) - 80)
        );
      if (!n) return null;
      return pickNickText(n);
    } catch (eId) {
      return null;
    }
  }
  try {
    for (var ii = 0; ii < DY_ME_NICKNAME_IDS.length; ii++) {
      var fromId = pickNickFromId(DY_ME_NICKNAME_IDS[ii], 280);
      if (fromId) return fromId;
    }
  } catch (eIds) {}
  try {
    // 华为 nova6：昵称容器 s5n 下的 TextView
    var s5n = id("com.ss.android.ugc.aweme:id/s5n").findOne(220) || idMatches(/.*:id\/s5n$/).findOne(180);
    if (s5n) {
      try {
        var kids = s5n.find(className("android.widget.TextView"));
        if (kids && kids.size && kids.size() > 0) {
          for (var ki = 0; ki < kids.size(); ki++) {
            var kt = pickNickText(kids.get(ki));
            if (kt) return kt;
          }
        }
      } catch (eKids) {}
      var fromS5n = pickNickText(s5n);
      if (fromS5n) return fromS5n;
    }
  } catch (eS5n) {}
  try {
    // 无 id 时：固定区域 + 选最靠上的有效昵称（已过滤「创建 AI 形象」）
    var sw = device.width;
    var sh = device.height;
    var coll = className("android.widget.TextView")
      .boundsInside(Math.floor(sw * 0.18), Math.floor(sh * 0.1), Math.floor(sw * 0.95), Math.floor(sh * 0.46))
      .find();
    if (coll && coll.size && coll.size() > 0) {
      var best = null;
      var bestTop = 1e9;
      for (var i = 0; i < coll.size(); i++) {
        var n = coll.get(i);
        var t = pickNickText(n);
        if (!t) continue;
        try {
          var b = n.bounds();
          if (b.top < bestTop) {
            bestTop = b.top;
            best = t;
          }
        } catch (e2) {}
      }
      if (best) return best;
    }
  } catch (e1) {}
  return null;
}

function getFansFromMePage() {
  function readNodeValue(node) {
    if (!node) return null;
    try {
      var v = node.text();
      if (!v && node.desc) v = node.desc();
      if (!v) return null;
      v = String(v).trim().replace(/[^\d\.万亿]/g, "");
      return v || null;
    } catch (e0) {
    return null;
  }
  }
  function normalizeFansVal(v, allowSmall) {
    if (!v) return null;
    var vv = String(v)
      .trim()
      .replace(/[^\d\.万亿wW]/g, "")
      .replace(/[wW]/g, "万");
    if (!vv) return null;
    var n = fansToInt(vv);
    if (n == null || n < 0 || n >= 1e10) return null;
    if (allowSmall) return vv;
    if (n >= 100) return vv;
    if (/[万亿]/.test(vv)) return vv;
    return null;
  }
  function pickBestFansFromBounds(l, t, r, b, allowSmall) {
    try {
      var coll = textMatches(/^\d+(?:\.\d+)?(?:万|亿)?$/).boundsInside(l, t, r, b).find();
      if (!coll || !coll.size || coll.size() < 1) return null;
      var best = null;
      var bestInt = -1;
      for (var i = 0; i < coll.size(); i++) {
        var n = coll.get(i);
        var v = normalizeFansVal(readNodeValue(n), !!allowSmall);
        if (!v) continue;
        var iv = fansToInt(v);
        if (iv == null) continue;
        if (iv > bestInt) {
          bestInt = iv;
          best = v;
        }
      }
      return best;
    } catch (ePick) {
      return null;
    }
  }
  /** 竖排「数字在上 + 粉丝在下」同一 LinearLayout（部分机型数字 class 为 TexctView 拼写） */
  function fansValFromFansLabelParent() {
    try {
      var labelFans =
        id("com.ss.android.ugc.aweme:id/5Ol").findOne(280) ||
        id("com.ss.android.ugc.aweme:id/5ol").findOne(280) ||
        text("粉丝").findOne(280);
      if (!labelFans) return null;
      var p = labelFans.parent();
      if (!p) return null;
      var best = null;
      var bestInt = -1;
      var cc = 0;
      try {
        cc = p.childCount();
      } catch (eCc) {
        cc = 0;
      }
      for (var ci = 0; ci < cc; ci++) {
        var ch = null;
        try {
          ch = p.child(ci);
        } catch (eCh) {
          ch = null;
        }
        var v = normalizeFansVal(readNodeValue(ch), true);
        if (!v) continue;
        var iv = fansToInt(v);
        if (iv == null) continue;
        if (iv > bestInt) {
          bestInt = iv;
          best = v;
        }
      }
      return best;
    } catch (ePar) {
      return null;
    }
  }
  /** 明确 id 的统计数字：允许 <100（normalizeFansVal 会滤掉两位数导致「粉丝未读到」） */
  function fansValFromStatsId(resId, waitMs) {
    try {
      var n = id(resId).findOne(typeof waitMs === "number" ? waitMs : 450);
      if (!n) return null;
      var raw = readNodeValue(n);
      if (!raw) return null;
      var vv = String(raw)
        .trim()
        .replace(/[^\d\.万亿wW]/g, "")
        .replace(/[wW]/g, "万");
      var nInt = fansToInt(vv);
      if (nInt == null || nInt < 0 || nInt >= 1e10) return null;
      return vv;
    } catch (eId) {
      return null;
    }
  }
  try {
    var v5yr = fansValFromStatsId("com.ss.android.ugc.aweme:id/5yr", 500);
    if (v5yr) return v5yr;
  } catch (e5yr0) {}
  try {
    var v5y5m = fansValFromStatsId("com.ss.android.ugc.aweme:id/5y5", 400);
    if (v5y5m) return v5y5m;
  } catch (e5y50) {}
  try {
    var vPar = fansValFromFansLabelParent();
    if (vPar) return vPar;
  } catch (ePar0) {}
  try {
    var node =
      className("android.widget.TextView").boundsInside(500, 640, 760, 820).findOne(500) ||
      classNameMatches(/android\.widget\.Text.*View$/).boundsInside(500, 640, 760, 820).findOne(500);
    var val = normalizeFansVal(readNodeValue(node), true);
    if (val) return val;
  } catch (e1) {}
  // 小米/部分新布局：统计项容器 id=50j（粉丝）内文本是“粉丝”，数字常在同容器附近
  try {
    var box50j = id("com.ss.android.ugc.aweme:id/50j").findOne(700);
    if (box50j) {
      var bb = box50j.bounds();
      var v50j = pickBestFansFromBounds(
        Math.max(0, bb.left - Math.floor(device.width * 0.16)),
        Math.max(0, bb.top - Math.floor(device.height * 0.12)),
        Math.min(device.width - 1, bb.right + Math.floor(device.width * 0.06)),
        Math.min(device.height - 1, bb.bottom + Math.floor(device.height * 0.05)),
        true
      );
      if (v50j) return v50j;
    }
  } catch (e50j) {}
  // 标签“粉丝”旁边取数：适配 id=5Ol / 5ol 这类仅标签节点（已确认「粉丝」时允许 <100）
  try {
    var labelFans =
      id("com.ss.android.ugc.aweme:id/5Ol").findOne(450) ||
      id("com.ss.android.ugc.aweme:id/5ol").findOne(450) ||
      text("粉丝").findOne(450);
    if (labelFans) {
      var lb = labelFans.bounds();
      var vLbl = pickBestFansFromBounds(
        Math.max(0, lb.left - Math.floor(device.width * 0.20)),
        Math.max(0, lb.top - Math.floor(device.height * 0.18)),
        Math.min(device.width - 1, lb.right + Math.floor(device.width * 0.08)),
        Math.min(device.height - 1, lb.bottom + Math.floor(device.height * 0.03)),
        true
      );
      if (vLbl) return vLbl;
    }
  } catch (eLbl) {}
  try {
    var n2 = id("com.ss.android.ugc.aweme:id/5xa").findOne(800);
    var v2 = normalizeFansVal(readNodeValue(n2), true);
    if (v2) return v2;
  } catch (e2) {}
  try {
    var n2b = id("com.ss.android.ugc.aweme:id/5xo").findOne(600);
    var v2b = normalizeFansVal(readNodeValue(n2b), true);
    if (v2b) return v2b;
  } catch (e2b) {}
  try {
    var n3 = textMatches(/^\d+(?:\.\d+)?(?:万|亿)?$/).boundsInside(500, 640, 760, 820).findOne(600);
    var v3 = normalizeFansVal(readNodeValue(n3), true);
    if (v3) return v3;
  } catch (e3) {}
  try {
    var vOcrMe = readProfileFansCountByOcr(2600);
    if (vOcrMe != null) return String(vOcrMe);
  } catch (eOcrMe) {}
  return null;
}

function shouldDeepReadExactFansFromMyFansList(fansText) {
  var s = String(fansText == null ? "" : fansText).trim();
  if (!s) return false;
  return /[万亿]/.test(s);
}

function readExactFansCountFromMyFansListPage() {
  function parseExactFansText(raw) {
    var s = String(raw == null ? "" : raw).trim();
    if (!s) return null;
    var m = s.match(/我的粉丝\s*\(\s*([\d,]+)\s*人?\s*\)/);
    if (!m) m = s.match(/我的粉丝\s*([\d,]+)\s*人?/);
    if (!m) return null;
    var digits = String(m[1] || "").replace(/[^\d]/g, "");
    if (!digits) return null;
    return digits;
  }
  var endAt = Date.now() + 2200;
  while (Date.now() < endAt && !__scriptUserStop) {
    try {
      var n0 = id("com.ss.android.ugc.aweme:id/3vo").findOne(180);
      if (n0) {
        var t0 = "";
        try { t0 = (n0.text && n0.text()) || (n0.desc && n0.desc()) || ""; } catch (e00) { t0 = ""; }
        var p0 = parseExactFansText(t0);
        if (p0) return p0;
      }
    } catch (e0) {}
    try {
      var n1 = textMatches(/^我的粉丝\s*\([\d,]+人?\)$/).findOne(160);
      if (n1) {
        var t1 = "";
        try { t1 = (n1.text && n1.text()) || (n1.desc && n1.desc()) || ""; } catch (e11) { t1 = ""; }
        var p1 = parseExactFansText(t1);
        if (p1) return p1;
      }
    } catch (e1) {}
    sleepCtrl(120);
  }
  return null;
}

function clickFansOnMePageSilentForExactFans() {
  var node = null;
  try { node = id("com.ss.android.ugc.aweme:id/50j").findOne(320); } catch (e0) {}
  if (!node) {
    try { node = idMatches(/.*:id\/50j$/).findOne(220); } catch (e1) {}
  }
  if (!node) {
    try {
      node =
        id("com.ss.android.ugc.aweme:id/5ol").findOne(220) ||
        id("com.ss.android.ugc.aweme:id/5Ol").findOne(220) ||
        text("粉丝").findOne(220);
    } catch (e2) {}
  }
  var ok = false;
  if (node) {
    try { ok = clickNode(node); } catch (e3) { ok = false; }
    if (!ok) {
      try {
        var b = node.bounds();
        click(b.centerX(), b.centerY());
        ok = true;
      } catch (e4) {}
    }
  }
  if (!ok) {
    try {
      ok = clickFansTabFromStatsLayoutA11y();
    } catch (eLayS) {
      ok = false;
    }
  }
  if (!ok) {
    try {
      ok = clickProfileFansTabByOcr();
    } catch (eOcrS) {
      ok = false;
    }
  }
  if (!ok) {
    try {
      var x = Math.floor(device.width * 0.54);
      var y = Math.floor(device.height * 0.28);
      click(x, y);
      ok = true;
    } catch (e5) {}
  }
  return ok;
}

function tryDeepReadExactFansFromMyFansList(fansText) {
  if (!shouldDeepReadExactFansFromMyFansList(fansText)) return null;
  var entered = false;
  try {
    entered = clickFansOnMePageSilentForExactFans();
    if (!entered) return null;
    sleepCtrl(700);
    var exact = readExactFansCountFromMyFansListPage();
    return exact || null;
  } catch (e0) {
    return null;
  } finally {
    if (entered) {
      try { back(); } catch (eBk) {}
      sleepCtrl(420);
    }
  }
}

function detectMeProfileLikely() {
  var strong = 0;
  try {
    if (getNicknameFromMePage()) strong++;
  } catch (e0) {}
  try {
    if (getFansFromMePage()) strong++;
  } catch (e00) {}
  try {
    if (text("抖音号").findOne(220) || descContains("抖音号").findOne(220)) strong++;
  } catch (e1) {}
  try {
    // 机型差异：有的版本“我”页不直接暴露抖音号，但会有编辑资料/添加朋友
    if (text("编辑资料").findOne(220) || text("添加朋友").findOne(220)) strong++;
  } catch (e2) {}
  try {
    // 统计区文案仅作为辅助，不再单独判真（防卡顿时误判“已进入我”）
    if (text("获赞").findOne(160) && text("关注").findOne(160) && text("粉丝").findOne(160)) strong++;
  } catch (e3) {}
  return strong >= 2;
}

/** 快速判定：不读昵称/粉丝（避免 findOne 等待过久），用于“点我后前几秒”加速确认 */
function detectMeProfileLikelyFast() {
  // 先尝试“我已选中”作加分项；但不要强依赖（部分机型/打包环境读不到 selected/desc）
  var meSel = false;
  try {
    meSel =
      !!descMatches(/^我(，已选中)?$/).findOne(40) ||
      !!textMatches(/^我(，已选中)?$/).findOne(40);
  } catch (e0) {
    meSel = false;
  }
  var hit = 0;
  try {
    if (textMatches(/^作品\s*\d*$/).findOne(60) || text("作品").findOne(60) || desc("作品").findOne(60)) hit++;
  } catch (e1) {}
  try {
    if (text("抖音号").findOne(60) || descContains("抖音号").findOne(60) || textMatches(/^抖音号[：:·].+/).findOne(60))
      hit++;
  } catch (e2) {}
  try {
    if (text("编辑资料").findOne(60) || text("添加朋友").findOne(60) || descContains("编辑资料").findOne(60)) hit++;
  } catch (e3) {}
  try {
    if ((text("获赞").findOne(60) || desc("获赞").findOne(60)) && (text("关注").findOne(60) || desc("关注").findOne(60))) hit++;
  } catch (e4) {}
  // 命中两项就认为已进入；若“我已选中”命中，则一项也可认定（更快）
  if (meSel && hit >= 1) return true;
  return hit >= 2;
}

/** 兜底判定：弱于 detectMeProfileLikely，仅用于超时前最后确认，防止已进“我”却误触发重启 */
function detectMeProfileLikelySoft() {
  try {
    // 底部“我”选中态（仅作前置）
    var meSel =
      !!descMatches(/^我(，已选中)?$/).findOne(120) ||
      !!textMatches(/^我(，已选中)?$/).findOne(120);
    if (!meSel) return false;
    // 再叠加任一主页结构特征
    if (text("作品").findOne(120)) return true;
    if (text("获赞").findOne(120) && text("关注").findOne(120)) return true;
    if (text("编辑资料").findOne(120) || text("添加朋友").findOne(120)) return true;
  } catch (eS) {}
  return false;
}

function clickMeTabSingleTry() {
  var meNode = null;
  try {
    meNode = text("我").findOne(900) || desc("我").findOne(900);
  } catch (e) {}
  var usedNode = false;
  if (meNode) usedNode = clickNode(meNode);
  if (!usedNode) {
    try {
      var x = Math.floor(device.width * 0.92);
      var y = Math.floor(device.height * 0.93);
    click(x, y);
    } catch (eC) {}
  }
  // 某些机型点击后页面切换慢，单次700ms易误判没进“我”
  var t0 = Date.now();
  var okHits = 0;
  while (Date.now() - t0 < 2600 && !__scriptUserStop) {
    sleepCtrl(220);
    if (detectMeProfileLikelyFast() || detectMeProfileLikely()) {
      okHits++;
      if (okHits >= 2) return true; // 连续命中两次，避免瞬时假阳性
    } else {
      okHits = 0;
    }
  }
  return false;
}

function applyMeTabNicknameAndFansAfterEntered() {
      sleep(800);
  function isLikelyOwnProfileByUi() {
    try {
      if (text("编辑主页").findOne(120) || desc("编辑主页").findOne(120)) return true;
    } catch (eU0) {}
    try {
      if (text("添加头像").findOne(120) || desc("添加头像").findOne(120)) return true;
    } catch (eU1) {}
    try {
      if (textContains("点击添加介绍").findOne(120) || textContains("添加性别等标签").findOne(120)) return true;
    } catch (eU2) {}
    return false;
  }
  // 先做账号一致性校验：若当前页抖音号与已缓存本人抖音号不一致，跳过本次同步，避免误覆盖昵称/粉丝/增长。
  var currentMyDid = "";
  var cachedMyDid = "";
  try { currentMyDid = normalizeMyDouyinIdTextToIdOnly(getMyDouyinIdFromMePage()); } catch (eD0) { currentMyDid = ""; }
  try { cachedMyDid = getCachedMyDouyinIdForFilter(); } catch (eD1) { cachedMyDid = ""; }
  if (currentMyDid && cachedMyDid && currentMyDid !== cachedMyDid) {
    if (isLikelyOwnProfileByUi()) {
      // 命中本人主页特征时，允许刷新缓存，避免旧缓存误拦截导致长期不更新。
      try { cacheMyDouyinIdForFilter(currentMyDid); } catch (eD3) {}
    } else {
      appendLog("我页账号不一致，跳过同步");
      return;
    }
  }
  // 首次拿到有效抖音号则缓存，供后续一致性校验使用。
  if (currentMyDid) {
    try { cacheMyDouyinIdForFilter(currentMyDid); } catch (eD2) {}
  }

  var nick = null;
  for (var ni = 0; ni < 5 && !__scriptUserStop; ni++) {
    nick = getNicknameFromMePage();
    if (nick) break;
    sleepCtrl(220);
  }
      if (nick) {
    var nickChanged = String(__nickname || "") !== String(nick || "");
          __nickname = nick;
          updateFloatInfo();
    if (nickChanged) appendLog("更新昵称:" + nick);
  }
  var fans = null;
  for (var fi = 0; fi < 7 && !__scriptUserStop; fi++) {
    fans = getFansFromMePage();
    if (fans) break;
    sleepCtrl(260);
  }
      if (fans) {
    try {
      var exactFans = tryDeepReadExactFansFromMyFansList(fans);
      if (exactFans) fans = exactFans;
    } catch (eFx) {}
    __fans = fans;
        const fansInt = fansToInt(fans);
      if (fansInt != null) recomputeGrowth(fansInt);
    try { tryUploadMyDouyinIdToA2IfFansOver1000(fansInt); } catch (eA2) {}
        try {
          __stats.put("floatDisplayFansStr", fans);
          if (fansInt != null) __stats.put("floatDisplayFansInt", fansInt);
          __stats.put("floatDisplayYesterdayGrowth", __yesterdayGrowth);
          __stats.put("floatDisplayTodayGrowth", __todayGrowth);
          __stats.put("floatDisplayGrowthDay", dateKey(new Date()));
    } catch (eG0) {}
    if (fansDisplayChanged(fans, fansInt)) {
      appendLog("更新近期粉丝:" + fans);
    }
        updateFloatInfo();
      } else {
    appendLog("未读到粉丝数");
      try {
        if (!__stats.get("floatDisplayFansStr", "")) {
          __fans = "0";
          appendLog("粉丝未读到，按0显示");
        }
      } catch (eF) {
        __fans = "0";
        appendLog("粉丝未读到，按0显示");
      }
      updateFloatInfo();
    }
  }

/**
 * 启动抖音后点「我」：__CLICK_ME_MAX_MS 内轮询直至进入个人页；超时则走「重启脚本获取新对标」1～9 步（注入内不嵌套）。
 * @param {boolean} allowRecoveryRestart
 * @returns {boolean}
 */
function clickMeTabWith25sRestart(allowRecoveryRestart) {
  if (allowRecoveryRestart === undefined) allowRecoveryRestart = true;
  appendLog("点“我”…");
  // 只点击一次，后续仅等待页面加载完成
  clickMeTabSingleTry();
  var t0 = Date.now();
  var fastPhaseMs = 5200; // 前 5.2s 高频快速确认
  var lastFullCheckMs = 0;
  var lastRetapMs = t0;
  while (Date.now() - t0 < __CLICK_ME_MAX_MS && !__scriptUserStop) {
    var elapsed = Date.now() - t0;
    if (elapsed <= fastPhaseMs) {
      if (detectMeProfileLikelyFast()) {
        appendLog("已进入“我”");
        sleep(900);
        applyMeTabNicknameAndFansAfterEntered();
        return true;
      }
      // 1.8s 仍未命中：补点一次“我”（防首次点击未吃到/页面切换慢）
      if (Date.now() - lastRetapMs >= 1800) {
        lastRetapMs = Date.now();
        try {
          clickMeTabSingleTry();
        } catch (eRt) {}
      }
      sleepCtrl(120);
      continue;
    }
    // 过了快速期后：先用 fast，再低频跑一次完整判定（避免每圈都读昵称/粉丝）
    if (detectMeProfileLikelyFast()) {
      appendLog("已进入“我”");
      sleep(900);
      applyMeTabNicknameAndFansAfterEntered();
      return true;
    }
    if (!lastFullCheckMs || Date.now() - lastFullCheckMs >= 1100) {
      lastFullCheckMs = Date.now();
      if (detectMeProfileLikely()) {
        appendLog("已进入“我”");
        sleep(900);
        applyMeTabNicknameAndFansAfterEntered();
        return true;
      }
    }
    sleepCtrl(260);
  }
  // 超时前再做一次弱兜底：避免页面已在“我”但因昵称/粉丝未及时读到而误判失败
  if (detectMeProfileLikelySoft()) {
    appendLog("已进入“我”");
    sleep(1200);
    applyMeTabNicknameAndFansAfterEntered();
    return true;
  }
  appendLog("点“我”超过" + Math.floor(__CLICK_ME_MAX_MS / 1000) + "秒未成功");
  // 按需求：点“我”超时不再触发重启获取新对标，直接返回失败给上层处理。
  return false;
}

/** @param {string} [reason] 日志标注来源：主流程 / 获取新对标链 */
function clickHomeTab(reason) {
  appendLog("进入首页");
  let homeNode = text("首页").findOne(1500) || desc("首页").findOne(1500);
  let clicked = false;
  if (homeNode) clicked = clickNode(homeNode);
  if (!clicked) {
    const x = Math.floor(device.width * 0.08);
    const y = Math.floor(device.height * 0.93);
    click(x, y);
    clicked = true;
  }
  appendLog(clicked ? "已进入首页" : "点首页失败");
  sleep(1500);
  return clicked;
}

/** 问道模式第4步：在“我”页点击粉丝入口（不再点首页） */
function clickFansOnMePageForWendao() {
  appendLog("进入粉丝");
  var node = null;
  // 优先点击可点击容器：id 50j
  try {
    node = id("com.ss.android.ugc.aweme:id/50j").findOne(900);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/50j$/).findOne(700);
    } catch (e1) {}
  }
  // 兜底：粉丝文案 id 5ol/5Ol 或文本“粉丝”
  if (!node) {
    try {
      node =
        id("com.ss.android.ugc.aweme:id/5ol").findOne(500) ||
        id("com.ss.android.ugc.aweme:id/5Ol").findOne(500) ||
        text("粉丝").findOne(500);
    } catch (e2) {}
  }
  var ok = false;
  if (node) {
    try { ok = clickNode(node); } catch (e3) { ok = false; }
    if (!ok) {
      try {
        var b = node.bounds();
        click(b.centerX(), b.centerY());
        ok = true;
      } catch (e4) {}
    }
  }
  if (!ok) {
    try {
      ok = clickFansTabFromStatsLayoutA11y();
    } catch (eLayW) {
      ok = false;
    }
  }
  if (!ok) {
    try {
      ok = clickProfileFansTabByOcr();
    } catch (eOcrW) {
      ok = false;
    }
  }
  if (!ok) {
    // 坐标兜底：你提供的样本中心约 (580,668)
    try {
      var x = Math.floor(device.width * 0.54);
      var y = Math.floor(device.height * 0.28);
      click(x, y);
      ok = true;
    } catch (e5) {}
  }
  appendLog(ok ? "已进入粉丝" : "点粉丝失败");
  sleep(1200);
  return ok;
}

function isWendaoModeSelected() {
  try {
    return getEffectiveDaoceMode() === "wendao";
  } catch (e) {}
  return false;
}

/** 第4步按模式分流：问道=点我页粉丝，其他=点首页 */
function runStep4ByDaoMode(reason) {
  if (isWendaoModeSelected()) return clickFansOnMePageForWendao();
  return clickHomeTab(reason);
}

function clickSearchIcon() {
  appendLog("点搜索…");
  let node = descContains("搜索").findOne(1200) || textContains("搜索").findOne(1200);
  if (node && clickNode(node)) {
    appendLog("已点搜索");
    sleep(1200);
    return true;
  }
  const sx = Math.floor(device.width * 0.95);
  const sy = Math.floor(device.height * 0.07);
  click(sx, sy);
    sleep(1200);
    return true;
  }

// ===== 隐藏模式：修罗道采集 =====
function clickExpandButtonForXiuluo() {
  appendLog("点展开...");
  var node = null;
  try {
    node =
      desc("展开，按钮").findOne(1200) ||
      desc("展开").findOne(1200) ||
      descContains("展开").findOne(1200);
  } catch (e0) {}
  if (node && clickNode(node)) {
    appendLog("已点展开");
    sleepCtrl(650);
    return true;
  }
  try {
    var x = Math.floor((705 + 895) / 2);
    var y = Math.floor((273 + 334) / 2);
    click(x, y);
    appendLog("已点展开");
    sleepCtrl(650);
    return true;
  } catch (e1) {}
  appendLog("点展开失败");
  return false;
}

function dismissKeyboardIfVisibleForXiuluo() {
  try {
    var h = device.height;
    var keyboardHint =
      textContains("语音搜索").findOne(120) ||
      descContains("语音搜索").findOne(120) ||
      textContains("英中").boundsInside(0, Math.floor(h * 0.6), device.width, h).findOne(100);
    if (keyboardHint) {
      appendLog("收起输入法");
      try { back(); } catch (eBk) {}
      sleepCtrl(380);
      return true;
    }
  } catch (e0) {}
  return false;
}

function clickMoreHistoryForXiuluo() {
  appendLog("点查看更多历史...");
  // 你的反馈：有时输入法弹着但提示文案未命中，导致未 back；这里改为每次都先 back 一次再点
  try { back(); } catch (eBk0) {}
  sleepCtrl(260);
  dismissKeyboardIfVisibleForXiuluo();
  var node = null;
  try {
    node =
      textContains("查看更多历史").findOne(900) ||
      descContains("查看更多历史").findOne(900) ||
      textContains("历史").findOne(700);
  } catch (e0) {}
  if (node && clickNode(node)) {
    appendLog("已点查看更多历史");
    sleepCtrl(650);
    return true;
  }
  try {
    try { back(); } catch (eBk1) {}
    sleepCtrl(220);
    dismissKeyboardIfVisibleForXiuluo();
    var x = Math.floor((24 + 1056) / 2);
    var y = Math.floor((1389 + 1494) / 2);
    click(x, y);
    appendLog("已点查看更多历史");
    sleepCtrl(650);
    return true;
  } catch (e1) {}
  appendLog("点查看更多历史失败");
  return false;
}

function normalizeXiuluoAccountCandidate(s) {
  if (s == null) return "";
  var v = String(s).trim();
  if (!v) return "";
  v = v.replace(/[，,\s]*按钮$/, "").trim();
  if (!v) return "";
  if (/^(19|20)\d{2}[./-](0?[1-9]|1[0-2])[./-](0?[1-9]|[12]\d|3[01])$/.test(v)) return "";
  if (!/^[A-Za-z0-9._-]{4,40}$/.test(v)) return "";
  return v;
}

function collectXiuluoAccountsFromCurrentPage() {
  var out = [];
  var seen = {};
  function addOne(s) {
    var v = normalizeXiuluoAccountCandidate(s);
    if (!v) return;
    if (seen[v]) return;
    seen[v] = 1;
    out.push(v);
  }
  var yMin = Math.floor(device.height * 0.14);
  var yMax = Math.floor(device.height * 0.92);
  try {
    var rows = className("android.view.ViewGroup").find();
    if (rows && rows.size) {
      for (var i = 0; i < rows.size(); i++) {
        var n = rows.get(i);
        try {
          var b = n.bounds();
          var cy = b.centerY();
          if (cy < yMin || cy > yMax) continue;
          var d = "";
          try { d = n.desc ? String(n.desc() || "") : ""; } catch (eD) {}
          if (d) addOne(d);
        } catch (e0) {}
      }
    }
  } catch (e1) {}
  try {
    var tv = className("android.widget.TextView").find();
    if (tv && tv.size) {
      for (var j = 0; j < tv.size(); j++) {
        var t = tv.get(j);
        try {
          var bt = t.bounds();
          var cyt = bt.centerY();
          if (cyt < yMin || cyt > yMax) continue;
          var s = "";
          try { s = t.text ? String(t.text() || "") : ""; } catch (eT) {}
          if (s) addOne(s);
        } catch (e2) {}
      }
    }
  } catch (e3) {}
  return out;
}

function scrollXiuluoListDown() {
  try {
    var x = Math.floor(device.width * 0.5);
    var y1 = Math.floor(device.height * 0.84);
    var y2 = Math.floor(device.height * 0.28);
    swipe(x, y1, x, y2, 420);
    return true;
  } catch (e) {
    return false;
  }
}

function runXiuluoCollectAndUploadLoop() {
  var uploadedSet = {};
  var uploadQueue = [];
  var queuedSet = {};
  var qLock = threads.lock();
  var AtomicInteger = java.util.concurrent.atomic.AtomicInteger;
  var uploadAdded = new AtomicInteger(0);
  var uploadDup = new AtomicInteger(0);
  var uploadFail = new AtomicInteger(0);
  var inFlight = new AtomicInteger(0);
  var workerCount = 6;
  var maxRetry = 1;
  var batchSize = 20;
  function queueLen() {
    qLock.lock();
    try { return uploadQueue.length; } finally { qLock.unlock(); }
  }
  function queuePush(task) {
    qLock.lock();
    try { uploadQueue.push(task); } finally { qLock.unlock(); }
  }
  function queueShift() {
    qLock.lock();
    try { return uploadQueue.length > 0 ? uploadQueue.shift() : null; } finally { qLock.unlock(); }
  }
  function retryOrFailTask(task, reason) {
    if (!task || !task.acc) return;
    if ((task.retry || 0) < maxRetry) {
      task.retry = (task.retry || 0) + 1;
      queuePush(task);
    } else {
      uploadFail.incrementAndGet();
    }
  }
  function processTaskSingle(task) {
    if (!task || !task.acc) return;
    try {
      var rs = postAppendDouyinIdToServerDb(task.acc);
      if (rs && rs.ok && rs.added) uploadAdded.incrementAndGet();
      else if (rs && rs.ok && rs.duplicate) uploadDup.incrementAndGet();
      else retryOrFailTask(task, rs && rs.reason ? rs.reason : "single_fail");
    } catch (eS) {
      retryOrFailTask(task, "single_err");
    }
  }
  function processBatchTasks(batch) {
    if (!batch || batch.length <= 0) return;
    var accs = [];
    for (var iB = 0; iB < batch.length; iB++) {
      if (batch[iB] && batch[iB].acc) accs.push(batch[iB].acc);
    }
    if (accs.length <= 1) {
      for (var iS = 0; iS < batch.length; iS++) processTaskSingle(batch[iS]);
      return;
    }
    var br = null;
    try {
      br = postAppendBatchDouyinIdsToServerDb(accs);
    } catch (eBR) {
      br = null;
    }
    if (br && br.ok && br.items && br.items.length > 0) {
      var itemMap = {};
      for (var iIt = 0; iIt < br.items.length; iIt++) {
        var it = br.items[iIt];
        if (!it || !it.norm) continue;
        itemMap[String(it.norm)] = it;
      }
      for (var iT = 0; iT < batch.length; iT++) {
        var task = batch[iT];
        if (!task || !task.acc) continue;
        var nm = normalizeDbLine(task.acc);
        var it2 = itemMap[nm];
        if (it2 && it2.ok && it2.added) uploadAdded.incrementAndGet();
        else if (it2 && it2.ok && it2.duplicate) uploadDup.incrementAndGet();
        else retryOrFailTask(task, it2 && it2.reason ? it2.reason : "batch_item_fail");
      }
      return;
    }
    for (var iF = 0; iF < batch.length; iF++) processTaskSingle(batch[iF]);
  }
  function startUploadWorker(idleSleepMs, doneSleepMs) {
    return threads.start(function () {
      while (!__scriptUserStop || queueLen() > 0 || inFlight.get() > 0) {
        var first = null;
        try { first = queueShift(); } catch (eQ0) {}
        if (!first || !first.acc) {
          sleep(idleSleepMs);
          continue;
        }
        var batch = [first];
        while (batch.length < batchSize) {
          var more = null;
          try { more = queueShift(); } catch (eQ1) {}
          if (!more || !more.acc) break;
          batch.push(more);
        }
        inFlight.addAndGet(batch.length);
        try {
          processBatchTasks(batch);
        } finally {
          inFlight.addAndGet(-batch.length);
        }
        sleep(doneSleepMs);
      }
    });
  }
  var uploadWorkers = [];
  for (var wi = 0; wi < workerCount; wi++) {
    uploadWorkers.push(startUploadWorker(80, 20));
  }

  var totalQueued = 0;
  var noNewRounds = 0;
  var maxNoNewRounds = 3;
  var maxRounds = 90;
  for (var round = 0; round < maxRounds && !__scriptUserStop; round++) {
    var arr = collectXiuluoAccountsFromCurrentPage();
    var newThisRound = 0;
    for (var i = 0; i < arr.length && !__scriptUserStop; i++) {
      var acc = arr[i];
      if (uploadedSet[acc]) continue;
      uploadedSet[acc] = 1;
      if (!queuedSet[acc]) {
        queuedSet[acc] = 1;
        queuePush({ acc: acc, retry: 0 });
        newThisRound++;
        totalQueued++;
      }
    }
    if (newThisRound > 0) appendLog("本页新增" + newThisRound + "，队列" + queueLen());
    if (newThisRound <= 0) noNewRounds++;
    else noNewRounds = 0;
    if (noNewRounds >= maxNoNewRounds) {
      appendLog("无新增账号，停止采集");
      break;
    }
    if (!scrollXiuluoListDown()) {
      appendLog("下滑失败，停止采集");
      break;
    }
    sleepCtrl(newThisRound > 0 ? 550 : 350);
  }

  var drainStart = Date.now();
  var drainMaxMs = 900000;
  var noProgressMaxMs = 90000;
  var lastDrainLogMs = 0;
  var lastProgressMs = Date.now();
  var lastRemain = queueLen() + inFlight.get();
  // 采集结束后进入冲刷阶段：临时提高并发，尽量把尾部队列清空
  if (workerCount < 8) {
    var extraWorkers = 8 - workerCount;
    for (var ew = 0; ew < extraWorkers; ew++) {
      uploadWorkers.push(startUploadWorker(60, 10));
    }
    workerCount = 8;
    appendLog("上传冲刷加速，并发" + workerCount);
  }
  while (queueLen() > 0 || inFlight.get() > 0) {
    var nowMs = Date.now();
    var remain = queueLen() + inFlight.get();
    if (remain < lastRemain) {
      lastRemain = remain;
      lastProgressMs = nowMs;
    }
    if (nowMs - lastDrainLogMs >= 5000) {
      appendLog("上传中，剩余" + remain);
      lastDrainLogMs = nowMs;
    }
    if (nowMs - drainStart >= drainMaxMs) break;
    if (nowMs - lastProgressMs >= noProgressMaxMs) break;
    sleepCtrl(200);
  }
  var pendingLeft = queueLen() + inFlight.get();
  if (pendingLeft > 0) {
    uploadFail.addAndGet(pendingLeft);
    appendLog("上传超时，剩余" + pendingLeft + "未完成");
  } else {
    appendLog("上传队列已清空");
  }
  __scriptUserStop = true;
  for (var wj = 0; wj < uploadWorkers.length; wj++) {
    try { if (uploadWorkers[wj] && uploadWorkers[wj].interrupt) uploadWorkers[wj].interrupt(); } catch (eI) {}
  }
  appendLog(
    "采集完成，入队" +
      totalQueued +
      "，成功新增" +
      uploadAdded.get() +
      "，重复跳过" +
      uploadDup.get() +
      "，失败" +
      uploadFail.get()
  );
}

function runXiuluoHiddenFlowOnce() {
  appendLog("修罗道模式");
  forceStopApp(DY_PKG, "抖音");
  if (__scriptUserStop) return;
  launchDouyin();
  if (__scriptUserStop) return;
  clickSearchIcon();
  if (__scriptUserStop) return;
  clickExpandButtonForXiuluo();
  if (__scriptUserStop) return;
  clickMoreHistoryForXiuluo();
  if (__scriptUserStop) return;
  runXiuluoCollectAndUploadLoop();
  }

// ===== HTTP 请求 =====
var SERVER_IP = "117.72.91.93"
var SERVER_PORT = 8080;
var SERVER_TOKEN = "8d7f9a2e3b1c5f6e8d9a2b4c6d8f0a1e";
/** POST /append、/append_batch 入库超时；服务器不可达时过大会拖很久才出现 S-B net */
var __HTTP_APPEND_TIMEOUT_MS = 5500;

function sha256Hex(s) {
  try {
    var md = java.security.MessageDigest.getInstance("SHA-256");
    var bytes = new java.lang.String(String(s)).getBytes("UTF-8");
    var digest = md.digest(bytes);
    var sb = new java.lang.StringBuilder();
    for (var i = 0; i < digest.length; i++) {
      var b = digest[i];
      var v = b & 0xff;
      if (v < 16) sb.append("0");
      sb.append(java.lang.Integer.toHexString(v));
    }
    return String(sb.toString());
  } catch (e) {
    return "";
  }
}

function buildSignedPayload(path, ext) {
  var payload = ext ? JSON.parse(JSON.stringify(ext)) : {};
  payload.token = SERVER_TOKEN;
  payload.dao = getDaoForServerApi();
  payload.ts = Math.floor(Date.now() / 1000);
  payload.nonce = String(Date.now()) + "_" + Math.floor(Math.random() * 1e9);
  var cid = payload.cid ? String(payload.cid) : "";
  var dao = payload.dao ? String(payload.dao) : "";
  var line = payload.line ? normalizeDbLine(payload.line) : "";
  var msg =
    SERVER_TOKEN +
    "|" +
    String(path || "") +
    "|" +
    String(payload.ts) +
    "|" +
    String(payload.nonce) +
    "|" +
    cid +
    "|" +
    dao +
    "|" +
    line;
  payload.sig = sha256Hex(msg);
  return payload;
}

function buildSignedPayloadWithDao(path, ext, daoOverride) {
  var payload = ext ? JSON.parse(JSON.stringify(ext)) : {};
  payload.token = SERVER_TOKEN;
  payload.dao = daoOverride == null ? getDaoForServerApi() : String(daoOverride);
  payload.ts = Math.floor(Date.now() / 1000);
  payload.nonce = String(Date.now()) + "_" + Math.floor(Math.random() * 1e9);
  var cid = payload.cid ? String(payload.cid) : "";
  var dao = payload.dao ? String(payload.dao) : "";
  var line = payload.line ? normalizeDbLine(payload.line) : "";
  var msg =
    SERVER_TOKEN +
    "|" +
    String(path || "") +
    "|" +
    String(payload.ts) +
    "|" +
    String(payload.nonce) +
    "|" +
    cid +
    "|" +
    dao +
    "|" +
    line;
  payload.sig = sha256Hex(msg);
  return payload;
}

/** http.postJson 抛错时摘一小段文案，便于区分超时/拒连/DNS 等（非服务端 JSON 里的 reason） */
function httpExcBrief(e) {
  try {
    var m = e && (e.message != null ? e.message : e.toString && e.toString());
    m = String(m || "").replace(/\r|\n/g, " ").trim();
    if (m.length > 72) m = m.slice(0, 69) + "...";
    return m || "exc";
  } catch (e2) {
    return "exc";
  }
}

function postAppendHumandaoDouyinIdToServerA2(raw) {
  raw = raw == null ? "" : String(raw).trim();
  if (!raw) return { ok: false, reason: "empty" };
  var url = "http://" + SERVER_IP + ":" + SERVER_PORT + "/a2_append";
  var payload = buildSignedPayload("/a2_append", { line: raw });
  try {
    var r = http.postJson(url, payload, { timeout: 12000 });
    if (!r || r.statusCode !== 200) {
      return { ok: false, reason: "http_" + (r ? r.statusCode : "0") };
    }
    try {
      return r.body.json();
    } catch (eJ) {
      return { ok: false, reason: "bad_json" };
    }
  } catch (e) {
    return { ok: false, reason: "net " + httpExcBrief(e) };
  }
}

function getMyDouyinIdFromMePage() {
  // 你提供的小米元素：id=5no 文案形如“抖音号:57655091978”
  try {
    var n = id("com.ss.android.ugc.aweme:id/5no").findOne(260);
    if (n) {
      var t = "";
      try { t = (n.text && n.text()) || (n.desc && n.desc()) || ""; } catch (e0) { t = ""; }
      t = String(t || "").trim();
      if (t) return t;
    }
  } catch (e1) {}
  try {
    var t2 = textMatches(/^抖音号[：:·]\s*\S+/).findOne(260);
    if (t2) {
      var s2 = "";
      try { s2 = (t2.text && t2.text()) || (t2.desc && t2.desc()) || ""; } catch (e2) { s2 = ""; }
      s2 = String(s2 || "").trim();
      if (s2) return s2;
    }
  } catch (e3) {}
  return "";
}

function normalizeMyDouyinIdTextToIdOnly(s) {
  s = s == null ? "" : String(s);
  s = s.replace(/\s+/g, "").trim();
  // 形如：抖音号:57655091978
  var m = s.match(/抖音号[：:·]?([A-Za-z0-9._-]{4,40})/);
  if (m && m[1]) {
    var fromLabel = String(m[1]).trim();
    return isValidDouyinIdForUpload(fromLabel) ? fromLabel : "";
  }
  // 若直接就是 ID（纯数字须 ≥8 位，避免把粉丝数 1717/6377 当抖音号）
  if (/^[A-Za-z0-9._-]{4,40}$/.test(s)) {
    return isValidDouyinIdForUpload(s) ? s : "";
  }
  return "";
}

/** 换道/借道登记前：过滤 4～7 位纯数字（多为粉丝/获赞误读，不是抖音号） */
function isValidDouyinIdForUpload(id) {
  var s = id == null ? "" : String(id).replace(/\s+/g, "").trim();
  if (!s) return false;
  if (!/^[A-Za-z0-9._-]{4,40}$/.test(s)) return false;
  if (/^\d+$/.test(s)) return s.length >= 8;
  return /[A-Za-z]/.test(s);
}

function getCachedMyDouyinIdForFilter() {
  var v = "";
  try { v = String(__stats.get("myDouyinIdCached", "") || ""); } catch (e0) { v = ""; }
  v = normalizeMyDouyinIdTextToIdOnly(v);
  return v;
}

function cacheMyDouyinIdForFilter(rawOrId) {
  var did = normalizeMyDouyinIdTextToIdOnly(rawOrId);
  if (!did) return;
  try { __stats.put("myDouyinIdCached", did); } catch (e0) {}
}

function tryUploadMyDouyinIdToA2IfFansOver1000(fansInt) {
  try {
    if (!(fansInt != null && Number(fansInt) >= 1000 && Number(fansInt) <= 10000)) return;
  } catch (e0) {
    return;
  }
  // 每天最多上报一次，避免刷接口
  var today = "";
  try { today = dateKey(new Date()); } catch (e1) { today = ""; }
  try {
    var last = String(__stats.get("a2HumandaoUploadDay", "") || "");
    if (today && last === today) return;
  } catch (e2) {}
  var raw = "";
  try { raw = getMyDouyinIdFromMePage(); } catch (e3) { raw = ""; }
  var did = normalizeMyDouyinIdTextToIdOnly(raw);
  if (!did) return;
  cacheMyDouyinIdForFilter(did);
  threads.start(function () {
    try {
      var rs = postAppendHumandaoDouyinIdToServerA2(did);
      if (rs && rs.ok) {
        try { __stats.put("a2HumandaoUploadDay", today); } catch (eS0) {}
      }
    } catch (e4) {}
  });
}

var __lastPickedDbLine = null;

function normalizeDbLine(s) {
  if (s == null) return "";
  return String(s).replace(/^\ufeff/, "").replace(/\s+/g, " ").trim();
}

function buildPickUrlPath() {
  return "/pick/" + new Date().getTime() + "r" + Math.floor(Math.random() * 1e12);
}

function doPickRequest() {
  var base = "http://" + SERVER_IP + ":" + SERVER_PORT;
  for (var a = 0; a < 10; a++) {
    var path = buildPickUrlPath();
    var url = base + path;
    var cid = "c" + new Date().getTime() + "a" + a;
    var payload = buildSignedPayload(path, {
      cid: cid,
      t: new Date().getTime()
    });

    var r = null;
    try {
      r = http.postJson(url, payload, { timeout: 10000 });
    } catch (e) {}

    if (!r || r.statusCode !== 200) continue;

    var j = null;
    try {
      j = r.body.json();
    } catch (e) {}

    if (!j) {
      var raw = r.body.string();
      var trimmed = raw.trim();
      if (trimmed.charAt(0) !== "{") {
        return { raw: trimmed, norm: normalizeDbLine(trimmed) };
      }
      try {
        j = JSON.parse(trimmed);
      } catch (e) { continue; }
    }

    if (j.line && String(j.line).length > 0) {
      return { raw: String(j.line), norm: j.norm || normalizeDbLine(j.line) };
    }
    sleep(200);
  }
  return null;
}

function pickRandomDbLine() {
  var dao = getDaoForServerApi();
  var myDid = getCachedMyDouyinIdForFilter();
  for (var k = 0; k < 20; k++) {
    var pr = doPickRequest();
    if (pr && pr.raw) {
      var got = normalizeDbLine(pr.raw);
      // 换道模式：不允许取到自己的账号
      if (dao === "huandao" && myDid && got && String(got) === String(myDid)) {
        sleep(120);
        continue;
      }
      return pr.raw;
    }
    sleep(300);
  }
  return null;
}

function buildPickCommentUrlPath() {
  return "/pick_comment/" + new Date().getTime() + "r" + Math.floor(Math.random() * 1e12);
}

function doPickCommentRequest() {
  var base = "http://" + SERVER_IP + ":" + SERVER_PORT;
  for (var a = 0; a < 10; a++) {
    var path = buildPickCommentUrlPath();
    var url = base + path;
    var cid = "cc" + new Date().getTime() + "a" + a;
    var payload = buildSignedPayload(path, { cid: cid, t: new Date().getTime() });
    var r = null;
    try {
      r = http.postJson(url, payload, { timeout: 10000 });
    } catch (e0) {}
    if (!r || r.statusCode !== 200) {
      try {
        r = http.post(url, JSON.stringify(payload), {
          headers: { "Content-Type": "application/json;charset=utf-8" },
          timeout: 10000,
        });
      } catch (e1) {}
    }
    if (!r || r.statusCode !== 200) continue;
    var j = null;
    try {
      j = r.body.json();
    } catch (e2) {}
    if (!j) {
      var raw = String(r.body.string() || "").trim();
      if (raw && raw.charAt(0) !== "{") {
        return normalizeDbLine(raw);
      }
      try {
        j = JSON.parse(raw);
      } catch (e3) {
        continue;
      }
    }
    if (String(j.cid) !== String(cid)) {
      sleep(80);
      continue;
    }
    if (j.text != null && String(j.text).length) return String(j.text);
    if (j.line != null && String(j.line).length) return String(j.line);
    var jn = j.n != null ? Number(j.n) : -1;
    if (jn === 0) return null;
    sleep(200);
  }
  return null;
}

function pickRandomCommentLine() {
  for (var k = 0; k < 20; k++) {
    var s = doPickCommentRequest();
    if (s) return s;
    sleep(300);
  }
  return null;
}

/** 日志里服务端库行数少显示一位：实际 ÷10 取整（如 1325→132、2080→208），逻辑仍用真实值 */
function formatDbCountForLog(n) {
  var v = Number(n);
  if (isNaN(v) || v < 0) return String(n == null ? "" : n);
  return String(Math.floor(v / 10));
}

function removeDbLineFromServer(line) {
  if (!line) return false;
  var url = "http://" + SERVER_IP + ":" + SERVER_PORT + "/remove";
  var payload = buildSignedPayload("/remove", { line: normalizeDbLine(line) });

  var r = null;
  try {
    r = http.postJson(url, payload, { timeout: 10000 });
  } catch (e) {
    appendLog("删行异常");
    return false;
  }

  if (r && r.statusCode === 200) {
    try {
      var jr = r.body.json();
      if (jr) {
        appendLog(jr.removed ? "已删" : "无此行");
        if (jr.left !== undefined) appendLog("剩余:" + formatDbCountForLog(jr.left));
        return jr.removed === true;
      }
    } catch (e) {}
        return true;
  }
  appendLog("删行失败:" + (r ? r.statusCode : "?"));
  return false;
}

/** 从「抖音号: xxx」文案里取出纯号码（与界面展示一致即可被服务端 normalize） */
function stripDouyinIdFromLabelText(txt) {
  if (!txt) return "";
  return String(txt)
    .replace(/^\s*抖音号[:：]\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** （已停用）粉丝主页抖音号入库相关参数 */
var __MIN_FAN_COUNT_FOR_PROFILE_DB_APPEND = 1000;

/**
 * 他人粉丝主页：顶部「粉丝」旁数量 TextView（常见 id 50y/5xo），规则与「我」页 getFansFromMePage 一致。
 * @returns {number|null} 解析失败返回 null（此时不上报入库，避免未校验粉丝量）
 */
function readFanProfilePageFansCountInt() {
  function _parseFansTextToInt(t) {
    if (!t) return null;
    var s = String(t).trim();
    if (!s || s === "粉丝") return null;
    return fansToInt(s.replace(/[^\d\.万亿wW]/g, "").replace(/[wW]/g, "万"));
  }
  /** 无 resource-id：横排「数字 + 粉丝」同在可点 LinearLayout，或数字在「粉丝」左侧同行 */
  function _fansFromProfileStatsNoId() {
    var w = device.width;
    var h = device.height;
    var xMin = Math.floor(w * 0.26);
    var yMin = Math.floor(h * 0.05);
    var xMax = w - 1;
    var yMax = Math.floor(h * 0.45);
    try {
      var layouts = className("android.widget.LinearLayout")
        .clickable(true)
        .boundsInside(xMin, yMin, xMax, yMax)
        .find();
      if (layouts && layouts.size && layouts.size() > 0) {
        for (var li = 0; li < layouts.size(); li++) {
          var lay = layouts.get(li);
          if (!lay) continue;
          var hasFansLbl = false;
          var numVal = null;
          var cc = 0;
          try {
            cc = lay.childCount();
          } catch (eCc) {
            cc = 0;
          }
          for (var ci = 0; ci < cc; ci++) {
            var ch = null;
            try {
              ch = lay.child(ci);
            } catch (eCh) {
              ch = null;
            }
            if (!ch) continue;
            var tb = "";
            try {
              tb = String((ch.text && ch.text()) || (ch.desc && ch.desc()) || "").trim();
            } catch (eTb) {
              tb = "";
            }
            if (tb === "粉丝") hasFansLbl = true;
            else {
              var nv = _parseFansTextToInt(tb);
              if (nv != null) numVal = nv;
            }
          }
          if (hasFansLbl && numVal != null) return numVal;
        }
      }
    } catch (eLay) {}
    try {
      var lblColl = text("粉丝").boundsInside(xMin, yMin, xMax, yMax).find();
      if (lblColl && lblColl.size && lblColl.size() > 0) {
        for (var fi = lblColl.size() - 1; fi >= 0; fi--) {
          var lbl = lblColl.get(fi);
          if (!lbl) continue;
          var p = null;
          try {
            p = lbl.parent();
          } catch (eP0) {
            p = null;
          }
          if (p) {
            try {
              for (var i2 = 0; i2 < p.childCount(); i2++) {
                var ch2 = p.child(i2);
                if (!ch2) continue;
                var t2 = "";
                try {
                  t2 = String((ch2.text && ch2.text()) || (ch2.desc && ch2.desc()) || "").trim();
                } catch (eT2) {
                  t2 = "";
                }
                var n2 = _parseFansTextToInt(t2);
                if (n2 != null) return n2;
              }
            } catch (eC0) {}
          }
          try {
            var lb = lbl.bounds();
            var digitColl = textMatches(/^\d+(?:\.\d+)?(?:万|亿)?$/)
              .boundsInside(
                Math.max(0, lb.left - Math.floor(w * 0.24)),
                Math.max(0, lb.top - 12),
                lb.left + 6,
                Math.min(h - 1, lb.bottom + 12)
              )
              .find();
            if (digitColl && digitColl.size && digitColl.size() > 0) {
              var bestL = -1;
              var bestN = null;
              for (var di = 0; di < digitColl.size(); di++) {
                var dn = digitColl.get(di);
                var dt = "";
                try {
                  dt = String((dn.text && dn.text()) || "").trim();
                } catch (eDt) {
                  dt = "";
                }
                var dnInt = _parseFansTextToInt(dt);
                if (dnInt == null) continue;
                if (dnInt > bestL) {
                  bestL = dnInt;
                  bestN = dnInt;
                }
              }
              if (bestN != null) return bestN;
            }
          } catch (eLeft) {}
        }
      }
    } catch (eLbl) {}
    return null;
  }
  try {
    var vNoId = _fansFromProfileStatsNoId();
    if (vNoId != null) return vNoId;
  } catch (eNoId0) {}
  /** 单 id 等待过长时，问道第 8 步多用户循环会累加成分钟；略短仍可二次读屏 */
  var fanIdWaitMs = 220;
  var candIds = [
    // 机型 D：数字 id=5y5，旁「粉丝」5y7，容器 5y4
    "com.ss.android.ugc.aweme:id/5y5",
    // 机型 B：数字 id=5yw，旁「粉丝」id=5yy，容器 5yv（勿把 5yr 放 5yw 前：5yr 树上可能先命中但无文案，导致跳过 5yw）
    "com.ss.android.ugc.aweme:id/5yw",
    // 机型 E：数字 id=5yr，下方「粉丝」id=5ys
    "com.ss.android.ugc.aweme:id/5yr",
    // 机型 A：粉丝数 id=50y（旁边“粉丝” id=500）
    "com.ss.android.ugc.aweme:id/50y",
    // 机型 C：粉丝数 id=5mp（旁边“粉丝” id=5mr）
    "com.ss.android.ugc.aweme:id/5mp",
    // 旧兜底
    "com.ss.android.ugc.aweme:id/5xo",
  ];
  function _parseFansFromNode(n) {
    if (!n) return null;
    var val = null;
    try {
      val = n.text();
      if (!val && n.desc) val = n.desc();
    } catch (e1) {}
    return _parseFansTextToInt(val);
  }
  var ci;
  for (ci = 0; ci < candIds.length; ci++) {
  var node = null;
  try {
      node = id(candIds[ci]).findOne(fanIdWaitMs);
    } catch (e0) {
      node = null;
    }
    if (!node) continue;
    var vCand = _parseFansFromNode(node);
    if (vCand != null) return vCand;
  }
  // 打包环境或部分 ROM：全包名 id 找不到时用短 id / idMatches
  var altTry = [
    function () {
      return idMatches(/.*:id\/5yw$/).findOne(280);
    },
    function () {
      return id("5yw").findOne(200);
    },
    function () {
      return idMatches(/.*:id\/5y5$/).findOne(280);
    },
    function () {
      return id("5y5").findOne(200);
    },
  ];
  for (ci = 0; ci < altTry.length; ci++) {
    var n2 = null;
    try {
      n2 = altTry[ci]();
    } catch (eA) {
      n2 = null;
    }
    var vAlt = _parseFansFromNode(n2);
    if (vAlt != null) return vAlt;
  }
  // 容器 5yv / 5y4：扫子节点数字（横排统计条）
  function _fansFromBarContainer(barIdFull, barIdShort, barMatch) {
    var bar = null;
    try {
      bar = id(barIdFull).findOne(320);
    } catch (eB0) {}
    if (!bar && barMatch) {
      try {
        bar = idMatches(barMatch).findOne(260);
      } catch (eB1) {}
    }
    if (!bar && barIdShort) {
      try {
        bar = id(barIdShort).findOne(220);
      } catch (eB2) {}
    }
    var cct = bar && bar.childCount ? bar.childCount() : 0;
    if (cct <= 0) return null;
    var ic;
    for (ic = 0; ic < cct; ic++) {
      var ch = bar.child(ic);
      if (!ch) continue;
      var tb = "";
      try {
        tb = String((ch.text && ch.text()) || (ch.desc && ch.desc()) || "").trim();
      } catch (eTb) {
        tb = "";
      }
      if (!tb || tb === "粉丝") continue;
      var nb = fansToInt(String(tb).replace(/[^\d\.万亿wW]/g, "").replace(/[wW]/g, "万"));
      if (nb != null) return nb;
    }
    return null;
  }
  var vBar = _fansFromBarContainer("com.ss.android.ugc.aweme:id/5yv", "5yv", /.*:id\/5yv$/);
  if (vBar != null) return vBar;
  vBar = _fansFromBarContainer("com.ss.android.ugc.aweme:id/5y4", "5y4", /.*:id\/5y4$/);
  if (vBar != null) return vBar;

  // 兜底：带 id 的「粉丝」标签邻近取数；最后再走一遍无 id 横排逻辑
  try {
    var lbl = null;
    try { lbl = id("com.ss.android.ugc.aweme:id/5mr").text("粉丝").findOne(180); } catch (eL0) {}
    if (!lbl) {
      try { lbl = id("com.ss.android.ugc.aweme:id/5y7").text("粉丝").findOne(180); } catch (eL0b) {}
    }
    if (!lbl) {
      try { lbl = id("com.ss.android.ugc.aweme:id/5yy").text("粉丝").findOne(220); } catch (eL0d) {}
    }
    if (!lbl) {
      try { lbl = idMatches(/.*:id\/5yy$/).text("粉丝").findOne(200); } catch (eL0e) {}
    }
    if (!lbl) {
      try { lbl = id("com.ss.android.ugc.aweme:id/5ys").text("粉丝").findOne(180); } catch (eL0c) {}
    }
    if (lbl) {
      var p = null;
      try { p = lbl.parent(); } catch (eP0) { p = null; }
      if (p) {
        try {
          for (var i2 = 0; i2 < p.childCount(); i2++) {
            var ch = p.child(i2);
            if (!ch) continue;
            var t = "";
            try { t = String((ch.text && ch.text()) || (ch.desc && ch.desc()) || "").trim(); } catch (eT0) { t = ""; }
            var n2 = _parseFansTextToInt(t);
            if (n2 != null) return n2;
          }
        } catch (eC0) {}
      }
    }
  } catch (eF1) {}
  try {
    var vNoId2 = _fansFromProfileStatsNoId();
    if (vNoId2 != null) return vNoId2;
  } catch (eNoId1) {}
  try {
    var vOcr = readProfileFansCountByOcr(2800);
    if (vOcr != null) {
      appendLog("O用户粉丝:" + vOcr);
      return vOcr;
    }
  } catch (eOcr0) {}
  return null;
}

/**
 * 他人粉丝主页「抖音号: xxx」文案节点：新版 id=5ny，旧版 id=5me。
 */
function findFanProfileDouyinIdTextNode(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 400;
  var node = null;
  try {
    node = id("com.ss.android.ugc.aweme:id/5ny").findOne(t);
  } catch (e0) {}
  if (node) return node;
  try {
    node = id("com.ss.android.ugc.aweme:id/5me").findOne(t);
  } catch (e1) {}
  if (node) return node;
  try {
    node = idMatches(/.*:id\/5ny$/).findOne(Math.min(t, 280));
  } catch (e2) {}
  if (node) return node;
  try {
    node = idMatches(/.*:id\/5me$/).findOne(Math.min(t, 280));
  } catch (e3) {}
  return node;
}

/** 粉丝主页：读取抖音号控件（5ny/5me 或 抖音号: 前缀的 TextView） */
function readDouyinIdFromFanProfilePage(quick) {
  var sodaQuick = quick && isSodaPlatformSelected();
  var tMain = sodaQuick ? 80 : quick ? 160 : 480;
  var tAlt = sodaQuick ? 60 : quick ? 120 : 320;
  var tBox = sodaQuick ? 60 : quick ? 120 : 260;
  var node = findFanProfileDouyinIdTextNode(tMain);
  if (!node) {
    try {
      node = textMatches(/^抖音号[:：].+/).findOne(tAlt);
    } catch (e1) {}
  }
  if (!node) {
    try {
      var w = device.width;
      node = textMatches(/^抖音号[:：].+/)
        .boundsInside(380, 420, Math.min(w, 820), 560)
        .findOne(tBox);
    } catch (e2) {}
  }
  if (!node) return null;
  var t = node.text();
  if (!t && node.desc) t = node.desc();
  t = t == null ? "" : String(t).trim();
  if (!/抖音号[：:·]/.test(t)) return null;
  var raw = stripDouyinIdFromLabelText(t);
  if (!raw) return null;
  var id = normalizeMyDouyinIdTextToIdOnly(t);
  return id || null;
}

function getOperatedDyidMapWindow() {
  try {
    var raw = String(__stats.get(__OPERATED_DYID_JSON_KEY, "{}") || "{}");
    var obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e1) {
    return {};
  }
}

function pruneOperatedDyidMapWindow(m, nowMs) {
  var now = typeof nowMs === "number" && nowMs > 0 ? nowMs : Date.now();
  var changed = false;
  var out = {};
  var cutoff = now - __OPERATED_DYID_WINDOW_MS;
  for (var k in m) {
    if (!m.hasOwnProperty(k)) continue;
    var ts = Number(m[k]) || 0;
    if (ts >= cutoff) out[k] = ts;
    else changed = true;
  }
  return { changed: changed, map: out };
}

function saveOperatedDyidMapWindow(m) {
  try {
    __stats.put(__OPERATED_DYID_JSON_KEY, JSON.stringify(m || {}));
  } catch (e0) {}
}

function hasOperatedDyidInWindow(dyid) {
  var k = normalizeDbLine(dyid);
  if (!k) return false;
  var now = Date.now();
  var pr = pruneOperatedDyidMapWindow(getOperatedDyidMapWindow(), now);
  if (pr.changed) saveOperatedDyidMapWindow(pr.map);
  return !!pr.map[String(k)];
}

function markOperatedDyidInWindow(dyid) {
  var k = normalizeDbLine(dyid);
  if (!k) return;
  var now = Date.now();
  var pr = pruneOperatedDyidMapWindow(getOperatedDyidMapWindow(), now);
  var m = pr.map;
  m[String(k)] = now;
  saveOperatedDyidMapWindow(m);
}

function normalizeOperatedSodaNickKey(nick) {
  return normalizeFollowerNickKey(normalizeFollowerNicknameForLog(nick) || nick);
}

function getOperatedSodaNickMapWindow() {
  try {
    var raw = String(__stats.get(__OPERATED_SODA_NICK_JSON_KEY, "{}") || "{}");
    var obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e1) {
    return {};
  }
}

function saveOperatedSodaNickMapWindow(m) {
  try {
    __stats.put(__OPERATED_SODA_NICK_JSON_KEY, JSON.stringify(m || {}));
  } catch (e0) {}
}

function hasOperatedSodaNickInWindow(nick) {
  var k = normalizeOperatedSodaNickKey(nick);
  if (!k) return false;
  var now = Date.now();
  var pr = pruneOperatedDyidMapWindow(getOperatedSodaNickMapWindow(), now);
  if (pr.changed) saveOperatedSodaNickMapWindow(pr.map);
  return !!pr.map[String(k)];
}

function markOperatedSodaNickInWindow(nick) {
  var k = normalizeOperatedSodaNickKey(nick);
  if (!k) return;
  var now = Date.now();
  var pr = pruneOperatedDyidMapWindow(getOperatedSodaNickMapWindow(), now);
  var m = pr.map;
  m[String(k)] = now;
  saveOperatedSodaNickMapWindow(m);
}

function resetCurrentTargetOperatedSkipCounter() {
  __currentTargetOperatedSkipN = 0;
}

function resetSodaStep8UnqualifiedSkipCounter() {
  __sodaStep8UnqualifiedSkipN = 0;
}

/** 汽水第8步：连续多名关注用户粉丝数不符合 → 重启脚本获取新对标 */
function sodaRestartForBadBenchmarkFromStep8(maxStep) {
  appendLog("对标不好 更换对标");
  resetSodaStep8UnqualifiedSkipCounter();
  try {
    __followerVisitedNicks = {};
  } catch (eClr) {}
  __lastSodaFollowingVisitKey = "";
  __noWorkLikeEntryDidBack = false;
  var ms = typeof maxStep === "number" && maxStep > 0 ? maxStep : 11;
  var ok = runFlowSteps1Through9ForInjectedRestart(ms, true);
  if (!ok) appendLog("重启获取新对标失败");
  return ok;
}

/** GET /count：服务端是否仍接受入库（append_ok）；请求失败时返回 true，仍尝试 POST */
function fetchServerAppendOkForProfileUpload() {
  var url =
    "http://" +
    SERVER_IP +
    ":" +
    SERVER_PORT +
    "/count?token=" +
    encodeURIComponent(SERVER_TOKEN) +
    "&dao=" +
    encodeURIComponent(getDaoForServerApi());
  try {
    var r = http.get(url, { timeout: 2500 });
    if (!r || r.statusCode !== 200) return true;
    var jr = r.body.json();
    if (jr && jr.append_ok === false) return false;
  } catch (e) {}
      return true;
    }

/** POST /append：把纯抖音号写入服务端 db（与 pick/remove 同 token） */
function postAppendDouyinIdToServerDb(line) {
  var raw = normalizeDbLine(line);
  if (!raw) return { ok: false, added: false, duplicate: false, reason: "empty" };
  if (!isValidDouyinIdForUpload(raw)) {
    return { ok: false, added: false, duplicate: false, reason: "invalid_id" };
  }
  var url = "http://" + SERVER_IP + ":" + SERVER_PORT + "/append";
  var payload = buildSignedPayload("/append", { line: raw });
  var r = null;
  try {
    r = http.postJson(url, payload, { timeout: __HTTP_APPEND_TIMEOUT_MS });
  } catch (e) {
    return { ok: false, added: false, duplicate: false, reason: "net " + httpExcBrief(e) };
  }
  if (!r || r.statusCode !== 200) {
    return {
      ok: false,
      added: false,
      duplicate: false,
      reason: "http " + (r && r.statusCode != null ? r.statusCode : "0"),
    };
  }
  try {
    var jr = r.body.json();
    if (jr && jr.ok === false)
      return {
        ok: false,
        added: false,
        duplicate: false,
        reason: String(jr.reason || "server"),
      };
    return {
      ok: true,
      added: !!(jr && jr.added === true),
      duplicate: !!(jr && jr.duplicate === true),
      reason: "",
    };
  } catch (e2) {
    return { ok: false, added: false, duplicate: false, reason: "bad_json" };
  }
}

function postAppendDouyinIdToServerDbWithDao(line, daoOverride) {
  var raw = normalizeDbLine(line);
  if (!raw) return { ok: false, added: false, duplicate: false, reason: "empty" };
  if (!isValidDouyinIdForUpload(raw)) {
    return { ok: false, added: false, duplicate: false, reason: "invalid_id" };
  }
  var url = "http://" + SERVER_IP + ":" + SERVER_PORT + "/append";
  var payload = buildSignedPayloadWithDao("/append", { line: raw }, daoOverride);
  var r = null;
  try {
    r = http.postJson(url, payload, { timeout: __HTTP_APPEND_TIMEOUT_MS });
  } catch (e) {
    return { ok: false, added: false, duplicate: false, reason: "net " + httpExcBrief(e) };
  }
  if (!r || r.statusCode !== 200) {
    return {
      ok: false,
      added: false,
      duplicate: false,
      reason: "http " + (r && r.statusCode != null ? r.statusCode : "0"),
    };
  }
  try {
    var jr = r.body.json();
    if (jr && jr.ok === false)
      return {
        ok: false,
        added: false,
        duplicate: false,
        reason: String(jr.reason || "server"),
      };
    return {
      ok: true,
      added: !!(jr && jr.added === true),
      duplicate: !!(jr && jr.duplicate === true),
      reason: "",
    };
  } catch (e2) {
    return { ok: false, added: false, duplicate: false, reason: "bad_json" };
  }
}

/** POST /append_batch：批量写入，减少请求往返和锁竞争 */
function postAppendBatchDouyinIdsToServerDb(lines) {
  if (!lines || !lines.length) {
    return { ok: false, added: 0, duplicate: 0, failed: 0, reason: "empty", items: [] };
  }
  var arr = [];
  for (var i = 0; i < lines.length; i++) {
    var s = normalizeDbLine(lines[i]);
    if (s) arr.push(s);
  }
  if (!arr.length) {
    return { ok: false, added: 0, duplicate: 0, failed: 0, reason: "empty", items: [] };
  }
  var url = "http://" + SERVER_IP + ":" + SERVER_PORT + "/append_batch";
  var payload = buildSignedPayload("/append_batch", { line: arr[0], lines: arr });
  var r = null;
  try {
    r = http.postJson(url, payload, { timeout: Math.max(10000, __HTTP_APPEND_TIMEOUT_MS + 2500) });
  } catch (e) {
    return { ok: false, added: 0, duplicate: 0, failed: arr.length, reason: "net " + httpExcBrief(e), items: [] };
  }
  if (!r || r.statusCode !== 200) {
    return {
      ok: false,
      added: 0,
      duplicate: 0,
      failed: arr.length,
      reason: "http " + (r && r.statusCode != null ? r.statusCode : "0"),
      items: [],
    };
  }
  try {
    var jr = r.body.json();
    return {
      ok: !!(jr && jr.ok === true),
      added: Number(jr && jr.added != null ? jr.added : 0) || 0,
      duplicate: Number(jr && jr.duplicate != null ? jr.duplicate : 0) || 0,
      failed: Number(jr && jr.failed != null ? jr.failed : 0) || 0,
      reason: String((jr && jr.reason) || ""),
      items: (jr && jr.items && jr.items.length) ? jr.items : [],
    };
  } catch (e2) {
    return { ok: false, added: 0, duplicate: 0, failed: arr.length, reason: "bad_json", items: [] };
  }
}

/** 进入粉丝主页后：抖音号入库功能已停用（不再上报服务器） */
function tryCaptureAndUploadFanProfileDouyinId() {
    return;
}

function pasteValueIntoSearch(value) {
  if (!value) return false;
  setClip(value);
  sleep(200);
  try {
    var input = className("android.widget.EditText").findOne(2000);
    if (input) {
      clickNode(input);
      sleep(300);
      setText(value);
      appendLog("已粘贴");
      return true;
    }
  } catch (e) {}
  return false;
}

function clearSearchInput() {
  appendLog("清空搜索栏");
  try {
    var input = className("android.widget.EditText").findOne(1500);
    if (input) {
      clickNode(input);
      sleep(200);
      setText("");
    }
  } catch (e) {}
}

function findDouyinIdResultNode(timeoutMs) {
  var t = typeof timeoutMs === "number" && timeoutMs >= 0 ? timeoutMs : 3000;
  try {
    var node = descMatches(/^抖音号[:：].+/).findOne(t);
    if (!node) node = textMatches(/^抖音号[:：].+/).findOne(t);
    return node || null;
  } catch (e) {}
  return null;
}

function normalizeOcrCompareText(s) {
  if (s == null) return "";
  return String(s)
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9]/g, "")
    .trim();
}

function parseOcrTextAndBounds(item) {
  if (!item) return null;
  var txt = "";
  var b = null;
  // 兼容部分 OCR 返回数组结构： [bounds, text, score] 或 [[x,y]... , text]
  try {
    if (Array.isArray(item)) {
      if (item.length >= 2) {
        if (typeof item[1] === "string") txt = String(item[1] || "").trim();
        b = item[0] || null;
      } else if (item.length === 1 && item[0] && typeof item[0] === "object") {
        item = item[0];
      }
    }
  } catch (eA) {}
  try {
    if (!txt) {
      txt = String(
        item.text ||
          item.label ||
          item.words ||
          item.value ||
          (item.result && item.result.text) ||
          ""
      ).trim();
    }
  } catch (e0) {
    txt = "";
  }
  if (!txt) return null;
  try {
    if (!b) b = item.bounds || item.bound || item.rect || item.box || item.points || item.position || null;
  } catch (e1) {
    b = null;
  }
  return { text: txt, bounds: b };
}

/** 他人/我页粉丝数：无障碍无 id 时用录屏+OCR 识别（需 paddle.ocr，且已点「允许」录屏投射） */
var PROFILE_FANS_OCR_FALLBACK_ENABLED = true;
var __profileFansPaddleOcrDisabled = false;

function isProfileFansPaddleOcrAvailable() {
  if (!PROFILE_FANS_OCR_FALLBACK_ENABLED) return false;
  if (__profileFansPaddleOcrDisabled) return false;
  return typeof paddle !== "undefined" && paddle && typeof paddle.ocr === "function";
}

function runProfileFansPaddleOcrSafe(ocrImg) {
  if (!isProfileFansPaddleOcrAvailable()) return [];
  try {
    return paddle.ocr(ocrImg) || [];
  } catch (e) {
    __profileFansPaddleOcrDisabled = true;
    try {
      appendLog("OCR库不可用已跳过");
    } catch (eL) {}
    return [];
  }
}

function ocrBoundsToRect(bd) {
  if (!bd) return null;
  try {
    if (Array.isArray(bd) && bd.length >= 2) {
      var minX = 1e9,
        minY = 1e9,
        maxX = -1,
        maxY = -1;
      for (var i = 0; i < bd.length; i++) {
        var p = bd[i];
        if (!p || p.length < 2) continue;
        var x = Number(p[0]),
          y = Number(p[1]);
        if (isNaN(x) || isNaN(y)) continue;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
      if (maxX >= minX && maxY >= minY) {
        return {
          left: minX,
          top: minY,
          right: maxX,
          bottom: maxY,
          cx: Math.floor((minX + maxX) / 2),
          cy: Math.floor((minY + maxY) / 2),
        };
      }
    }
  } catch (eA) {}
  try {
    if (bd.left != null && bd.top != null && bd.right != null && bd.bottom != null) {
      var l = Number(bd.left),
        t = Number(bd.top),
        r = Number(bd.right),
        b = Number(bd.bottom);
      return {
        left: l,
        top: t,
        right: r,
        bottom: b,
        cx: Math.floor((l + r) / 2),
        cy: Math.floor((t + b) / 2),
      };
    }
  } catch (eB) {}
  return null;
}

/** OCR 文本是否为脚本悬浮窗/日志噪声（勿与主页「粉丝」统计混淆） */
function isOcrFloatOrScriptNoise(txt) {
  if (!txt) return true;
  return /近期|昨日|今日|增长|六道|比例|运行平台|点赞\s*\d|收藏\s*\d|评论\s*\d|分享\s*\d|已运行|授权|日志|您的昵称|对标|重启|流程@|允许权限|总体比例/i.test(
    String(txt)
  );
}

/** 是否在左侧悬浮窗大致区域（默认 x≈10,y≈70,w≈155） */
function isOcrItemInFloatPanelZone(item, w, h) {
  if (!item) return false;
  var panelR = Math.max(200, Math.floor(w * 0.24));
  var panelB = Math.max(380, Math.floor(h * 0.42));
  return item.left < panelR && item.top < panelB;
}

/** 是否为主页顶部「获赞/关注/粉丝」统计条内的「粉丝」标签 */
function isOcrStatsBarFansLabel(item, w, h) {
  if (!item) return false;
  if (item.text !== "粉丝") return false;
  if (isOcrItemInFloatPanelZone(item, w, h)) return false;
  return (
    item.cx >= Math.floor(w * 0.38) &&
    item.cy >= Math.floor(h * 0.08) &&
    item.cy <= Math.floor(h * 0.38)
  );
}

/** 是否为主页顶部统计条内的「关注」Tab（非右侧 +关注 按钮） */
function isOcrStatsBarFollowLabel(item, w, h) {
  if (!item) return false;
  if (String(item.text || "").trim() !== "关注") return false;
  if (isOcrItemInFloatPanelZone(item, w, h)) return false;
  if (item.cx >= Math.floor(w * 0.68)) return false;
  return (
    item.cx >= Math.floor(w * 0.28) &&
    item.cx <= Math.floor(w * 0.62) &&
    item.cy >= Math.floor(h * 0.08) &&
    item.cy <= Math.floor(h * 0.48)
  );
}

/**
 * 录屏投射 + Paddle OCR：在顶部统计条识别「粉丝」旁数字（横排/竖排/粘连文案均可）。
 * @returns {number|null}
 */
function readProfileFansCountByOcr(maxBudgetMs) {
  if (!isProfileFansPaddleOcrAvailable()) return null;
  var budget = typeof maxBudgetMs === "number" && maxBudgetMs > 0 ? maxBudgetMs : 2800;
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(Math.min(budget, 2600))) return null;
    img = captureScreenOnceForWorkGridProbe(Math.min(budget, 2200));
    if (!img) return null;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.04);
    var cropH = Math.max(80, Math.floor(h * 0.36) - cropTop);
    var cropLeft = Math.floor(w * 0.18);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft, cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return null;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return null;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      var t0 = items[ji].text;
      if (isOcrFloatOrScriptNoise(t0)) continue;
      var m0 = t0.match(/^(\d+(?:\.\d+)?(?:万|亿)?)粉丝$/);
      if (m0) {
        var v0 = fansToInt(
          String(m0[1] || "")
            .replace(/[^\d\.万亿wW]/g, "")
            .replace(/[wW]/g, "万")
        );
        if (v0 != null) return v0;
      }
    }
    var colFans = null;
    var colZan = null;
    var colGuan = null;
    for (ji = 0; ji < items.length; ji++) {
      var tl = items[ji].text;
      if (tl === "粉丝" && isOcrStatsBarFansLabel(items[ji], w, h)) {
        if (!colFans || items[ji].cx > colFans.cx) colFans = items[ji];
      } else if (tl === "获赞" && items[ji].cx < Math.floor(w * 0.55)) colZan = items[ji];
      else if (tl === "关注" && items[ji].cx > Math.floor(w * 0.28) && items[ji].cx < Math.floor(w * 0.72)) {
        colGuan = items[ji];
      }
    }
    if (colFans) {
      var fansCx = colFans.cx;
      var fansCy = colFans.cy;
      var frL = colFans.left;
      var frR = colFans.right;
      var bestNum = null;
      var bestScore = 1e9;
      var ni;
      for (ni = 0; ni < items.length; ni++) {
        var nt = items[ni].text;
        if (!nt || nt.indexOf("粉丝") >= 0 || nt === "获赞" || nt === "关注") continue;
        if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
        var nv = fansToInt(nt.replace(/[^\d\.万亿wW]/g, "").replace(/[wW]/g, "万"));
        if (nv == null) continue;
        var nr = items[ni];
        var isLeft = nr.right <= frR + 8 && nr.cx < fansCx && Math.abs(nr.cy - fansCy) <= rowTol;
        var isAbove =
          nr.cy < fansCy - 4 &&
          nr.bottom <= fansCy + 6 &&
          nr.right > frL - Math.floor(w * 0.14) &&
          nr.left < frR + Math.floor(w * 0.1);
        if (!isLeft && !isAbove) continue;
        if (colGuan && Math.abs(nr.cx - colGuan.cx) < Math.abs(nr.cx - fansCx) && nr.cx < fansCx - 20) continue;
        if (colZan && nr.cx < colZan.cx + Math.floor(w * 0.08) && nr.cx < fansCx - 40) continue;
        var dist = isAbove
          ? Math.abs(nr.cy - fansCy) * 1.2 + Math.abs(nr.cx - fansCx) * 0.25
          : Math.abs(nr.cx - fansCx) + Math.abs(nr.cy - fansCy) * 0.35;
        if (dist < bestScore) {
          bestScore = dist;
          bestNum = nv;
        }
      }
      if (bestNum != null) return bestNum;
    }
    var bestFans = null;
    var fi;
    for (fi = 0; fi < items.length; fi++) {
      if (!isOcrStatsBarFansLabel(items[fi], w, h)) continue;
      var fansCx2 = items[fi].cx;
      var fansCy2 = items[fi].cy;
      var frL2 = items[fi].left;
      var frR2 = items[fi].right;
      var bestNum2 = null;
      var bestScore2 = 1e9;
      for (ni = 0; ni < items.length; ni++) {
        if (ni === fi) continue;
        var nt2 = items[ni].text;
        if (!nt2 || nt2.indexOf("粉丝") >= 0) continue;
        if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt2)) continue;
        var nv2 = fansToInt(nt2.replace(/[^\d\.万亿wW]/g, "").replace(/[wW]/g, "万"));
        if (nv2 == null) continue;
        var nr2 = items[ni];
        var isLeft2 = nr2.right <= frR2 + 8 && nr2.cx < fansCx2 && Math.abs(nr2.cy - fansCy2) <= rowTol;
        var isAbove2 =
          nr2.cy < fansCy2 - 4 && nr2.right > frL2 - Math.floor(w * 0.14) && nr2.left < frR2 + Math.floor(w * 0.1);
        if (!isLeft2 && !isAbove2) continue;
        var dist2 = isAbove2
          ? Math.abs(nr2.cy - fansCy2) * 1.2 + Math.abs(nr2.cx - fansCx2) * 0.25
          : Math.abs(nr2.cx - fansCx2) + Math.abs(nr2.cy - fansCy2) * 0.35;
        if (dist2 < bestScore2) {
          bestScore2 = dist2;
          bestNum2 = nv2;
        }
      }
      if (bestNum2 != null && (bestFans == null || bestScore2 < bestFans.score)) {
        bestFans = { val: bestNum2, score: bestScore2 };
      }
    }
    if (bestFans) return bestFans.val;
    return null;
  } catch (eOcr) {
    return null;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

/** 无 id：统计条可点 LinearLayout 内含「粉丝」 */
function clickFansTabFromStatsLayoutA11y() {
  var w = device.width;
  var h = device.height;
  var xMin = Math.floor(w * 0.26);
  var yMin = Math.floor(h * 0.05);
  var xMax = w - 1;
  var yMax = Math.floor(h * 0.45);
  try {
    var layouts = className("android.widget.LinearLayout")
      .clickable(true)
      .boundsInside(xMin, yMin, xMax, yMax)
      .find();
    if (layouts && layouts.size && layouts.size() > 0) {
      var li, bestLay = null;
      var bestCx = -1;
      for (li = 0; li < layouts.size(); li++) {
        var lay = layouts.get(li);
        if (!lay) continue;
        var hasFans = false;
        var cc = 0;
        try {
          cc = lay.childCount();
        } catch (eCc) {
          cc = 0;
        }
        var ci;
        for (ci = 0; ci < cc; ci++) {
          var ch = null;
          try {
            ch = lay.child(ci);
          } catch (eCh) {
            ch = null;
          }
          if (!ch) continue;
          var tb = "";
          try {
            tb = String((ch.text && ch.text()) || (ch.desc && ch.desc()) || "").trim();
          } catch (eTb) {
            tb = "";
          }
          if (tb === "粉丝") hasFans = true;
        }
        if (!hasFans) continue;
        try {
          var bb = lay.bounds();
          if (bb && bb.centerX() > bestCx) {
            bestCx = bb.centerX();
            bestLay = lay;
          }
        } catch (eB) {}
      }
      if (bestLay) {
        if (clickNode(bestLay)) return true;
        try {
          var b2 = bestLay.bounds();
          click(b2.centerX(), b2.centerY());
          return true;
        } catch (eC) {}
      }
    }
  } catch (eLay) {}
  try {
    var lblColl = text("粉丝").boundsInside(xMin, yMin, xMax, yMax).find();
    if (lblColl && lblColl.size && lblColl.size() > 0) {
      var fi = lblColl.size() - 1;
      for (; fi >= 0; fi--) {
        var lbl = lblColl.get(fi);
        if (!lbl) continue;
        var p = null;
        try {
          p = lbl.parent();
        } catch (eP) {
          p = null;
        }
        if (p) {
          if (clickNode(p)) return true;
          try {
            var bp = p.bounds();
            click(bp.centerX(), bp.centerY());
            return true;
          } catch (ePc) {}
        }
        try {
          var lb = lbl.bounds();
          click(lb.centerX(), lb.centerY());
          return true;
        } catch (eLb) {}
      }
    }
  } catch (eLbl) {}
  return false;
}

/** 节点树是否含指定文案（华为等嵌套布局） */
function nodeTreeHasExactText(n, label, maxDepth, depth) {
  if (!n || depth > maxDepth) return false;
  try {
    var tb = "";
    try {
      tb = String((n.text && n.text()) || (n.desc && n.desc()) || "").trim();
    } catch (eT) {
      tb = "";
    }
    if (tb === label) return true;
    var cc = 0;
    try {
      cc = n.childCount && n.childCount();
    } catch (eCc) {
      cc = 0;
    }
    for (var i = 0; i < cc; i++) {
      var ch = null;
      try {
        ch = n.child(i);
      } catch (eCh) {
        ch = null;
      }
      if (ch && nodeTreeHasExactText(ch, label, maxDepth, depth + 1)) return true;
    }
  } catch (e0) {}
  return false;
}

/** 无 id：统计条可点容器内含「关注」（中间列，非右侧关注按钮） */
function clickFollowTabFromStatsLayoutA11y() {
  var w = device.width;
  var h = device.height;
  var xMin = Math.floor(w * 0.22);
  var yMin = Math.floor(h * 0.05);
  var xMax = Math.floor(w * 0.68);
  var yMax = Math.floor(h * 0.48);
  var midCx = Math.floor(w * 0.43);
  try {
    var zan = text("获赞").boundsInside(0, yMin, Math.floor(w * 0.5), yMax).findOne(220);
    var fans = text("粉丝").boundsInside(Math.floor(w * 0.45), yMin, w, yMax).findOne(220);
    if (zan && fans) {
      midCx = Math.floor((zan.bounds().centerX() + fans.bounds().centerX()) / 2);
    }
  } catch (eMid) {}
  function tryPickFollowContainer(classNamePat, requireClickable) {
    try {
      var q = className(classNamePat).boundsInside(xMin, yMin, xMax, yMax);
      if (requireClickable) q = q.clickable(true);
      var layouts = q.find();
      if (!layouts || !layouts.size || layouts.size() <= 0) return false;
      var li;
      var bestLay = null;
      var bestScore = 1e9;
      for (li = 0; li < layouts.size(); li++) {
        var lay = layouts.get(li);
        if (!lay || !nodeTreeHasExactText(lay, "关注", 12, 0)) continue;
        try {
          var bb = lay.bounds();
          var cx = bb.centerX();
          var bh = bb.bottom - bb.top;
          if (cx >= Math.floor(w * 0.68)) continue;
          if (bh > 80) continue;
          var score = Math.abs(cx - midCx) + bh * 0.35;
          if (score < bestScore) {
            bestScore = score;
            bestLay = lay;
          }
        } catch (eB) {}
      }
      if (bestLay) {
        if (clickNode(bestLay)) return true;
        try {
          var ptLay = pressPointForProfileStatsFollowTab(null);
          click(ptLay.x, ptLay.y);
          return true;
        } catch (eC) {}
      }
      return false;
    } catch (eLay) {
      return false;
    }
  }
  if (tryPickFollowContainer("android.widget.LinearLayout", true)) return true;
  if (tryPickFollowContainer("android.widget.RelativeLayout", true)) return true;
  if (tryPickFollowContainer("android.widget.LinearLayout", false)) return true;
  if (tryPickFollowContainer("android.widget.RelativeLayout", false)) return true;
  try {
    var lblColl = text("关注").boundsInside(xMin, yMin, xMax, yMax).find();
    if (lblColl && lblColl.size && lblColl.size() > 0) {
      var fi;
      var bestLbl = null;
      var bestLblScore = 1e9;
      for (fi = 0; fi < lblColl.size(); fi++) {
        var lbl = lblColl.get(fi);
        if (!lbl) continue;
        if (!isProfileStatsBarFollowLabelAligned(lbl)) continue;
        try {
          var lb0 = lbl.bounds();
          var sc0 = Math.abs(lb0.centerX() - midCx);
          if (sc0 < bestLblScore) {
            bestLblScore = sc0;
            bestLbl = lbl;
          }
        } catch (eLb0) {}
      }
      if (bestLbl) {
        var p = null;
        try {
          p = bestLbl.parent();
        } catch (eP) {
          p = null;
        }
        if (p && p.clickable && p.clickable()) {
          try {
            var bp = p.bounds();
            if (bp.bottom - bp.top <= 80 && clickNode(p)) return true;
          } catch (ePc0) {}
        }
        try {
          var ptLbl = pressPointForProfileStatsFollowTab(bestLbl);
          click(ptLbl.x, ptLbl.y);
          return true;
        } catch (eLb) {}
      }
    }
  } catch (eLbl) {}
  return false;
}

/**
 * OCR 点击他人/我页顶部统计条「粉丝」（无 id、无障碍点不到时）。
 * @returns {boolean} 是否已发出点击
 */
function clickProfileFansTabByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.04);
    var cropH = Math.max(80, Math.floor(h * 0.36) - cropTop);
    var cropLeft = Math.floor(w * 0.18);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft, cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return false;
    var colFans = null;
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      var t0 = items[ji].text;
      var m0 = t0.match(/^(\d+(?:\.\d+)?(?:万|亿)?)粉丝$/);
      if (m0) {
        colFans = items[ji];
        break;
      }
      if (isOcrStatsBarFansLabel(items[ji], w, h)) {
        if (!colFans || items[ji].cx > colFans.cx) colFans = items[ji];
      }
    }
    if (!colFans) return false;
    var tapX = colFans.cx;
    var tapY = colFans.cy;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var frL = colFans.left;
    var frR = colFans.right;
    var fansCx = colFans.cx;
    var fansCy = colFans.cy;
    var numLeft = null;
    var numRight = null;
    var ni;
    for (ni = 0; ni < items.length; ni++) {
      var nt = items[ni].text;
      if (!nt || nt.indexOf("粉丝") >= 0) continue;
      if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
      var nr = items[ni];
      var isLeft = nr.right <= frR + 10 && nr.cx < fansCx && Math.abs(nr.cy - fansCy) <= rowTol;
      var isAbove = nr.cy < fansCy - 4 && nr.right > frL - Math.floor(w * 0.14) && nr.left < frR + Math.floor(w * 0.1);
      if (!isLeft && !isAbove) continue;
      if (numLeft == null || nr.left < numLeft) numLeft = nr.left;
      if (numRight == null || nr.right > numRight) numRight = nr.right;
    }
    if (numLeft != null && numRight != null) {
      tapX = Math.floor((numLeft + frR) / 2);
      tapY = fansCy;
    }
    tapX = Math.max(8, Math.min(w - 8, tapX));
    tapY = Math.max(8, Math.min(h - 8, tapY));
    try {
      click(tapX, tapY);
    } catch (eC0) {
      try {
        press(tapX, tapY, 90);
      } catch (eC1) {
        return false;
      }
    }
    appendLog("O点用户粉丝");
    return true;
  } catch (eTap) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

/**
 * OCR 点击他人主页顶部统计条「关注」Tab（无 id、TextView 不可点时）。
 * @returns {boolean} 是否已发出点击
 */
function clickProfileFollowTabByOcr() {
  if (!isProfileFansPaddleOcrAvailable()) return false;
  var img = null;
  var cropped = null;
  try {
    if (!ensureScreenCaptureReady(2200)) return false;
    img = captureScreenOnceForWorkGridProbe(1800);
    if (!img) return false;
    var w = device.width;
    var h = device.height;
    var cropTop = Math.floor(h * 0.04);
    var cropH = Math.max(80, Math.floor(h * 0.36) - cropTop);
    var cropLeft = Math.floor(w * 0.18);
    var ocrImg = img;
    var xOff = 0;
    var yOff = 0;
    try {
      if (typeof images !== "undefined" && images.clip) {
        cropped = images.clip(img, cropLeft, cropTop, w - cropLeft, cropH);
        if (cropped) {
          ocrImg = cropped;
          xOff = cropLeft;
          yOff = cropTop;
        }
      }
    } catch (eClip) {}
    var rs = runProfileFansPaddleOcrSafe(ocrImg);
    if (!rs || !rs.length) return false;
    var items = [];
    var ri;
    for (ri = 0; ri < rs.length; ri++) {
      var it = parseOcrTextAndBounds(rs[ri]);
      if (!it || !it.text) continue;
      var r0 = ocrBoundsToRect(it.bounds);
      if (!r0) continue;
      var txt = String(it.text).replace(/\s+/g, "");
      if (!txt || isOcrFloatOrScriptNoise(txt)) continue;
      if (/已关注|互相关注|\+关注/.test(txt)) continue;
      var item = {
        text: txt,
        cx: r0.cx + xOff,
        cy: r0.cy + yOff,
        left: r0.left + xOff,
        right: r0.right + xOff,
        top: r0.top + yOff,
        bottom: r0.bottom + yOff,
      };
      if (isOcrItemInFloatPanelZone(item, w, h)) continue;
      items.push(item);
    }
    if (!items.length) return false;
    var rowTol = Math.max(14, Math.floor(h * 0.02));
    var ji;
    for (ji = 0; ji < items.length; ji++) {
      var tGlue = items[ji].text;
      var mGlue = tGlue.match(/^(\d+(?:\.\d+)?(?:万|亿)?)关注$/);
      if (!mGlue) continue;
      if (items[ji].cx >= Math.floor(w * 0.68)) continue;
      if (items[ji].cy < Math.floor(h * 0.08) || items[ji].cy > Math.floor(h * 0.48)) continue;
      var tapXg = items[ji].cx;
      var tapYg = items[ji].cy;
      tapXg = Math.max(8, Math.min(w - 8, tapXg));
      tapYg = Math.max(8, Math.min(h - 8, tapYg));
      try {
        click(tapXg, tapYg);
      } catch (eCg0) {
        try {
          press(tapXg, tapYg, 90);
        } catch (eCg1) {
          return false;
        }
      }
      appendLog("O点用户关注");
      return true;
    }
    var colFollow = null;
    var colZan = null;
    var colFans = null;
    var midCx = Math.floor(w * 0.43);
    for (ji = 0; ji < items.length; ji++) {
      var tl = items[ji].text;
      if (tl === "获赞" && items[ji].cx < Math.floor(w * 0.45)) colZan = items[ji];
      else if (isOcrStatsBarFansLabel(items[ji], w, h)) {
        if (!colFans || items[ji].cx > colFans.cx) colFans = items[ji];
      } else if (isOcrStatsBarFollowLabel(items[ji], w, h)) {
        if (!colFollow) colFollow = items[ji];
        else {
          var scOld = Math.abs(colFollow.cx - midCx);
          var scNew = Math.abs(items[ji].cx - midCx);
          if (colZan && colFans) {
            midCx = Math.floor((colZan.cx + colFans.cx) / 2);
            scOld = Math.abs(colFollow.cx - midCx);
            scNew = Math.abs(items[ji].cx - midCx);
          }
          if (scNew < scOld) colFollow = items[ji];
        }
      }
    }
    if (colZan && colFans) midCx = Math.floor((colZan.cx + colFans.cx) / 2);
    if (colFollow && colZan && colFans) {
      if (colFollow.cx <= colZan.cx + 8 || colFollow.cx >= colFans.cx - 8) colFollow = null;
    }
    if (!colFollow) return false;
    var tapX = colFollow.cx;
    var tapY = colFollow.cy;
    var frL = colFollow.left;
    var frR = colFollow.right;
    var followCx = colFollow.cx;
    var followCy = colFollow.cy;
    var numTop = null;
    var numBot = null;
    var ni;
    for (ni = 0; ni < items.length; ni++) {
      var nt = items[ni].text;
      if (!nt || nt === "关注" || nt === "获赞" || nt === "粉丝") continue;
      if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
      var nr = items[ni];
      if (Math.abs(nr.cy - followCy) <= rowTol) continue;
      var nearX = Math.abs(nr.cx - followCx) <= Math.floor(w * 0.06);
      if (!nearX) continue;
      var isAbove = nr.cy < followCy - 4 && nr.bottom <= followCy + 8;
      var isBelow = nr.cy > followCy + 4 && nr.top >= followCy - 8;
      if (isAbove) {
        if (numTop == null || nr.cy < numTop) numTop = nr.cy;
      }
      if (isBelow) {
        if (numBot == null || nr.cy > numBot) numBot = nr.cy;
      }
    }
    if (numTop != null) {
      tapY = Math.floor((numTop + followCy) / 2);
    } else {
      var numLeft = null;
      var numRight = null;
      for (ni = 0; ni < items.length; ni++) {
        nt = items[ni].text;
        if (!nt || nt === "关注" || nt === "获赞" || nt === "粉丝") continue;
        if (!/^\d+(?:\.\d+)?(?:万|亿)?$/.test(nt)) continue;
        nr = items[ni];
        var isLeft = nr.right <= frR + 10 && nr.cx < followCx && Math.abs(nr.cy - followCy) <= rowTol;
        if (!isLeft) continue;
        if (numLeft == null || nr.left < numLeft) numLeft = nr.left;
        if (numRight == null || nr.right > numRight) numRight = nr.right;
      }
      if (numLeft != null && numRight != null) {
        tapX = Math.floor((numLeft + frR) / 2);
      }
    }
    tapX = Math.max(8, Math.min(w - 8, tapX));
    tapY = Math.max(8, Math.min(h - 8, tapY));
    try {
      click(tapX, tapY);
    } catch (eC0) {
      try {
        press(tapX, tapY, 90);
      } catch (eC1) {
        return false;
      }
    }
    appendLog("O点用户关注");
    return true;
  } catch (eTap) {
    return false;
  } finally {
    try {
      if (cropped && cropped.recycle) cropped.recycle();
    } catch (eR0) {}
    try {
      if (img && img.recycle) img.recycle();
    } catch (eR1) {}
  }
}

function clickSearchResultByOcrTarget(targetId, timeoutMs) {
  var t0 = Date.now();
  var waitMs = typeof timeoutMs === "number" && timeoutMs > 0 ? timeoutMs : 2500;
  // OCR 兜底在部分机型会出现长时间阻塞，默认关闭以避免“页面停住无动作”。
  // 如需启用可改为 true（建议后续再做限时线程版）。
  var SEARCH_FOLLOW_OCR_FALLBACK_ENABLED = false;
  var targetNorm = normalizeOcrCompareText(targetId);
  if (!targetNorm) return false;
  function isLikelySearchResultNode(n) {
    if (!n) return false;
    try {
      var cls = String((n.className && n.className()) || "");
      if (/EditText/i.test(cls)) return false;
    } catch (eC) {}
    try {
      var b = n.bounds && n.bounds();
      if (b) {
        var y = Math.floor((b.top + b.bottom) / 2);
        // 过滤顶部搜索栏区域，避免点到输入框里的文本命中
        if (y < Math.floor(device.height * 0.18)) return false;
      }
    } catch (eB) {}
    return true;
  }
  function confirmProfileEnteredAfterTap() {
    try { return waitForFanProfileEntered(2600); } catch (eW) { return false; }
  }
  function tryTapAvatarResultNode() {
    // 新规则：不识别头像，仅识别「关注/已关注/互相关注」并点击其左侧（用户信息区）
    var w = device.width, h = device.height;
    var followTexts = /^(关注|已关注|互相关注)$/;
    var yMin = Math.floor(h * 0.18);
    // 某些机型搜索结果首行会更靠下（例如 1080 高屏时关注按钮可能落在 y>0.56h），放宽上界避免误过滤
    var yMax = Math.floor(h * 0.74);
    function collToArrSafe(coll) {
      var arr = [];
      try {
        if (!coll) return arr;
        if (typeof coll.size === "function" && typeof coll.get === "function") {
          for (var i = 0; i < coll.size(); i++) {
            try { arr.push(coll.get(i)); } catch (eG) {}
          }
          return arr;
        }
      } catch (e0) {}
      try {
        if (coll && coll.length != null) {
          for (var j = 0; j < coll.length; j++) arr.push(coll[j]);
        }
      } catch (e1) {}
      return arr;
    }
    function collectFollowCandidates() {
      var out = [];
      var pushFrom = function (coll) {
        var arr = collToArrSafe(coll);
        for (var i = 0; i < arr.length; i++) out.push(arr[i]);
      };
      // 最高优先：你提供的控件特征（ViewGroup + desc=关注按钮）
      try {
        pushFrom(
          descContains("关注按钮")
            .className("android.view.ViewGroup")
            .boundsInside(0, yMin, w, yMax)
            .find()
        );
      } catch (e0a) {}
      try { pushFrom(textMatches(followTexts).boundsInside(0, yMin, w, yMax).find()); } catch (e2) {}
      try { pushFrom(textContains("关注").boundsInside(0, yMin, w, yMax).find()); } catch (e3) {}
      try { pushFrom(descMatches(followTexts).boundsInside(0, yMin, w, yMax).find()); } catch (e4) {}
      try { pushFrom(descContains("关注按钮").boundsInside(0, yMin, w, yMax).find()); } catch (e4b) {}
      // APK 下常见 text/desc 为空：补抓右侧可点击按钮类节点（按位置/尺寸后续过滤）
      try {
        pushFrom(
          className("android.widget.TextView")
            .clickable(true)
            .boundsInside(Math.floor(w * 0.56), yMin, w, yMax)
            .find()
        );
      } catch (e5) {}
      try {
        pushFrom(
          className("android.widget.Button")
            .clickable(true)
            .boundsInside(Math.floor(w * 0.56), yMin, w, yMax)
            .find()
        );
      } catch (e6) {}
      try {
        pushFrom(
          className("android.view.View")
            .clickable(true)
            .boundsInside(Math.floor(w * 0.56), yMin, w, yMax)
            .find()
        );
      } catch (e7) {}
      return out;
    }
    function filterAndSortCandidates(nodes) {
      var arr = [];
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        try {
          var b = n.bounds();
          var cx = Math.floor((b.left + b.right) / 2);
          var cy = Math.floor((b.top + b.bottom) / 2);
          if (cy < yMin || cy > yMax) continue;
          // 关注按钮一般在右半屏
          if (cx < Math.floor(w * 0.50)) continue;
          // 过滤过小控件
          if ((b.right - b.left) < 60 || (b.bottom - b.top) < 26) continue;
          // 过滤过大控件（避免把整块容器当“关注按钮”）
          if ((b.right - b.left) > Math.floor(w * 0.36) || (b.bottom - b.top) > Math.floor(h * 0.14)) continue;
          var pri = 9;
          try {
            var d0 = String((n.desc && n.desc()) || "");
            var c0 = String((n.className && n.className()) || "");
            if (d0.indexOf("关注按钮") >= 0 && c0.indexOf("ViewGroup") >= 0) pri = 0;
            else if (d0.indexOf("关注按钮") >= 0) pri = 1;
            else if (/^android\.widget\.Button$/i.test(c0)) pri = 2;
          } catch (eP0) {}
          try {
            if (typeof n.visibleToUser === "function" && !n.visibleToUser()) continue;
          } catch (eV) {}
          arr.push({ n: n, b: b, cx: cx, cy: cy, pri: pri });
        } catch (eB) {}
      }
      // 优先级：明确“关注按钮”控件 > 顶部行 > 更靠右
      arr.sort(function (a, b) {
        if (a.pri !== b.pri) return a.pri - b.pri;
        if (Math.abs(a.cy - b.cy) > 16) return a.cy - b.cy;
        return b.cx - a.cx;
      });
      return arr;
    }
    var cands = filterAndSortCandidates(collectFollowCandidates());
    if (!cands.length) return false;
    // 同行式“一次点击”：只取最优候选关注按钮，按 left-100 点击一次
    var bestCand = cands[0];
    var fb = bestCand.b;
    var y = Math.floor((fb.top + fb.bottom) / 2);
    var x = Math.floor(fb.left - 100);
    x = Math.max(8, Math.min(w - 8, x));
    y = Math.max(8, Math.min(h - 8, y));
    try { click(x, y); } catch (eC0) { return false; }
    if (confirmProfileEnteredAfterTap()) {
      appendLog("选择用户");
      sleepCtrl(220);
      return true;
    }
    return false;
  }
  function tryTapByOcrFollow() {
    var w = device.width, h = device.height;
    var yMin = Math.floor(h * 0.18);
    // OCR 兜底与控件识别保持一致的纵向范围
    var yMax = Math.floor(h * 0.74);
    var img = null;
    try {
      try {
        img = captureScreen();
      } catch (e0) {
        img = images.captureScreen();
      }
      if (!img || typeof paddle === "undefined" || !paddle.ocr) return false;
      var rs = paddle.ocr(img) || [];
      var best = null;
      function toRect(bd) {
        if (!bd) return null;
        try {
          if (Array.isArray(bd) && bd.length >= 2) {
            // points: [[x,y], ...]
            var minX = 1e9, minY = 1e9, maxX = -1, maxY = -1;
            for (var i = 0; i < bd.length; i++) {
              var p = bd[i];
              if (!p || p.length < 2) continue;
              var x = Number(p[0]), y = Number(p[1]);
              if (isNaN(x) || isNaN(y)) continue;
              if (x < minX) minX = x;
              if (y < minY) minY = y;
              if (x > maxX) maxX = x;
              if (y > maxY) maxY = y;
            }
            if (maxX >= minX && maxY >= minY) return { left: minX, top: minY, right: maxX, bottom: maxY };
          }
        } catch (eA) {}
        try {
          if (bd.left != null && bd.top != null && bd.right != null && bd.bottom != null) {
            return {
              left: Number(bd.left),
              top: Number(bd.top),
              right: Number(bd.right),
              bottom: Number(bd.bottom),
            };
          }
        } catch (eB) {}
        return null;
      }
      for (var i = 0; i < rs.length; i++) {
        var it = parseOcrTextAndBounds(rs[i]);
        if (!it || !it.text) continue;
        var t = String(it.text).replace(/\s+/g, "");
        if (!(/^(关注|已关注|互相关注)$/.test(t) || /关注/.test(t))) continue;
        var r = toRect(it.bounds);
        if (!r) continue;
        var cy = Math.floor((r.top + r.bottom) / 2);
        if (cy < yMin || cy > yMax) continue;
        // 关注按钮通常在右侧
        if (Math.floor((r.left + r.right) / 2) < Math.floor(w * 0.50)) continue;
        if (!best || r.top < best.top) best = r;
      }
      if (!best) return false;
      var xTap = Math.floor(best.left - 100);
      var yTap = Math.floor((best.top + best.bottom) / 2);
      xTap = Math.max(8, Math.min(w - 8, xTap));
      yTap = Math.max(8, Math.min(h - 8, yTap));
      try { click(xTap, yTap); } catch (eC0) { return false; }
      if (confirmProfileEnteredAfterTap()) {
        appendLog("选择对标");
        sleepCtrl(280);
        return true;
      }
      sleepCtrl(140);
      try { press(xTap, yTap, 110); } catch (eC1) {}
      if (confirmProfileEnteredAfterTap()) {
        appendLog("选择对标");
        sleepCtrl(280);
        return true;
      }
      return false;
    } catch (eX) {
      return false;
    } finally {
      try { if (img && img.recycle) img.recycle(); } catch (eR) {}
    }
  }
  while (Date.now() - t0 < waitMs && !__scriptUserStop) {
    // 仅保留“关注元素”命中；未命中则视为无抖音号结果
    var inSearchResultScene = false;
    try {
      if (text("综合").findOne(80) && text("用户").findOne(80)) inSearchResultScene = true;
    } catch (eS0) {}
    if (!inSearchResultScene) {
      try {
        if (desc("综合").findOne(80) && desc("用户").findOne(80)) inSearchResultScene = true;
      } catch (eS1) {}
    }
    if (inSearchResultScene && tryTapAvatarResultNode()) return true;
    if (SEARCH_FOLLOW_OCR_FALLBACK_ENABLED && inSearchResultScene && tryTapByOcrFollow()) return true;
    sleepCtrl(140);
  }
  return false;
}

function clickDouyinIdResult(prefetchedNode) {
  appendLog("点抖音号…");
  sleep(2000);
  try {
    var node = prefetchedNode || findDouyinIdResultNode(3000);
    if (node && clickNode(node)) {
      appendLog("已点抖音号");
      sleep(1500);
      return true;
    }
  } catch (e) {}
  appendLog("点抖音号失败");
  return false;
}

/** 对标用户主页：点「粉丝」进入列表（控件多为不可点 TextView，用 clickNode 抬父级或按压中心） */
function waitForFollowerListEnterOrTimeout(timeoutMs) {
  var ms = timeoutMs == null ? 3000 : timeoutMs;
  var endAt = Date.now() + ms;
  var tick = 0;
  function isPrivacyBlockedByText() {
    try {
      var t = null;
      try {
        t = textMatches(/.*隐私.*粉丝.*(不可见|无法查看|不可查看).*/).findOne(80);
      } catch (e0) {}
      if (!t) {
        try {
          t = textContains("隐私").findOne(60);
        } catch (e1) {}
      }
      if (t) {
        var s = "";
        try {
          s = (t.text && t.text()) || (t.desc && t.desc()) || "";
        } catch (e2) {}
        s = String(s || "");
        if (
          /隐私/.test(s) &&
          /(粉丝|列表|不可见|无法查看|不可查看)/.test(s)
        ) {
          return true;
        }
      }
    } catch (e3) {}
    try {
      if (textContains("粉丝列表不可见").findOne(60)) return true;
    } catch (e4) {}
    try {
      if (textContains("由于该用户隐私设置").findOne(60)) return true;
    } catch (e5) {}
    return false;
  }
  function stillOnUserProfilePage() {
    try {
      var n1 = findFanProfileDouyinIdTextNode(60);
      if (n1) {
        try {
          if (typeof n1.visibleToUser === "function" && !n1.visibleToUser()) {
            n1 = null;
          }
        } catch (e6v) {}
      }
      if (n1) {
        try {
          var b1 = n1.bounds();
          var cy1 = Math.floor((b1.top + b1.bottom) / 2);
          if (cy1 >= Math.floor(device.height * 0.10) && cy1 <= Math.floor(device.height * 0.46)) return true;
        } catch (e6b) {}
      }
    } catch (e6) {}
    try {
      var n2 = textMatches(/^抖音号[:：].+/).findOne(60);
      if (n2) {
        try {
          if (typeof n2.visibleToUser === "function" && !n2.visibleToUser()) {
            n2 = null;
          }
        } catch (e7v) {}
      }
      if (n2) {
        try {
          var b2 = n2.bounds();
          var cy2 = Math.floor((b2.top + b2.bottom) / 2);
          if (cy2 >= Math.floor(device.height * 0.10) && cy2 <= Math.floor(device.height * 0.50)) return true;
        } catch (e7b) {}
      }
    } catch (e7) {}
    return false;
  }
  function looksLikeFollowerListHeaderPage() {
    try {
      var hasFollowTab = !!textMatches(/^关注\s*\d*$/).findOne(80) || !!text("关注").findOne(80);
      var hasFansTab = !!textMatches(/^粉丝\s*\d*$/).findOne(80) || !!text("粉丝").findOne(80);
      if (hasFollowTab && hasFansTab) return true;
    } catch (e8) {}
    try {
      var topNum = textMatches(/^\d[\d,]*$/).boundsInside(0, Math.floor(device.height * 0.08), device.width, Math.floor(device.height * 0.26)).findOne(80);
      var fansTab = text("粉丝").boundsInside(0, Math.floor(device.height * 0.08), device.width, Math.floor(device.height * 0.26)).findOne(80);
      if (topNum && fansTab) return true;
    } catch (e9) {}
    try {
      var followBtn = textMatches(/^关注$/).boundsInside(Math.floor(device.width * 0.72), Math.floor(device.height * 0.18), device.width, device.height).find();
      if (followBtn && followBtn.size && followBtn.size() >= 3) return true;
    } catch (e10) {}
    return false;
  }
  while (Date.now() < endAt) {
    if (__scriptUserStop) return false;
    try {
      if (isPrivacyBlockedByText()) {
        appendLog("粉丝列表不可见，返回一次");
        try {
          back();
        } catch (ep2) {}
        sleepCtrl(420);
        // 视为「点粉丝后未跳到目标列表页」：仅返回一次，交给删号重搜的静默分支处理
        __fansTapNoNavigationReselect = true;
        return true;
      }
    } catch (ep) {}
    try {
      var rows = collectFollowerListRowsDeduped();
      if (rows && rows.length > 0) {
        return true;
      }
    } catch (e0) {}
    try {
      // 即使无有效行，只要命中“粉丝列表空页”也算已进入粉丝列表
      if (isFollowerListEffectivelyEmpty() && !stillOnUserProfilePage()) {
        return true;
      }
    } catch (e1) {}
    try {
      if (looksLikeFollowerListHeaderPage() && !stillOnUserProfilePage()) {
        return true;
      }
    } catch (e1b) {}
    try {
      pollDismissScreenCaptureDialogA11yOnly(220);
    } catch (e2) {}
    tick++;
    sleepCtrl(320);
  }
  try {
    back();
  } catch (eBk) {}
  sleepCtrl(420);
  __fansTapNoNavigationReselect = true;
  return true;
}

function clickFansOnTargetProfile() {
  appendLog("点“粉丝”…");
  var FAST_FIND_MS = 420;
  var ENTER_WAIT_MS = 5000;
  function waitFollowerListAfterTap() {
    try {
      for (var sec = Math.ceil(ENTER_WAIT_MS / 1000); sec >= 1; sec--) {
        appendLog(sec + "秒后开始");
        if (sec > 1) sleepCtrl(1000);
      }
    } catch (eLg) {}
    // 倒计时完成后再做短等待判定，避免重复再等一整轮。
    return waitForFollowerListEnterOrTimeout(1200);
  }
  var l0 = 557,
    t0 = 699,
    r0 = 641,
    b0 = 756;
  var node = null;
  // 新机型（如 nova2s）优先：粉丝文案常为 id=5vb（不可点），需抬父级点击
  try {
    node = id("com.ss.android.ugc.aweme:id/5vb").findOne(FAST_FIND_MS);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/5vb$/).findOne(FAST_FIND_MS);
    } catch (e0m) {}
  }
  if (!node) {
    try {
      node = id("com.ss.android.ugc.aweme:id/5xq").findOne(FAST_FIND_MS);
    } catch (e4) {}
  }
  try {
    if (!node) node = className("android.widget.TextView").text("粉丝").boundsInside(l0, t0, r0, b0).findOne(FAST_FIND_MS);
  } catch (e) {}
  if (!node) {
    try {
      node = text("粉丝").boundsInside(l0, t0, r0, b0).findOne(FAST_FIND_MS);
    } catch (e2) {}
  }
  if (!node) {
    var pad = 48;
    try {
      node = text("粉丝").boundsInside(l0 - pad, t0 - pad, r0 + pad, b0 + pad).findOne(FAST_FIND_MS);
    } catch (e3) {}
  }
  if (!node) {
    // 放宽到顶部统计区域，避免固定小框漏检
    try {
      node = text("粉丝")
        .boundsInside(
          Math.floor(device.width * 0.42),
          Math.floor(device.height * 0.2),
          Math.floor(device.width * 0.78),
          Math.floor(device.height * 0.42)
        )
        .findOne(FAST_FIND_MS);
    } catch (e4b) {}
  }
  if (node) {
    if (clickNode(node)) {
      return waitFollowerListAfterTap();
    }
    try {
      var b = node.bounds();
      // 文案通常不可点，优先点其父容器中心
      var p = node.parent ? node.parent() : null;
      if (p) {
        try {
          var bp = p.bounds();
          click(bp.centerX(), bp.centerY());
          return waitFollowerListAfterTap();
        } catch (eP) {}
      }
      click(b.centerX(), b.centerY());
      return waitFollowerListAfterTap();
    } catch (e5) {}
  }
  try {
    if (clickFansTabFromStatsLayoutA11y()) {
      return waitFollowerListAfterTap();
    }
  } catch (eLayTap) {}
  try {
    if (clickProfileFansTabByOcr()) {
      return waitFollowerListAfterTap();
    }
  } catch (eOcrTap) {}
  try {
    var cx = Math.floor((l0 + r0) / 2);
    var cy = Math.floor((t0 + b0) / 2);
    press(cx, cy, 80);
    appendLog("粉丝区域按压");
    return waitFollowerListAfterTap();
  } catch (e6) {}
  appendLog("点粉丝失败");
  return false;
}

/** 主页顶部「获赞/关注/粉丝」统计条里的「关注」Tab（非右侧 +关注 按钮） */
/** 统计条「关注」Tab：须与「获赞/粉丝」同一行，排除下方「他(她)关注了你」等区域 */
function isProfileStatsBarFollowLabelAligned(n) {
  if (!n) return false;
  var w = device.width;
  var h = device.height;
  var yMin = Math.floor(h * 0.12);
  var yMax = Math.floor(h * 0.42);
  try {
    var t = String((n.text && n.text()) || (n.desc && n.desc()) || "").trim();
    if (t !== "关注") return false;
    var b = n.bounds();
    var cy = Math.floor((b.top + b.bottom) / 2);
    if (cy < yMin || cy > yMax) return false;
    if (b.centerX() >= Math.floor(w * 0.68)) return false;
    var zan = text("获赞").boundsInside(0, yMin, Math.floor(w * 0.5), yMax).findOne(150);
    var fans = text("粉丝").boundsInside(Math.floor(w * 0.45), yMin, w, yMax).findOne(150);
    if (!zan || !fans) return cy >= Math.floor(h * 0.20) && cy <= Math.floor(h * 0.40);
    var zy = zan.bounds().centerY();
    var fy = fans.bounds().centerY();
    return Math.abs(cy - zy) <= 30 && Math.abs(cy - fy) <= 30;
  } catch (e0) {
    return false;
  }
}

function findProfileStatsBarFollowLabelNode() {
  var w = device.width;
  var h = device.height;
  var yMin = Math.floor(h * 0.12);
  var yMax = Math.floor(h * 0.42);
  var xMin = Math.floor(w * 0.22);
  var xMax = Math.floor(w * 0.65);
  var midCx = Math.floor(w * 0.43);
  try {
    var zan = text("获赞").boundsInside(0, yMin, Math.floor(w * 0.5), yMax).findOne(220);
    var fans = text("粉丝").boundsInside(Math.floor(w * 0.45), yMin, w, yMax).findOne(220);
    if (zan && fans) midCx = Math.floor((zan.bounds().centerX() + fans.bounds().centerX()) / 2);
  } catch (eMid) {}
  var picked = null;
  var bestScore = 1e9;
  try {
    var list = text("关注").boundsInside(xMin, yMin, xMax, yMax).find();
    if (list) {
      for (var i = 0; i < list.size(); i++) {
        var n = list.get(i);
        if (!isProfileStatsBarFollowLabelAligned(n)) continue;
        try {
          var sc = Math.abs(n.bounds().centerX() - midCx);
          if (sc < bestScore) {
            bestScore = sc;
            picked = n;
          }
        } catch (eB) {}
      }
    }
  } catch (eList) {}
  return picked;
}

/** 中间列可点 LinearLayout（如 bounds 321,654,545,711 含「关注+数字」） */
function findProfileStatsFollowClickableLayoutNode() {
  var w = device.width;
  var h = device.height;
  var yMin = Math.floor(h * 0.12);
  var yMax = Math.floor(h * 0.42);
  var xMin = Math.floor(w * 0.22);
  var xMax = Math.floor(w * 0.68);
  var midCx = Math.floor(w * 0.43);
  try {
    var zan = text("获赞").boundsInside(0, yMin, Math.floor(w * 0.5), yMax).findOne(200);
    var fans = text("粉丝").boundsInside(Math.floor(w * 0.45), yMin, w, yMax).findOne(200);
    if (zan && fans) midCx = Math.floor((zan.bounds().centerX() + fans.bounds().centerX()) / 2);
  } catch (eMid) {}
  var best = null;
  var bestScore = 1e9;
  try {
    var layouts = className("android.widget.LinearLayout")
      .clickable(true)
      .boundsInside(xMin, yMin, xMax, yMax)
      .find();
    if (!layouts) return null;
    for (var li = 0; li < layouts.size(); li++) {
      var lay = layouts.get(li);
      if (!lay) continue;
      var hasFollowLbl = false;
      var cc = 0;
      try {
        cc = lay.childCount();
      } catch (eCc) {
        cc = 0;
      }
      var ci;
      for (ci = 0; ci < cc; ci++) {
        var ch = null;
        try {
          ch = lay.child(ci);
        } catch (eCh) {
          ch = null;
        }
        if (!ch) continue;
        try {
          if (String((ch.text && ch.text()) || (ch.desc && ch.desc()) || "").trim() === "关注") hasFollowLbl = true;
        } catch (eTb) {}
      }
      if (!hasFollowLbl) continue;
      try {
        var bb = lay.bounds();
        var bh = bb.bottom - bb.top;
        if (bh > 80) continue;
        var sc = Math.abs(bb.centerX() - midCx) + bh * 0.35;
        if (sc < bestScore) {
          bestScore = sc;
          best = lay;
        }
      } catch (eB) {}
    }
  } catch (eLay) {}
  return best;
}

function pressPointForProfileStatsFollowTab(node) {
  var w = device.width;
  var lbl = node;
  try {
    if (!lbl || !isProfileStatsBarFollowLabelAligned(lbl)) lbl = findProfileStatsBarFollowLabelNode();
  } catch (e0) {
    lbl = node;
  }
  if (lbl) {
    try {
      var lb = lbl.bounds();
      var cx = lb.centerX();
      var cy = lb.centerY();
      try {
        var p = lbl.parent ? lbl.parent() : null;
        if (p && p.clickable && p.clickable()) {
          var bp = p.bounds();
          var ph = bp.bottom - bp.top;
          var pw = bp.right - bp.left;
          if (ph > 0 && ph <= 76 && pw <= Math.floor(w * 0.34)) {
            var overlap = Math.min(lb.bottom, bp.bottom) - Math.max(lb.top, bp.top);
            if (overlap >= Math.floor((lb.bottom - lb.top) * 0.5)) {
              cx = bp.centerX();
              cy = bp.centerY();
            }
          }
        }
      } catch (eP) {}
      return { x: cx, y: cy, ok: true };
    } catch (eB) {}
  }
  try {
    var lay = findProfileStatsFollowClickableLayoutNode();
    if (lay) {
      var bl = lay.bounds();
      return { x: bl.centerX(), y: bl.centerY(), ok: true };
    }
  } catch (eLay) {}
  try {
    var zan = text("获赞").findOne(180);
    var fans = text("粉丝").findOne(180);
    if (zan && fans) {
      return {
        x: Math.floor((zan.bounds().centerX() + fans.bounds().centerX()) / 2),
        y: Math.floor((zan.bounds().centerY() + fans.bounds().centerY()) / 2),
        ok: true,
      };
    }
  } catch (eF) {}
  return { x: Math.floor(w * 0.4), y: Math.floor(device.height * 0.28), ok: false };
}

function findProfileStatsFollowTabNodeForWendao() {
  var layPick = null;
  try {
    layPick = findProfileStatsFollowClickableLayoutNode();
  } catch (eLay0) {}
  if (layPick) return layPick;
  var lblPick = null;
  try {
    lblPick = findProfileStatsBarFollowLabelNode();
  } catch (eLbl0) {}
  if (lblPick) return lblPick;
  var w = device.width;
  var h = device.height;
  var yMin = Math.floor(h * 0.18);
  var yMax = Math.floor(h * 0.48);
  var xMin = Math.floor(w * 0.24);
  var xMax = Math.floor(w * 0.62);
  function inStatsBand(b) {
    if (!b) return false;
    var cy = Math.floor((b.top + b.bottom) / 2);
    if (cy < yMin || cy > yMax) return false;
    if (b.bottom - b.top > 120) return false;
    return b.left >= xMin - 40 && b.right <= xMax + 80;
  }
  function pushValid(arr, n) {
    if (!n) return;
    try {
      var b = n.bounds();
      if (!inStatsBand(b)) return;
      var t = "";
      try { t = String(n.text() || "").trim(); } catch (eT) {}
      if (t && t !== "关注") return;
      arr.push(n);
    } catch (eB) {}
  }
  var zan = null;
  var fans = null;
  try {
    zan = text("获赞").boundsInside(0, yMin, Math.floor(w * 0.45), yMax).findOne(320);
  } catch (eZ) {}
  try {
    fans = text("粉丝").boundsInside(Math.floor(w * 0.48), yMin, w, yMax).findOne(320);
  } catch (eF) {}
  var zanCx = -1;
  var fansCx = w + 1;
  try {
    if (zan) zanCx = zan.bounds().centerX();
  } catch (eZx) {}
  try {
    if (fans) fansCx = fans.bounds().centerX();
  } catch (eFx) {}
  var picked = null;
  var bestScore = 1e9;
  try {
    var descList = desc("关注").boundsInside(xMin, yMin, xMax, yMax).find();
    if (descList) {
      for (var di = 0; di < descList.size(); di++) {
        var dn = descList.get(di);
        try {
          if (String(dn.desc() || "").trim() !== "关注") continue;
        } catch (eDesc) {
          continue;
        }
        var bd = dn.bounds();
        if (!inStatsBand(bd)) continue;
        var dcx = bd.centerX();
        if (zanCx >= 0 && dcx <= zanCx + 8) continue;
        if (fansCx <= w && dcx >= fansCx - 8) continue;
        var midCxD = Math.floor(w * 0.43);
        if (zanCx >= 0 && fansCx <= w) midCxD = Math.floor((zanCx + fansCx) / 2);
        var scD = Math.abs(dcx - midCxD);
        if (scD < bestScore) {
          bestScore = scD;
          picked = dn;
        }
      }
    }
  } catch (eDescList) {}
  if (picked) return picked;
  bestScore = 1e9;
  try {
    var list = text("关注").boundsInside(xMin, yMin, xMax, yMax).find();
    if (list) {
      for (var i = 0; i < list.size(); i++) {
        var n0 = list.get(i);
        try {
          if (String(n0.text() || "").trim() !== "关注") continue;
        } catch (eTxt) {
          continue;
        }
        if (!isProfileStatsBarFollowLabelAligned(n0)) continue;
        var b0 = n0.bounds();
        if (!inStatsBand(b0)) continue;
        var cx = b0.centerX();
        if (zanCx >= 0 && cx <= zanCx + 8) continue;
        if (fansCx <= w && cx >= fansCx - 8) continue;
        var midCx = Math.floor(w * 0.43);
        if (zanCx >= 0 && fansCx <= w) midCx = Math.floor((zanCx + fansCx) / 2);
        else if (zanCx >= 0) midCx = zanCx + Math.floor(w * 0.12);
        else if (fansCx <= w) midCx = fansCx - Math.floor(w * 0.12);
        var score = Math.abs(cx - midCx);
        if (score < bestScore) {
          bestScore = score;
          picked = n0;
        }
      }
    }
  } catch (eList) {}
  if (picked) return picked;
  var idCandidates = [];
  try {
    pushValid(idCandidates, id("com.ss.android.ugc.aweme:id/50w").findOne(280));
  } catch (eId0) {}
  try {
    pushValid(idCandidates, idMatches(/.*:id\/50w$/).findOne(220));
  } catch (eId1) {}
  try {
    pushValid(idCandidates, id("com.ss.android.ugc.aweme:id/50t").findOne(280));
  } catch (eId2) {}
  try {
    pushValid(idCandidates, idMatches(/.*:id\/50t$/).findOne(220));
  } catch (eId3) {}
  if (idCandidates.length > 0) return idCandidates[0];
  return findProfileStatsBarFollowLabelNode();
}

function pressProfileStatsFollowTab(node) {
  try {
    var pt = pressPointForProfileStatsFollowTab(node);
    if (pt && pt.x > 0 && pt.y > 0) {
      press(pt.x, pt.y, 80);
      return true;
    }
  } catch (ePress) {}
  return false;
}

/** 是否仍在他人用户主页（有顶部抖音号/作品锚点） */
function stillOnDouyinUserProfilePageQuick() {
  try {
    var n1 = findFanProfileDouyinIdTextNode(80);
    if (n1) {
      try {
        if (typeof n1.visibleToUser === "function" && !n1.visibleToUser()) n1 = null;
      } catch (e6v) {}
    }
    if (n1) {
      try {
        var b1 = n1.bounds();
        var cy1 = Math.floor((b1.top + b1.bottom) / 2);
        if (cy1 >= Math.floor(device.height * 0.10) && cy1 <= Math.floor(device.height * 0.46)) return true;
      } catch (e6b) {}
    }
  } catch (e6) {}
  try {
    var n2 = textMatches(/^抖音号[:：].+/).findOne(80);
    if (n2) {
      try {
        if (typeof n2.visibleToUser === "function" && !n2.visibleToUser()) n2 = null;
      } catch (e7v) {}
    }
    if (n2) {
      try {
        var b2 = n2.bounds();
        var cy2 = Math.floor((b2.top + b2.bottom) / 2);
        if (cy2 >= Math.floor(device.height * 0.10) && cy2 <= Math.floor(device.height * 0.50)) return true;
      } catch (e7b) {}
    }
  } catch (e7) {}
  try {
    if (hasDouyinProfileWorksAnchor()) return true;
  } catch (eW) {}
  return false;
}

/** 是否已进入「关注/粉丝」子列表页（顶部双 Tab + 已离开用户主页） */
function looksLikeDouyinFollowFansSubListPage() {
  if (stillOnDouyinUserProfilePageQuick()) return false;
  try {
    var hasFollowTab = !!textMatches(/^关注\s*\d*$/).findOne(120) || !!text("关注").findOne(120);
    var hasFansTab = !!textMatches(/^粉丝\s*\d*$/).findOne(120) || !!text("粉丝").findOne(120);
    if (hasFollowTab && hasFansTab) return true;
  } catch (e8) {}
  try {
    var topNum = textMatches(/^\d[\d,]*$/).boundsInside(0, Math.floor(device.height * 0.06), device.width, Math.floor(device.height * 0.28)).findOne(120);
    var fansTab = text("粉丝").boundsInside(0, Math.floor(device.height * 0.06), device.width, Math.floor(device.height * 0.28)).findOne(120);
    if (topNum && fansTab) return true;
  } catch (e9) {}
  try {
    var rows = collectFollowerListRowsDeduped();
    if (rows && rows.length > 0) return true;
  } catch (e10) {}
  return false;
}

/**
 * 问道第6步：点统计条「关注」后等待列表打开（华为等机型指纹常不变，不能只比 fingerprint）。
 */
function waitWendaoFollowingListOpened(beforeFp, maxWaitMs) {
  var endAt = Date.now() + (typeof maxWaitMs === "number" && maxWaitMs > 0 ? maxWaitMs : 5200);
  while (Date.now() < endAt && !__scriptUserStop) {
    try {
      if (looksLikeDouyinFollowFansSubListPage()) {
        sleepCtrl(320);
        return true;
      }
    } catch (e1) {}
    if (beforeFp) {
      try {
        var nowFp = getQuickPageFingerprintForBack();
        if (nowFp && nowFp !== beforeFp && !stillOnDouyinUserProfilePageQuick()) {
          sleepCtrl(320);
          return true;
        }
      } catch (e2) {}
    }
    sleepCtrl(260);
  }
  return false;
}

function pressWendaoStatsFollowTabFallback() {
  try {
    var pt = pressPointForProfileStatsFollowTab(null);
    press(pt.x, pt.y, 90);
    return true;
  } catch (e5) {
    return false;
  }
}

/** 问道模式第6步：在用户主页点击「关注」 */
function clickFollowOnTargetProfileForWendao() {
  appendLog("点击关注");
  var beforeFp = "";
  try { beforeFp = getQuickPageFingerprintForBack(); } catch (eFp0) { beforeFp = ""; }
  var node = null;
  try {
    node = findProfileStatsFollowTabNodeForWendao();
  } catch (eFind) {}
  var ok = false;
  if (node) {
    try {
      ok = pressProfileStatsFollowTab(node);
    } catch (e3) {
      ok = false;
    }
  }
  if (!ok) {
    try {
      ok = clickFollowTabFromStatsLayoutA11y();
    } catch (eLayF) {
      ok = false;
    }
  }
  if (!ok) {
    try {
      ok = clickProfileFollowTabByOcr();
    } catch (eOcrF) {
      ok = false;
    }
  }
  if (!ok) {
    ok = pressWendaoStatsFollowTabFallback();
  }
  if (!ok) {
    appendLog("点关注失败");
    return false;
  }
  if (waitWendaoFollowingListOpened(beforeFp, 5200)) {
    return true;
  }
  pressWendaoStatsFollowTabFallback();
  sleepCtrl(500);
  if (waitWendaoFollowingListOpened("", 3600)) {
    return true;
  }
  appendLog("关注页未打开，返回一次");
  try { back(); } catch (eBk) {}
  sleepCtrl(420);
  return false;
}

function isLikelyFollowerNicknameText(t) {
  if (!t) return false;
  t = String(t).trim();
  if (!t || t.length > 48) return false;
  if (/^[\d\.\s,，万亿]+$/.test(t)) return false;
  var skip = { 关注: 1, 互相关注: 1, 已关注: 1, 粉丝: 1, 获赞: 1, 作品: 1, 抖音号: 1 };
  if (skip[t]) return false;
  return true;
}

function normalizeFollowerNicknameForLog(t) {
  if (!t) return "";
  var s = String(t).trim();
  if (!s) return "";
  // 仅取首行，避免把简介/标签拼进昵称
  s = s.split(/\r?\n/)[0] || "";
  // 常见拼接分隔符：逗号、冒号、竖线等；只保留前半段昵称
  s = s.split(/[，,:：|｜]/)[0] || "";
  // 清理尾部空白和异常符号
  s = s.replace(/\s+/g, " ").trim();
  // 兜底：昵称通常不会太长，超长基本是拼接文案
  if (s.length > 24) s = s.slice(0, 24).trim();
  if (!isLikelyFollowerNicknameText(s)) return "";
  return s;
}

/** 从首行节点或大致区域内取昵称（偏左第一个像昵称的 TextView，或遍历子节点） */
function extractFollowerNicknameFromRow(node, l0, t0, r0, b0) {
  var left, top, right, bottom;
  try {
    if (node) {
      try {
        var dRow = node.desc && node.desc();
        var dNorm = normalizeFollowerNicknameForLog(dRow);
        if (dNorm) return dNorm;
        var tRow = node.text && node.text();
        var tNorm = normalizeFollowerNicknameForLog(tRow);
        if (tNorm) return tNorm;
      } catch (eRow) {}
      var b = node.bounds();
      left = Math.max(0, b.left - 16);
      top = Math.max(0, b.top - 12);
      right = Math.min(device.width, b.right + 420);
      bottom = Math.min(device.height, b.bottom + 24);
    } else {
      var pad = 48;
      left = Math.max(0, l0 - pad);
      top = Math.max(0, t0 - pad);
      right = Math.min(device.width, r0 + 360);
      bottom = Math.min(device.height, b0 + pad);
    }
    var coll = null;
    if (!__sodaStep11FastEnter) {
      coll = className("android.widget.TextView").boundsInside(left, top, right, bottom).find();
    }
    if (coll && coll.size && coll.size() > 0) {
      var list = [];
      for (var i = 0; i < coll.size(); i++) {
        var tv = coll.get(i);
        try {
          var tx = tv.text();
          if (!tx && tv.desc) tx = tv.desc();
          var txNorm = normalizeFollowerNicknameForLog(tx);
          if (!txNorm) continue;
          var tb = tv.bounds();
          list.push({ text: txNorm, left: tb.left });
        } catch (e0) {}
      }
      list.sort(function (a, c) {
        return a.left - c.left;
      });
      if (list.length) return list[0].text;
    }
  } catch (e) {}
  if (!node) return "";
  function walk(n, depth) {
    if (!n || depth > 12) return "";
    try {
      var cn = n.className && n.className();
      if (cn && String(cn).indexOf("TextView") >= 0) {
        var tx = n.text && n.text();
        if (!tx && n.desc) tx = n.desc();
        var txNorm = normalizeFollowerNicknameForLog(tx);
        if (txNorm) return txNorm;
      }
      var cnt = n.childCount && n.childCount();
      if (cnt > 0) {
        for (var j = 0; j < cnt; j++) {
          var c = n.child(j);
          var r = walk(c, depth + 1);
          if (r) return r;
        }
      }
    } catch (e2) {}
    return "";
  }
  return walk(node, 0);
}

/** 粉丝列表 1xt 节点：先上后下、同行从左 */
function sortFollowerRowNodesByVisual(arr) {
  var slop = Math.max(24, Math.floor(device.height * 0.025));
  var items = [];
  for (var i = 0; i < arr.length; i++) {
    try {
      var b = arr[i].bounds();
      items.push({ n: arr[i], t: b.top, l: b.left });
    } catch (e0) {
      items.push({ n: arr[i], t: 1e7, l: 1e7 });
    }
  }
  items.sort(function (x, y) {
    if (Math.abs(x.t - y.t) > slop) return x.t - y.t;
    return x.l - y.l;
  });
  var out = [];
  for (var j = 0; j < items.length; j++) out.push(items[j].n);
  return out;
}

/** 同一行多个 1xt 时保留左侧一个，得到每行一个点击目标（从上到下） */
function dedupeFollowerRowsOnePerLine(sortedNodes) {
  var slop = Math.max(24, Math.floor(device.height * 0.028));
  var buckets = [];
  for (var i = 0; i < sortedNodes.length; i++) {
    var n = sortedNodes[i];
    var bt, bl;
    try {
      var b = n.bounds();
      bt = b.top;
      bl = b.left;
    } catch (e0) {
      continue;
    }
    var found = -1;
    for (var j = 0; j < buckets.length; j++) {
      if (Math.abs(buckets[j].t - bt) <= slop) {
        found = j;
        break;
      }
    }
    if (found < 0) {
      buckets.push({ t: bt, l: bl, n: n });
    } else if (bl < buckets[found].l) {
      buckets[found].l = bl;
      buckets[found].n = n;
    }
  }
  buckets.sort(function (a, c) {
    return a.t - c.t;
  });
  var out = [];
  for (var k = 0; k < buckets.length; k++) out.push(buckets[k].n);
  return out;
}

/** 列表可视区：勿用过窄的纵向带（原 22%～62% 会漏掉下半屏多行）；底部预留导航条 */
function followerListYBand() {
  var sh = device.height;
  var reserveBottom = Math.max(88, Math.floor(sh * 0.07));
  return {
    yMin: Math.floor(sh * 0.07),
    yMax: sh - reserveBottom,
  };
}

// （精简版已移除：getTopStatsMaxY/getDynamicWorkGridBounds/getWorkGridBoundsByCover）

/** 精简版：作品网格纵向带（仅用于图像识别粗扫） */
function profileWorkGridYBand() {
  var sh = device.height;
  var tabBottom = 0;
  try {
    var w = null;
    try {
      w = textMatches(/^作品\s*\d*$/).findOne(220);
    } catch (e0) {}
    if (!w) {
      try {
        w = text("作品").findOne(220);
      } catch (e1) {}
    }
    if (!w) {
      try {
        w = desc("作品").findOne(220);
      } catch (e2) {}
    }
    if (w) {
      try {
        tabBottom = w.bounds().bottom;
      } catch (eB) {}
    }
  } catch (e3) {}
  if (WORK_GRID_IMAGE_PICK_DEBUG && tabBottom > 0) {
    try {
      appendLog("作品Tab底部Y: " + tabBottom);
    } catch (eLog) {}
  }
  return {
    // 实测作品首行常在屏高约 50% 附近；带太靠上会把头像区当封面
    // 关键：优先用「作品Tab底部+30」作为起点；读不到再回退到比例
    yMin: tabBottom ? tabBottom + 30 : Math.floor(sh * 0.45),
    yMax: Math.floor(sh * 0.92),
  };
}

// （精简版已移除：collectLikelyWorkLikeNumberNodes/pushProfileWorkGridPureDigitLikeTextNodes/clickWorkByVisibleLikeNumberFallback）

function normalizeFollowerNickKey(nick) {
  return String(nick || "")
    .trim()
    .replace(/\s+/g, " ");
}

/** 去重用：有昵称用昵称，否则用行大致位置（无昵称时弱唯一） */
function followerRowVisitKey(node, nick) {
  var k = normalizeFollowerNickKey(nick);
  if (k) return k;
  try {
    var b = node.bounds();
    return "_" + b.top + "_" + b.left;
  } catch (e) {
    return "";
  }
}

function scrollFollowerListDown() {
  var w = device.width,
    h = device.height;
  try {
    var x = Math.floor(w * 0.5);
    var y1 = Math.floor(h * 0.76);
    var y2 = Math.floor(h * 0.20);
    swipe(x, y1, x, y2, 430);
    return true;
  } catch (e) {
    return false;
  }
}

/** 当前屏粉丝列表：优先 1xt；新机常见整行 root_layout（desc 为昵称，text 常为空） */
function collectFollowerListRowsDeduped() {
  var band = followerListYBand();
  var raw = [];
  var sw = device.width;
  try {
    var coll = id("com.ss.android.ugc.aweme:id/1xt").find();
    if (coll && coll.size) {
      for (var i = 0; i < coll.size(); i++) {
        var w = coll.get(i);
        try {
          var b = w.bounds();
          var cy = b.centerY();
          if (cy < band.yMin || cy > band.yMax) continue;
          raw.push(w);
        } catch (e0) {}
      }
    }
  } catch (e) {}
  // 机型差异：部分 ROM 下 find() 返回不稳定，补一条短 findOne 兜底
  if (raw.length === 0) {
    try {
      var one = id("com.ss.android.ugc.aweme:id/1xt").findOne(220);
      if (one) raw.push(one);
    } catch (e1) {}
  }
  // 新 UI：列表行可能是全宽 Button，id=root_layout，无 1xt
  if (raw.length === 0) {
    try {
      var coll2 = id("com.ss.android.ugc.aweme:id/root_layout").find();
      if (coll2 && coll2.size) {
        for (var j = 0; j < coll2.size(); j++) {
          var rj = coll2.get(j);
          try {
            var br = rj.bounds();
            var cy2 = br.centerY();
            if (cy2 < band.yMin || cy2 > band.yMax) continue;
            if (br.width() < sw * 0.55 || br.height() < 24) continue;
            raw.push(rj);
          } catch (e2) {}
        }
      }
    } catch (e3) {}
  }
  return dedupeFollowerRowsOnePerLine(sortFollowerRowNodesByVisual(raw));
}

/** 与空列表占位 LinearLayout 常见区域相交（如 252,457～780,572） */
function fanListRegionIntersectsEmptyPlaceholder(b) {
  try {
    var L = 230,
      T = 425,
      R = Math.min(device.width - 1, 805),
      B = Math.min(device.height - 1, 625);
    return !(b.right < L || b.left > R || b.bottom < T || b.top > B);
  } catch (e) {
    return false;
  }
}

/**
 * 进入粉丝列表后是否「没有有效粉丝行」：无 1xt 行，或仅有宽条占位 LinearLayout（约 252,457～780,572 等）且无昵称。
 */
function isFollowerListEffectivelyEmpty() {
  var band = followerListYBand();
  var sw = device.width;
  // 硬探针 1：1xt 行（旧布局）
  try {
    var p1 = null;
    try {
      p1 = id("com.ss.android.ugc.aweme:id/1xt").findOne(180);
    } catch (eP1) {}
    if (!p1) {
      try {
        p1 = idMatches(/.*:id\/1xt$/).findOne(180);
      } catch (eP2) {}
    }
    if (p1) {
      try {
        var b0 = p1.bounds();
        if (b0 && b0.width() > 50 && b0.height() > 20) return false;
      } catch (eB0) {
        return false;
      }
    }
  } catch (eProbe) {}
  // 硬探针 2：整行 root_layout（新布局，常见 className=Button，desc 为昵称）
  try {
    var collRl = id("com.ss.android.ugc.aweme:id/root_layout").find();
    if (collRl && collRl.size) {
      for (var ri = 0; ri < collRl.size(); ri++) {
        var rn = collRl.get(ri);
        try {
          var br = rn.bounds();
          var cy = br.centerY();
          if (cy < band.yMin || cy > band.yMax) continue;
          if (br.width() > sw * 0.55 && br.height() > 24) return false;
        } catch (eRl) {}
      }
    }
  } catch (eRl2) {}
  var l0 = 252,
    t0 = 448,
    r0 = 342,
    b0 = 575;
  var rows = collectFollowerListRowsDeduped();
  // 新机型上 1xt 行经常无文本；抓到 1xt 或 root_layout 行即视为“有粉丝列表”
  if (rows.length > 0) return false;
  if (rows.length === 0) {
    try {
      var coll = null;
      try {
        coll = className("android.widget.LinearLayout").packageName(DY_PKG).find();
      } catch (ep) {
        coll = className("android.widget.LinearLayout").find();
      }
      var k = coll && coll.size ? coll.size() : 0;
      for (var i = 0; i < k; i++) {
        var n = coll.get(i);
        try {
          var b = n.bounds();
          var cy = b.centerY();
          var inBand = cy >= band.yMin && cy <= band.yMax;
          if (!inBand && !fanListRegionIntersectsEmptyPlaceholder(b)) continue;
          if (b.width() < 300 || b.right < 480) continue;
          if (n.clickable && n.clickable()) continue;
          var nick = extractFollowerNicknameFromRow(n, l0, t0, r0, b0);
          if (!nick) return true;
        } catch (e0) {}
      }
    } catch (e1) {}
    return true;
  }
  return false;
}

/**
 * 从「无粉丝列表」界面退出：与第11步相同节奏按两次返回（中间留足间隔，避免系统只吃到一次返回）。
 */
function getQuickPageFingerprintForBack() {
  var parts = [];
  try {
    parts.push("pkg:" + (currentPackage ? currentPackage() : ""));
  } catch (e0) {}
  try {
    parts.push("act:" + (currentActivity ? currentActivity() : ""));
  } catch (e1) {}
  try {
    parts.push("works:" + (hasDouyinProfileWorksAnchor() ? 1 : 0));
  } catch (e2) {}
  try {
    parts.push("fansRows:" + (collectFollowerListRowsDeduped().length > 0 ? 1 : 0));
  } catch (e3) {}
  try {
    parts.push("commentSend:" + (textMatches(/发送|说点什么/).findOne(60) ? 1 : 0));
  } catch (e4) {}
  return parts.join("|");
}

function pressBackAndWait(maxWaitMs) {
  var waitMs = maxWaitMs == null ? 1500 : maxWaitMs;
  var before = "";
  try {
    before = getQuickPageFingerprintForBack();
  } catch (e0) {}
  var tried = 0;
  while (tried < 3) {
  try {
    back();
    } catch (e1) {}
    var endAt = Date.now() + waitMs;
    while (Date.now() < endAt) {
      if (__scriptUserStop) return;
      sleep(180);
      var now = "";
      try {
        now = getQuickPageFingerprintForBack();
  } catch (e2) {}
      if (now !== before) return;
    }
    tried++;
    // 页面指纹未变，补打一发返回（慢机常见吞键）
  }
}

function pressBackTwiceLeavingFanListEmpty() {
  try {
    appendLog("粉丝列表空，返回×2");
  } catch (e0) {}
  sleepCtrl(PACE_9_11.step11BeforeAction);
  pressBackAndWait(1500);
  sleepCtrl(PACE_9_11.step11Back1);
  pressBackAndWait(1100);
  sleepCtrl(PACE_9_11.step11Back2);
}

/**
 * 粉丝列表为空或不可用：
 * - 点粉丝后**已进新页**但非所需列表：先返回×2 → 删行 → 搜索栏重取号（第6步）→ 再点粉丝。
 * - 点粉丝后**页面未变**（wait 内已 back 一次）：静默删号重搜，不打「无列表/未知号」、不做返回×2。
 * @returns {boolean} 是否已回到「有粉丝列表或已尽力」的对标主页（无列表时仍可能 false）
 */
function handleEmptyFollowerListByReselect(maxStep, maxRounds) {
  maxRounds = maxRounds == null ? 8 : maxRounds;
  var round = 0;
  var firstPassNoNav = __fansTapNoNavigationReselect === true;
  __fansTapNoNavigationReselect = false;
  while (round < maxRounds) {
    if (__scriptUserStop) return false;
    var silentNoNav = false;
    if (firstPassNoNav) {
      silentNoNav = true;
      firstPassNoNav = false;
    } else {
    sleepCtrl(900);
    if (!isFollowerListEffectivelyEmpty()) return true;
    }
    round++;
    if (!silentNoNav) appendLog("无粉丝列表，删号重搜");
    if (!__currentTargetDbLine) {
      if (!silentNoNav) {
      appendLog("当前号未知");
      pressBackTwiceLeavingFanListEmpty();
      sleepCtrl(600);
      return false;
    }
      sleepCtrl(420);
    } else {
      if (!silentNoNav) {
    pressBackTwiceLeavingFanListEmpty();
      }
    removeDbLineFromServer(__currentTargetDbLine);
    __currentTargetDbLine = null;
    sleepCtrl(900);
    }
    clearSearchInput();
    var okNew = false;
    for (var a = 0; a < 3; a++) {
      if (__scriptUserStop) return false;
      var line = pickRandomDbLine();
      if (!line) {
    appendLog("库为空");
    return false;
  }
      var show = normalizeDbLine(line);
      appendLog("取号:" + show);
      if (!pasteValueIntoSearch(show)) continue;
      __currentTargetDbLine = line;
      sleepCtrl(900);
      appendLog("执行搜索");
      clickSearchIcon();
      sleepCtrl(950);
      var hitOldFlow = clickSearchResultByOcrTarget(show, 3600);
      if (!hitOldFlow) {
        appendLog("结果加载中，再试一次");
        sleepCtrl(900);
        hitOldFlow = clickSearchResultByOcrTarget(show, 3600);
      }
      if (hitOldFlow) {
        okNew = true;
        break;
      }
      appendLog("点号失败,删除");
      removeDbLineFromServer(line);
      __currentTargetDbLine = null;
      clearSearchInput();
      sleepCtrl(600);
    }
    if (!okNew) return false;
    if (maxStep < 8) return true;
    if (!clickFansOnTargetProfile()) return false;
  }
  sleepCtrl(500);
  return !isFollowerListEffectivelyEmpty();
}

/**
 * 1xt 行往往很宽，clickNode 末尾会对「整行 bounds 中心」press，易点到行中空区（如 ~466,332）无效。
 * 仅在父链 .click() 失败后，对行内偏左昵称带按压。
 * @param {number} [xBiasFrac] 行内横向比例，默认 0.2；汽水建议 0.44 避开左侧悬浮窗
 */
function getFloatCloseButtonTapRect(pad) {
  var p = typeof pad === "number" ? pad : 52;
  var px = typeof __floatPanelX === "number" ? __floatPanelX : 10;
  var py = typeof __floatPanelY === "number" ? __floatPanelY : 70;
  var dx = -60;
  var dy = -110;
  var cw = 96;
  var ch = 72;
  return {
    left: px + dx - p,
    top: py + dy - p,
    right: px + dx + cw + p,
    bottom: py + dy + ch + p,
  };
}

function nudgeTapAwayFromFloatClose(cx, cy) {
  try {
    var r = getFloatCloseButtonTapRect(52);
    if (cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom) {
      cx = Math.min((device.width || 1080) - 12, r.right + 40);
    }
  } catch (eNudge) {}
  return { x: cx, y: cy };
}

function pressFollowerRowNicknameFallback(node, xBiasFrac) {
  if (!node) return false;
  try {
    var b2 = node.bounds();
    var rw = b2.width();
    var rh = b2.height();
    if (rw < 32 || rh < 10) return false;
    var frac = typeof xBiasFrac === "number" ? xBiasFrac : 0.2;
    var cx = Math.min(b2.right - 18, Math.max(b2.left + 22, b2.left + Math.floor(rw * frac)));
    var cy = Math.min(b2.bottom - 4, Math.max(b2.top + 6, Math.floor((b2.top + b2.bottom) / 2)));
    var pt = nudgeTapAwayFromFloatClose(cx, cy);
    cx = pt.x;
    cy = pt.y;
    try {
      press(cx, cy, 85);
      return true;
    } catch (eP) {
      try {
        click(cx, cy);
        return true;
      } catch (eC) {
        return false;
      }
    }
  } catch (eB) {
    return false;
  }
}

/** 点粉丝行后：确认已进入该粉丝主页（避免动画/加载慢导致仍在粉丝列表却继续下滑） */
function waitForFanProfileEntered(maxMs) {
  function hasStrongFanProfileSignals() {
    var hasDyId = false;
    var hasWorks = false;
    var hasStats = false;
    try {
      if (findFanProfileDouyinIdTextNode(70)) hasDyId = true;
    } catch (e0) {}
    if (!hasDyId) {
      try {
        if (
          textMatches(/^抖音号[：:·].+/).findOne(70) ||
          textContains("抖音号").findOne(70)
        ) {
          hasDyId = true;
        }
      } catch (e1) {}
    }
    try {
      if (
        textMatches(/^作品\s*\d*/).findOne(70) ||
        text("作品").findOne(70) ||
        descMatches(/^作品\s*\d*/).findOne(70) ||
        desc("作品").findOne(70)
      ) {
        hasWorks = true;
      }
    } catch (e2) {}
    try {
      if (
        text("获赞").findOne(70) ||
        text("关注").findOne(70) ||
        textMatches(/^\+?\s*关注$/).findOne(70) ||
        textMatches(/^已关注$/).findOne(70)
      ) {
        hasStats = true;
      }
    } catch (e3) {}
    return hasDyId && (hasWorks || hasStats);
  }

  var ms = typeof maxMs === "number" && maxMs > 0 ? maxMs : 2200;
  var end = Date.now() + ms;
  while (Date.now() < end && !__scriptUserStop) {
    // 0) 先看是否仍在粉丝列表：只要还能稳定收集到粉丝行，优先视为“未进入主页”。
    // 这可避免列表页同时出现“关注/作品”等文案时被误判为已进入。
    var rows = [];
    try {
      rows = collectFollowerListRowsDeduped();
    } catch (e0) {
      rows = [];
    }
    if (!rows || rows.length === 0) {
      // 1) 列表行已消失，再看主页强特征
      try {
        if (hasStrongFanProfileSignals()) return true;
      } catch (eSig) {}
      // 2) 兼容旧机型：再做分项弱特征兜底
      try {
        if (findFanProfileDouyinIdTextNode(80)) return true; // 抖音号控件 5ny/5me
      } catch (e1) {}
      try {
        if (textMatches(/^抖音号[：:·].+/).findOne(80) || textContains("抖音号").findOne(80)) return true;
      } catch (e2) {}
      try {
        if (
          textMatches(/^作品\s*\d*/).findOne(80) ||
          text("作品").findOne(80) ||
          descMatches(/^作品\s*\d*/).findOne(80) ||
          desc("作品").findOne(80)
        ) {
          return true;
        }
      } catch (e3) {}
      try {
        if (text("获赞").findOne(80) || text("关注").findOne(80)) return true;
      } catch (e4) {}
      // rows 为空但特征没命中：也可能是过渡页，继续等
    }
    sleep(120);
  }
  return false;
}

function sodaFollowerRowAfterOpenWaitMs(logPrefix) {
  if (isSodaPlatformSelected()) {
    if (__sodaStep11FastEnter) return 25;
    return typeof SODA_STEP9_AFTER_OPEN_PROFILE_MS === "number" && SODA_STEP9_AFTER_OPEN_PROFILE_MS > 0
      ? SODA_STEP9_AFTER_OPEN_PROFILE_MS
      : 200;
  }
  return PACE_9_11.step9AfterOpenProfile;
}

function sodaFollowerRowEnterConfirmMs(logPrefix) {
  if (isSodaPlatformSelected()) {
    if (
      __sodaStep11FastEnter &&
      typeof SODA_STEP11_ENTER_CONFIRM_MS === "number" &&
      SODA_STEP11_ENTER_CONFIRM_MS > 0
    ) {
      return SODA_STEP11_ENTER_CONFIRM_MS;
    }
    return typeof SODA_STEP9_ENTER_CONFIRM_MS === "number" && SODA_STEP9_ENTER_CONFIRM_MS > 0
      ? SODA_STEP9_ENTER_CONFIRM_MS
      : 420;
  }
  return 1400;
}

function resolveSodaFollowerRowNickname(node, l0, t0, r0, b0, nickHint) {
  var nick = nickHint ? String(nickHint).trim() : "";
  if (nick) {
    var hinted = normalizeFollowerNicknameForLog(nick);
    if (hinted) return hinted;
  }
  if (node) {
    try {
      var nickTv =
        node.findOne(id(SODA_FOLLOWING_LIST_NICK_ID), 35) ||
        node.findOne(id(SODA_FOLLOWING_LIST_NICK_ALT_ID), 35) ||
        node.findOne(idMatches(/.*:id\/gi8$/), 25) ||
        node.findOne(idMatches(/.*:id\/gja$/), 25);
      if (nickTv) {
        var fromId = normalizeFollowerNicknameForLog(String(nickTv.text() || "").trim());
        if (fromId) return fromId;
      }
    } catch (eGi8) {}
  }
  nick = extractFollowerNicknameFromRow(node, l0, t0, r0, b0);
  if (nick) return nick;
  return extractFollowerNicknameFromRow(null, l0, t0, r0, b0);
}

function tryClickFollowerRowNode(node, l0, t0, r0, b0, logPrefix, nickHint, skipEnterLog) {
  var isSoda = isSodaPlatformSelected();
  var dyEmbedRow = isSoda && isDouyinEmbedFanRowNode(node);
  var nick = "";
  if (isSoda) {
    nick = resolveSodaFollowerRowNickname(node, l0, t0, r0, b0, nickHint);
    if (!nick) nick = extractFollowerNicknameFromRow(node, l0, t0, r0, b0);
    if (!skipEnterLog) appendSodaEnterUserLog(nick || nickHint || "");
  }
  if (isSoda && !dyEmbedRow) {
    node = resolveSodaFollowerListClickRow(node);
    if (!node) return false;
  }
  if (!isSoda) {
    nick = extractFollowerNicknameFromRow(node, l0, t0, r0, b0);
    if (!nick) nick = extractFollowerNicknameFromRow(null, l0, t0, r0, b0);
  }
  if (!node) return false;
  var xBias = isSoda
    ? (typeof SODA_FOLLOWER_ROW_TAP_X_BIAS === "number" ? SODA_FOLLOWER_ROW_TAP_X_BIAS : 0.44)
    : 0.2;
  var afterOpenMs = sodaFollowerRowAfterOpenWaitMs(logPrefix);
  var enterConfirmMs = sodaFollowerRowEnterConfirmMs(logPrefix);
  function logEnterIntent() {
    try {
      var msg = nick ? (logPrefix || "进入：") + nick : (logPrefix || "进入：") + "目标粉丝";
      if (isSoda) {
        appendLogProgress(msg);
      } else {
        appendLog(msg);
      }
    } catch (eL0) {}
  }
  // 汽水内嵌抖音 1xt 行：与火力同款点击，不走 k3o 偏右区
  if (dyEmbedRow) {
    xBias = 0.2;
    var nDy = node;
    var piDy;
    for (piDy = 0; piDy < 3 && nDy; piDy++, nDy = nDy.parent()) {
      try {
        if (nDy.clickable && nDy.clickable()) {
          logEnterIntent();
          if (nDy.click && nDy.click()) {
            sleep(afterOpenMs);
            if (waitForSodaProfileEnteredQuick(enterConfirmMs)) return true;
            return waitForSodaProfileEnteredQuick(Math.max(enterConfirmMs, 520));
          }
        }
      } catch (eDy1) {}
    }
    if (pressFollowerRowNicknameFallback(node, xBias)) {
      sleep(afterOpenMs);
      if (waitForSodaProfileEnteredQuick(enterConfirmMs)) return true;
      return waitForSodaProfileEnteredQuick(Math.max(enterConfirmMs, 520));
    }
    return false;
  }
  // 汽水 k3o 行很宽，父节点 .click() 易偏左/偏中误触悬浮窗×；直接按昵称偏右区点击
  if (!isSoda) {
    var n = node;
    var pi;
    for (pi = 0; pi < 3 && n; pi++, n = n.parent()) {
      try {
        if (n.clickable && n.clickable()) {
          logEnterIntent();
          if (n.click && n.click()) {
            sleep(afterOpenMs);
            return waitForFanProfileEntered(enterConfirmMs);
          }
        }
      } catch (e1) {}
    }
  }
  if (!isSoda) logEnterIntent();
  if (pressFollowerRowNicknameFallback(node, xBias)) {
    sleep(afterOpenMs);
    if (isSoda) {
      if (waitForSodaProfileEnteredQuick(enterConfirmMs)) return true;
      // 进页动画慢：再确认一轮，避免上层坐标兜底在主页误点
      return waitForSodaProfileEnteredQuick(Math.max(enterConfirmMs, 520));
    }
    return waitForFanProfileEntered(enterConfirmMs);
  }
  try {
    appendLog("进入失败，继续下滑");
  } catch (eL1) {}
  return false;
}

/** 粉丝列表：点第一个粉丝进入其主页（首行昵称区多为不可点 ViewGroup，id 常为 1xt） */
function clickFirstFollowerInList() {
  sleep(PACE_9_11.step9LeadIn);
  var l0 = 252,
    t0 = 478,
    r0 = 342,
    b0 = 539;
  var band = followerListYBand();
  __followerVisitedNicks = {};
  __noWorkLikeEntryDidBack = false;
  var node = null;
  var rows = collectFollowerListRowsDeduped();
  if (rows.length > 0) {
    node = rows[0];
  }
  if (!node) {
    try {
      var coll = id("com.ss.android.ugc.aweme:id/1xt").find();
      if (coll && coll.size && coll.size() > 0) {
        var best = null;
        var bestTop = 2147483647;
        for (var i = 0; i < coll.size(); i++) {
          var w = coll.get(i);
          try {
            var b = w.bounds();
            var cy = b.centerY();
            if (cy < band.yMin || cy > band.yMax) continue;
            if (b.top < bestTop) {
              bestTop = b.top;
              best = w;
            }
          } catch (e0) {}
        }
        node = best;
      }
    } catch (e) {}
  }
  if (!node) {
    try {
      node = id("com.ss.android.ugc.aweme:id/1xt").boundsInside(0, band.yMin, device.width, band.yMax).findOne(2000);
    } catch (e2) {}
  }
  if (!node) {
    var pad = 36;
    try {
      node = className("android.view.ViewGroup")
        .boundsInside(l0 - pad, t0 - pad, r0 + 120, b0 + pad)
        .findOne(1500);
    } catch (e3) {}
  }

  var nickBefore = extractFollowerNicknameFromRow(node, l0, t0, r0, b0);
  var visitKey0 = followerRowVisitKey(node, nickBefore);
  if (tryClickFollowerRowNode(node, l0, t0, r0, b0, "进入：")) {
    if (visitKey0) __followerVisitedNicks[visitKey0] = 1;
    tryCaptureAndUploadFanProfileDouyinId();
    return true;
  }

  return false;
}

/** 问道模式第7步：从粉丝关注首行开始（元素识别复用原第9步） */
function clickFirstFollowerInFollowListForWendao() {
  appendLog("选择首行");
  return clickFirstFollowerInList();
}

function runWendaoStep8FanGateUploadThenEnterFansList(maxStep) {
  appendLog("点击粉丝开始（问道）");
  // 规则：
  // 1) 粉丝 <=800 或 >=10000：back 一次 → 回到关注列表 → 第7步选择下一个用户
  // 2) 800~10000 开区间（即 >800 且 <10000）：上传该用户抖音号到「换道」库 → 点击粉丝（约 3s 无跳页则 back 一次并换下一个）
  try {
    ensureScreenCaptureReady(2200);
  } catch (eCap0) {}
  try {
    sleepCtrl(320);
  } catch (eW0) {}
  var MAX_TRIES = 60;
  for (var t = 0; t < MAX_TRIES && !__scriptUserStop; t++) {
    var fansN = null;
    try {
      fansN = readFanProfilePageFansCountInt();
    } catch (e0) {
      fansN = null;
    }
    if (!(typeof fansN === "number" && Number.isFinite(fansN))) {
      appendLog("问道：未读到粉丝数，返回换下一个");
      try { back(); } catch (eB0) {}
      sleepCtrl(500);
      if (!clickNextFollowerInList()) return false;
      sleepCtrl(520);
      continue;
    }
    if (fansN <= 800 || fansN >= 10000) {
      appendLog("返回换下一个");
      try { back(); } catch (eB1) {}
      sleepCtrl(500);
      if (!clickNextFollowerInList()) return false;
      sleepCtrl(520);
      continue;
    }

    var dyid = null;
    try {
      dyid = readDouyinIdFromFanProfilePage();
    } catch (e1) {
      dyid = null;
    }
    if (dyid && !isValidDouyinIdForUpload(dyid)) {
      appendLog("T-G");
      dyid = null;
    }
    if (dyid) {
      var rs = postAppendDouyinIdToServerDbWithDao(dyid, "huandao");
      if (rs && rs.ok) {
        if (rs.added) appendLog("C-G");
        else if (rs.duplicate) appendLog("C-F");
      } else {
        var sbWhy = "";
        try {
          if (rs && rs.reason != null && String(rs.reason).trim()) sbWhy = String(rs.reason).trim();
        } catch (eSb) {}
        appendLog(sbWhy ? "S-B " + sbWhy : "S-B");
      }
    } else {
      appendLog("问道：未读到抖音号，仍继续点粉丝");
    }

    // 点粉丝进入粉丝列表；若 3s 无跳页（内部会 back 并置标志），则换下一个
    __fansTapNoNavigationReselect = false;
    var okFansTap = false;
    try {
      okFansTap = clickFansOnTargetProfile();
    } catch (e2) {
      okFansTap = false;
    }
    if (!okFansTap || __fansTapNoNavigationReselect) {
      appendLog("问道：点粉丝未进列表，换下一个");
      // clickFansOnTargetProfile 的 waitForFollowerListEnterOrTimeout 里可能已 back；这里不重复 back，直接尝试点下一行
      sleepCtrl(520);
      if (!clickNextFollowerInList()) return false;
      sleepCtrl(520);
      continue;
    }
    // 成功进入粉丝列表后，按原流程继续第9步
    if (maxStep) handleEmptyFollowerListByReselect(maxStep);
    return true;
  }
  appendLog("问道：第8步多次换人仍失败，终止本轮");
  return false;
}

/**
 * 是否已在「他人粉丝用户主页」（有抖音号 + 作品/统计区），而非粉丝列表。
 * 用于避免：主页作品网格也有 id=container，被误判为「要返回列表」；或在主页上采不到行时疯狂「粉丝列表下滑」。
 */
function isLikelyOnFanUserProfilePageQuick() {
  try {
    var hasDyId = false;
    var hasWorks = false;
    var hasStats = false;
    try {
      if (findFanProfileDouyinIdTextNode(120)) hasDyId = true;
    } catch (e0) {}
    if (!hasDyId) {
      try {
        if (
          textMatches(/^抖音号[：:·].+/).findOne(120) ||
          textContains("抖音号").findOne(120)
        ) {
          hasDyId = true;
        }
      } catch (e1) {}
    }
    try {
      if (
        textMatches(/^作品\s*\d*/).findOne(120) ||
        text("作品").findOne(120) ||
        descMatches(/^作品\s*\d*/).findOne(120) ||
        desc("作品").findOne(120)
      ) {
        hasWorks = true;
      }
    } catch (e2) {}
    try {
      if (
        text("获赞").findOne(120) ||
        text("关注").findOne(120) ||
        textMatches(/^\+?\s*关注$/).findOne(120) ||
        textMatches(/^已关注$/).findOne(120)
      ) {
        hasStats = true;
      }
    } catch (e3) {}
    return hasDyId && (hasWorks || hasStats);
  } catch (e) {}
  return false;
}

/**
 * 若当前在个人主页等页面，粉丝行采集为空；此时应先返回粉丝列表再点「下一行」，否则会误触「粉丝列表下滑」刷屏。
 * 真·空粉丝列表页（isFollowerListEffectivelyEmpty）不返回，避免误 back 离开列表。
 * 疑似主页：能采到作品格 container（网格）时优先认为在他人主页而非列表。
 */
function tryEnsureBackToFanListIfNoFollowerRowsVisible() {
  try {
    if (collectFollowerListRowsDeduped().length > 0) return;
    if (isFollowerListEffectivelyEmpty()) return;
    // 已在真实粉丝用户主页：不要用作品区 container 做「疑似主页」误触返回（作品网格也有 container）
    try {
      if (isLikelyOnFanUserProfilePageQuick()) return;
    } catch (ePf) {}
    var suspectProfile = false;
    try {
      var g0 = id("com.ss.android.ugc.aweme:id/container").findOne(160);
      if (g0) suspectProfile = true;
    } catch (eG) {}
    if (!suspectProfile) return;
    appendLog("返回粉丝列表");
    try {
      back();
    } catch (e0) {}
    sleepCtrl(450);
    if (collectFollowerListRowsDeduped().length > 0) return;
    try {
      back();
    } catch (e1) {}
    sleepCtrl(450);
  } catch (e2) {}
}

/** 粉丝列表：点下一个未访问过的粉丝；当前屏没有则下滑再扫，可加载更多 */
function clickNextFollowerInList() {
  if (__scriptUserStop) return false;
  tryEnsureBackToFanListIfNoFollowerRowsVisible();
  // 第10步失败后仍停在粉丝用户主页：采不到列表行，先 back 回列表再点下一行，禁止在主页上无效下滑
  try {
    if (collectFollowerListRowsDeduped().length === 0 && isLikelyOnFanUserProfilePageQuick()) {
      try {
        back();
      } catch (eBkPf) {}
      sleepCtrl(520);
    }
  } catch (eRowPf) {}
  sleepCtrl(PACE_9_11.nextFollowerLeadIn);
  var l0 = 252,
    t0 = 478,
    r0 = 342,
    b0 = 539;
  var maxSwipes =
    typeof PACE_9_11.fanListScrollSwipesBeforeRestart === "number" &&
    PACE_9_11.fanListScrollSwipesBeforeRestart >= 0
      ? Math.floor(PACE_9_11.fanListScrollSwipesBeforeRestart)
      : 5;
  // pass0=首屏不滑；pass1..maxSwipes=下滑 maxSwipes 次
  var maxScrollPasses = maxSwipes + 1;
  for (var pass = 0; pass < maxScrollPasses; pass++) {
    if (__scriptUserStop) return false;
    if (pass > 0) {
      appendLog("粉丝列表下滑");
      scrollFollowerListDown();
      sleepCtrl(PACE_9_11.followerListScroll);
    }
    var rows = collectFollowerListRowsDeduped();
    if (!rows.length) continue;
    for (var i = 0; i < rows.length; i++) {
      var cand = rows[i];
      var nick = extractFollowerNicknameFromRow(cand, l0, t0, r0, b0);
      var vk = followerRowVisitKey(cand, nick);
      if (!vk) continue;
      if (__followerVisitedNicks[vk]) continue;
      if (tryClickFollowerRowNode(cand, l0, t0, r0, b0, "进入：")) {
        __followerVisitedNicks[vk] = 1;
        __noWorkLikeEntryDidBack = false;
        tryCaptureAndUploadFanProfileDouyinId();
        return true;
      }
    }
  }
  appendLog("粉丝列表下滑" + maxSwipes + "次仍无新行，重启获取新对标");
  try {
    requestStuckRestart("粉丝列表下滑多次仍无新行，重启脚本获取新对标");
  } catch (eRs) {}
  return false;
}

/** 问道模式：按概率随机下滑 0/1/2 次后，仅从当前屏随机选择 1 个。 */
function clickFirstUnpickedFollowerInListForWendao() {
  if (__scriptUserStop) return false;
  var l0 = 252,
    t0 = 478,
    r0 = 342,
    b0 = 539;
  var rr = Math.random();
  var downTimes = rr < 0.5 ? 0 : rr < 0.8 ? 1 : 2; // 0=50%, 1=30%, 2=20%
  for (var pass = 0; pass < downTimes; pass++) {
    if (__scriptUserStop) return false;
    appendLog("粉丝列表下滑");
    scrollFollowerListDown();
    sleepCtrl(PACE_9_11.followerListScroll);
  }
  var rows = collectFollowerListRowsDeduped();
  var candidates = [];
  if (rows && rows.length > 0) {
    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var nick = extractFollowerNicknameFromRow(row, l0, t0, r0, b0);
      var key = normalizeFollowerNickKey(nick) || followerRowVisitKey(row, nick) || ("row_" + i);
      candidates.push({ row: row, key: key });
    }
  }
  if (!candidates.length) {
    appendLog("粉丝列表无可选用户");
    return false;
  }
  var lastPickKey = "";
  try {
    lastPickKey = String(__stats.get(__WENDAO_LAST_PICK_KEY, "") || "");
  } catch (eLast0) {
    lastPickKey = "";
  }
  var pool = candidates;
  if (lastPickKey && candidates.length > 1) {
    var filtered = [];
    for (var p = 0; p < candidates.length; p++) {
      if (String(candidates[p].key) === lastPickKey) continue;
      filtered.push(candidates[p]);
    }
    if (filtered.length > 0) pool = filtered;
  }
  var order = [];
  for (var j = 0; j < pool.length; j++) order.push(j);
  for (var k = order.length - 1; k > 0; k--) {
    var ri = Math.floor(Math.random() * (k + 1));
    var tmp = order[k];
    order[k] = order[ri];
    order[ri] = tmp;
  }
  for (var m = 0; m < order.length; m++) {
    var cand = pool[order[m]];
    if (tryClickFollowerRowNode(cand.row, l0, t0, r0, b0, "进入：")) {
      try { __stats.put(__WENDAO_LAST_PICK_KEY, String(cand.key || "")); } catch (eLast1) {}
      return true;
    }
  }
  appendLog("粉丝列表随机选择失败");
  return false;
}

/**
 * 从点赞数/赞条等子节点向上找封面格 bounds（约一列宽、高度像缩略图）。
 */
function findWorkGridCellBoundsFromAnchor(node) {
  if (!node) return null;
  var sw = device.width;
  var wMin = Math.floor(sw * 0.19);
  var wMax = Math.ceil(sw * 0.76);
  var hMin = Math.floor(sw * 0.16);
  var hMax = Math.ceil(sw * 1.35);
  var n = node;
  var best = null;
  var bestArea = 0;
  for (var i = 0; i < 22 && n; i++, n = n.parent()) {
    try {
      var b = n.bounds();
      var bw = b.width();
      var bh = b.height();
      if (bw < wMin || bw > wMax) continue;
      if (bh < hMin || bh > hMax) continue;
      var a = bw * bh;
      if (a > bestArea) {
        bestArea = a;
        best = b;
      }
    } catch (e0) {}
  }
  return best;
}

/**
 * 网格上点心形/数字旁常只触发「站外赞」不进全屏播；优先点封面中上以进入播放页，供第11步识别 gln。
 */
function clickEnterDouyinWorkFromGridAnchor(anchorNode) {
  if (!anchorNode) return false;
  var b = findWorkGridCellBoundsFromAnchor(anchorNode);
  if (!b) {
    try {
      b = anchorNode.bounds();
      if (b.width() < 12 || b.height() < 12) return false;
    } catch (e) {
      return false;
    }
  }
  try {
    var cx = b.centerX();
    var cy = b.top + Math.floor(b.height() * 0.36);
    var yFloor = Math.floor(device.height * 0.11);
    if (cy < yFloor) cy = yFloor;
    try {
      click(cx, cy);
    } catch (e1) {
      press(cx, cy, 110);
    }
    sleep(580);
    return true;
  } catch (e2) {
    return false;
  }
}

/** 作品网格里「点赞数」TextView 往往不可点，心形在数字左侧；多向上层找 clickable，再对左侧区域按压 */
function clickDouyinWorkLikeNearCountNode(node) {
  if (!node) return false;
  var n = node;
  for (var i = 0; i < 14 && n; i++, n = n.parent()) {
    try {
      if (n.clickable && n.clickable() && n.click && n.click()) return true;
  } catch (e) {}
  }
  try {
    var b = node.bounds();
    var off = Math.min(120, Math.max(52, Math.floor(device.width * 0.1)));
    var cx = Math.max(16, b.left - off);
    var cy = b.centerY();
    try {
      click(cx, cy);
    } catch (e3) {
      press(cx, cy, 100);
    }
    sleep(350);
    return true;
  } catch (e2) {
    return false;
  }
}

/** 小心心外层 LinearLayout（id 44g）：整条互动区里心形偏左，点在条内约左 22% 处 */
function clickDouyinWorkLikeCellLayout(node) {
  if (!node) return false;
  var n = node;
  for (var i = 0; i < 14 && n; i++, n = n.parent()) {
    try {
      if (n.clickable && n.clickable() && n.click && n.click()) return true;
    } catch (e) {}
  }
  try {
    var b = node.bounds();
    var cx = b.left + Math.max(20, Math.floor(b.width() * 0.22));
    var cy = b.centerY();
    try {
      click(cx, cy);
    } catch (e3) {
      press(cx, cy, 100);
    }
    sleep(350);
      return true;
  } catch (e2) {
    return false;
  }
}

/** 封面格内取「点赞数」文案，仅作进入作品日志的附带说明 */
function likeHintInsideWorkContainer(container) {
  try {
    var b = container.bounds();
    var tv = id("com.ss.android.ugc.aweme:id/3f6")
      .boundsInside(b.left + 1, b.top + 1, b.right - 1, b.bottom - 1)
      .findOne(220);
    if (tv) {
      var d = tv.desc && tv.desc();
      if (d) return String(d).replace(/\s+/g, "");
      var tx = tv.text && tv.text();
      if (tx) return "赞" + String(tx);
    }
  } catch (e) {}
  return "";
}

/** 整格封面 id container：心形在左下角；格内若有 44g 优先点条，否则直接压左下角（勿整格 clickNode，易进播放） */
function clickDouyinWorkContainerHeart(container) {
  if (!container) return false;
  try {
    var b = container.bounds();
    var bar = null;
    try {
      bar = id("com.ss.android.ugc.aweme:id/44g")
        .boundsInside(b.left + 2, b.top + 2, b.right - 2, b.bottom - 2)
        .findOne(380);
    } catch (e0) {}
    if (bar) {
      if (clickDouyinWorkLikeCellLayout(bar)) return true;
    }
    var cx = b.left + Math.max(26, Math.floor(b.width() * 0.14));
    var cy = b.bottom - Math.max(30, Math.floor(b.height() * 0.11));
    try {
      click(cx, cy);
    } catch (e1) {
      press(cx, cy, 100);
    }
    sleep(380);
    return true;
  } catch (e2) {
  return false;
  }
}

/** 按屏幕上「先上后下、同行从左到右」排序，与肉眼数的第几个一致（DOM 顺序常乱） */
function sortWorkContainersVisualOrder(arr) {
  var slop = Math.max(28, Math.floor(device.height * 0.028));
  var items = [];
  for (var i = 0; i < arr.length; i++) {
    try {
      var b = arr[i].bounds();
      items.push({ n: arr[i], t: b.top, l: b.left });
    } catch (e0) {
      items.push({ n: arr[i], t: 1e7, l: 1e7 });
    }
  }
  items.sort(function (x, y) {
    if (Math.abs(x.t - y.t) > slop) return x.t - y.t;
    return x.l - y.l;
  });
  var out = [];
  for (var j = 0; j < items.length; j++) out.push(items[j].n);
  return out;
}

/**
 * 企业/蓝 V 常默认在「商家」Tab；普通号也可能默认在「喜欢」等。只要当前屏还收不到作品网格 container，则尝试切到「作品」。
 */
function ensureDouyinProfileWorksTab() {
  function clickWorksTabNode() {
    try {
      var n =
        textMatches(/^作品\s*\d*$/).findOne(260) ||
        text("作品").findOne(220) ||
        descMatches(/^作品\s*\d*$/).findOne(220) ||
        desc("作品").findOne(220);
      if (n) {
        if (clickNode(n)) return true;
        try {
          var b = n.bounds();
          click(b.centerX(), b.centerY());
          return true;
        } catch (eN0) {}
      }
    } catch (eN1) {}
    return false;
  }
  function isWorksTabSelected() {
    try {
      var w =
        textMatches(/^作品\s*\d*/).findOne(150) ||
        text("作品").findOne(120) ||
        descMatches(/^作品\s*\d*/).findOne(120) ||
        desc("作品").findOne(120);
      if (!w) return false;
      try {
        if (typeof w.selected === "function" && w.selected()) return true;
      } catch (eS0) {}
      // 兜底：作品网格已出现，说明已在作品区，不再补点
      try {
        if (collectVisibleWorksGridContainers().length > 0) return true;
      } catch (eS1) {}
    } catch (e0) {}
    return false;
  }
  function selectedNonWorksTab() {
    try {
      var n;
      n = textMatches(/^(橱窗|日常|商家|商品|喜欢)$/).findOne(120) || descMatches(/^(橱窗|日常|商家|商品|喜欢)$/).findOne(120);
      if (n) {
        try {
          if (typeof n.selected === "function" && n.selected()) return true;
        } catch (eS2) {}
      }
      } catch (e1) {}
    return false;
  }
  function waitWorksGridBriefly(maxMs) {
    var endAt = Date.now() + (maxMs == null ? 700 : maxMs);
    while (Date.now() < endAt && !__scriptUserStop) {
      try {
        if (collectVisibleWorksGridContainers().length > 0) return true;
      } catch (eW0) {}
      sleepCtrl(110);
    }
    return false;
  }

  try {
    // 先短等网格出现，避免刚进主页尚未渲染时误点作品 tab
    if (waitWorksGridBriefly(700)) return true;
  } catch (eC0) {}
  try {
    if (isWorksTabSelected()) return true;
  } catch (eC1) {}
  try {
    // 若无法明确判断为“非作品 tab 被选中”，则不主动点击，减少多余点击
    if (!selectedNonWorksTab()) return true;
  } catch (eC2) {}
  try {
    if (!clickWorksTabNode()) {
      // 节点失败再坐标兜底（作品通常在统计 Tab 行偏左）
      var sw = device.width;
      var sh = device.height;
      click(sw * 0.23, sh * 0.92);
    }
    sleepCtrl(360);
    return true;
  } catch (e0) {}
  return false;
}

/**
 * 图文作品角标（多在封面右上角、叠图小 ImageView，多为 clickable=false）。
 * 当前版抖音常见 id 为 l-x（含连字符），启发式正则会单独匹配；其他版本可继续往数组里加完整 id。
 */
var DY_GRAPHIC_TEXT_IMAGE_VIEW_IDS = ["com.ss.android.ugc.aweme:id/l-x"];

/** 某格 container 内是否像「图文」作品（右上角叠图角标 / 无障碍文案） */
function workContainerIsGraphicText(container) {
  if (!container) return false;
  try {
    var b = container.bounds();
    var pad = 2;
    var left = b.left + pad,
      top = b.top + pad,
      right = b.right - pad,
      bottom = b.bottom - pad;
    var i, n;
    for (i = 0; i < DY_GRAPHIC_TEXT_IMAGE_VIEW_IDS.length; i++) {
      try {
        n = id(DY_GRAPHIC_TEXT_IMAGE_VIEW_IDS[i]).boundsInside(left, top, right, bottom).findOne(350);
        if (n) return true;
      } catch (e0) {}
    }
    var coll = className("android.widget.ImageView")
      .packageName("com.ss.android.ugc.aweme")
      .boundsInside(left, top, right, bottom)
      .find();
    if (!coll || !coll.size) return false;
    // 角标一般在封面「右上角」：中心偏右 + 偏上（叠图小方块图标）
    var xRightMin = b.left + Math.floor(b.width() * 0.45);
    var yTopMax = b.top + Math.floor(b.height() * 0.4);
    for (i = 0; i < coll.size(); i++) {
      n = coll.get(i);
      try {
        var desc = n.desc && n.desc();
        if (desc && String(desc).indexOf("图文") >= 0) return true;
        var ib = n.bounds();
        var w = ib.width(),
          h = ib.height();
        if (w < 40 || w > 92 || h < 40 || h > 92) continue;
        if (ib.centerX() < xRightMin) continue;
        if (ib.centerY() > yTopMax) continue;
        var isClick = false;
        try {
          isClick = !!(n.clickable && n.clickable());
        } catch (e1) {}
        if (isClick) continue;
        var idStr = n.id && n.id();
        if (!idStr) continue;
        var short = idStr.replace(/^.*?:id\//, "");
        // 抖音图文角标常为 l-x（连字符不在 [a-z0-9_] 内，曾被漏判）
        if (short === "l-x") return true;
        if (/^l[a-z0-9_]{1,5}$/i.test(short)) return true;
      } catch (e2) {}
    }
  } catch (e3) {}
  return false;
}

/** 去掉图文格；若原列表非空且过滤后为空则 allGraphic 为 true */
function filterNonGraphicWorkContainers(containers) {
  var ok = [];
  if (!containers || !containers.length) return { list: [], allGraphic: false };
  for (var i = 0; i < containers.length; i++) {
    if (!workContainerIsGraphicText(containers[i])) ok.push(containers[i]);
  }
  return {
    list: ok,
    allGraphic: ok.length === 0,
  };
}

function workOutContainsNode(arr, node) {
  for (var wi = 0; wi < arr.length; wi++) {
    if (arr[wi] === node) return true;
  }
  return false;
}

function workContainerCenterInsideAnyNodeBounds(cx, cy, nodes) {
  for (var wi = 0; wi < nodes.length; wi++) {
    try {
      var bk = nodes[wi].bounds();
      if (cx >= bk.left && cx <= bk.right && cy >= bk.top && cy <= bk.bottom) return true;
    } catch (e0) {}
  }
  return false;
}

/**
 * 同一封面常有多个 id/container（内外层）；内层 bounds 常不含左下角赞条，导致像素/无障碍都漏判已赞。
 * 保留「面积更大且能包住其它格中心」的节点，去掉被包住的较小重复项。
 */
function dedupeWorkContainersKeepLargestCovering(containers) {
  if (!containers || containers.length <= 1) return containers;
  var scored = [];
  var si;
  for (si = 0; si < containers.length; si++) {
    var node = containers[si];
    try {
      var b = node.bounds();
      scored.push({ n: node, b: b, a: b.width() * b.height() });
    } catch (e0) {
      scored.push({ n: node, a: 0 });
    }
  }
  scored.sort(function (x, y) {
    return y.a - x.a;
  });
  var kept = [];
  for (si = 0; si < scored.length; si++) {
    var item = scored[si];
    if (!item.b) {
      kept.push(item);
      continue;
    }
    var cx = item.b.centerX();
    var cy = item.b.centerY();
    var swallowed = false;
    var ki;
    for (ki = 0; ki < kept.length; ki++) {
      var kb = kept[ki].b;
      if (!kb) continue;
      try {
        if (
          cx >= kb.left &&
          cx <= kb.right &&
          cy >= kb.top &&
          cy <= kb.bottom &&
          item.a < kept[ki].a * 0.92
        ) {
          swallowed = true;
          break;
        }
      } catch (e1) {}
    }
    if (!swallowed) kept.push(item);
  }
  var out = [];
  for (ki = 0; ki < kept.length; ki++) out.push(kept[ki].n);
  return sortWorkContainersVisualOrder(out);
}

/**
 * 作品格节点：全包名 id 与 idMatches 双路（部分机型/新版布局 find 其一为空）。
 */
function findWorkContainerNodesRaw() {
  var coll = null;
  try {
    coll = id("com.ss.android.ugc.aweme:id/container").find();
  } catch (e0) {}
  if (!coll || !coll.size) {
    try {
      coll = idMatches(/.*:id\/container$/).find();
    } catch (e1) {}
  }
  // 打包环境下，部分机型仅短 id 可命中
  if (!coll || !coll.size) {
    try {
      coll = id("container").find();
    } catch (e2) {}
  }
  return coll && coll.size ? coll : null;
}

/** 通过 3f6/44g 等锚点向上找作品格容器（打包环境下常比直接找 container 稳） */
function pushWorkContainersFromAnchorCollection(out, coll, minW, maxW, minH, yHeader, sh) {
  if (!out || !coll || !coll.size) return;
  for (var i = 0; i < coll.size(); i++) {
    var a = coll.get(i);
    var cell = findWorkGridCellBoundsFromAnchor(a);
    if (!cell) continue;
    try {
      var bw = cell.width(),
        bh = cell.height();
      if (bw < minW || bw > maxW) continue;
      if (bh < minH) continue;
      if (cell.top < yHeader) continue;
      if (cell.bottom < 48 || cell.centerY() < 0 || cell.centerY() > sh) continue;
      if (workContainerCenterInsideAnyNodeBounds(cell.centerX(), cell.centerY(), out)) continue;
      out.push(a);
    } catch (e0) {}
  }
}

// （精简版已移除：collectWorksByDesc/collectWorksByBounds/tryClickWorkByTextViewDigitsHeuristic/tryClickWorkGridRandomCoordFallback 等节点相关“找作品”逻辑）

function workGridPixelSampleLooksLikeCover(img, cx, cy, sw, sh) {
  try {
    if (!img || typeof images === "undefined" || !images.pixel) return false;
    var pts = [
      [0, 0],
      [-18, -18],
      [18, -18],
      [-18, 18],
      [18, 18],
      [-26, 0],
      [26, 0],
      [0, -26],
      [0, 26],
    ];
    var base = null;
    var diff = 0;
    var i;
    for (i = 0; i < pts.length; i++) {
      var x = Math.max(0, Math.min(sw - 1, cx + pts[i][0]));
      var y = Math.max(0, Math.min(sh - 1, cy + pts[i][1]));
      var c = images.pixel(img, x, y);
      var n = typeof c === "number" ? c >>> 0 : 0;
      var rv = (n >> 16) & 0xff;
      var gv = (n >> 8) & 0xff;
      var bv = n & 0xff;
      if (!base) {
        base = { r: rv, g: gv, b: bv };
      } else {
        // 近似曼哈顿距离；封面一般纹理/颜色变化明显
        diff += Math.abs(rv - base.r) + Math.abs(gv - base.g) + Math.abs(bv - base.b);
      }
    }
    return diff >= 380;
  } catch (e0) {
    return false;
  }
}

function workGridPixelSampleLooksLikeHeartAt(img, hx, hy, sw, sh) {
  try {
    if (!img || typeof images === "undefined" || !images.pixel) return false;
    var pts = [
      [0, 0],
      [-10, -10],
      [0, -10],
      [10, -10],
      [-10, 0],
      [10, 0],
      [-10, 10],
      [0, 10],
      [10, 10],
      [-16, 0],
      [16, 0],
      [0, -16],
      [0, 16],
    ];
    var white = 0;
    var red = 0;
    var total = 0;
    for (var i = 0; i < pts.length; i++) {
      var x = Math.max(0, Math.min(sw - 1, hx + pts[i][0]));
      var y = Math.max(0, Math.min(sh - 1, hy + pts[i][1]));
      if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
      total++;
      var c = images.pixel(img, x, y);
      var n = typeof c === "number" ? c >>> 0 : 0;
      var rv = (n >> 16) & 0xff;
      var gv = (n >> 8) & 0xff;
      var bv = n & 0xff;
      if (rv > 212 && gv > 212 && bv > 212) white++;
      if (workGridHeartPixelLooksSolidUiRed(rv, gv, bv)) red++;
    }
    if (total < 6) return false;
    // 既允许“白色空心心”也允许“红色实心心”（两者都能定位到作品格左下角）
    if (red >= 2) return true;
    var wr = white / total;
    return wr >= 0.18;
  } catch (e0) {
    return false;
  }
}

function workGridPixelCenterLooksLikeCoverTexture(img, cx, cy, sw, sh) {
  try {
    if (!img || typeof images === "undefined" || !images.pixel) return false;
    // 采样中心周围 5x5（步长10），用颜色差异判断是否“有内容”
    var pts = [];
    for (var dx = -20; dx <= 20; dx += 10) {
      for (var dy = -20; dy <= 20; dy += 10) {
        pts.push([dx, dy]);
      }
    }
    var base = null;
    var diff = 0;
    var used = 0;
    for (var i = 0; i < pts.length; i++) {
      var x = Math.max(0, Math.min(sw - 1, cx + pts[i][0]));
      var y = Math.max(0, Math.min(sh - 1, cy + pts[i][1]));
      var c = images.pixel(img, x, y);
      var n = typeof c === "number" ? c >>> 0 : 0;
      var rv = (n >> 16) & 0xff;
      var gv = (n >> 8) & 0xff;
      var bv = n & 0xff;
      if (!base) {
        base = { r: rv, g: gv, b: bv };
      } else {
        used++;
        diff += Math.abs(rv - base.r) + Math.abs(gv - base.g) + Math.abs(bv - base.b);
      }
    }
    if (used < 6) return false;
    // 降低阈值：避免漏检（按钮区仍倾向低纹理差异）
    return diff >= 350;
  } catch (e0) {
    return false;
  }
}

function workGridWhiteRatioAt(img, cx, cy, sw, sh, halfSize, step, whiteMin) {
  try {
    if (!img || typeof images === "undefined" || !images.pixel) return 0;
    halfSize = typeof halfSize === "number" ? halfSize : 10;
    step = typeof step === "number" ? step : 4;
    whiteMin = typeof whiteMin === "number" ? whiteMin : 210;
    var white = 0;
    var total = 0;
    for (var dx = -halfSize; dx <= halfSize; dx += step) {
      for (var dy = -halfSize; dy <= halfSize; dy += step) {
        var x = Math.max(0, Math.min(sw - 1, cx + dx));
        var y = Math.max(0, Math.min(sh - 1, cy + dy));
        var c = images.pixel(img, x, y);
        var n = typeof c === "number" ? c >>> 0 : 0;
        var rv = (n >> 16) & 0xff;
        var gv = (n >> 8) & 0xff;
        var bv = n & 0xff;
        total++;
        if (rv >= whiteMin && gv >= whiteMin && bv >= whiteMin) white++;
      }
    }
    if (total < 1) return 0;
    return white / total;
  } catch (e0) {
    return 0;
  }
}

function workGridLightTextRatioAt(img, cx, cy, sw, sh) {
  try {
    if (!img || typeof images === "undefined" || !images.pixel) return 0;
    var halfSize = 12;
    var step = 4;
    var hit = 0;
    var total = 0;
    for (var dx = -halfSize; dx <= halfSize; dx += step) {
      for (var dy = -halfSize; dy <= halfSize; dy += step) {
        var x = Math.max(0, Math.min(sw - 1, cx + dx));
        var y = Math.max(0, Math.min(sh - 1, cy + dy));
        var c = images.pixel(img, x, y);
        var n = typeof c === "number" ? c >>> 0 : 0;
        var rv = (n >> 16) & 0xff;
        var gv = (n >> 8) & 0xff;
        var bv = n & 0xff;
        total++;
        // 白色/亮灰文字
        if (rv >= 215 && gv >= 215 && bv >= 215) {
          hit++;
          continue;
        }
        // 浅黄/金色文字（抖音点赞数偶发用浅黄）
        if (rv >= 210 && gv >= 185 && bv >= 110 && rv >= gv - 24 && gv >= bv - 40) {
          hit++;
          continue;
        }
      }
    }
    if (total < 1) return 0;
    return hit / total;
  } catch (e0) {
    return 0;
  }
}

function workGridEdgeStrengthAt(img, cx, cy, sw, sh) {
  try {
    if (!img || typeof images === "undefined" || !images.pixel) return 0;
    var sum = 0;
    var n = 0;
    // 采样 5x5 点，每点看水平相邻像素差异，近似边缘密度
    for (var dx = -8; dx <= 8; dx += 4) {
      for (var dy = -8; dy <= 8; dy += 4) {
        var x1 = Math.max(0, Math.min(sw - 2, cx + dx));
        var y1 = Math.max(0, Math.min(sh - 1, cy + dy));
        var x2 = x1 + 4;
        var c1 = images.pixel(img, x1, y1);
        var c2 = images.pixel(img, x2, y1);
        var n1 = typeof c1 === "number" ? c1 >>> 0 : 0;
        var n2 = typeof c2 === "number" ? c2 >>> 0 : 0;
        var r1 = (n1 >> 16) & 0xff,
          g1 = (n1 >> 8) & 0xff,
          b1 = n1 & 0xff;
        var r2 = (n2 >> 16) & 0xff,
          g2 = (n2 >> 8) & 0xff,
          b2 = n2 & 0xff;
        sum += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
        n++;
      }
    }
    if (n < 1) return 0;
    return sum / n;
  } catch (e0) {
    return 0;
  }
}

/**
 * 用“文字边缘密度”定位两行作品：每列扫描 Y，找到边缘强度高的文字带（通常是点赞数/标题），再向上偏移点击封面。
 * 返回 [{x,y,row,col}]
 */
function findWorkCoverPositionsByTextEdgePixels(wgBand) {
  var out = [];
  try {
    if (typeof images === "undefined" || !images.pixel) return out;
  var sw = device.width;
  var sh = device.height;
    var band = wgBand || profileWorkGridYBand();
    var img = captureScreenOnceForWorkGridProbe(WORK_GRID_PROBE_BUDGET_QUICK_MS);
    if (!img) return out;
    try {
      var yMin = Math.max(band.yMin, Math.floor(sh * 0.42));
      var yMax = Math.min(band.yMax, Math.floor(sh * 0.9));
      if (yMin >= yMax) return out;
      var colXs = [Math.floor(sw * 0.17), Math.floor(sw * 0.5), Math.floor(sw * 0.83)];
      var colHits = [[], [], []];
      for (var y = yMin; y <= yMax; y += 10) {
        for (var col = 0; col < colXs.length; col++) {
          var x = colXs[col];
          var edge = workGridEdgeStrengthAt(img, x, y, sw, sh);
          if (edge >= 26) {
            colHits[col].push(y);
          }
        }
      }
      // 聚类：间隔 > 40 认为是新段，取每列前两段的中心作为“文字带”
      var rows = [];
      for (var c = 0; c < colHits.length; c++) {
        var arr = colHits[c];
        if (!arr || arr.length === 0) continue;
        arr.sort(function (a, b) {
          return a - b;
        });
        var segs = [];
        var s = arr[0],
          last = arr[0];
        for (var i = 1; i < arr.length; i++) {
          if (arr[i] - last > 40) {
            segs.push({ top: s, bottom: last });
            s = arr[i];
          }
          last = arr[i];
        }
        segs.push({ top: s, bottom: last });
        for (var si = 0; si < segs.length && si < 2; si++) {
          var midY = Math.floor((segs[si].top + segs[si].bottom) / 2);
          rows.push({ col: c, textY: midY });
        }
      }
      if (rows.length < 2) return out;
      // 生成点击点：文字带通常在封面下方/底部附近，向上偏移点击封面
      for (var r = 0; r < rows.length; r++) {
        var col = rows[r].col;
        var textY = rows[r].textY;
        var clickY = textY - 110;
        clickY = Math.max(clickY, textY - 170);
        clickY = Math.min(clickY, textY - 60);
        out.push({ x: colXs[col], y: clickY, row: r, col: col });
      }
    } finally {
      try {
        img.recycle();
      } catch (eR) {}
    }
  } catch (e1) {}
  return out;
}

function findWorkCoverPositionsByImageView(wgBand) {
  var out = [];
  try {
    var coll = null;
    try {
      coll = className("android.widget.ImageView").find();
    } catch (e0) {
      coll = null;
    }
    if (!coll || !coll.size) return out;

    var sw = device.width;
    var sh = device.height;
    var band = wgBand || profileWorkGridYBand();
    var yMin = Math.max(band.yMin, Math.floor(sh * 0.35));
    var yMax = Math.min(band.yMax, Math.floor(sh * 0.82));
    var min = Math.floor(sw * 0.22);
    var max = Math.floor(sw * 0.38);

    var tmp = [];
    var lim = Math.min(coll.size(), 800);
    for (var i = 0; i < lim; i++) {
      var iv = coll.get(i);
      try {
        var b = iv.bounds();
        var w = b.width();
        var h = b.height();
        var cy = b.centerY();
        if (cy < yMin || cy > yMax) continue;
        if (w < min || w > max) continue;
        if (h < min || h > max) continue;
        var aspect = w / Math.max(1, h);
        if (aspect < 0.82 || aspect > 1.18) continue;
        // 点击封面中部（略偏上），更稳进作品
        var clickY = b.top + Math.floor(h * 0.45);
        tmp.push({ x: b.centerX(), y: clickY, t: b.top, l: b.left, w: w, h: h });
      } catch (e1) {}
    }
    if (!tmp.length) return out;
    // 去重：按大致网格位置（行/列）聚合
    tmp.sort(function (a, b) {
      if (Math.abs(a.t - b.t) > 18) return a.t - b.t;
      return a.l - b.l;
    });
    var seen = {};
    for (var k = 0; k < tmp.length; k++) {
      var key = Math.round(tmp[k].l / 20) + "_" + Math.round(tmp[k].t / 24);
      if (seen[key]) continue;
      seen[key] = 1;
      out.push({ x: tmp[k].x, y: tmp[k].y });
    }
    // 只取首屏前 6 个
    if (out.length > 6) out = out.slice(0, 6);
  } catch (e2) {}
  return out;
}

/**
 * 用作品网格 container 直接取点击点：
 * - 适配“只有一个作品且靠左”的页面，不依赖 3 列像素统计；
 * - 仅在作品纵向带内取近似方形格，避免误点到头图/按钮区。
 */
function findWorkCoverPositionsByContainerNodes(wgBand) {
  var out = [];
  try {
    var coll = findWorkContainerNodesRaw();
    if (!coll || !coll.size) return out;
    var sw = device.width;
    var sh = device.height;
    var band = wgBand || profileWorkGridYBand();
    var yMin = Math.max(0, Math.floor((band && band.yMin) || sh * 0.4) - 36);
    var yMax = Math.min(sh - 1, Math.floor((band && band.yMax) || sh * 0.92));
    var minSide = Math.max(70, Math.floor(sw * 0.14));
    var maxSide = Math.floor(sw * 0.56);
    var tmp = [];
    for (var i = 0; i < coll.size(); i++) {
      var n = coll.get(i);
      try {
        var b = n.bounds();
        var w = b.width();
        var h = b.height();
        var cx = b.centerX();
        var cy = b.centerY();
        if (cy < yMin || cy > yMax) continue;
        if (b.bottom < yMin || b.top > yMax) continue;
        if (w < minSide || h < minSide) continue;
        if (w > maxSide || h > maxSide) continue;
        var aspect = w / Math.max(1, h);
        if (aspect < 0.62 || aspect > 1.45) continue;
        var clickY = b.top + Math.floor(h * 0.46);
        if (clickY <= b.top + 8 || clickY >= b.bottom - 8) continue;
        tmp.push({ n: n, x: cx, y: clickY, t: b.top, l: b.left });
      } catch (e1) {}
    }
    if (!tmp.length) return out;
    var dedupedNodes = [];
    for (var j = 0; j < tmp.length; j++) dedupedNodes.push(tmp[j].n);
    dedupedNodes = dedupeWorkContainersKeepLargestCovering(dedupedNodes);
    for (var k = 0; k < dedupedNodes.length; k++) {
      try {
        var bk = dedupedNodes[k].bounds();
        var cky = bk.top + Math.floor(bk.height() * 0.46);
        out.push({ x: bk.centerX(), y: cky, t: bk.top, l: bk.left });
      } catch (e2) {}
    }
    out.sort(function (a, b) {
      if (Math.abs(a.t - b.t) > 18) return a.t - b.t;
      return a.l - b.l;
    });
    if (out.length > 9) out = out.slice(0, 9);
  } catch (e0) {}
  return out;
}

/**
 * 超简化版：直接扫描作品带（偏下半屏），用“像素颜色变化”粗判封面位置。
 * 返回 [{x,y}] 点击点（封面中上部）。
 */
function findWorkCoverPositionsSimple(wgBand, opts) {
  opts = opts || {};
  var varianceMin =
    typeof opts.varianceMin === "number" && opts.varianceMin > 0 ? opts.varianceMin : 21;
  var out = [];
  try {
    if (typeof images === "undefined" || !images.pixel) return out;
    var sw = device.width;
    var sh = device.height;
    var band = wgBand || profileWorkGridYBand();

    var img = captureScreenOnceForWorkGridProbe(WORK_GRID_PROBE_BUDGET_QUICK_MS);
    if (!img) return out;

    try {
      // 探针列 X：在标准 3 列中心外，补一组「左偏」采样，覆盖“单个作品仅靠左显示”的机型偏移
      var colXs = [
        Math.floor(sw * 0.12),
        Math.floor(sw * 0.17),
        Math.floor(sw * 0.22),
        Math.floor(sw * 0.5),
        Math.floor(sw * 0.78),
        Math.floor(sw * 0.83),
      ];
      // 预估封面高度（按屏幕宽度比例）
      var coverH = Math.floor(sw * 0.32);
      // 步进：封面高度的50%
      var stepY = Math.max(40, Math.floor(coverH * 0.5));

      // 扫描范围：从作品Tab下方开始，到屏幕底部附近
      var startY = Math.max(band.yMin, Math.floor(sh * 0.4));
      var endY = Math.min(band.yMax, sh - 120);
      if (endY <= startY + coverH) return out;

      if (WORK_GRID_IMAGE_PICK_DEBUG) {
        try {
          appendLog("简化版扫描范围: Y从" + startY + "到" + endY + " 封面高" + coverH);
        } catch (eLog0) {}
      }

      for (var y = startY; y <= endY - coverH; y += stepY) {
        for (var c = 0; c < colXs.length; c++) {
          var x = colXs[c];
          var samples = [];
          // 采样封面中心区域（而不是偏移）
          var centerY = y + Math.floor(coverH / 2);
          for (var dx = -15; dx <= 15; dx += 8) {
            for (var dy = -15; dy <= 15; dy += 8) {
              var px = Math.min(sw - 1, Math.max(0, x + dx));
              var py = Math.min(sh - 1, Math.max(0, centerY + dy));
              var cVal = images.pixel(img, px, py);
              var n = typeof cVal === "number" ? cVal >>> 0 : 0;
              samples.push({ r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff });
            }
          }
          if (!samples.length) continue;

          // 计算颜色方差（L1）
          var sumR = 0,
            sumG = 0,
            sumB = 0;
          for (var i = 0; i < samples.length; i++) {
            sumR += samples[i].r;
            sumG += samples[i].g;
            sumB += samples[i].b;
          }
          var avgR = sumR / samples.length;
          var avgG = sumG / samples.length;
          var avgB = sumB / samples.length;

          var variance = 0;
          for (var j = 0; j < samples.length; j++) {
            variance +=
              Math.abs(samples[j].r - avgR) + Math.abs(samples[j].g - avgG) + Math.abs(samples[j].b - avgB);
          }
          variance = variance / samples.length;

          // 阈值放宽：单列封面或低对比封面在部分机型上方差偏低，降低漏检
          if (variance > varianceMin) {
            // 点击封面中心偏上（40%处），并限制在封面范围内
            var clickY = y + Math.floor(coverH * 0.4);
            clickY = Math.max(clickY, y + 20);
            clickY = Math.min(clickY, y + coverH - 20);

            // 去重
            var dup = false;
            for (var k = 0; k < out.length; k++) {
              if (Math.abs(out[k].x - x) < 50 && Math.abs(out[k].y - clickY) < 100) {
                dup = true;
                break;
              }
            }
            if (!dup) {
              out.push({ x: x, y: clickY, topY: y, coverH: coverH });
              if (WORK_GRID_IMAGE_PICK_DEBUG) {
                try {
                  appendLog(
                    "简化版候选: 顶Y=" + y + " 点击(" + x + "," + clickY + ") 方差=" + Math.floor(variance)
                  );
                } catch (eLog1) {}
              }
            }
          }
        }
      }

      // 按Y排序，优先上面几行
      out.sort(function (a, b) {
        return a.y - b.y;
      });
    } finally {
      try {
        img.recycle();
      } catch (eR) {}
    }
  } catch (e) {
    try {
      appendLog("简单识别异常: " + e);
      } catch (e2) {}
    }
  return out;
}

/**
 * 用“点赞数字（白色）”做像素验证：不做全屏扫，只在每格左下角数字区域采样。
 * 返回 [{x,y,row,col}] 点击点（封面中部偏上）。
 */
function findWorkCoverPositionsByLikeNumberPixels(wgBand) {
  var out = [];
  try {
    if (typeof images === "undefined" || !images.pixel) return out;
    var sw = device.width;
    var sh = device.height;
    var band = wgBand || profileWorkGridYBand();
    var img = captureScreenOnceForWorkGridProbe(WORK_GRID_PROBE_BUDGET_QUICK_MS);
    if (!img) return out;
    try {
      // 放宽扫描带：覆盖“只有一行/两行作品”的首屏布局
      var yMin = Math.max(band.yMin, Math.floor(sh * 0.35));
      var yMax = Math.min(band.yMax, Math.floor(sh * 0.8));
      if (yMin >= yMax) return out;

      // 三列中心 X（微调：适配你实测的列中心略偏左/右）
      var colXs = [sw * 0.15, sw * 0.5, sw * 0.836];
      var xTolerance = 50;
      // 估算封面高度：按屏宽比例（3列封面接近方形）
      var coverH = Math.max(220, Math.floor(sw * 0.32));
      var offsetToCenter = Math.floor(coverH * 0.55);

      // 按列收集“疑似数字”的 y：每列只扫中心±tolerance 的少量点
      var colYs = [[], [], []];
      var scanStepY = 8;
      var scanStepX = 15;
      // 降低白色检测阈值与比例，减少漏检
      var whiteThreshold = 180;
      var whiteRatio = 0.15;
      for (var y = yMin; y <= yMax; y += scanStepY) {
        for (var col = 0; col < colXs.length; col++) {
          var cx = colXs[col];
          for (var x = Math.floor(cx - xTolerance); x <= Math.floor(cx + xTolerance); x += scanStepX) {
            try {
              var whiteCount = 0;
              var total = 0;
              for (var dx = -10; dx <= 10; dx += 4) {
                for (var dy = -8; dy <= 8; dy += 4) {
                  var px = Math.min(sw - 1, Math.max(0, x + dx));
                  var py = Math.min(sh - 1, Math.max(0, y + dy));
                  var c = images.pixel(img, px, py);
                  var n = typeof c === "number" ? c >>> 0 : 0;
                  var r = (n >> 16) & 0xff;
                  var g = (n >> 8) & 0xff;
                  var b = n & 0xff;
                  total++;
                  if (r > whiteThreshold && g > whiteThreshold && b > whiteThreshold) {
                    whiteCount++;
                  } else if (r > 160 && g > 140 && b > 80 && r > g - 40) {
                    whiteCount++;
                  }
                }
              }
              if (total > 0 && whiteCount / total > whiteRatio) {
                colYs[col].push(y);
                break;
              }
            } catch (ePx) {}
          }
        }
      }

      function findMainY(ys) {
        if (!ys || ys.length === 0) return null;
        var buckets = {};
        for (var i = 0; i < ys.length; i++) {
          var b = Math.round(ys[i] / 15);
          buckets[b] = (buckets[b] || 0) + 1;
        }
        var maxCount = 0;
        var maxBucket = null;
        for (var k in buckets) {
          if (buckets[k] > maxCount) {
            maxCount = buckets[k];
            maxBucket = parseInt(k, 10);
          }
        }
        if (maxBucket == null) return null;
        return maxBucket * 15;
      }

      // 取每列主行，并从“主行”之外再找一个可能的第二行
      var row1ByCol = [null, null, null];
      var row2ByCol = [null, null, null];
      for (var c = 0; c < colYs.length; c++) {
        var ys = colYs[c];
        if (!ys || ys.length === 0) continue;
        var r1 = findMainY(ys);
        if (r1 != null && r1 > yMin && r1 < yMax) row1ByCol[c] = r1;
        // second row: 过滤掉离 r1 太近的点，再取众数
        if (r1 != null) {
          var cand = [];
          for (var i2 = 0; i2 < ys.length; i2++) {
            if (Math.abs(ys[i2] - r1) > 60) cand.push(ys[i2]);
          }
          var r2 = findMainY(cand);
          if (r2 != null && r2 > yMin && r2 < yMax) row2ByCol[c] = r2;
        }
      }

      function fillMissingColsByAvg(rowYs) {
        var sum = 0;
        var cnt = 0;
        for (var i = 0; i < 3; i++) {
          if (rowYs[i] != null) {
            sum += rowYs[i];
            cnt++;
          }
        }
        if (cnt < 2) return { filled: rowYs, estimated: [false, false, false], hits: cnt };
        var avg = Math.floor(sum / cnt);
        var est = [false, false, false];
        for (var j = 0; j < 3; j++) {
          if (rowYs[j] == null) {
            rowYs[j] = avg;
            est[j] = true;
          }
        }
        return { filled: rowYs, estimated: est, hits: cnt };
      }

      function pushRowIfStrong(rowYs, rowIndex) {
        var filledInfo = fillMissingColsByAvg([rowYs[0], rowYs[1], rowYs[2]]);
        // 至少两列命中才认为该行存在，避免一列误检导致乱点
        if (filledInfo.hits < 2) return;
        var filled = filledInfo.filled;
        var est = filledInfo.estimated;
        for (var c2 = 0; c2 < 3; c2++) {
          if (filled[c2] == null) continue;
          var digitY = filled[c2];
          // 额外过滤：太靠上多为误检
          if (digitY < sh * 0.42) continue;
          var centerY = digitY - offsetToCenter;
          if (centerY > yMin && centerY < yMax) {
            out.push({
              x: Math.floor(colXs[c2]),
              y: Math.floor(centerY),
              digitY: digitY,
              col: c2,
              row: rowIndex,
              estimated: !!est[c2],
            });
          }
        }
      }

      pushRowIfStrong(row1ByCol, 0);
      pushRowIfStrong(row2ByCol, 1);
      // 按列排序
      out.sort(function (a, b) {
        if ((a.row | 0) !== (b.row | 0)) return (a.row | 0) - (b.row | 0);
        return a.x - b.x;
      });
    } finally {
      try {
        img.recycle();
      } catch (eR) {}
    }
  } catch (e1) {}
  return out;
}

/**
 * UI 树不可用时：用截屏像素在 3 列网格上粗识别“非纯色封面格”并返回点击点。
 * 返回 [{x,y,row,col}]；为空表示本轮无法判断。
 */
function findWorkCoverPositionsByImage(wgBand) {
  var out = [];
  try {
    if (typeof images === "undefined" || !images.pixel) return out;
    var sw = device.width;
    var sh = device.height;
    var band = wgBand || profileWorkGridYBand();
    var img = captureScreenOnceForWorkGridProbe(WORK_GRID_PROBE_BUDGET_QUICK_MS);
    if (!img) return out;
    try {
      // 扫描带：稍放宽，避免作品首行偏上时漏检
      var yMin = Math.max(band.yMin, Math.floor(sh * 0.4));
      var yMax = Math.min(band.yMax, Math.floor(sh * 0.85));
      if (yMin >= yMax) return out;

      // 3 列点击点（更稳，不依赖左右 padding）
      var colXs = [Math.floor(sw * 0.17), Math.floor(sw * 0.5), Math.floor(sw * 0.83)];

      // “精确封面”版：逐列扫描 Y，找出连续的“封面纹理段”（即封面上下边界）
      var stepY = 8;
      var minCoverH = Math.max(200, Math.floor(sh * 0.16));
      var maxCoverH = Math.min(600, Math.floor(sh * 0.32));

      for (var col = 0; col < colXs.length; col++) {
        var x = colXs[col];
        var inCover = false;
        var start = 0;
        var segs = [];
        for (var y = yMin; y <= yMax; y += stepY) {
          // 以列中心点为采样，判断该 y 是否“像封面中心纹理”
          var ok = false;
          try {
            ok = workGridPixelCenterLooksLikeCoverTexture(img, x, y, sw, sh);
          } catch (eT) {
            ok = false;
          }
          if (!inCover && ok) {
            inCover = true;
            start = y;
          } else if (inCover && !ok) {
            inCover = false;
            var end = y;
            var h = end - start;
            if (h >= minCoverH && h <= maxCoverH) {
              segs.push({ top: start, bottom: end });
            }
          }
        }
        // 收尾
        if (inCover) {
          var end2 = yMax;
          var h2 = end2 - start;
          if (h2 >= minCoverH && h2 <= maxCoverH) {
            segs.push({ top: start, bottom: end2 });
          }
        }

        // 每列只取最靠上的两个封面段（首屏两行）
        segs.sort(function (a, b) {
          return a.top - b.top;
        });
        for (var si = 0; si < segs.length && si < 2; si++) {
          var s0 = segs[si];
          var h0 = s0.bottom - s0.top;
          // 点击封面中心（0.5），更不容易点到关注/按钮条
          var clickY = s0.top + Math.floor(h0 * 0.5);
          out.push({ x: x, y: clickY, row: si, col: col });
        }
      }

      // 允许单格命中：部分账号首屏仅 1 个作品，或只在左侧列可见，不能硬性要求 >=2
      if (out.length < 1) {
        out = [];
      }
    } finally {
      try {
        img.recycle();
      } catch (eR) {}
    }
  } catch (e1) {}
  if (__DEBUG_WORK_GRID_LIKED_PROBE) {
    try {
      appendLog("图像识别封面候选: " + out.length);
    } catch (eL) {}
  }
  return out;
}

/**
 * 收集当前屏作品网格的 id/container。
 * 已赞格有时上报的宽高略小，易被 minH/maxW 漏掉（屏上 6 格只收到 5 个）；故放宽首遍条件并做二遍补格（中心点不在已有格内即收）。
 * 新机常见 FrameLayout + container，多列时单格可窄至 ~sw/6；原 yHeader=0.19 易漏掉 Tab 下方首屏网格行；原 b.top>sh-40 在矮屏上误杀整行。
 */
// （精简版已移除：collectVisibleWorkContainers）

/** 无障碍：作品格/赞条是否表现为「已赞」（小红心）；纯「点赞数123」无「已赞/未点赞」则视为未赞 */
function nodeShowsAlreadyLikedState(n) {
  if (!n) return false;
  try {
    var d = n.desc && n.desc();
    if (d) {
      var s = String(d);
      if (/未点赞/.test(s)) return false;
      if (/已点赞|已喜欢|喜欢按钮已|喜欢，按钮，已/.test(s)) return true;
    }
  } catch (e0) {}
  try {
    if (n.checked && n.checked()) return true;
  } catch (e1) {}
  try {
    if (n.selected && n.selected()) return true;
  } catch (e2) {}
  return false;
}

function walkAncestorsForAlreadyLiked(node, maxUp) {
  var n = node;
  for (var i = 0; i < (maxUp || 14) && n; i++, n = n.parent()) {
    if (nodeShowsAlreadyLikedState(n)) return true;
  }
  return false;
}

/** 心形控件常见 class（抖音可能 Fresco Drawee 等，不单是 ImageView） */
function likeBarNodeLooksLikeHeartIconClass(cn) {
  if (!cn) return false;
  var s = String(cn);
  return (
    s.indexOf("ImageView") >= 0 ||
    s.indexOf("SimpleDraweeView") >= 0 ||
    s.indexOf("DraweeView") >= 0 ||
    s.indexOf("AsyncImageView") >= 0
  );
}

/**
 * 深度遍历赞条（44g）：心形可能在 3f6 的兄弟的父容器里，不能只做一层 sibling。
 * 注意：遇到「未点赞」不得 return false 终止整棵子树，否则后面的兄弟/深层已赞节点扫不到。
 */
function likeBarSubtreeHasLikedHeart(root, maxDepth) {
  maxDepth = maxDepth != null ? maxDepth : 22;
  function walk(n, depth) {
    if (!n || depth > maxDepth) return false;
    try {
      if (nodeShowsAlreadyLikedState(n)) return true;
      var cn = n.className && n.className();
      var cns = cn ? String(cn) : "";
      if (likeBarNodeLooksLikeHeartIconClass(cns)) {
        try {
          if (n.selected && n.selected()) return true;
        } catch (eS) {}
        try {
          if (n.checked && n.checked()) return true;
        } catch (eC) {}
        var d = n.desc && n.desc();
        if (d) {
          var s = String(d);
          if (!/未点赞|未喜欢/.test(s) && /已点赞|已喜欢|喜欢按钮已|喜欢，按钮，已/.test(s)) return true;
        }
      }
      var cct = n.childCount && n.childCount();
      if (cct > 0) {
        for (var i = 0; i < cct; i++) {
          try {
            var ch = n.child(i);
            if (ch && walk(ch, depth + 1)) return true;
          } catch (eCh) {}
        }
      }
    } catch (eW) {}
    return false;
  }
  return walk(root, 0);
}

/** 从 3f6 的父节点向下深搜心形（与 44g 根遍历互补，覆盖 index 与层级差异） */
function likeCountDeepHeartScanFrom3f6Parent(tv, maxDepth) {
  if (!tv) return false;
  var root = null;
  try {
    root = tv.parent();
  } catch (eP) {}
  if (!root) return false;
  maxDepth = maxDepth != null ? maxDepth : 18;
  function walk(n, depth) {
    if (!n || depth > maxDepth) return false;
    try {
      if (nodeShowsAlreadyLikedState(n)) return true;
      var cn = n.className && n.className();
      if (likeBarNodeLooksLikeHeartIconClass(cn)) {
        try {
          if (n.selected && n.selected()) return true;
        } catch (e0) {}
        try {
          if (n.checked && n.checked()) return true;
        } catch (e1) {}
        var d = n.desc && n.desc();
        if (d) {
          var s = String(d);
          if (!/未点赞|未喜欢/.test(s) && /已点赞|已喜欢|喜欢按钮已|喜欢，按钮，已/.test(s)) return true;
        }
      }
      var cct = n.childCount && n.childCount();
      for (var i = 0; i < cct; i++) {
        try {
          if (walk(n.child(i), depth + 1)) return true;
        } catch (e2) {}
      }
    } catch (e3) {}
    return false;
  }
  return walk(root, 0);
}

/** 点赞数 TextView（3f6）：先扫一层兄弟，再深搜父节点（心形常在嵌套里） */
function likeCountSiblingHeartLooksLiked(tv) {
  if (!tv) return false;
  if (likeCountDeepHeartScanFrom3f6Parent(tv, 18)) return true;
  try {
    var p = tv.parent();
    if (!p) return false;
    var cct = p.childCount && p.childCount();
    for (var i = 0; i < cct; i++) {
      try {
        var ch = p.child(i);
        if (!ch) continue;
        var cn = ch.className && ch.className();
        if (!likeBarNodeLooksLikeHeartIconClass(cn)) continue;
        try {
          if (ch.selected && ch.selected()) return true;
        } catch (e0) {}
        try {
          if (ch.checked && ch.checked()) return true;
        } catch (e1) {}
        var d = ch.desc && ch.desc();
        if (d) {
          var s = String(d);
          if (/未点赞|未喜欢/.test(s)) continue;
          if (/已点赞|已喜欢/.test(s)) return true;
        }
      } catch (e2) {}
    }
  } catch (e3) {}
  return false;
}

/** 格左下「赞」角标区：与全局 find 配合；略放宽比例，避免心形略偏右/略偏上漏检 */
function workContainerLikeCornerZone(container) {
  var b = container.bounds();
  return {
    zL: b.left + 1,
    zR: b.left + Math.floor(b.width() * 0.56),
    zT: b.top + Math.floor(b.height() * 0.48),
    zB: b.bottom - 1,
  };
}

/** 子树 DFS：部分机型心形不在全局 selector 命中范围内，但仍在 container 子树内 */
function containerSubtreeCornerHeartLooksLiked(container, maxDepth) {
  if (!container) return false;
  var z = workContainerLikeCornerZone(container);
  function walk(n, depth) {
    if (!n || depth > maxDepth) return false;
    try {
      var ib = n.bounds();
      var cx = ib.centerX();
      var cy = ib.centerY();
      if (cx >= z.zL && cx <= z.zR && cy >= z.zT && cy <= z.zB) {
        var cn = n.className && n.className();
        var cns = cn ? String(cn) : "";
        if (likeBarNodeLooksLikeHeartIconClass(cns)) {
          var iw = ib.width();
          var ih = ib.height();
          if (iw > 2 && iw < 160 && ih > 2 && ih < 160) {
            try {
              if (n.selected && n.selected()) return true;
            } catch (eS) {}
            try {
              if (n.checked && n.checked()) return true;
            } catch (eC) {}
            var d = n.desc && n.desc();
            if (d && /已点赞|已喜欢/.test(String(d))) return true;
          }
        }
      }
      var cct = n.childCount && n.childCount();
      for (var i = 0; i < cct; i++) {
        try {
          var ch = n.child(i);
          if (ch && walk(ch, depth + 1)) return true;
        } catch (eCh) {}
      }
    } catch (eW) {}
    return false;
  }
  return walk(container, 0);
}

/** 无 44g 时：格左下窄区内心形 ImageView（已赞常为选中态） */
function likeZoneCornerImageLooksLiked(container) {
  if (!container) return false;
  if (containerSubtreeCornerHeartLooksLiked(container, 14)) return true;
  try {
    var z = workContainerLikeCornerZone(container);
    var coll = className("android.widget.ImageView")
      .packageName("com.ss.android.ugc.aweme")
      .boundsInside(z.zL, z.zT, z.zR, z.zB)
      .find();
    if (!coll || !coll.size) return false;
    for (var i = 0; i < coll.size(); i++) {
      var im = coll.get(i);
      try {
        var ib = im.bounds();
        if (ib.width() > 130 || ib.height() > 130) continue;
        try {
          if (im.selected && im.selected()) return true;
        } catch (eS) {}
        try {
          if (im.checked && im.checked()) return true;
        } catch (eC) {}
        var d = im.desc && im.desc();
        if (d && /已点赞|已喜欢/.test(String(d))) return true;
      } catch (eI) {}
    }
  } catch (eZ) {}
  return false;
}

/**
 * 作品格内 44g 赞条：心形在条内约左 22%（与 clickDouyinWorkLikeCellLayout 一致）。
 * 抖音常把已/未赞的 3f6「点赞数」无障碍做成相同，只能靠条上实心红 vs 空心白区分；此处取色仅限条区域，避免封面图左下角红色误判。
 */
function like44gBarHeartBandLooksFilledRed(bar, probeImg) {
  if (!bar) return false;
  try {
    if (typeof images === "undefined" || !images.pixel) return false;
    var img = probeImg;
    if (!img) {
      img = captureScreenForWorkGridProbeInner();
    }
    if (!img) return false;
    var bb = bar.bounds();
    var sw = device.width;
    var sh = device.height;
    var bw = bb.width();
    var bh = bb.height();
    if (bw < 16 || bh < 8) return false;
    var cy = bb.top + Math.floor(bh / 2);
    var cxMain = bb.left + Math.max(8, Math.floor(bw * 0.22));
    var cxLeft = bb.left + Math.max(6, Math.floor(bw * 0.14));
    var pts = [];
    var addAround = function (cx0) {
      pts.push([cx0, cy]);
      pts.push([cx0 - 5, cy]);
      pts.push([cx0 + 5, cy]);
      pts.push([cx0, cy - 6]);
      pts.push([cx0, cy + 6]);
      pts.push([cx0 - 4, cy - 4]);
      pts.push([cx0 + 4, cy + 4]);
    };
    addAround(cxMain);
    addAround(cxLeft);
    var rHit = 0;
    var whiteHit = 0;
    var pi;
    for (pi = 0; pi < pts.length; pi++) {
      var x = pts[pi][0];
      var y = pts[pi][1];
      if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
      var c = images.pixel(img, x, y);
      var n = typeof c === "number" ? c >>> 0 : 0;
      var rv = (n >> 16) & 0xff;
      var gv = (n >> 8) & 0xff;
      var bv = n & 0xff;
      if (rv > 210 && gv > 210 && bv > 210) whiteHit++;
      if (rv >= 162 && rv >= gv + 32 && rv >= bv + 32 && rv - Math.min(gv, bv) >= 26) rHit++;
    }
    if (whiteHit >= 8) return false;
    return rHit >= 3;
  } catch (eBarPx) {
    return false;
  }
}

/**
 * 是否新版作品格（格内有点赞数 3f6 或赞条 44g）。部分机型 44g 未落在 id=container 的 bounds 内，仅用 44g 会漏判并误走封面像素。
 */
function workContainerHasModernLikeUiInCell(container) {
  if (!container) return false;
  try {
    var b = container.bounds();
    if (
      id("com.ss.android.ugc.aweme:id/3f6")
        .boundsInside(b.left + 1, b.top + 1, b.right - 1, b.bottom - 1)
        .findOne(220)
    )
      return true;
    return !!id("com.ss.android.ugc.aweme:id/44g")
      .boundsInside(b.left + 1, b.top + 1, b.right - 1, b.bottom - 1)
      .findOne(160);
  } catch (eM) {
    return false;
  }
}

/** 是否像抖音条上「实心红心」的品红色点（排除橙肤、土色等 R 略高但 G 也高的像素） */
function workGridHeartPixelLooksSolidUiRed(rv, gv, bv) {
  var rMin = typeof WORK_GRID_HEART_RED_R_MIN === "number" ? WORK_GRID_HEART_RED_R_MIN : 178;
  var gMax = typeof WORK_GRID_HEART_RED_G_MAX === "number" ? WORK_GRID_HEART_RED_G_MAX : 108;
  var bMax = typeof WORK_GRID_HEART_RED_B_MAX === "number" ? WORK_GRID_HEART_RED_B_MAX : 112;
  var rgGap = typeof WORK_GRID_HEART_RED_RG_MIN_GAP === "number" ? WORK_GRID_HEART_RED_RG_MIN_GAP : 40;
  var rbGap = typeof WORK_GRID_HEART_RED_RB_MIN_GAP === "number" ? WORK_GRID_HEART_RED_RB_MIN_GAP : 40;
  if (rv < rMin) return false;
  if (gv > gMax) return false;
  if (bv > bMax) return false;
  if (rv - gv < rgGap) return false;
  if (rv - bv < rbGap) return false;
  return true;
}

/**
 * 通过 44g（赞条容器）作为锚点，精准定位心形区域采样红像素占比。
 * 注意：未赞时不要直接 return false 阻断外层其它兜底（可能 44g 未命中或 bounds 异常）。
 * @param {UiObject} container 作品格 container
 * @param {Image} probeImg 截屏图像（必须传入）
 * @returns {boolean} true=已赞（实心红心），false=未赞/无法判定
 */
function isWorkLikedBy44gAnchor(container, probeImg) {
  if (!container || !probeImg) return false;
  try {
    if (typeof images === "undefined" || !images.pixel) return false;
    var cb = container.bounds && container.bounds();
    if (!cb) return false;
    var bar44g = null;
    try {
      bar44g = id("com.ss.android.ugc.aweme:id/44g")
        .boundsInside(cb.left, cb.top, cb.right, cb.bottom)
        .findOne(160);
    } catch (e0) {}
    if (!bar44g) return false;
    var bb = bar44g.bounds && bar44g.bounds();
    if (!bb) return false;
    var sw = device.width;
    var sh = device.height;
    if (bb.width() < 20 || bb.height() < 10) return false;

    // 心形大致位于 44g 左侧，且常在赞条“偏上”区域（避免误采到 3f6 点赞数字行）
    // 调参：采样框略大一点 + 偏上 + 提高阈值，降低空心描边/抗锯齿误判
    var heartW = 45;
    var heartH = 45;
    var left = Math.max(0, (bb.left + 8) | 0);
    var right = Math.min(sw - 1, (left + heartW) | 0);
    var offsetFromTop = 18;
    var top = Math.max(0, (bb.top + offsetFromTop) | 0);
    var bottom = Math.min(sh - 1, (top + heartH) | 0);
    if (right <= left || bottom <= top) return false;

    var step = 4;
    var redHit = 0;
    var total = 0;
    for (var x = left; x <= right; x += step) {
      for (var y = top; y <= bottom; y += step) {
        if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
        total++;
        try {
          var c = images.pixel(probeImg, x, y);
          var n = typeof c === "number" ? c >>> 0 : 0;
          var rv = (n >> 16) & 0xff;
          var gv = (n >> 8) & 0xff;
          var bv = n & 0xff;
          if (workGridHeartPixelLooksSolidUiRed(rv, gv, bv)) redHit++;
        } catch (ePx) {}
      }
    }
    if (total < 1) return false;
    var ratio = redHit / total;
    if (__DEBUG_WORK_GRID_LIKED_PROBE) {
      try {
        appendLog(
          "心形检测:红点=" +
            redHit +
            ",总点=" +
            total +
            ",比例=" +
            (ratio * 100).toFixed(1) +
            "%,bb=(" +
            bb.left +
            "," +
            bb.top +
            "," +
            bb.right +
            "," +
            bb.bottom +
            ")"
        );
      } catch (eLog) {}
    }
    return ratio >= 0.5;
  } catch (e) {
    return false;
  }
}

/**
 * 通过 3f6（点赞数）作为锚点定位心形（适用于无 44g 的布局）。
 * @param {UiObject} container 作品格 container
 * @param {Image} probeImg 截屏图像（必须传入）
 * @returns {boolean} true=已赞（实心红心），false=未赞/无法判定
 */
function isWorkLikedBy3f6Anchor(container, probeImg) {
  if (!container || !probeImg) return false;
  try {
    if (typeof images === "undefined" || !images.pixel) return false;
    var cb = container.bounds && container.bounds();
    if (!cb) return false;
    var tv3f6 = null;
    try {
      tv3f6 = id("com.ss.android.ugc.aweme:id/3f6")
        .boundsInside(cb.left, cb.top, cb.right, cb.bottom)
        .findOne(160);
    } catch (e0) {}
    if (!tv3f6) return false;
    var tb = tv3f6.bounds && tv3f6.bounds();
    if (!tb) return false;
    var sw = device.width;
    var sh = device.height;
    if (tb.width() < 12 || tb.height() < 10) return false;

    // 心形在数字内部左侧，紧贴数字左边缘（从 tb.left+4 起采样，避开数字边缘抗锯齿）
    // 仍保留“对照区域”差分判断以排除封面红色元素
    var heartW = 24;
    var heartH = 24;
    var left = Math.max(0, (tb.left + 4) | 0);
    var right = Math.min(sw - 1, (left + heartW) | 0);
    // 垂直居中（不下移，避免偏离心形与数字同一行的布局）
    var top = (tb.top + (tb.height() - heartH) / 2) | 0;
    top = Math.max(0, Math.min(sh - 1, top));
    var bottom = Math.min(sh - 1, (top + heartH) | 0);
    if (right <= left || bottom <= top) return false;

    // control：在心形区域左侧再挪一段（尽量落在封面上），用于排除“封面本身就很红”
    var ctrlShift = 28;
    var cLeft = Math.max(0, (left - ctrlShift) | 0);
    var cRight = Math.min(sw - 1, (cLeft + heartW) | 0);
    if (cRight <= cLeft) return false;

    function sampleRedRatio(x1, x2, y1, y2) {
      var step = 2;
      var redHit = 0;
      var total = 0;
      for (var x = x1; x <= x2; x += step) {
        for (var y = y1; y <= y2; y += step) {
          if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
          total++;
          try {
            var c = images.pixel(probeImg, x, y);
            var n = typeof c === "number" ? c >>> 0 : 0;
            var rv = (n >> 16) & 0xff;
            var gv = (n >> 8) & 0xff;
            var bv = n & 0xff;
            if (workGridHeartPixelLooksSolidUiRed(rv, gv, bv)) redHit++;
          } catch (ePx) {}
        }
      }
      if (total < 1) return 0;
      return redHit / total;
    }

    var ratio = sampleRedRatio(left, right, top, bottom);
    var ratioCtrl = sampleRedRatio(cLeft, cRight, top, bottom);
    if (__DEBUG_WORK_GRID_LIKED_PROBE) {
      try {
        appendLog(
          "心形检测(3f6):比例=" +
            (ratio * 100).toFixed(1) +
            "%,对照=" +
            (ratioCtrl * 100).toFixed(1) +
            "%,tb=(" +
            tb.left +
            "," +
            tb.top +
            "," +
            tb.right +
            "," +
            tb.bottom +
            ")"
        );
      } catch (eLog) {}
    }
    // 双阈值：自身要足够红，且比对照区域“明显更红”
    return ratio >= 0.45 && ratio - ratioCtrl >= 0.12;
  } catch (e) {
    return false;
  }
}

/**
 * 作品网格：以格 **左下角** 为锚点，在矩形 [left, left+W] × [bottom−H, bottom] 内采样是否含抖音实心红心（品红像素）。
 * 与「锚点 X+W、锚点 Y−H」即自左下角向右 W、向上 H 的矩形范围一致；W/H 见 WORK_GRID_HEART_REGION_*。
 */
function workGridCellBottomLeftOffsetRegionHasFilledRed(container, probeImg) {
  if (!container) return false;
  try {
    if (typeof images === "undefined" || !images.pixel) return false;
    var img = probeImg;
    if (!img) {
      img = captureScreenForWorkGridProbeInner();
    }
    if (!img) return false;
    var b = container.bounds();
    var sw = device.width;
    var sh = device.height;
    var bw = b.width();
    var bh = b.height();
    if (bw < 16 || bh < 16) return false;
    var rw =
      typeof WORK_GRID_HEART_REGION_W_FROM_BOTTOM_LEFT === "number"
        ? WORK_GRID_HEART_REGION_W_FROM_BOTTOM_LEFT
        : 80;
    var rh =
      typeof WORK_GRID_HEART_REGION_H_FROM_BOTTOM_LEFT === "number"
        ? WORK_GRID_HEART_REGION_H_FROM_BOTTOM_LEFT
        : 80;
    if (rw < 8) rw = 80;
    if (rh < 8) rh = 80;
    var x1 = b.left;
    var x2 = Math.min(b.right - 1, b.left + rw);
    var y2 = b.bottom - 1;
    var y1 = Math.max(b.top + 1, b.bottom - rh);
    if (x2 < x1 || y2 < y1) return false;
    var step = Math.max(4, WORK_GRID_HEART_PROBE_STEP | 0);
    var pts = [];
    var sx;
    var sy;
    for (sx = x1; sx <= x2; sx += step) {
      for (sy = y1; sy <= y2; sy += step) {
        pts.push([Math.round(sx), Math.round(sy)]);
      }
    }
    pts.push([x1, y1]);
    pts.push([x2, y2]);
    var rHit = 0;
    var whiteHit = 0;
    var total = 0;
    var pi;
    for (pi = 0; pi < pts.length; pi++) {
      var x = pts[pi][0];
      var y = pts[pi][1];
      if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
      total++;
      var c = images.pixel(img, x, y);
      var n = typeof c === "number" ? c >>> 0 : 0;
      var rv = (n >> 16) & 0xff;
      var gv = (n >> 8) & 0xff;
      var bv = n & 0xff;
      if (rv > 200 && gv > 200 && bv > 200) whiteHit++;
      if (workGridHeartPixelLooksSolidUiRed(rv, gv, bv)) rHit++;
    }
    if (total < 1) return false;
    var vetoRatio =
      typeof WORK_GRID_HEART_PROBE_WHITE_VETO_RATIO === "number"
        ? WORK_GRID_HEART_PROBE_WHITE_VETO_RATIO
        : 0.55;
    if (whiteHit >= Math.ceil(total * vetoRatio)) return false;
    var req = WORK_GRID_HEART_PROBE_RED_HITS_REQUIRED;
    if (typeof req !== "number" || req < 1) req = 2;
    if (rHit >= req) {
      __wgLogLiked("左下角红心矩形区");
      return true;
    }
    return false;
  } catch (eOff) {
    return false;
  }
}

/** 截屏像素：格内有 44g 时只扫赞条心形带；无条时才扫封面左下角（旧布局） */
function workGridCellPixelProbeAlreadyLiked(container, probeImg) {
  if (!container) return false;
  var bar = null;
  try {
    var b = container.bounds();
    bar = id("com.ss.android.ugc.aweme:id/44g")
      .boundsInside(b.left + 1, b.top + 1, b.right - 1, b.bottom - 1)
      .findOne(280);
  } catch (eFindBar) {}
  if (bar) {
    if (like44gBarHeartBandLooksFilledRed(bar, probeImg)) {
      __wgLogLiked("仅像素:44g红心");
      return true;
    }
    return false;
  }
  if (workContainerLikeCornerPixelsLookFilledRed(container, probeImg)) {
    __wgLogLiked("仅像素:封面角strict");
    return true;
  }
  if (workContainerLikeCornerPixelsLookFilledRedRelaxed(container, probeImg)) {
    __wgLogLiked("仅像素:封面角relaxed");
    return true;
  }
  return false;
}

/** 左下角实心红心：无障碍常无 selected；采样兼顾「内层 bounds 偏上」时赞标画在底边下方的情况 */
function workContainerLikeCornerPixelsLookFilledRed(container, probeImg) {
  if (!container) return false;
  try {
    if (typeof images === "undefined" || !images.pixel) return false;
    var img = probeImg;
    if (!img) {
      img = captureScreenForWorkGridProbeInner();
    }
    if (!img) return false;
    var b = container.bounds();
    var sh = device.height;
    var sw = device.width;
    var bw = b.width();
    var bh = b.height();
    var xL = Math.max(0, b.left + 2);
    var xR = Math.min(sw - 1, b.right - 2);
    var yIn = b.bottom - Math.max(8, Math.floor(bh * 0.055));
    var extraDown = Math.min(58, Math.max(22, Math.floor(bh * 0.11)));
    var yExt = Math.min(sh - 2, b.bottom + extraDown);
    var fracXs = [0.09, 0.14, 0.19, 0.11, 0.16];
    var pts = [];
    var fi;
    for (fi = 0; fi < fracXs.length; fi++) {
      var x0 = b.left + Math.floor(bw * fracXs[fi]);
      x0 = Math.max(xL, Math.min(xR, x0));
      pts.push([x0, yIn]);
      pts.push([x0, yExt]);
    }
    var rHit = 0;
    var pi;
    for (pi = 0; pi < pts.length; pi++) {
      var x = pts[pi][0];
      var y = pts[pi][1];
      if (x < 0 || y < 0 || x >= sw || y >= sh) continue;
      var c = images.pixel(img, x, y);
      var n = typeof c === "number" ? c >>> 0 : 0;
      var rv = (n >> 16) & 0xff;
      var gv = (n >> 8) & 0xff;
      var bv = n & 0xff;
      if (rv >= 155 && rv >= gv + 30 && rv >= bv + 30 && rv - Math.min(gv, bv) >= 24) rHit++;
    }
    return rHit >= 2;
  } catch (ePx) {
    return false;
  }
}

/** 作品网格批量扫：红心像素略放宽（strict 漏检抖音实色心时用），仍限左下角采样区 */
function workContainerLikeCornerPixelsLookFilledRedRelaxed(container, probeImg) {
  if (!container) return false;
  try {
    if (typeof images === "undefined" || !images.pixel) return false;
    var img = probeImg;
    if (!img) {
      try {
        img = captureScreenForWorkGridProbeInner();
      } catch (eI0) {}
    }
    if (!img) return false;
    var b = container.bounds();
    var sh = device.height;
    var sw = device.width;
    var bw = b.width();
    var bh = b.height();
    var xL = Math.max(0, b.left + 2);
    var xR = Math.min(sw - 1, b.right - 2);
    var yIn = b.bottom - Math.max(8, Math.floor(bh * 0.055));
    var extraDown = Math.min(58, Math.max(22, Math.floor(bh * 0.11)));
    var yExt = Math.min(sh - 2, b.bottom + extraDown);
    var fracXs = [0.09, 0.14, 0.19, 0.11, 0.16];
    var rHit = 0;
    var fi;
    for (fi = 0; fi < fracXs.length; fi++) {
      var x0 = b.left + Math.floor(bw * fracXs[fi]);
      x0 = Math.max(xL, Math.min(xR, x0));
      var pi;
      for (pi = 0; pi < 2; pi++) {
        var y0 = pi === 0 ? yIn : yExt;
        if (x0 < 0 || y0 < 0 || x0 >= sw || y0 >= sh) continue;
        var c = images.pixel(img, x0, y0);
        var n = typeof c === "number" ? c >>> 0 : 0;
        var rv = (n >> 16) & 0xff;
        var gv = (n >> 8) & 0xff;
        var bv = n & 0xff;
        if (rv >= 128 && rv >= gv + 16 && rv >= bv + 16 && rv - Math.min(gv, bv) >= 10) rHit++;
      }
    }
    return rHit >= 1;
  } catch (eR) {
    return false;
  }
}

/** 是否已调用过 requestScreenCapture（避免重复发起） */
var __workGridScreenCaptureRequestIssued = false;
/** 是否已成功截到至少一帧（此前弹窗可能滞后到进抖音后才出现，不能提前结束「点允许」逻辑） */
var __workGridScreenCaptureReady = false;
/** 首轮「点允许」使用较长总时长；之后每次 captureScreenOnce 仍带较短重试窗 */
var __workGridScreenCaptureLongAllowCycleDone = false;
var __screenCaptureAllowPollThread = null;
/** 已对「允许」成功执行过一次无障碍点击，避免循环/后台线程连点 */
var __screenCaptureAllowNodeClicked = false;
/** 已对「立即开始/现在开始」成功执行过一次无障碍点击，避免循环/后台线程连点 */
var __screenCaptureStartNodeClicked = false;
var __screenCaptureStartNodeClickedAtMs = 0;
/** 点「开始」后倒数秒数（0 关闭）；每秒一条「脚本N秒后开始」，再接允许权限与主流程 */
var __AUTOMATION_PRE_START_COUNTDOWN_SEC = 3;
/** 保留：网格第二遍已改为「左下角偏移红心区」采样；若日后恢复旧 44g/封面像素分支再使用 */
var WORK_GRID_PIXEL_LIKED_PROBE_WHEN_CELL_HAS_44G = false;
/**
 * 作品 Tab 网格：是否检测「当前屏任意一格锚点区域像已赞（实心红）则跳过该粉丝并返回」。
 * 已赞/未赞无障碍常一致，用作品格左下角矩形区内截图像素判红心；默认 true。若仍误判可改 false 或调下面区域/阈值。
 */
var WORK_GRID_THUMB_SKIP_IF_ANY_CELL_LOOKS_LIKED = true;
/**
 * 自作品格左下角锚点起：向右宽度、向上高度（像素）构成的矩形内采样，即 x∈[left,left+W]、y∈[bottom−H,bottom]。
 * 与「锚点 X+W、锚点 Y−H」范围一致；默认 80×80。
 */
var WORK_GRID_HEART_REGION_W_FROM_BOTTOM_LEFT = 80;
var WORK_GRID_HEART_REGION_H_FROM_BOTTOM_LEFT = 80;
/** 矩形内采样步长（像素） */
var WORK_GRID_HEART_PROBE_STEP = 8;
/** 判为已赞需命中的高饱和红点数量（越多越严，漏检越高） */
var WORK_GRID_HEART_PROBE_RED_HITS_REQUIRED = 3;
/** 采样点中超半数为近白则判未赞（弱化空心白描边+透底红误判） */
var WORK_GRID_HEART_PROBE_WHITE_VETO_RATIO = 0.55;
/** 选择作品：进入主页后等待网格稳定（ms）；调小更快，过小可能偶发识别为空 */
var WORK_GRID_PROFILE_LOAD_WAIT_MS = 360;
/** 选择作品：下滑刷新后等待网格稳定（ms）；调小更快，过小可能漏识别 */
var WORK_GRID_PROFILE_RETRY_SETTLE_MS = 900;
/**
 * 网格「已赞」是否先跑无障碍首轮。默认 false：列表选中态/格内挂件文案等易误报已赞，与左下取色无关；只信偏移取色时请保持 false。
 */
var WORK_GRID_PROFILE_USE_A11Y_FIRST_PASS = false;
/** 纯坐标兜底容易点错位置：默认关闭；仅在你明确需要时才打开 */
var WORK_GRID_ENABLE_COORD_FALLBACK = false;
/** UI 树不可用时：允许用截屏像素粗识别封面格并点击进入 */
var WORK_GRID_ENABLE_IMAGE_COVER_PICK = true;
/** 全局开发者日志开关：只改这一个即可控制调试输出 */
var DEV_DEBUG_LOG = false;
/** 图像识别作品调试日志（跟随全局开关） */
var WORK_GRID_IMAGE_PICK_DEBUG = DEV_DEBUG_LOG;
/** 作品网格：用左下角“白色点赞数字”像素做验证（默认开） */
var WORK_GRID_ENABLE_LIKE_NUMBER_PIXEL_PICK = true;
/** 作品网格：用“文字边缘密度”像素定位（默认开） */
var WORK_GRID_ENABLE_TEXT_EDGE_PICK = true;
/** 作品网格：优先用 ImageView（近方形封面）定位（若节点可用则最精确） */
var WORK_GRID_ENABLE_IMAGEVIEW_PICK = true;
/** 启用简化版封面识别（推荐开启） */
var WORK_GRID_ENABLE_SIMPLE_COVER_PICK = true;
/** 近似抖音红心 UI 色（品红）：过松会把肤色、土黄、浅橙当成红 */
var WORK_GRID_HEART_RED_R_MIN = 178;
var WORK_GRID_HEART_RED_G_MAX = 108;
var WORK_GRID_HEART_RED_B_MAX = 112;
var WORK_GRID_HEART_RED_RG_MIN_GAP = 40;
var WORK_GRID_HEART_RED_RB_MIN_GAP = 40;
/** 已赞探针调试日志（跟随全局开关） */
var __DEBUG_WORK_GRID_LIKED_PROBE = DEV_DEBUG_LOG;
/** 像素探针预算（ms）：首轮/后续/进作品前快检 */
var WORK_GRID_PROBE_BUDGET_FIRST_MS = 8000;
var WORK_GRID_PROBE_BUDGET_NEXT_MS = 3000;
var WORK_GRID_PROBE_BUDGET_QUICK_MS = 450;

function __wgLogLiked(tag) {
  try {
    if (__DEBUG_WORK_GRID_LIKED_PROBE) appendLog("已赞探针:" + tag);
  } catch (eWg) {}
}

/** 仅根据文案判断已赞（不用 selected/checked，避免空心心与错误选中态误判） */
function nodeShowsAlreadyLikedFromDescOnly(n) {
  if (!n) return false;
  try {
    var d = n.desc && n.desc();
    if (d) {
      var s = String(d);
      if (/未点赞|未喜欢/.test(s)) return false;
      if (/已点赞|已喜欢|喜欢按钮已|喜欢，按钮，已/.test(s)) return true;
    }
  } catch (e0) {}
  return false;
}

function walkAncestorsForAlreadyLikedFromDescOnly(node, maxUp) {
  var n = node;
  for (var i = 0; i < (maxUp || 14) && n; i++, n = n.parent()) {
    if (nodeShowsAlreadyLikedFromDescOnly(n)) return true;
  }
  return false;
}

/** 44g 子树：仅当节点 desc 含明确「已赞」短语才认（不用 .* 宽松匹配） */
function likeBarSubtreeExplicitLikedDescOnly(root, maxDepth) {
  maxDepth = maxDepth != null ? maxDepth : 22;
  function walk(n, depth) {
    if (!n || depth > maxDepth) return false;
    try {
      if (nodeShowsAlreadyLikedFromDescOnly(n)) return true;
      var cn = n.className && n.className();
      var cns = cn ? String(cn) : "";
      if (likeBarNodeLooksLikeHeartIconClass(cns)) {
        var d = n.desc && n.desc();
        if (d) {
          var s = String(d);
          if (/未点赞|未喜欢/.test(s)) {
            /* 继续扫子节点 */
          } else if (/已点赞|已喜欢|喜欢按钮已|喜欢，按钮，已/.test(s)) return true;
        }
      }
      var cct = n.childCount && n.childCount();
      for (var i = 0; i < cct; i++) {
        try {
          if (walk(n.child(i), depth + 1)) return true;
        } catch (eCh) {}
      }
    } catch (eW) {}
    return false;
  }
  return walk(root, 0);
}

/** 未拿到截屏权限时：inner 可能被多处直接调用；先轻量识别系统窗再点允许，避免只阻塞在 captureScreen */
function workGridProbeNudgeScreenCaptureAllowIfDialogLikely() {
  if (__workGridScreenCaptureReady) return;
  try {
    bumpStuckWatchdogHeartbeat();
    var hit = false;
    try {
      if (text("禁止").findOne(70)) hit = true;
    } catch (e0) {}
    if (!hit) {
      try {
        if (textContains("投射").findOne(55)) hit = true;
      } catch (e1) {}
    }
    if (!hit) {
      try {
        if (textContains("录制").findOne(55)) hit = true;
      } catch (e2) {}
    }
    if (hit) {
      tryClickScreenCaptureAllowButton();
      sleep(160);
    }
  } catch (eN) {}
}

function captureScreenForWorkGridProbeInner() {
  workGridProbeNudgeScreenCaptureAllowIfDialogLikely();
  var img = null;
  if (typeof captureScreen === "function") {
    try {
      img = captureScreen();
    } catch (eC) {}
  }
  if (!img && typeof images !== "undefined" && images.captureScreen) {
    try {
      img = images.captureScreen();
    } catch (eC2) {}
  }
  if (img) __workGridScreenCaptureReady = true;
  return img;
}

/**
 * 系统录屏权限弹窗：各厂商 permission 包名 + 系统 dialog 按钮 id + 文案「允许」（仅节点点击，无坐标盲打）。
 */
function tryClickScreenCaptureAllowByIdButtonPreferAllow() {
  var ids = ["android:id/button1", "android:id/button2", "android:id/button3"];
  var ii;
  for (ii = 0; ii < ids.length; ii++) {
    try {
      var n = id(ids[ii]).findOne(220);
      if (!n) continue;
      var tx = "";
      try {
        tx = n.text && n.text();
      } catch (eTx) {}
      tx = tx ? String(tx) : "";
      if (tx.indexOf("禁止") >= 0 || /deny|decline/i.test(tx)) continue;
      if (/允许|Allow/i.test(tx) || /确定|^OK$/i.test(tx) || /立即开始|现在开始|开始|Start now/i.test(tx)) {
        if (clickNode(n)) return true;
      }
    } catch (eId) {}
  }
  return false;
}

function tryClickScreenCaptureAllowByPermissionPackages() {
  var pkgs = [
    "com.android.permissioncontroller",
    "com.google.android.permissioncontroller",
    "com.android.systemui",
    "com.android.packageinstaller",
    "com.android.settings",
    "com.miui.securitycenter",
    "com.huawei.systemmanager",
    "com.coloros.safecenter",
    "com.oplus.securitypermission",
    "com.vivo.permissionmanager",
    "com.samsung.android.permissioncontroller"
  ];
  var pi;
  for (pi = 0; pi < pkgs.length; pi++) {
    try {
      var n =
        text("允许").packageName(pkgs[pi]).findOne(220) ||
        textContains("允许").packageName(pkgs[pi]).findOne(100);
      if (n && clickNode(n)) return true;
    } catch (eP) {}
  }
  return false;
}

/** 系统录屏/投射弹窗：点「立即开始/现在开始/开始」 */
function tryClickScreenCaptureStartNowButton() {
  // 不要“一次点击就永不再试”：有些机型点到但未生效/被遮挡，需要持续尝试直到弹窗消失
  try {
    if (__screenCaptureStartNodeClicked && __screenCaptureStartNodeClickedAtMs) {
      if (Date.now() - __screenCaptureStartNodeClickedAtMs < 650) return false;
    }
  } catch (e00) {}
  function clickNodeOrCenter(n) {
    if (!n) return false;
    try {
      if (clickNode(n)) return true;
    } catch (e0) {}
    try {
      var b = n.bounds && n.bounds();
      if (b) {
        var cx = b.centerX();
        var cy = b.centerY();
        if (cx > 0 && cy > 0) {
          click(cx, cy);
          return true;
        }
      }
    } catch (e1) {}
    return false;
  }
  function clickNearestClickableAncestor(n, maxDepth) {
    var d = 0;
    var cur = n;
    while (cur && d < (maxDepth || 6)) {
      try {
        if (cur.clickable && cur.clickable()) {
          if (clickNodeOrCenter(cur)) return true;
        }
      } catch (eC) {}
      try {
        cur = cur.parent && cur.parent();
      } catch (eP) {
        cur = null;
      }
      d++;
    }
    return false;
  }
  function looksLikeStartNowText(tx) {
    tx = tx ? String(tx) : "";
    if (!tx) return false;
    if (/取消|Cancel/i.test(tx)) return false;
    return /立即开始|现在开始|开始投射|开始录制|Start now|Start/i.test(tx);
  }
  try {
    // 优先按钮 id
    var ids = ["android:id/button1", "android:id/button2", "android:id/button3"];
    for (var ii = 0; ii < ids.length; ii++) {
      try {
        var n = id(ids[ii]).findOne(180);
        if (!n) continue;
        var tx = "";
        try { tx = n.text && n.text(); } catch (eTx) {}
        tx = tx ? String(tx) : "";
        if (!looksLikeStartNowText(tx)) continue;
        if (clickNodeOrCenter(n) || clickNearestClickableAncestor(n, 8)) {
          __screenCaptureStartNodeClicked = true;
          __screenCaptureStartNodeClickedAtMs = Date.now();
          return true;
        }
      } catch (eId) {}
    }
  } catch (e0) {}
  try {
    // 文案兜底（不同 ROM 可能不是标准 button id）
    var t =
      textMatches(/^(立即开始|现在开始|开始投射|开始录制|开始)$/).findOne(420) ||
      textContains("立即开始").findOne(320) ||
      textContains("现在开始").findOne(320) ||
      textContains("开始投射").findOne(320) ||
      textContains("开始录制").findOne(320) ||
      descContains("立即开始").findOne(240) ||
      descContains("现在开始").findOne(240) ||
      textMatches(/Start now/i).findOne(320) ||
      textMatches(/^Start$/i).findOne(220);
    if (t) {
      if (clickNodeOrCenter(t) || clickNearestClickableAncestor(t, 10)) {
        __screenCaptureStartNodeClicked = true;
        __screenCaptureStartNodeClickedAtMs = Date.now();
        return true;
      }
      try {
        var p = t.parent();
        if (p && p.clickable && p.clickable() && p.click && p.click()) {
          __screenCaptureStartNodeClicked = true;
          __screenCaptureStartNodeClickedAtMs = Date.now();
          return true;
        }
      } catch (ePa) {}
    }
  } catch (e1) {}
  return false;
}

function tryClickScreenCaptureAllowButton() {
  if (__screenCaptureAllowNodeClicked) return false;
  // 有些机型先弹「开始投射/立即开始」，点完才会进入允许/确定
  try { if (tryClickScreenCaptureStartNowButton()) return true; } catch (eS0) {}
  if (tryClickScreenCaptureAllowByIdButtonPreferAllow()) {
    __screenCaptureAllowNodeClicked = true;
    return true;
  }
  if (tryClickScreenCaptureAllowByPermissionPackages()) {
    __screenCaptureAllowNodeClicked = true;
    return true;
  }
  try {
    var t =
      text("允许").findOne(420) ||
      textContains("允许").findOne(200) ||
      descContains("允许").findOne(200) ||
      desc("允许").findOne(200) ||
      text("Allow").findOne(200);
    if (t) {
      if (clickNode(t)) {
        __screenCaptureAllowNodeClicked = true;
        return true;
      }
      try {
        var p = t.parent();
        if (p && p.clickable && p.clickable() && p.click && p.click()) {
          __screenCaptureAllowNodeClicked = true;
          return true;
        }
      } catch (ePa) {}
    }
  } catch (eAllow) {}
  return false;
}

/** 进入粉丝列表等界面后短时轮询：仅无障碍点「允许」（成功一次后不再连点） */
function pollDismissScreenCaptureDialogA11yOnly(maxMs) {
  if (__workGridScreenCaptureReady) return;
  var ms = typeof maxMs === "number" && maxMs > 0 ? maxMs : 4500;
  var end = Date.now() + ms;
  while (Date.now() < end) {
    if (__workGridScreenCaptureReady) return;
    var clicked = false;
    try {
      clicked = !!tryClickScreenCaptureAllowButton();
    } catch (e0) {}
    // 已经点到一次允许后，不要再傻等满额；稍让出即可
    if (clicked && __screenCaptureAllowNodeClicked) {
      sleep(420);
      return;
    }
    sleep(260);
  }
}

/**
 * 主流程运行中、截屏尚未成功前：后台轻轮询「禁止/录制/投射」以点允许。
 * 弹窗常在进抖音、首次真正 capture 时才出现，不能只依赖开始按钮后那一小段循环。
 */
function ensureScreenCaptureAllowPollWhileAutomation() {
  if (__workGridScreenCaptureReady) return;
  try {
    if (__screenCaptureAllowPollThread) {
      try {
        if (
          __screenCaptureAllowPollThread.isAlive &&
          __screenCaptureAllowPollThread.isAlive()
        ) {
          return;
        }
      } catch (eA) {}
    }
  } catch (e0) {}
  try {
    __screenCaptureAllowPollThread = threads.start(function () {
      while (__automationWorkerActive && !__workGridScreenCaptureReady) {
        try {
          bumpStuckWatchdogHeartbeat();
          var hit = false;
          try {
            if (text("禁止").findOne(90)) hit = true;
          } catch (e1) {}
          if (!hit) {
            try {
              if (textContains("投射").findOne(70)) hit = true;
            } catch (e2) {}
          }
          if (!hit) {
            try {
              if (textContains("录制").findOne(70)) hit = true;
            } catch (e3) {}
          }
          if (!hit) {
            try {
              if (
                textContains("开始截取").findOne(70) ||
                textContains("截取您的屏幕").findOne(70) ||
                textContains("屏幕上显示的所有内容").findOne(70)
              )
                hit = true;
            } catch (e4) {}
          }
          if (hit) {
            tryClickScreenCaptureAllowButton();
          }
        } catch (eP) {}
        sleep(520);
      }
      __screenCaptureAllowPollThread = null;
    });
  } catch (eTh) {
    __screenCaptureAllowPollThread = null;
  }
}

function captureScreenOnceForWorkGridProbe(maxBudgetMs) {
  try {
    if (typeof images === "undefined" || !images.pixel) return null;
    if (__workGridScreenCaptureReady) {
      return captureScreenForWorkGridProbeInner();
    }
    if (!__workGridScreenCaptureRequestIssued) {
      __workGridScreenCaptureRequestIssued = true;
      try {
        if (typeof requestScreenCapture === "function") requestScreenCapture(false);
      } catch (eR0) {}
      try {
        if (images.requestScreenCapture) images.requestScreenCapture(false);
      } catch (eR1) {}
      sleep(200);
      bumpStuckWatchdogHeartbeat();
      var imgEarly = captureScreenForWorkGridProbeInner();
      if (imgEarly) return imgEarly;
    }
    var longMs = !__workGridScreenCaptureLongAllowCycleDone;
    __workGridScreenCaptureLongAllowCycleDone = true;
    var budgetMs = longMs ? WORK_GRID_PROBE_BUDGET_FIRST_MS : WORK_GRID_PROBE_BUDGET_NEXT_MS;
    if (typeof maxBudgetMs === "number" && maxBudgetMs > 0) {
      budgetMs = Math.min(budgetMs, Math.floor(maxBudgetMs));
    }
    var deadline = Date.now() + budgetMs;
    while (Date.now() < deadline) {
      bumpStuckWatchdogHeartbeat();
      var imgFirst = captureScreenForWorkGridProbeInner();
      if (imgFirst) return imgFirst;
      tryClickScreenCaptureAllowButton();
      // 放慢“点允许/重试”节奏，避免弹窗闪烁过快
      sleep(260);
    }
    try {
      appendLog(
        "截屏权限本轮未就绪(可能弹窗滞后)；进抖音后将继续尝试，或请手动允许"
      );
    } catch (eL1) {}
    return null;
  } catch (e0) {
    return null;
  }
}

function ensureScreenCaptureReady(maxWaitMs) {
  if (__workGridScreenCaptureReady) return true;
  try {
    var img = captureScreenOnceForWorkGridProbe(typeof maxWaitMs === "number" ? maxWaitMs : 5200);
    if (img) {
      try {
        img.recycle();
      } catch (eR) {}
    }
  } catch (e0) {}
  return !!__workGridScreenCaptureReady;
}

/** 主流程前倒数；秒数由 __AUTOMATION_PRE_START_COUNTDOWN_SEC 控制，0 关闭 */
function runAutomationPreStartCountdown() {
  var sec =
    typeof __AUTOMATION_PRE_START_COUNTDOWN_SEC === "number"
      ? Math.floor(__AUTOMATION_PRE_START_COUNTDOWN_SEC)
      : 0;
  if (sec < 1) return;
  var k;
  for (k = sec; k >= 1; k--) {
    try {
      appendLog("脚本" + k + "秒后开始");
    } catch (eL) {}
    bumpStuckWatchdogHeartbeat();
    if (k > 1) sleep(1000);
  }
}

/**
 * 点「开始」后：立刻跑一轮截屏权限（后台轮询由外层 ensureScreenCaptureAllowPollWhileAutomation 启动）。
 */
function primeScreenCapturePermissionAtAutomationStart() {
  try {
    if (typeof images === "undefined" || !images.pixel) return;
    appendLog("允许权限");
    captureScreenOnceForWorkGridProbe();
  } catch (ePrime) {}
}

/**
 * 封面格内 44g/3f6 或格内任意「已赞」类 desc；可选 probeImg 做左下角红心像素兜底。
 * @param {boolean} [skipPixelProbe] 为 true 时不读像素（批量扫屏时先无障碍一轮，再统一截屏像素，避免每格重复算色）
 */
function workGridCellShowsAlreadyLiked(container, probeImg, skipPixelProbe) {
  if (!container) return false;
  // 优先：用 44g 锚点精准采样（仅当已有截屏时做，避免每格单独截屏/弹权限）
  if (probeImg) {
    try {
      if (isWorkLikedBy44gAnchor(container, probeImg)) {
        __wgLogLiked("44g锚点检测到已赞");
        return true;
      }
    } catch (e44g) {}
  }
  try {
    var b = container.bounds();
    var bar = id("com.ss.android.ugc.aweme:id/44g")
      .boundsInside(b.left + 1, b.top + 1, b.right - 1, b.bottom - 1)
      .findOne(300);
    var tv = id("com.ss.android.ugc.aweme:id/3f6")
      .boundsInside(b.left + 1, b.top + 1, b.right - 1, b.bottom - 1)
      .findOne(300);
    var has44gBar = !!bar;
    var hasModernStrip = has44gBar || !!tv;

    if (!hasModernStrip) {
      if (walkAncestorsForAlreadyLiked(container, 4)) {
        __wgLogLiked("container祖先无障碍");
        return true;
      }
    }

    if (bar) {
      if (
        nodeShowsAlreadyLikedFromDescOnly(bar) ||
        walkAncestorsForAlreadyLikedFromDescOnly(bar, 10) ||
        likeBarSubtreeExplicitLikedDescOnly(bar, 22)
      ) {
        __wgLogLiked("44g条明确已赞文案");
        return true;
      }
    }

    if (tv) {
      if (hasModernStrip) {
        if (
          nodeShowsAlreadyLikedFromDescOnly(tv) ||
          walkAncestorsForAlreadyLikedFromDescOnly(tv, 10)
        ) {
          __wgLogLiked("3f6明确已赞文案");
        return true;
        }
      } else {
        if (nodeShowsAlreadyLikedState(tv) || walkAncestorsForAlreadyLiked(tv, 10)) {
          __wgLogLiked("3f6无障碍状态");
          return true;
        }
        if (likeCountSiblingHeartLooksLiked(tv)) {
          __wgLogLiked("3f6兄弟心形");
          return true;
        }
      }
    }

    if (!hasModernStrip && likeZoneCornerImageLooksLiked(container)) {
      __wgLogLiked("格角心形图");
      return true;
    }

    if (!hasModernStrip) {
    try {
      var hit = descMatches(/已点赞|已喜欢|喜欢按钮已/)
        .boundsInside(b.left, b.top, b.right, b.bottom)
        .findOne(200);
        if (hit) {
          __wgLogLiked("格内全局desc");
          return true;
        }
    } catch (e3) {}
    }

    if (skipPixelProbe !== true && workGridCellPixelProbeAlreadyLiked(container, probeImg)) {
      __wgLogLiked(has44gBar ? "44g条像素红心" : "封面角像素红心");
      return true;
    }
  } catch (e4) {}
  return false;
}

/** 当前屏作品列表（thumb 为 container；bar/count 为 44g/3f6 等）是否出现任一「已赞」格；有则本用户跳过 */
function profileVisibleWorksShowAnyAlreadyLiked(list, mode) {
  if (!list || !list.length) return false;
  var j;
  if (mode === "thumb") {
    var i0;
    if (WORK_GRID_PROFILE_USE_A11Y_FIRST_PASS) {
    for (i0 = 0; i0 < list.length; i0++) {
      if (workContainerIsGraphicText(list[i0])) continue;
      if (workGridCellShowsAlreadyLiked(list[i0], null, true)) return true;
    }
    }
    var probeT = captureScreenOnceForWorkGridProbe(WORK_GRID_PROBE_BUDGET_QUICK_MS);
    if (probeT) {
      for (i0 = 0; i0 < list.length; i0++) {
        if (workContainerIsGraphicText(list[i0])) continue;
        if (workGridCellBottomLeftOffsetRegionHasFilledRed(list[i0], probeT)) return true;
      }
    }
    return false;
  }
  for (j = 0; j < list.length; j++) {
    if (
      nodeShowsAlreadyLikedState(list[j]) ||
      walkAncestorsForAlreadyLiked(list[j], 12)
    ) {
      return true;
    }
  }
  return false;
}

/** 当前屏收集到的封面格：任意一格已赞（小红心）即视为本粉丝跳过；含图文格一并扫 */
function profileAllWorkContainersAnyAlreadyLiked(containers) {
  if (!containers || !containers.length) return false;
  // 只检测前 6 个作品格（避免更靠后的实心作品触发“整个人跳过”）
  var MAX_CHECK = 9;
  var checkList = containers.slice(0, Math.min(containers.length, MAX_CHECK));
  if (__DEBUG_WORK_GRID_LIKED_PROBE) {
    try { appendLog("检测作品数:" + containers.length + ", 只检前" + checkList.length + "个"); } catch (eDbg) {}
  }
  var i;
  // 先做一次“明确文案”快检：只有出现明确「已点赞/已喜欢」才立即判定为已赞
  // 这样可以避免纯像素探针在空心心形+封面干扰下的误判直接触发「已赞过返回」。
  // 性能优化：文案快检只扫前 3 格且缩短 findOne 超时
  var quickN = Math.min(checkList.length, 3);
  for (i = 0; i < quickN; i++) {
    try {
      var b0 = checkList[i].bounds();
      var bar0 = id("com.ss.android.ugc.aweme:id/44g")
        .boundsInside(b0.left, b0.top, b0.right, b0.bottom)
        .findOne(20);
      if (bar0 && nodeShowsAlreadyLikedFromDescOnly(bar0)) return true;
    } catch (e0) {}
  }
  var probeA = captureScreenOnceForWorkGridProbe(WORK_GRID_PROBE_BUDGET_QUICK_MS);
  if (!probeA) return false;
  // 只用 3f6 锚点检测（不依赖 44g）
  for (i = 0; i < checkList.length; i++) {
    if (isWorkLikedBy3f6Anchor(checkList[i], probeA)) {
      if (__DEBUG_WORK_GRID_LIKED_PROBE) {
        try { appendLog("3f6锚点检测到已赞"); } catch (eL1) {}
      }
      return true;
    }
  }
  return false;
}

/** 进入作品后若落到商家/电商页，直接返回（避免误操作） */
function isLikelyDouyinMerchantPageAfterEnterWork() {
  try {
    // 仅用文案做轻量判断（打包环境下 id/class 可能不可用）
    var n =
      textMatches(/加入购物车|立即购买|马上抢|去购买|去下单|领券|优惠券|店铺|进店|商品详情|商品橱窗|小店|购物车/).findOne(180) ||
      descMatches(/加入购物车|立即购买|去购买|去下单|店铺|进店|商品详情|商品橱窗|小店|购物车|商家,按钮,/).findOne(180);
    return !!n;
  } catch (e) {}
  return false;
}

/** 个人主页 Tab 是否已落在「商家」（企业号常见） */
function isDouyinProfileMerchantTabSelected() {
  try {
    var tab = descMatches(/(商家|商品),按钮,?/).findOne(220);
    if (tab) {
      try {
        if (typeof tab.selected === "function" && tab.selected()) return true;
      } catch (eS0) {}
      return true;
    }
  } catch (e0) {}
  try {
    var t2 = textMatches(/^(商家|商品)$/).findOne(180);
    if (t2) {
      try {
        if (typeof t2.selected === "function" && t2.selected()) return true;
      } catch (eS1) {}
      return true;
    }
  } catch (e1) {}
  return false;
}

/** 当前页是否存在“作品”锚点（无锚点通常不是可选作品主页） */
function hasDouyinProfileWorksAnchor() {
  try {
    var n =
      textMatches(/^作品\s*\d*$/).findOne(180) ||
      text("作品").findOne(180) ||
      descMatches(/^作品\s*\d*$/).findOne(180) ||
      desc("作品").findOne(180);
    return !!n;
  } catch (e) {}
  return false;
}

/** 点击作品后是否仍停留在个人主页的作品网格（说明未成功进入播放页） */
function isStillOnDouyinProfileWorkGridAfterClick() {
  try {
    // 播放页一般不会出现「作品」Tab；打包环境下优先用 text/desc 轻量判断
    var n =
      textMatches(/^作品\s*\d*$/).findOne(160) ||
      text("作品").findOne(160) ||
      desc("作品").findOne(160);
    if (n) return true;
  } catch (e0) {}
  return false;
}

function isStillOnSodaProfileWorkGridAfterClick() {
  return isStillOnSodaProfileWorkGridAfterClickQuick();
}

/** 轻量：判断点击后是否仍在主页视频网格（避免 wait 轮询里全树 find） */
function isStillOnSodaProfileWorkGridAfterClickQuick() {
  if (isSodaWorkPlayerPageLikelyFast(32)) return false;
  try {
    if (text("视频").packageName(SODA_PKG).findOne(32)) return true;
    if (text("作品").packageName(SODA_PKG).findOne(32)) return true;
  } catch (e0) {}
  return false;
}

/** 点击作品后给页面反应时间：短轮询，持续仍在作品页才判失败 */
function waitWorkEnterAfterClickOrStillGrid(maxMs, opts) {
  opts = opts || {};
  var isSoda = opts.soda === true;
  if (isSoda) {
    var sodaMs =
      typeof SODA_WAIT_ENTER_PLAYER_MS === "number" && SODA_WAIT_ENTER_PLAYER_MS > 0
        ? SODA_WAIT_ENTER_PLAYER_MS
        : 480;
    if (!opts.skipInitialSettle) {
      sleepCtrl(
        typeof SODA_STEP10_AFTER_CLICK_WORK_MS === "number" && SODA_STEP10_AFTER_CLICK_WORK_MS > 0
          ? SODA_STEP10_AFTER_CLICK_WORK_MS
          : 180
      );
    }
    var sodaEnd = Date.now() + sodaMs;
    var sodaPoll =
      typeof SODA_WAIT_ENTER_PLAYER_POLL_MS === "number" && SODA_WAIT_ENTER_PLAYER_POLL_MS > 0
        ? SODA_WAIT_ENTER_PLAYER_POLL_MS
        : 32;
    while (Date.now() < sodaEnd && !__scriptUserStop) {
      if (dismissSodaWorkVideoListenAdIfAny(40)) {
        sleepCtrl(80);
      }
      if (isSodaWorkPlayerPageLikelyFast(30)) return true;
      if (!isStillOnSodaProfileWorkGridAfterClickQuick()) return true;
      sleepCtrl(sodaPoll);
    }
    return isSodaWorkPlayerPageLikelyFast(35);
  }
  var ms = typeof maxMs === "number" && maxMs > 0 ? maxMs : 2600;
  var endAt = Date.now() + ms;
  var stillHit = 0;
  while (Date.now() < endAt && !__scriptUserStop) {
    if (!isSoda && isLikelyDouyinMerchantPageAfterEnterWork()) return false;
    if (isSoda && detectSodaProfileNoWorksOrPrivate(80, { requireContentArea: true })) return false;
    var stillGrid = isSoda ? isStillOnSodaProfileWorkGridAfterClick() : isStillOnDouyinProfileWorkGridAfterClick();
    if (!stillGrid) {
      return true;
    }
    stillHit++;
    // 前几拍允许页面切换动画/网络抖动，别太早判失败
    if (stillHit < 3) {
      sleepCtrl(180);
      continue;
    }
    sleepCtrl(220);
  }
  return false;
}

/** 粉丝用户作品页：随机进一个作品（优先点封面格 container）；兜底才按 44g/3f6 点赞条；没有入口则返回 */
function randomClickWorkLikeHeartOrBack(opts) {
  opts = opts || {};
  var isSoda = opts.soda === true;
  var sodaCoversReady = null;
  if (__scriptUserStop) return false;
  __workEntryTerminalFail = false;

  // 无作品/私密等提示文案：只返回一次，避免误点进头像/空白区域
  try {
    if (isSoda) {
      // 汽水：右滑进视频页后，作品识别与火力共用完整链路
      if (!swipeSodaProfileToVideoPage()) {
        __workEntryTerminalFail = true;
        return false;
      }
      if (detectSodaProfileSongsPlayAllAfterSwipe(60)) {
        sodaBackOnceForNoVideo("用户不符合，返回");
        return false;
      }
      pollDismissScreenCaptureDialogA11yOnly(20);
      var sodaPaintState = waitForSodaVideoPageAfterSwipe();
      sodaCoversReady = sodaHasCachedVideoGrid() ? __sodaVideoGridCache.cells : null;
      if (!sodaCoversReady && sodaPaintState !== "ready") {
        sleepCtrl(
          typeof SODA_PROFILE_POST_PAINT_WAIT_MS === "number" && SODA_PROFILE_POST_PAINT_WAIT_MS > 0
            ? SODA_PROFILE_POST_PAINT_WAIT_MS
            : 30
        );
        if (!sodaCoversReady && sodaHasCachedVideoGrid()) {
          sodaCoversReady = __sodaVideoGridCache.cells;
        }
      }
      if (sodaPaintState === "empty") {
        sodaBackOnceForEmptyProfile(detectSodaProfileEmptyStateReasonFast(40) || "暂无内容");
        return false;
      }
      if (sodaPaintState !== "ready" && !sodaCoversReady) {
        var sodaEmptyReason = detectSodaProfileEmptyStateReasonFast(40);
        if (sodaEmptyReason) {
          sodaBackOnceForEmptyProfile(sodaEmptyReason);
          return false;
        }
        if (sodaPaintState === "timeout" && sodaBackIfEmptyProfileDetected(50)) {
          return false;
        }
      }
      if (isLikelyDouyinMerchantPageAfterEnterWork()) {
        appendLog("商家页返回");
        try {
          back();
        } catch (eBkPreShopS) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
      if (isDouyinProfileMerchantTabSelected()) {
        appendLog("商家号返回");
        try {
          back();
        } catch (eBkMS) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
    } else {
      sleepCtrl(PACE_9_11.step10LeadIn);
      pollDismissScreenCaptureDialogA11yOnly(120);
      sleepCtrl(
        typeof WORK_GRID_PROFILE_LOAD_WAIT_MS === "number" && WORK_GRID_PROFILE_LOAD_WAIT_MS > 0
          ? WORK_GRID_PROFILE_LOAD_WAIT_MS
          : 650
      );
      if (!ensureScreenCaptureReady(5200)) {
        appendLog("截屏权限未就绪，跳过本用户");
        return false;
      }
      ensureDouyinProfileWorksTab();
      sleepCtrl(100);
      // 前置拦截：部分商家号在主页就会出现“去购买/商品橱窗”等文案，直接返回，避免先点作品再判商家
      if (isLikelyDouyinMerchantPageAfterEnterWork()) {
        appendLog("商家页返回");
        try {
          back();
        } catch (eBkPreShop) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
      if (isDouyinProfileMerchantTabSelected()) {
        appendLog("商家号返回");
        try {
          back();
        } catch (eBkM0) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
      if (!hasDouyinProfileWorksAnchor()) {
        appendLog("该帐号不符合");
        try {
          back();
        } catch (eBkNoAnchor) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
    }
    if (!isSoda) {
      var noWorksMs = 180;
      var noWorks =
        textMatches(/暂无作品|还没有(发布)?作品|暂时没有作品|没有作品|作品为空|还没有内容|暂无内容|暂无视频|没有视频/).findOne(noWorksMs) ||
        textMatches(/已设置为私密|该账号已设置私密|对方设置了隐私|由于对方的隐私设置/).findOne(noWorksMs);
      if (noWorks) {
        appendLog("无作品，返回");
        try {
          back();
        } catch (eBk) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
    }
  } catch (eNW) {}

  // 识别重试：火力 2 次+下滑；汽水有缓存格则直接点
  var wgBand = isSoda ? sodaProfileWorkGridYBand() : profileWorkGridYBand();
  var covers = isSoda && sodaCoversReady ? sodaCoversReady : null;
  var maxRetries = isSoda ? 1 : 2;
  for (var retry = 0; retry < maxRetries; retry++) {
    if (retry > 0 || !covers || !covers.length) {
      if (retry > 0) {
        if (isSoda) {
          sleepCtrl(
            typeof SODA_WORK_COVER_RETRY_WAIT_MS === "number" && SODA_WORK_COVER_RETRY_WAIT_MS > 0
              ? SODA_WORK_COVER_RETRY_WAIT_MS
              : 400
          );
        } else {
        appendLog("下滑刷新，第 " + retry + "/" + maxRetries + " 次重试");
        try {
          var sw = device.width;
          var sh = device.height;
          swipe(sw * 0.5, sh * 0.8, sw * 0.5, sh * 0.25, 500);
          sleepCtrl(
            typeof WORK_GRID_PROFILE_RETRY_SETTLE_MS === "number" && WORK_GRID_PROFILE_RETRY_SETTLE_MS > 0
              ? WORK_GRID_PROFILE_RETRY_SETTLE_MS
              : 1200
          );
        } catch (eSw2) {}
        }
      }
    }
    if (!(covers && covers.length > 0)) {
      if (isSoda) {
        var emptyNow = detectSodaProfileEmptyStateReasonFast(50);
        if (emptyNow) {
          covers = null;
          break;
        }
      }
      try {
        covers = isSoda
          ? pickSodaWorkCoverPositionsForClick(wgBand)
          : pickWorkCoverPositionsFullChain(wgBand, null);
      } catch (eTry) {
        covers = null;
      }
    }
    if (covers && covers.length > 0) break;
  }

  try {
    if (WORK_GRID_IMAGE_PICK_DEBUG) {
      try {
        appendLog("识别到 " + (covers ? covers.length : 0) + " 个作品");
        for (var ii = 0; covers && ii < covers.length; ii++) {
          appendLog("作品" + (ii + 1) + ": (" + Math.floor(covers[ii].x) + "," + Math.floor(covers[ii].y) + ")");
        }
      } catch (eDbgImg) {}
    }
    if (covers && covers.length > 0) {
      var ri = Math.floor(Math.random() * covers.length);
      var p = covers[ri];
      // 点击前再做一次商家前置拦截，避免“刚好识别完成后页面切到商家态”仍继续点击
      if (isLikelyDouyinMerchantPageAfterEnterWork()) {
        appendLog("商家页返回");
      try {
        back();
        } catch (eBkPreShop2) {}
      sleepCtrl(PACE_9_11.step10NoEntryBack);
      __workEntryTerminalFail = true;
    return false;
  }
    if (isSoda) appendLogProgress("点击视频作品");
    else appendLog("点击作品");
      __lastWorkClickTs = Date.now();
      click(p.x, p.y);
      if (isSoda) {
        sleepCtrl(
          typeof SODA_STEP10_AFTER_CLICK_WORK_MS === "number" && SODA_STEP10_AFTER_CLICK_WORK_MS > 0
            ? SODA_STEP10_AFTER_CLICK_WORK_MS
            : 180
        );
        if (dismissSodaWorkVideoListenAdIfAny(80)) {
          sleepCtrl(80);
          if (isSodaWorkPlayerPageLikelyFast(35) || !isStillOnSodaProfileWorkGridAfterClickQuick()) {
            __noWorkLikeEntryDidBack = false;
            return true;
          }
        }
        if (!waitWorkEnterAfterClickOrStillGrid(2800, { soda: true, skipInitialSettle: true })) {
          appendLog("点击后仍在视频页，返回跳过");
          try {
            back();
          } catch (eBkStill) {}
          sleepCtrl(PACE_9_11.step10NoEntryBack);
          if (detectSodaProfileNoWorksOrPrivate(120, { requireContentArea: true })) {
            __sodaNoVideoSkipToNext = true;
          }
          __workEntryTerminalFail = true;
          return false;
        }
      } else {
        sleepCtrl(PACE_9_11.step10AfterEnterWork);
        // 火力：轮询确认已离开作品网格
        if (!waitWorkEnterAfterClickOrStillGrid(2800, null)) {
          appendLog("点击后仍在作品页，返回跳过");
          try {
            back();
          } catch (eBkStill) {}
          sleepCtrl(PACE_9_11.step10NoEntryBack);
          __workEntryTerminalFail = true;
          return false;
        }
      }
      // 若误入商家/电商页：直接返回，不再继续“再点作品”
      if (isLikelyDouyinMerchantPageAfterEnterWork()) {
        appendLog("检测到商家页，返回");
        try {
          back();
        } catch (eBkShop) {}
        sleepCtrl(PACE_9_11.step10NoEntryBack);
        __workEntryTerminalFail = true;
        return false;
      }
      __noWorkLikeEntryDidBack = false;
      return true;
    }
  } catch (eImg) {}

  if (isSoda) {
    var emptyReasonFinal = detectSodaProfileEmptyStateReasonFast(60);
    if (emptyReasonFinal) {
      sodaBackOnceForEmptyProfile(emptyReasonFinal);
    } else if (detectSodaProfileEmptyContentStateTextOnly(60)) {
      sodaBackOnceForEmptyProfile("暂无内容");
    } else {
      sodaBackOnceForNoVideo("未找到视频作品，返回");
    }
  } else {
    appendLog("2次重试后未找到作品，按返回键");
    try { back(); } catch (eBk2) {}
    sleepCtrl(PACE_9_11.step10NoEntryBack);
    __workEntryTerminalFail = true;
  }
  return false;
}

function tryEnterWorkWithProfileOperateGate(maxStep) {
  var guard = 0;
  while (guard < 18 && !__scriptUserStop) {
    guard++;
    var dyid = "";
    for (var di = 0; di < 3 && !__scriptUserStop; di++) {
      try { dyid = normalizeDbLine(readDouyinIdFromFanProfilePage()); } catch (eDy0) { dyid = ""; }
      if (dyid) break;
      sleepCtrl(120);
    }
    if (dyid && hasOperatedDyidInWindow(dyid)) {
      __currentTargetOperatedSkipN++;
      if (__currentTargetOperatedSkipN > 10) {
        appendLog("对标不好 更换对标");
        resetCurrentTargetOperatedSkipCounter();
        __currentFanProfileDyid = "";
        if (!runFlowSteps1Through9ForInjectedRestart(maxStep, false)) {
          return false;
        }
        resetCurrentTargetOperatedSkipCounter();
        continue;
      }
      appendLog("已操作过，换下一个");
      try { back(); } catch (eBk0) {}
      sleepCtrl(420);
      __currentFanProfileDyid = "";
      if (!clickNextFollowerInList()) return false;
      continue;
    }
    __currentFanProfileDyid = dyid || "";
    var entered = randomClickWorkLikeHeartOrBack();
    if (!entered && !__scriptUserStop && !__workEntryTerminalFail) {
      sleepCtrl(420);
      entered = randomClickWorkLikeHeartOrBack();
    }
    if (!entered && !__scriptUserStop && !__workEntryTerminalFail) {
      sleepCtrl(800);
      entered = randomClickWorkLikeHeartOrBack();
    }
    return entered;
  }
  return false;
}

/** UiCollection → 数组 */
function uiCollectionToArray(coll) {
  var arr = [];
  if (!coll || !coll.size) return arr;
  for (var i = 0; i < coll.size(); i++) {
    try {
      arr.push(coll.get(i));
    } catch (e) {}
  }
  return arr;
}

/** 播放页右侧竖条：竖向比例带 + 靠右；visibleToUser 为真优先（避免点到 ViewPager 里上一页缓存的 gln/dil） */
function filterPlayerSidebarNodes(nodes, yMinRatio, yMaxRatio, xMinRatio) {
  var w = device.width;
  var h = device.height;
  var y1 = Math.floor(h * yMinRatio);
  var y2 = Math.floor(h * yMaxRatio);
  var xr = typeof xMinRatio === "number" ? xMinRatio : 0.7;
  var xMin = Math.floor(w * xr);
  var strict = [];
  var loose = [];
  for (var i = 0; i < nodes.length; i++) {
    var n = nodes[i];
    try {
      var b = n.bounds();
      if (b.centerX() < xMin) continue;
      var cy = b.centerY();
      if (cy < y1 || cy > y2) continue;
      if (b.right < 24 || b.left > w - 4) continue;
      if (b.bottom < 60 || b.top > h - 20) continue;
      var vis = true;
      try {
        if (typeof n.visibleToUser === "function") vis = !!n.visibleToUser();
      } catch (e0) {
        vis = true;
      }
      loose.push(n);
      if (vis) strict.push(n);
    } catch (e1) {}
  }
  return strict.length ? strict : loose;
}

/** 多候选时取遍历序最后一个，常对应当前页 */
function pickLastSidebarNode(nodes) {
  if (!nodes || nodes.length === 0) return null;
  return nodes[nodes.length - 1];
}

function findBestGlnForCurrentVideo() {
  var passes = [
    { bands: [[0.38, 0.62], [0.32, 0.68]], xMin: 0.7 },
    { bands: [[0.3, 0.7], [0.24, 0.78]], xMin: 0.58 },
  ];
  for (var pi = 0; pi < passes.length; pi++) {
    var st = passes[pi];
    for (var bi = 0; bi < st.bands.length; bi++) {
      var y1 = st.bands[bi][0];
      var y2 = st.bands[bi][1];
      var xm = st.xMin;
    try {
      var coll0 = id("com.ss.android.ugc.aweme:id/gl1").find();
      var filt0 = filterPlayerSidebarNodes(uiCollectionToArray(coll0), y1, y2, xm);
      var pick0 = pickLastSidebarNode(filt0);
      if (pick0) return pick0;
    } catch (e0a) {}
    try {
      var coll0b = idMatches(/.*:id\/gl1$/).find();
      var filt0b = filterPlayerSidebarNodes(uiCollectionToArray(coll0b), y1, y2, xm);
      var pick0b = pickLastSidebarNode(filt0b);
      if (pick0b) return pick0b;
    } catch (e0b) {}
    try {
      var coll0c = id("com.ss.android.ugc.aweme:id/gle").find();
      var filt0c = filterPlayerSidebarNodes(uiCollectionToArray(coll0c), y1, y2, xm);
      var pick0c = pickLastSidebarNode(filt0c);
      if (pick0c) return pick0c;
    } catch (e0c) {}
    try {
      var coll0d = idMatches(/.*:id\/gle$/).find();
      var filt0d = filterPlayerSidebarNodes(uiCollectionToArray(coll0d), y1, y2, xm);
      var pick0d = pickLastSidebarNode(filt0d);
      if (pick0d) return pick0d;
    } catch (e0d) {}
    try {
      var coll = id("com.ss.android.ugc.aweme:id/gln").find();
        var filt = filterPlayerSidebarNodes(uiCollectionToArray(coll), y1, y2, xm);
      var pick = pickLastSidebarNode(filt);
      if (pick) return pick;
    } catch (e) {}
      try {
        var collM = idMatches(/.*:id\/gln$/).find();
        var filtM = filterPlayerSidebarNodes(uiCollectionToArray(collM), y1, y2, xm);
        var pickM = pickLastSidebarNode(filtM);
        if (pickM) return pickM;
      } catch (em) {}
    try {
      var c2 = descMatches(/未点赞.*喜欢.*按钮|已点赞.*喜欢.*按钮/).clickable(true).find();
        var f2 = filterPlayerSidebarNodes(uiCollectionToArray(c2), y1, y2, xm);
      var p2 = pickLastSidebarNode(f2);
      if (p2) return p2;
    } catch (e2) {}
    try {
      var c3 = descContains("喜欢").descContains("按钮").clickable(true).find();
        var f3 = filterPlayerSidebarNodes(uiCollectionToArray(c3), y1, y2, xm);
      var p3 = pickLastSidebarNode(f3);
      if (p3) return p3;
    } catch (e3) {}
      try {
        var c4 = descContains("点赞").clickable(true).find();
        var f4 = filterPlayerSidebarNodes(uiCollectionToArray(c4), y1, y2, xm);
        var p4 = pickLastSidebarNode(f4);
        if (p4) return p4;
      } catch (e4) {}
    }
  }
  return null;
}

function findBestCollectControlForCurrentVideo() {
  var tryIds = ["dil", "d1l", "dfl"];
  var bands = [
    [0.54, 0.84],
    [0.5, 0.88],
  ];
  for (var bi = 0; bi < bands.length; bi++) {
    var y1 = bands[bi][0];
    var y2 = bands[bi][1];
    for (var tj = 0; tj < tryIds.length; tj++) {
      try {
        var coll = id("com.ss.android.ugc.aweme:id/" + tryIds[tj]).find();
        var filt = filterPlayerSidebarNodes(uiCollectionToArray(coll), y1, y2);
        var pick = pickLastSidebarNode(filt);
        if (pick) return pick;
      } catch (e) {}
    }
    try {
      var c2 = descMatches(/未收藏.*按钮|已收藏.*按钮/).clickable(true).find();
      var f2 = filterPlayerSidebarNodes(uiCollectionToArray(c2), y1, y2);
      var p2 = pickLastSidebarNode(f2);
      if (p2) return p2;
    } catch (e2) {}
    try {
      var c3 = descContains("收藏").clickable(true).find();
      var f3 = filterPlayerSidebarNodes(uiCollectionToArray(c3), y1, y2);
      var p3 = pickLastSidebarNode(f3);
      if (p3) return p3;
    } catch (e3) {}
  }
  return null;
}

function pickLastVisibleOrLast(coll) {
  var arr = uiCollectionToArray(coll);
  var vis = [];
  for (var i = 0; i < arr.length; i++) {
    var n = arr[i];
    try {
      if (typeof n.visibleToUser === "function" && !n.visibleToUser()) continue;
    } catch (e) {}
    vis.push(n);
  }
  var u = vis.length ? vis : arr;
  return u.length ? u[u.length - 1] : null;
}

/** 播放页点赞：当前播放页右侧 gln（findOne 易命中上一页缓存，改为 find + 过滤 + 取最后一个） */
function clickLikeOnDouyinWorkPlayer(maxMs) {
  if (isSodaPlatformSelected()) return clickLikeOnSodaWorkPlayer(maxMs);
  var likeStartMs = Date.now();
  var LIKE_STAGE_MAX_MS = typeof maxMs === "number" && maxMs > 0 ? Math.floor(maxMs) : 6000; // 点开作品后，点赞阶段最长 6s，超时直接走坐标兜底
  var likeDeadlineMs = likeStartMs + LIKE_STAGE_MAX_MS;
  function likeStageTimeout() {
    return Date.now() >= likeDeadlineMs;
  }
  sleep(220);
  var REF_W = 1080;
  var REF_H = 2400;
  var sw = device.width / REF_W;
  var sh = device.height / REF_H;
  var node = findBestGlnForCurrentVideo();
  if (!node && !likeStageTimeout()) {
    sleep(220);
    node = findBestGlnForCurrentVideo();
  }

  if (!node && !likeStageTimeout()) {
    try {
      var cL = className("android.widget.LinearLayout")
        .clickable(true)
        .boundsInside(
          Math.max(0, Math.floor(880 * sw)),
          Math.max(0, Math.floor(1160 * sh)),
          device.width,
          Math.min(device.height, Math.floor(1410 * sh))
        )
        .find();
      var fl = filterPlayerSidebarNodes(uiCollectionToArray(cL), 0.32, 0.68);
      node = pickLastSidebarNode(fl);
    } catch (e4) {}
  }

  if (node && !likeStageTimeout()) {
    try {
      if (node.clickable && node.clickable() && node.click && node.click()) {
        appendLog("已点赞");
        sleep(450);
        return true;
      }
    } catch (e6) {}
    if (clickNode(node)) {
      appendLog("已点赞");
      sleep(450);
      return true;
    }
    try {
      var bb = node.bounds();
      var cx = bb.centerX();
      var cy = bb.centerY();
      press(cx, cy, 120);
      sleep(120);
      try {
        click(cx, cy);
      } catch (e7) {}
      appendLog("已点赞");
      sleep(450);
      return true;
    } catch (e8) {}
  }

  // 预算已到：不再做重查询，直接走坐标兜底，避免点赞阶段被 find() 拖长到 30s+
  if (likeStageTimeout()) {
    try {
      var wT = device.width,
        hT = device.height;
      var pxT = Math.floor(wT * 0.915);
      var pyT = Math.floor(hT * 0.5);
      press(pxT, pyT, 120);
      sleep(180);
      appendLog("已点赞");
      sleep(320);
      return true;
    } catch (eTimeoutTap) {}
    appendLog("未识别播放页，未点赞");
    return false;
  }

  var l2 = Math.max(0, Math.floor(908 * sw));
  var t2 = Math.max(0, Math.floor(1188 * sh));
  var r2 = Math.min(device.width, Math.floor(1068 * sw));
  var b2 = Math.min(device.height, Math.floor(1342 * sh));
  var img = null;
  try {
    var cImg = className("android.widget.ImageView").boundsInside(l2, t2, r2, b2).find();
    img = pickLastVisibleOrLast(cImg);
  } catch (e9) {}
  if (!img) {
    try {
      var cImg2 = className("android.widget.ImageView")
        .boundsInside(
          Math.floor(device.width * 0.82),
          Math.floor(device.height * 0.46),
          device.width - 6,
          Math.floor(device.height * 0.58)
        )
        .find();
      img = pickLastVisibleOrLast(cImg2);
    } catch (e10) {}
  }
  if (img) {
    var n2 = img;
    for (var i = 0; i < 16 && n2; i++, n2 = n2.parent()) {
      try {
        if (n2.clickable && n2.clickable() && n2.click && n2.click()) {
          appendLog("已点赞");
          sleep(450);
          return true;
        }
      } catch (e11) {}
    }
    try {
      var b3 = img.bounds();
      press(b3.centerX(), b3.centerY(), 120);
      sleep(120);
      try {
        click(b3.centerX(), b3.centerY());
      } catch (e12) {}
      appendLog("已点赞");
      sleep(450);
      return true;
    } catch (e13) {}
  }
  try {
    var w0 = device.width,
      h0 = device.height;
    var px = Math.floor(w0 * 0.915);
    var py = Math.floor(h0 * 0.5);
    press(px, py, 140);
    sleep(280);
    appendLog("已点赞");
    sleep(400);
    return true;
  } catch (eLast) {}
  appendLog("未识别播放页，未点赞");
  return false;
}

/** 播放页收藏：与点赞相同策略，find + 右侧竖条过滤 + 最后一个，避免 findOne 点到上一页 */
function clickCollectOnDouyinWorkPlayer() {
  sleep(480);
  var REF_W = 1080;
  var REF_H = 2400;
  var sw = device.width / REF_W;
  var sh = device.height / REF_H;
  var l = Math.max(0, Math.floor(878 * sw));
  var t = Math.max(0, Math.floor(1548 * sh));
  var r = device.width;
  var b = Math.min(device.height, Math.floor(1785 * sh));
  var node = findBestCollectControlForCurrentVideo();
  if (!node) {
    try {
      var cI = className("android.widget.ImageView").boundsInside(l, t, r, b).find();
      node = pickLastVisibleOrLast(cI);
    } catch (e4) {}
  }
  if (!node) {
    try {
      var cI2 = className("android.widget.ImageView")
        .boundsInside(
          Math.floor(device.width * 0.8),
          Math.floor(device.height * 0.6),
          device.width - 4,
          Math.floor(device.height * 0.76)
        )
        .find();
      node = pickLastVisibleOrLast(cI2);
    } catch (e5) {}
  }
  if (node) {
    try {
      if (node.clickable && node.clickable() && node.click && node.click()) {
        sleep(600);
        return true;
      }
    } catch (e6) {}
    if (clickNode(node)) {
      sleep(600);
      return true;
    }
    try {
      var bb = node.bounds();
      var cx = bb.centerX();
      var cy = bb.centerY();
      press(cx, cy, 120);
      sleep(150);
      try {
        click(cx, cy);
      } catch (e7) {}
      sleep(600);
      return true;
    } catch (e8) {}
  }
  try {
    var cx2 = Math.floor(((903 + 1080) / 2) * sw);
    var cy2 = Math.floor(((1584 + 1756) / 2) * sh);
    press(cx2, cy2, 130);
    sleep(150);
    try {
      click(cx2, cy2);
    } catch (e9) {}
    sleep(600);
    return true;
  } catch (e10) {}
  appendLog("收藏失败");
  return false;
}

function findBestShareContainerForCurrentVideo() {
  function pickClosestSidebarNode(nodes, aimXRatio, aimYRatio) {
    if (!nodes || !nodes.length) return null;
    var w = device.width;
    var h = device.height;
    var aimX = Math.floor(w * (typeof aimXRatio === "number" ? aimXRatio : 0.92));
    var aimY = Math.floor(h * (typeof aimYRatio === "number" ? aimYRatio : 0.78));
    var best = null;
    var bestD = 1e9;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      try {
        var b = n.bounds();
        var d = Math.abs(b.centerX() - aimX) * 2 + Math.abs(b.centerY() - aimY);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      } catch (e0) {}
    }
    return best;
  }
  function findClickableAncestor(node, maxDepth) {
    var cur = node;
    var lim = typeof maxDepth === "number" ? maxDepth : 8;
    for (var d = 0; cur && d < lim; d++) {
      try {
        if (cur.clickable && cur.clickable()) return cur;
      } catch (e1) {}
      try {
        cur = cur.parent && cur.parent();
      } catch (e2) {
        cur = null;
      }
    }
    return null;
  }
  var passes = [
    { y1: 0.7, y2: 0.86, xMin: 0.72, aimY: 0.78 },
    { y1: 0.66, y2: 0.9, xMin: 0.68, aimY: 0.79 },
  ];
  for (var pi = 0; pi < passes.length; pi++) {
    var st = passes[pi];
    // 小米实测优先：分享文案节点 zfq（再回溯到可点击父节点）
    var tPick = null;
    try {
      var t1 = id("com.ss.android.ugc.aweme:id/zfq").find();
      tPick = pickClosestSidebarNode(filterPlayerSidebarNodes(uiCollectionToArray(t1), st.y1, st.y2, st.xMin), 0.92, st.aimY);
    } catch (e3) {}
    if (!tPick) {
      try {
        var t2 = idMatches(/.*:id\/zfq$/).find();
        tPick = pickClosestSidebarNode(filterPlayerSidebarNodes(uiCollectionToArray(t2), st.y1, st.y2, st.xMin), 0.92, st.aimY);
      } catch (e4) {}
    }
    if (!tPick) {
      try {
        var t3 = text("分享").find();
        tPick = pickClosestSidebarNode(filterPlayerSidebarNodes(uiCollectionToArray(t3), st.y1, st.y2, st.xMin), 0.92, st.aimY);
      } catch (e5) {}
    }
    if (tPick) {
      var anc = findClickableAncestor(tPick, 10);
      if (anc) return anc;
      return tPick;
    }
    // 兜底：直接找 share_container
    try {
      var coll = id("com.ss.android.ugc.aweme:id/share_container").find();
      var filt = filterPlayerSidebarNodes(uiCollectionToArray(coll), st.y1, st.y2, st.xMin);
      var pick = pickClosestSidebarNode(filt, 0.92, st.aimY);
      if (pick) return pick;
    } catch (e6) {}
  }
  return null;
}

/** 播放页右侧分享入口（id share_container），策略同点赞/收藏 */
function clickShareOnDouyinWorkPlayer() {
  function isShareSheetLikelyOpened() {
    try {
      if (text("推荐").exists()) return true;
    } catch (e0) {}
    try {
      if (textContains("转发").exists()) return true;
    } catch (e1) {}
    try {
      if (textContains("帮上热门").exists()) return true;
    } catch (e2) {}
    try {
      if (descContains("推荐").exists()) return true;
    } catch (e3) {}
    return false;
  }
  sleep(600);
  var REF_W = 1080;
  var REF_H = 2400;
  var sw = device.width / REF_W;
  var sh = device.height / REF_H;
  var node = findBestShareContainerForCurrentVideo();
  if (node) {
    function tapShareHotspotFromNode(n, yBiasFrac) {
      try {
        var bb = n.bounds();
        var w = bb.width();
        var h = bb.height();
        if (w <= 0 || h <= 0) return false;
        var x = bb.left + Math.floor(w * 0.5);
        // 小米上点容器中心容易打到上方收藏热区，改为点容器下半区（贴近“分享”文案）
        var frac = typeof yBiasFrac === "number" ? yBiasFrac : 0.82;
        var y = bb.top + Math.floor(h * frac);
        x = Math.max(1, Math.min(device.width - 1, x));
        y = Math.max(1, Math.min(device.height - 1, y));
        press(x, y, 130);
        sleep(120);
        try {
          click(x, y);
        } catch (eC0) {}
        return true;
      } catch (eT0) {
        return false;
      }
    }
    try {
      // 优先“偏下热区”点击，尽量避开收藏
      if (tapShareHotspotFromNode(node, 0.82)) {
        sleep(380);
        if (isShareSheetLikelyOpened()) {
          sleep(500);
          return true;
        }
        // 再下移一次重试（不同 ROM 热区略有偏移）
        if (tapShareHotspotFromNode(node, 0.9)) {
          sleep(380);
          if (isShareSheetLikelyOpened()) {
            sleep(500);
            return true;
          }
        }
      }
      if (node.clickable && node.clickable() && node.click && node.click()) {
        sleep(380);
        if (isShareSheetLikelyOpened()) {
          sleep(500);
        return true;
        }
      }
    } catch (e0) {}
    if (clickNode(node)) {
      sleep(380);
      if (isShareSheetLikelyOpened()) {
        sleep(500);
      return true;
      }
    }
    try {
      var b = node.bounds();
      press(b.centerX(), b.centerY(), 120);
      sleep(150);
      try {
        click(b.centerX(), b.centerY());
      } catch (e1) {}
      sleep(380);
      if (isShareSheetLikelyOpened()) {
        sleep(500);
      return true;
      }
    } catch (e2) {}
  }
  try {
    var cx = Math.floor(((900 + 1080) / 2) * sw);
    // 兜底坐标也下移，减少误触到上方收藏
    var cy = Math.floor(((1868 + 1941) / 2) * sh);
    press(cx, cy, 130);
    sleep(150);
    try {
      click(cx, cy);
    } catch (e3) {}
    sleep(380);
    if (isShareSheetLikelyOpened()) {
      sleep(500);
    return true;
    }
  } catch (e4) {}
  appendLog("分享失败");
  return false;
}

/** 分享弹层底行第 2 格「推荐」：用水平窄带锁定列（避免点到转发/帮上热门），不再用 pickLast */
function clickRecommendInShareSheet() {
  appendLog("点推荐…");
  sleep(700);
  var w = device.width;
  var h = device.height;
  // 五列底栏：第 2 列中心约 0.3w；左界避开第 1 列「转发」，右界避开第 3 列及「帮上热门」
  var colLeft = Math.floor(w * 0.2);
  var colRight = Math.floor(w * 0.41);
  var rowTop = Math.floor(h * 0.73);
  var rowBot = h - 10;
  var aimX = Math.floor(w * 0.3);
  var aimY = Math.floor(h * 0.855);

  function inRecommendCell(bb) {
    try {
      var cx = bb.centerX();
      var cy = bb.centerY();
      return cx >= colLeft && cx <= colRight && cy >= rowTop && cy <= rowBot;
    } catch (e) {
      return false;
    }
  }

  function pickClosestInCell(coll) {
    var arr = uiCollectionToArray(coll);
    var best = null;
    var bestD = 1e9;
    for (var i = 0; i < arr.length; i++) {
      var n = arr[i];
      try {
        var b = n.bounds();
        if (!inRecommendCell(b)) continue;
        var d = Math.abs(b.centerX() - aimX) * 3 + Math.abs(b.centerY() - aimY);
        if (d < bestD) {
          bestD = d;
          best = n;
        }
      } catch (e2) {}
    }
    return best;
  }

    var node = null;
    try {
    node = pickClosestInCell(text("推荐").find());
  } catch (e) {}
    if (!node) {
      try {
      node = pickClosestInCell(id("com.ss.android.ugc.aweme:id/zfx").find());
    } catch (e0) {}
    }
    if (!node) {
    var idVars = ["zc_", "zC_"];
    for (var iv = 0; iv < idVars.length && !node; iv++) {
      try {
        node = pickClosestInCell(id("com.ss.android.ugc.aweme:id/" + idVars[iv]).find());
      } catch (e1) {}
    }
  }
  if (!node) {
    try {
      node = pickClosestInCell(
        className("android.widget.ImageView")
          .boundsInside(Math.max(0, colLeft - 50), Math.max(0, rowTop - 160), Math.min(w, colRight + 50), rowBot)
          .find()
      );
    } catch (e2) {}
  }
  if (!node) {
    try {
      node = pickClosestInCell(
        className("android.view.ViewGroup")
          .clickable(true)
          .boundsInside(0, Math.floor(h * 0.65), w, rowBot)
          .find()
      );
    } catch (e3) {}
  }
  if (!node) {
    try {
      node = pickClosestInCell(descContains("推荐").find());
    } catch (e4) {}
  }

  if (node) {
    try {
      if (node.clickable && node.clickable() && node.click && node.click()) {
        appendLog("已推荐");
        sleep(600);
      return true;
    }
    } catch (e5) {}
    if (clickNode(node)) {
      appendLog("已推荐");
      sleep(600);
      return true;
    }
    try {
      var bb = node.bounds();
      press(bb.centerX(), bb.centerY(), 110);
      sleep(120);
      try {
        click(bb.centerX(), bb.centerY());
      } catch (e6) {}
      appendLog("已推荐");
      sleep(600);
      return true;
    } catch (e7) {}
  }

  try {
    press(aimX, aimY, 120);
    sleep(120);
    try {
      click(aimX, aimY);
    } catch (e8) {}
    appendLog("已推荐");
    sleep(600);
    return true;
  } catch (e9) {}
  appendLog("推荐失败");
  return false;
}

/** 汽水作品播放页：左侧评论图标（he+ / 0x7f0a33a3） */
function filterSodaWorkSidebarNodes(arr, yMinRatio, yMaxRatio) {
  var w = device.width;
  var h = device.height;
  var xMax = Math.floor(w * 0.46);
  var yMin = Math.floor(h * (yMinRatio != null ? yMinRatio : 0.68));
  var yMax = Math.floor(h * (yMaxRatio != null ? yMaxRatio : 0.88));
  var out = [];
  var i;
  for (i = 0; i < arr.length; i++) {
    try {
      var b = arr[i].bounds();
      if (b.centerX() > xMax || b.centerY() < yMin || b.centerY() > yMax) continue;
      try {
        if (typeof arr[i].visibleToUser === "function" && !arr[i].visibleToUser()) continue;
      } catch (eVis) {}
      out.push(arr[i]);
    } catch (eB) {}
  }
  return out;
}

function findSodaWorkCommentButtonNode() {
  var node = null;
  try {
    node = id(SODA_WORK_COMMENT_BTN_ID).packageName(SODA_PKG).findOne(180);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/he\+$/).packageName(SODA_PKG).findOne(120);
    } catch (e1) {}
  }
  return node || null;
}

function findSodaWorkPlayerActionBarNode() {
  return findSodaWorkPlayerActionBarNodeFast(70);
}

function sodaWorkVideoLikeHeartTapCoords(fromNode) {
  if (fromNode) {
    try {
      var b = fromNode.bounds();
      var cx = b.centerX();
      var cy = b.centerY();
      var w = device.width || 1080;
      var h = device.height || 2400;
      cx = Math.max(8, Math.min(w - 8, cx));
      cy = Math.max(8, Math.min(h - 8, cy));
      if (cy > h * 0.6) return { x: cx, y: cy };
    } catch (eB) {}
  }
  var w2 = device.width || 1080;
  var h2 = device.height || 2400;
  return { x: Math.floor(w2 * 0.1056), y: Math.floor(h2 * 0.7775) };
}

function clampSodaTapCoord(x, y) {
  var w = device.width || 1080;
  var h = device.height || 2400;
  return {
    x: Math.max(8, Math.min(w - 8, Math.floor(x))),
    y: Math.max(8, Math.min(h - 8, Math.floor(y))),
  };
}

function tapSodaWorkVideoLikeHeartAt(x, y) {
  var pt = clampSodaTapCoord(x, y);
  try {
    press(pt.x, pt.y, 110);
    sleep(90);
    click(pt.x, pt.y);
    return true;
  } catch (e0) {
    try {
      click(pt.x, pt.y);
      return true;
    } catch (e1) {}
  }
  return false;
}

function tapSodaWorkVideoLikeHeartNode(node) {
  if (!node) return false;
  try {
    var b = node.bounds();
    return tapSodaWorkVideoLikeHeartAt(b.centerX(), b.centerY());
  } catch (e1) {}
  return false;
}

function sodaWorkVideoLikeHeartLooksLikedQuick(node) {
  if (!node) return false;
  try {
    if (node.selected && node.selected()) return true;
  } catch (e0) {}
  try {
    var d = String(node.desc && node.desc() || "");
    if (/已赞|已喜欢|liked/i.test(d)) return true;
  } catch (e1) {}
  return false;
}

/** @deprecated 请用 findSodaWorkVideoLikeHeartNode */
function findSodaWorkLikeButtonNode() {
  return findSodaWorkVideoLikeHeartNode();
}

/** 汽水作品播放页视频红心赞（he= ImageView） */
function clickLikeOnSodaWorkPlayer(maxMs) {
  appendLogProgress("点赞");
  var deadline = Date.now() + (typeof maxMs === "number" && maxMs > 0 ? maxMs : 2800);
  while (Date.now() < deadline && !__scriptUserStop) {
    if (isSodaWorkPlayerPageLikelyFast(30)) break;
    sleep(30);
  }
  if (!isSodaWorkPlayerPageLikelyFast(35)) {
    var ptEarly = sodaWorkVideoLikeHeartTapCoords(null);
    tapSodaWorkVideoLikeHeartAt(ptEarly.x, ptEarly.y);
    sleep(70);
    appendLog("已点赞");
    return true;
  }
  sleep(45);

  var node = findSodaWorkVideoLikeHeartNodeFast(55);
  if (node && sodaWorkVideoLikeHeartLooksLikedQuick(node)) {
    appendLog("已点赞");
    return true;
  }

  var pt = sodaWorkVideoLikeHeartTapCoords(node);
  if (!tapSodaWorkVideoLikeHeartAt(pt.x, pt.y)) return false;
  sleep(90);
  appendLog("已点赞");
  return true;
}

function findSodaCommentEditText() {
  var w = device.width;
  var h = device.height;
  try {
    var ed = className("android.widget.EditText")
      .packageName(SODA_PKG)
      .boundsInside(0, Math.floor(h * 0.52), w, h)
      .findOne(600);
    if (ed) return ed;
  } catch (e0) {}
  try {
    return className("android.widget.EditText").packageName(SODA_PKG).findOne(400);
  } catch (e1) {}
  return null;
}

function clickSodaWorkCommentButton() {
  appendSodaActionLog("点评论");
  var node = findSodaWorkCommentButtonNode();
  if (node) {
    try {
      if (node.clickable && node.clickable() && node.click && node.click()) {
        sleep(160);
        return true;
      }
    } catch (eClk) {}
    if (clickNode(node)) {
      sleep(160);
      return true;
    }
    try {
      var b = node.bounds();
      var cx = b.centerX();
      var cy = b.centerY();
      press(cx, cy, 95);
      sleep(45);
      click(cx, cy);
      sleep(160);
      return true;
    } catch (eTap) {}
  }
  var w = device.width;
  var h = device.height;
  // 元素 bounds 约 (216,1770)-(408,1962) @1080×2400，中心约 (0.289w, 0.797h)
  var cx = Math.floor(w * 0.289);
  var cy = Math.floor(h * 0.797);
  appendSodaActionLog("点评论(坐标)");
  try {
    press(cx, cy, 95);
    sleep(45);
    click(cx, cy);
    sleep(160);
    return true;
  } catch (eCoord) {
    try {
      click(cx, cy);
      sleep(160);
      return true;
    } catch (eCoord2) {}
  }
  appendLog("评论失败");
  return false;
}

/** 汽水评论浮层：右侧发送按钮 b8r（纸飞机图标，非「发送」文案） */
function findSodaCommentSendButtonNode() {
  var node = null;
  try {
    node = id(SODA_COMMENT_SEND_BTN_ID).packageName(SODA_PKG).findOne(400);
  } catch (e0) {}
  if (!node) {
    try {
      node = idMatches(/.*:id\/b8r$/).packageName(SODA_PKG).findOne(350);
    } catch (e1) {}
  }
  if (!node) {
    try {
      var w = device.width;
      var h = device.height;
      var coll = className("android.widget.TextView")
        .clickable(true)
        .packageName(SODA_PKG)
        .boundsInside(Math.floor(w * 0.72), Math.floor(h * 0.42), w - 4, Math.floor(h * 0.58))
        .find();
      if (coll && coll.size) {
        var best = null;
        var bestRight = -1;
        var i;
        for (i = 0; i < coll.size(); i++) {
          var n = coll.get(i);
          try {
            var b = n.bounds();
            if (b.right > bestRight) {
              bestRight = b.right;
              best = n;
            }
          } catch (eB) {}
        }
        node = best;
      }
    } catch (e2) {}
  }
  return node || null;
}

function clickSodaCommentSend() {
  appendSodaActionLog("点发送");
  sleep(120);
  var node = findSodaCommentSendButtonNode();
  if (node) {
    try {
      if (node.clickable && node.clickable() && node.click && node.click()) {
        appendLog("已发送");
        sleep(120);
        return true;
      }
    } catch (eClk) {}
    if (clickNode(node)) {
      appendLog("已发送");
      sleep(120);
      return true;
    }
    try {
      var b = node.bounds();
      press(b.centerX(), b.centerY(), 95);
      sleep(80);
      click(b.centerX(), b.centerY());
      appendLog("已发送");
      sleep(120);
      return true;
    } catch (eTap) {}
  }
  var w = device.width;
  var h = device.height;
  // 元素 bounds 约 (930,1178)-(1059,1292)，中心约 (0.921w, 0.515h)
  var cx = Math.floor(w * 0.921);
  var cy = Math.floor(h * 0.515);
  appendSodaActionLog("点发送(坐标)");
  try {
    press(cx, cy, 95);
    sleep(80);
    click(cx, cy);
    appendLog("已发送");
    sleep(120);
    return true;
  } catch (eCoord) {
    try {
      click(cx, cy);
      appendLog("已发送");
      sleep(120);
      return true;
    } catch (eCoord2) {}
  }
  appendLog("发送失败");
  return false;
}

/** 播放页底部评论条：点「发条评论，和大家一起讨论」等占位文案，勿用全屏 FrameLayout */
function clickDouyinWorkCommentBar() {
  if (isSodaPlatformSelected()) return clickSodaWorkCommentButton();
  appendLog("点评论框…");
  sleep(520);
  var w = device.width;
  var h = device.height;
  var yBar = Math.floor(h * 0.76);

  function inBottomBar(bb) {
    try {
      return bb.centerY() >= yBar && bb.centerY() <= h - 20;
    } catch (e) {
      return false;
    }
  }

  function pickHintInBar(coll) {
    var arr = uiCollectionToArray(coll);
    for (var i = 0; i < arr.length; i++) {
      try {
        if (inBottomBar(arr[i].bounds())) return arr[i];
      } catch (e2) {}
    }
    return null;
  }

  var node = null;
  try {
    node = pickHintInBar(textContains("发条评论").find());
  } catch (e) {}
  if (!node) {
    try {
      node = pickHintInBar(textContains("和大家一起").find());
    } catch (e0) {}
  }
  if (!node) {
    try {
      node = pickHintInBar(descContains("发条评论").find());
    } catch (e1) {}
  }
  if (!node) {
    try {
      node = className("android.widget.EditText").boundsInside(0, yBar - 40, w, h).findOne(1100);
    } catch (e2) {}
  }
  if (!node) {
    try {
      var c3 = textContains("评论").className("android.widget.TextView").boundsInside(0, yBar, w, h).find();
      node = pickHintInBar(c3);
    } catch (e3) {}
  }

  if (node) {
    if (clickNode(node)) {
      sleep(380);
      return true;
    }
    try {
      var b = node.bounds();
      press(b.centerX(), b.centerY(), 100);
      sleep(90);
      try {
        click(b.centerX(), b.centerY());
      } catch (e4) {}
      sleep(380);
      return true;
    } catch (e5) {}
  }

  try {
    var cx = Math.floor(w * 0.36);
    var cy = Math.floor(h * 0.915);
    press(cx, cy, 110);
    sleep(90);
    try {
      click(cx, cy);
    } catch (e6) {}
    sleep(380);
    return true;
  } catch (e7) {}
  appendLog("评论失败");
  return false;
}

function findDouyinCommentEditText() {
  if (isSodaPlatformSelected()) {
    var sodaEd = findSodaCommentEditText();
    if (sodaEd) return sodaEd;
  }
  var w = device.width;
  var h = device.height;
  var y0 = Math.floor(h * 0.7);
  try {
    var ed = className("android.widget.EditText").boundsInside(0, y0, w, h).findOne(2500);
    if (ed) return ed;
  } catch (e) {}
  try {
    return className("android.widget.EditText").findOne(2000);
  } catch (e2) {}
  return null;
}

/** 从服务器 pl.txt 随机一行写入当前评论框（需已点过评论条或自动先点） */
function fetchAndFillDouyinCommentFromServer() {
  var line = pickRandomCommentLine();
  if (!line) {
    appendLog("评论库为空");
    return false;
  }
  var show = line.length > 28 ? line.substring(0, 28) + "…" : line;
  appendLog("取评论:" + show);

  var ed = findDouyinCommentEditText();
  if (!ed) {
    if (!clickDouyinWorkCommentBar()) {
      appendLog("未打开评论框");
      return false;
    }
    sleep(900);
    ed = findDouyinCommentEditText();
  }
  if (!ed) {
    appendLog("无输入框");
    return false;
  }
  appendLog("写入评论");
  try {
    setClip(line);
  } catch (e) {}
  sleep(200);
  clickNode(ed);
  sleep(450);
  try {
    setText(line);
    return true;
  } catch (e2) {}
  try {
    var pb = text("粘贴").findOne(1200) || descContains("粘贴").findOne(800);
    if (pb) clickNode(pb);
    sleep(400);
    return true;
  } catch (e3) {}
  appendLog("写入评论失败");
  return false;
}

/** 评论浮层右侧红底「发送」：取 text/描述含发送且在右侧、尽量靠上（避免点到键盘区第二个发送） */
function clickDouyinCommentSend() {
  if (isSodaPlatformSelected()) return clickSodaCommentSend();
  sleep(450);
  var w = device.width;
  var h = device.height;
  var xMin = Math.floor(w * 0.52);
  var yMin = Math.floor(h * 0.12);
  var yMax = Math.floor(h * 0.76);

  function pickComposerSend(coll) {
    var arr = uiCollectionToArray(coll);
    var best = null;
    var bestTop = 1e9;
    for (var i = 0; i < arr.length; i++) {
      try {
        var b = arr[i].bounds();
        var cx = b.centerX();
        var cy = b.centerY();
        if (cx < xMin || cy < yMin || cy > yMax) continue;
        try {
          if (typeof arr[i].visibleToUser === "function" && !arr[i].visibleToUser()) continue;
        } catch (e0) {}
        var top = b.top;
        if (top < bestTop) {
          bestTop = top;
          best = arr[i];
        }
      } catch (e1) {}
    }
    return best;
  }

  var node = null;
  try {
    node = pickComposerSend(text("发送").find());
  } catch (e) {}
  if (!node) {
    try {
      node = pickComposerSend(descContains("发送").find());
    } catch (e2) {}
  }
  if (!node) {
    xMin = Math.floor(w * 0.4);
    try {
      node = pickComposerSend(text("发送").find());
    } catch (e3) {}
  }
  if (!node) {
    try {
      node = text("发送").clickable(true).boundsInside(xMin, yMin, w, yMax).findOne(2000);
    } catch (e4) {}
  }

  if (node) {
    try {
      if (node.clickable && node.clickable() && node.click && node.click()) {
        appendLog("已发送");
        sleep(700);
        return true;
      }
    } catch (e5) {}
    if (clickNode(node)) {
      appendLog("已发送");
      sleep(700);
      return true;
    }
    try {
      var bb = node.bounds();
      press(bb.centerX(), bb.centerY(), 100);
      sleep(120);
      try {
        click(bb.centerX(), bb.centerY());
      } catch (e6) {}
      appendLog("已发送");
      sleep(700);
      return true;
    } catch (e7) {}
  }

  try {
    var cx = Math.floor(w * 0.86);
    var cy = Math.floor(h * 0.4);
    press(cx, cy, 110);
    sleep(120);
    try {
      click(cx, cy);
    } catch (e8) {}
    appendLog("已发送");
    sleep(700);
    return true;
  } catch (e9) {}
  appendLog("发送失败");
  return false;
}

function isTaskTypeEnabled(cb) {
  try {
    return cb && cb.isChecked && cb.isChecked();
  } catch (e) {
    return true;
  }
}

/** 今日任务目标上限（与悬浮窗一致；restart 无勾选，看输入框；重启不超过 __RESTART_NEW_TARGET_CAP） */
function normalizeTaskTargetInput(inp, fallback, maxAllowed) {
  var v = getIntFromInput(inp, fallback);
  if (!Number.isFinite(v) || v < 0) v = fallback;
  // 防止个别机型输入框被脏值污染（如 1229743209）导致悬浮框比例异常
  if (v > maxAllowed) {
    v = fallback;
    try { setIntToInput(inp, v); } catch (e0) {}
    try { appendLog("任务数异常已回退默认:" + v); } catch (e1) {}
  }
  return Math.max(0, Math.min(maxAllowed, v));
}

function getDailyActionTargets() {
  var likeV = normalizeTaskTargetInput(ui.task_like, 3000, 50000);
  var favV = normalizeTaskTargetInput(ui.task_fav, 400, 50000);
  var commentV = normalizeTaskTargetInput(ui.task_comment, 400, 50000);
  var shareV = normalizeTaskTargetInput(ui.task_share, 200, 50000);
  var rawRestart = normalizeTaskTargetInput(ui.task_restart, 30, 5000);
  if (isSodaPlatformSelected()) {
    return {
      like: likeV,
      fav: 0,
      comment: commentV,
      share: 0,
      restart: Math.min(__SODA_RESTART_NEW_TARGET_CAP, rawRestart),
    };
  }
  return {
    like: isTaskTypeEnabled(ui.cb_do_like) ? likeV : 0,
    fav: isTaskTypeEnabled(ui.cb_do_fav) ? favV : 0,
    comment: isTaskTypeEnabled(ui.cb_do_comment) ? commentV : 0,
    share: isTaskTypeEnabled(ui.cb_do_share) ? shareV : 0,
    restart: Math.min(__RESTART_NEW_TARGET_CAP, rawRestart),
  };
}

function ensureTaskCountDayRolled() {
  var today = dateKey(new Date());
  try {
    if (__stats.get("taskCountDay", "") !== today) {
      __stats.put("taskCountDay", today);
      __stats.put("dLike", 0);
      __stats.put("dFav", 0);
      __stats.put("dComment", 0);
      __stats.put("dShare", 0);
      __stats.put("dRestart", 0);
      __stats.put("runTimeMsToday", 0);
      // 跨天时，运行时长展示必须从 00:00 后重新计时，避免把昨日会话尾巴算进今日
      try {
        if (__automationWorkerActive) __runSessionStartMs = Date.now();
        else __runSessionStartMs = 0;
      } catch (eRtRoll) {}
    }
  } catch (e) {}
}

function getTaskDoneSnapshot() {
  ensureTaskCountDayRolled();
  try {
    return {
      like: __stats.get("dLike", 0) || 0,
      fav: __stats.get("dFav", 0) || 0,
      comment: __stats.get("dComment", 0) || 0,
      share: __stats.get("dShare", 0) || 0,
      restart: __stats.get("dRestart", 0) || 0,
    };
  } catch (e2) {
    return { like: 0, fav: 0, comment: 0, share: 0, restart: 0 };
  }
}

function ensureWendaoPickDayRolled() {
  var today = dateKey(new Date());
  try {
    if (__stats.get(__WENDAO_PICK_DAY_KEY, "") !== today) {
      __stats.put(__WENDAO_PICK_DAY_KEY, today);
      __stats.put(__WENDAO_PICK_JSON_KEY, "{}");
    }
  } catch (e0) {}
}

function getWendaoPickedMapToday() {
  ensureWendaoPickDayRolled();
  try {
    var raw = String(__stats.get(__WENDAO_PICK_JSON_KEY, "{}") || "{}");
    var obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e1) {
    return {};
  }
}

function hasWendaoPickedUserToday(k) {
  if (!k) return false;
  var m = getWendaoPickedMapToday();
  return !!m[String(k)];
}

function markWendaoPickedUserToday(k) {
  if (!k) return;
  var m = getWendaoPickedMapToday();
  m[String(k)] = 1;
  try {
    __stats.put(__WENDAO_PICK_JSON_KEY, JSON.stringify(m));
  } catch (e2) {}
}

function ensureSodaPickDayRolled() {
  var today = dateKey(new Date());
  try {
    if (__stats.get(__SODA_PICK_DAY_KEY, "") !== today) {
      __stats.put(__SODA_PICK_DAY_KEY, today);
      __stats.put(__SODA_PICK_JSON_KEY, "{}");
    }
  } catch (e0) {}
}

function getSodaPickedMapToday() {
  ensureSodaPickDayRolled();
  try {
    var raw = String(__stats.get(__SODA_PICK_JSON_KEY, "{}") || "{}");
    var obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch (e1) {
    return {};
  }
}

function hasSodaPickedUserToday(k) {
  if (!k) return false;
  var m = getSodaPickedMapToday();
  return !!m[String(k)];
}

function markSodaPickedUserToday(k) {
  if (!k) return;
  var m = getSodaPickedMapToday();
  m[String(k)] = 1;
  try {
    __stats.put(__SODA_PICK_JSON_KEY, JSON.stringify(m));
  } catch (e2) {}
}

// 日终增长采样：23:55 先唤醒解锁再采样；00:00~00:03 跨日确认；满额跨日依赖采样前已解锁
var __EOD_SAMPLE_PRE_HOUR = 23;
var __EOD_SAMPLE_PRE_MIN = 55;
var __EOD_SAMPLE_POST_HOUR = 0;
var __EOD_SAMPLE_POST_MIN_MAX = 3;

/** 日终采样专用拉正链路：1停抖音 → 2开抖音 → 3点我并读取粉丝（不占重启名额） */
function runEodSamplingChainToMe() {
  if (__scriptUserStop) return false;
  try {
    forceStopApp(DY_PKG, "抖音");
  } catch (e0) {}
  if (__scriptUserStop) return false;
  var okLaunch = false;
  try {
    okLaunch = launchDouyin();
  } catch (e1) {
    okLaunch = false;
  }
  if (!okLaunch || __scriptUserStop) return false;
  try {
    return !!clickMeTabWith25sRestart(false);
  } catch (e2) {
    return false;
  }
}

/** 日终/跨日采样前：取消微亮 → 唤醒 → 上滑解锁（息屏/锁屏时必做；有密码锁需人工） */
function prepareDeviceUnlockedForEodSampling(logPrefix) {
  logPrefix = logPrefix || "日终采样";
  try {
    endQuotaIdleKeepAwake();
  } catch (eEndDim) {}
  try {
    device.wakeUpIfNeeded();
  } catch (eWake) {}
  sleepCtrl(450);
  var needUnlock = false;
  try {
    needUnlock = isKeyguardLockedForAutomation() || looksLikeLockScreenUi();
  } catch (eNeed) {
    needUnlock = true;
  }
  if (!needUnlock) {
    appendLog(logPrefix + "：屏幕已就绪");
    sleepCtrl(300);
    return true;
  }
  appendLog(logPrefix + "：唤醒并上滑解锁…");
  var endAt = Date.now() + 120000;
  while (Date.now() < endAt && !__scriptUserStop) {
    try {
      if (tryEnsureDeviceUnlockedOnce()) {
        appendLog(logPrefix + "：已解锁");
        sleepCtrl(500);
        return true;
      }
    } catch (eTry) {}
    try {
      bumpStuckWatchdogHeartbeat();
    } catch (eBump) {}
    sleepCtrl(4000);
  }
  appendLog(logPrefix + "：解锁未成功，仍尝试采样");
  return false;
}

function maybeRunEodFanGrowthSampling() {
  if (__scriptUserStop) return false;
  var now = new Date();
  var today = dateKey(now);
  var hh = now.getHours();
  var mm = now.getMinutes();

  // 23:55 后日终采样
  if (hh === __EOD_SAMPLE_PRE_HOUR && mm >= __EOD_SAMPLE_PRE_MIN) {
    var preTriedDay = "";
    try {
      preTriedDay = String(__stats.get("eodPreSampleTriedDay", "") || "");
    } catch (e2) {
      preTriedDay = "";
    }
    if (preTriedDay !== today) {
      try {
        __stats.put("eodPreSampleTriedDay", today);
      } catch (eMark0) {}
      appendLog("日终采样：23:55后执行采样链路");
      prepareDeviceUnlockedForEodSampling("日终采样");
      var preOk = runEodSamplingChainToMe();
      if (preOk) {
        try {
          __stats.put("eodPreSampleDoneDay", today);
        } catch (e3) {}
        appendLog("日终采样完成");
      } else {
        appendLog("日终采样失败");
      }
      __eodSampleNeedRestartFrom1 = true;
      return true;
    }
  }

  // 00:00~00:03 跨日确认采样
  if (hh === __EOD_SAMPLE_POST_HOUR && mm <= __EOD_SAMPLE_POST_MIN_MAX) {
    var postTriedDay = "";
    try {
      postTriedDay = String(__stats.get("eodPostSampleTriedDay", "") || "");
    } catch (e7) {
      postTriedDay = "";
    }
    if (postTriedDay !== today) {
      try {
        __stats.put("eodPostSampleTriedDay", today);
      } catch (eMark1) {}
      appendLog("跨日确认采样：00:00后执行采样链路");
      prepareDeviceUnlockedForEodSampling("跨日确认采样");
      var postOk = runEodSamplingChainToMe();
      if (postOk) {
        try {
          __stats.put("eodPostSampleDoneDay", today);
        } catch (e4) {}
        appendLog("跨日确认采样完成");
      } else {
        appendLog("跨日确认采样失败");
      }
      __eodSampleNeedRestartFrom1 = true;
      return true;
    }
  }

  return false;
}

function remainingTaskForKind(kind) {
  var T = getDailyActionTargets();
  var d = getTaskDoneSnapshot();
  var cap = T[kind];
  if (cap <= 0) return 0;
  return Math.max(0, cap - d[kind]);
}

function hasUnfinishedInteractiveTask() {
  return (
    remainingTaskForKind("like") > 0 ||
    remainingTaskForKind("fav") > 0 ||
    remainingTaskForKind("comment") > 0 ||
    remainingTaskForKind("share") > 0
  );
}

/** 四项互动剩余次数之和（用于与重启穿插比例：P(重启)=R_restart/(R_restart+本值)） */
function remainingInteractiveActionsSum() {
  return (
    remainingTaskForKind("like") +
    remainingTaskForKind("fav") +
    remainingTaskForKind("comment") +
    remainingTaskForKind("share")
  );
}

/**
 * 本格是否改为「穿插重启」：按互动进度做“均匀随机”分配，避免前期过快用完或后期长期不用。
 * - 先用进度带约束（doneRestart 应接近 totalRestart * progress）
 * - 再在允许带内按比例随机
 */
function shouldDoInjectedRestartThisSlot() {
  if (isTaskDailyQuotaComplete()) return false;
  var T = getDailyActionTargets();
  var d = getTaskDoneSnapshot();
  var totalR = Math.max(0, Number(T.restart) || 0);
  var doneR = Math.max(0, Number(d.restart) || 0);
  if (totalR <= 0) return false;
  var Rr = remainingTaskForKind("restart");
  if (Rr <= 0) return false;

  var totalI =
    Math.max(0, Number(T.like) || 0) +
    Math.max(0, Number(T.fav) || 0) +
    Math.max(0, Number(T.comment) || 0) +
    Math.max(0, Number(T.share) || 0);
  var doneI =
    Math.max(0, Number(d.like) || 0) +
    Math.max(0, Number(d.fav) || 0) +
    Math.max(0, Number(d.comment) || 0) +
    Math.max(0, Number(d.share) || 0);

  var Ri = remainingInteractiveActionsSum();
  if (Ri <= 0) return true;

  // 互动进度（0~1），用它约束“此时应消耗到多少重启名额”
  var p = totalI > 0 ? Math.max(0, Math.min(1, doneI / totalI)) : 1;
  var expectUsed = totalR > 0 ? totalR * p : doneR;
  var band = 0.45; // 缩窄浮动带，让重启完成进度更贴近互动进度
  var low = Math.floor(expectUsed - band);
  var high = Math.ceil(expectUsed + band);
  if (doneR < low) return true; // 落后太多：补一次
  if (doneR > high) return false; // 超前太多：压一压

  // 末段补齐：剩余互动槽位不多时，提高触发强度，尽量让 4000 完成时重启也接近完成
  if (Rr >= Ri) return true;
  if (Ri <= Math.max(4, Math.ceil(totalI * 0.08)) && Rr > 0) {
    var tailProb = Math.min(0.92, Math.max(0.45, Rr / Math.max(1, Ri)));
    return Math.random() < tailProb;
  }

  // 带内随机：按“剩余必须完成率 + 基础比例”融合，既不前段猛冲，也避免长时间不触发
  var mustProb = Rr / Math.max(1, Ri); // 如果后续想完成，理论平均每格需消耗的概率
  var RiEff = Ri * 2.4;
  var baseProb = Rr / Math.max(1, RiEff + Rr);
  var progressBias = 0.05 + 0.12 * p; // 越往后越积极
  var prob = Math.max(0.03, Math.min(0.88, Math.max(mustProb * 0.82, baseProb + progressBias)));
  return Math.random() < prob;
}

/**
 * 从第 1 步执行到第 9 步（停住粉丝列表首行），用于「重启脚本获取新对标」；成功启动抖音时记 1 次重启（总体比例 +1）。
 * @returns {boolean} 是否完整跑通（失败时不要继续当次随机互动）
 */
function runFlowSteps1Through9ForInjectedRestart(maxStep, consumeRestartQuota) {
  if (__scriptUserStop) return false;
  ensureTaskCountDayRolled();
  if (isTaskDailyQuotaComplete()) return false;
  if (consumeRestartQuota === undefined) consumeRestartQuota = true;
  var Trestart = getDailyActionTargets().restart;
  if (consumeRestartQuota && Trestart <= 0) return false;
  if (consumeRestartQuota && remainingTaskForKind("restart") <= 0) {
    appendLog("获取新对标重启次数已用尽，跳过");
    return false;
  }
  if (consumeRestartQuota) appendLog("重启脚本获取新对标");
  __noWorkLikeEntryDidBack = false;
  if (isSodaPlatformSelected()) {
    if (maxStep >= 1) {
      setSodaExecutingStep(1);
      forceStopApp(SODA_PKG, SODA_APP_NAME);
    }
    if (__scriptUserStop) return false;
    if (maxStep >= 2) {
      setSodaExecutingStep(2);
      var okSodaL = launchSodaApp();
      if (okSodaL && consumeRestartQuota && Trestart > 0) recordTaskDone("restart");
      if (!okSodaL) {
        if (consumeRestartQuota) appendLog("重启换对标启动失败");
        setSodaExecutingStep(0);
        return false;
      }
    }
    if (__scriptUserStop) return false;
    if (maxStep >= 3) {
      setSodaExecutingStep(3);
      if (!clickMyTabForSodaWith25sRestart(false)) {
        setSodaExecutingStep(0);
        return false;
      }
    }
    if (__scriptUserStop) return false;
    var sodaFansSeedR = maxStep >= 6;
    if (maxStep >= 4 && (maxStep <= 5 || sodaFansSeedR)) {
      setSodaExecutingStep(4);
      if (!clickFansOnMePageForSoda()) {
        setSodaExecutingStep(0);
        return false;
      }
      if (__scriptUserStop) return false;
      if (maxStep >= 5) {
        setSodaExecutingStep(5);
        if (!clickRandomFollowerFirst3PagesForSoda()) {
          setSodaExecutingStep(0);
          return false;
        }
      }
    }
    if (maxStep >= 6) {
      setSodaExecutingStep(6);
      if (sodaFansSeedR) {
        if (!runSodaStep6FollowOnProfileWithRetry(12)) {
          setSodaExecutingStep(0);
          return false;
        }
      } else if (!clickFollowOnMePageForSoda()) {
        setSodaExecutingStep(0);
        return false;
      }
      if (__scriptUserStop) return false;
      if (maxStep >= 7) {
        setSodaExecutingStep(7);
        if (!clickFirstFollowingInListForSoda()) {
          setSodaExecutingStep(0);
          return false;
        }
      }
      setSodaExecutingStep(8);
      if (__scriptUserStop) return false;
      if (maxStep >= 8 && !runSodaStep8ClickFansWithReselect(12, maxStep)) return false;
      if (__scriptUserStop) return false;
      if (maxStep >= 9 && !clickFirstFollowerInListForSoda()) return false;
      if (__scriptUserStop) return false;
      if (maxStep >= 10 && !tryEnterSodaWorkWithProfileOperateGate(maxStep)) return false;
      if (__scriptUserStop) return false;
      if (maxStep >= 11) {
        if (!prepareSlotForStep11RandomInteraction(maxStep)) return false;
        if (!runRandomSingleWorkInteraction()) return false;
      }
    }
    return true;
  }
  if (maxStep >= 1) forceStopApp(DY_PKG, "抖音");
  if (__scriptUserStop) return false;
  if (maxStep >= 2) {
    var okL = launchDouyin();
    if (okL && consumeRestartQuota && Trestart > 0) recordTaskDone("restart");
    if (!okL) {
      if (consumeRestartQuota) appendLog("重启脚本获取新对标：启动失败");
      return false;
    }
  }
  if (__scriptUserStop) return false;
  if (maxStep >= 3 && !clickMeTabWith25sRestart(false)) return false;
  var isWendao = isWendaoModeSelected();
  if (maxStep >= 4) runStep4ByDaoMode("获取新对标链");
  if (maxStep >= 5) {
    if (isWendao) {
      if (!clickFirstUnpickedFollowerInListForWendao()) return false;
    } else {
      clickSearchIcon();
    }
  }
  if (maxStep >= 6) {
    if (isWendao) {
      var followOkW = clickFollowOnTargetProfileForWendao();
      var followRetry = 0;
      var FOLLOW_RETRY_MAX_WENDAO = 12;
      while (!followOkW && followRetry < FOLLOW_RETRY_MAX_WENDAO && !__scriptUserStop) {
        appendLog("问道：选择下一个用户");
        if (!clickFirstUnpickedFollowerInListForWendao()) break;
        followOkW = clickFollowOnTargetProfileForWendao();
        followRetry++;
      }
      if (!followOkW) {
        appendLog("问道：点击关注多次失败，继续下一轮");
        return false;
      }
    } else {
      pasteTargetAccountIntoSearch();
    }
  }
  if (maxStep >= 7) {
    if (isWendao) {
      if (!clickFirstFollowerInFollowListForWendao()) return false;
    } else {
      completeDouyinSearchOpen(3);
    }
  }
  if (__scriptUserStop) return false;
  if (maxStep >= 8) {
    if (isWendao) {
      if (!runWendaoStep8FanGateUploadThenEnterFansList(maxStep)) return false;
      resetCurrentTargetOperatedSkipCounter();
    } else {
      if (clickFansOnTargetProfile()) {
        handleEmptyFollowerListByReselect(maxStep);
        resetCurrentTargetOperatedSkipCounter();
      }
    }
  }
  if (maxStep >= 9) clickFirstFollowerInList();
  if (__scriptUserStop) return false;
  return true;
}

/**
 * 卡住超 60 秒：① 连续 60 秒没有任何新日志；② 同一条日志反复出现累计满 60 秒（由 appendLog 检测）。
 * 执行与穿插重启相同的「重启脚本获取新对标」，成功启动抖音会计入重启次数（总体比例 +1）。
 */
function tryStuckRestartForRepeatedOrSilent(reason) {
  if (__insideStuckHandler || __stuckRestartInProgress) return;
  if (__scriptUserStop) return;
  if (!__automationWorkerActive) return;
  if (__flowEnd < 2) return;
  if (isTaskDailyQuotaComplete()) return;
  __stuckRestartInProgress = true;
  __insideStuckHandler = true;
  try {
    var __label = "";
    var __rsn = String(reason || "");
    if (__rsn.indexOf("同一提示") >= 0) __label = "日志重复重启";
    else if (__rsn.indexOf("过久无日志") >= 0) __label = "卡住超时重启";
    else __label = __rsn;
    appendLog(__label);
    if (!runFlowSteps1Through9ForInjectedRestart(__flowEnd, false))
      appendLog("获取新对标重启未跑通");
  } catch (e1) {
    try {
      appendLog("卡住重启异常:" + e1);
    } catch (e2) {}
  } finally {
    __insideStuckHandler = false;
    __stuckRestartInProgress = false;
    __stuckRepeatLogKey = "";
    __stuckRepeatLogFirstMs = 0;
    __lastAppendLogTimeMs = Date.now();
  }
}

/** 提交卡住重启请求（不直接执行，交由主流程线程串行处理） */
function requestStuckRestart(reason) {
  if (__insideStuckHandler || __stuckRestartInProgress) return;
  if (__scriptUserStop) return;
  if (!__automationWorkerActive) return;
  if (!reason) return;
  if (!__pendingStuckRestartReason) {
    __pendingStuckRestartReason = String(reason);
  }
}

function startAutomationStuckWatchdogOnce() {
  if (__automationStuckWatchdogStarted) return;
  __automationStuckWatchdogStarted = true;
  threads.start(function () {
    var uiTick = 0;
    while (true) {
      sleep(1000);
      try {
        updateFloatClockLine();
      } catch (eClk) {}
      uiTick++;
      if (uiTick >= 10) {
        uiTick = 0;
        try {
          if (!__scriptUserStop && __automationWorkerActive) updateFloatInfo();
        } catch (eUi) {}
      }
      if (__scriptUserStop) continue;
      if (!__automationWorkerActive) continue;
      if (__insideStuckHandler || __stuckRestartInProgress) continue;
      if (Date.now() - __lastAppendLogTimeMs >= __STUCK_RESTART_SILENT_MS) {
        requestStuckRestart("过久无日志，重启脚本获取新对标");
      }
    }
  });
}

/**
 * 本轮 runFlowFrom 内：前若干次「完成一次随机互动之后」不穿插重启，避免 Ri=0 时连续触发。
 * 穿插重启仅在 runRandomSingleWorkInteraction 结束之后按概率触发，不在「刚进作品」时触发。
 */
var __step11PrepareNoInjectRemaining = 2;
/** 第11步连跑点下一粉丝：用更短进主页确认、火力同款 1xt 点击 */
var __sodaStep11FastEnter = false;

/**
 * 进入作品并执行随机互动前的门槛（仅停脚本/满额）。
 */
function prepareSlotForStep11RandomInteraction(maxStep) {
  if (__scriptUserStop) return false;
  if (isTaskDailyQuotaComplete()) return false;
  return true;
}

/**
 * 完成一轮随机互动（点赞/收藏/分享/评论）之后：按概率穿插「获取新对标」1～9 步，再进作品并再执行一轮互动。
 * @returns {boolean} false=重启链失败宜停本轮；true=未重启或已处理完毕
 */
function maybeInjectedRestartAfterStep11Interaction(maxStep) {
  if (__scriptUserStop) return true;
  if (maxStep < 11) return true;
  if (isTaskDailyQuotaComplete()) return true;
  if (__step11PrepareNoInjectRemaining > 0) {
    __step11PrepareNoInjectRemaining--;
    return true;
  }
  if (!shouldDoInjectedRestartThisSlot()) return true;
  if (!runFlowSteps1Through9ForInjectedRestart(maxStep, true)) return false;
  if (isTaskDailyQuotaComplete()) return true;
  if (!randomEnterWorkAfterInjectedRestart()) {
    appendLog("重启脚本获取新对标后进作品失败，本格跳过互动");
    return true;
  }
  runRandomSingleWorkInteraction();
  return true;
}

/** 四项互动（赞/藏/评/享）已达目标且目标>0 时视为今日量完成；restart 不参与“是否满额停机”等待零点判定。 */
function isTaskDailyQuotaComplete() {
  ensureTaskCountDayRolled();
  var T = getDailyActionTargets();
  var d = getTaskDoneSnapshot();
  var sumT = T.like + T.fav + T.comment + T.share;
  if (sumT <= 0) return false;
  if (T.like > 0 && d.like < T.like) return false;
  if (T.fav > 0 && d.fav < T.fav) return false;
  if (T.comment > 0 && d.comment < T.comment) return false;
  if (T.share > 0 && d.share < T.share) return false;
  return true;
}

/** 满额等零点：仅微亮保进程，不周期性 wakeUp；跨日后再唤醒并上滑解锁 */
let __quotaIdleKeepAwakeActive = false;
let __quotaIdleKeepAwakeTick = 0;
var __QUOTA_IDLE_DIM_REFRESH_EVERY = 80; // 15s×80 ≈ 20 分钟续一次微亮

function isKeyguardLockedForAutomation() {
  try {
    importClass(android.app.KeyguardManager);
    importClass(android.content.Context);
    var km = context.getSystemService(context.KEYGUARD_SERVICE);
    if (km && typeof km.isKeyguardLocked === "function") return !!km.isKeyguardLocked();
  } catch (eKm) {}
  try {
    if (text("上滑解锁").findOne(120)) return true;
    if (textContains("滑动解锁").findOne(120)) return true;
    if (textContains("上滑打开").findOne(120)) return true;
    if (descContains("上滑解锁").findOne(120)) return true;
    if (descContains("滑动解锁").findOne(120)) return true;
  } catch (eUi) {}
  return false;
}

function looksLikeLockScreenUi() {
  try {
    if (text("上滑解锁").findOne(100)) return true;
    if (textContains("滑动解锁").findOne(100)) return true;
    if (textContains("上滑打开").findOne(100)) return true;
    if (descContains("上滑解锁").findOne(100)) return true;
  } catch (e0) {}
  return false;
}

function swipeUpUnlockLockScreenOnce() {
  var w = device.width;
  var h = device.height;
  var x = Math.floor(w * 0.5);
  var y1 = Math.floor(h * 0.90);
  var y2 = Math.floor(h * 0.22);
  try {
    swipe(x, y1, x, y2, 520);
  } catch (e0) {
    try {
      swipe(x, Math.floor(h * 0.86), x, Math.floor(h * 0.18), 480);
    } catch (e1) {
      return false;
    }
  }
  return true;
}

/** 唤醒 + 上滑解锁（仅无密码/上滑锁屏；有数字密码需人工） */
function tryEnsureDeviceUnlockedOnce() {
  var needUnlock = false;
  try {
    needUnlock = isKeyguardLockedForAutomation();
  } catch (e0) {
    needUnlock = looksLikeLockScreenUi();
  }
  if (!needUnlock) return true;
  try {
    device.wakeUpIfNeeded();
  } catch (eW) {}
  sleep(650);
  swipeUpUnlockLockScreenOnce();
  sleep(900);
  try {
    if (!isKeyguardLockedForAutomation()) return true;
  } catch (e1) {}
  if (!looksLikeLockScreenUi()) return true;
  sleep(400);
  swipeUpUnlockLockScreenOnce();
  sleep(700);
  try {
    return !isKeyguardLockedForAutomation();
  } catch (e2) {
    return !looksLikeLockScreenUi();
  }
}

/** 跨日满额结束等待：取消微亮后继续（主路径已在日终采样前解锁；此处仅兜底一次） */
function resumeAutomationAfterQuotaDayRoll() {
  try {
    endQuotaIdleKeepAwake();
  } catch (e0) {}
  try {
    if (isKeyguardLockedForAutomation() || looksLikeLockScreenUi()) {
      try {
        device.wakeUpIfNeeded();
      } catch (eW) {}
      sleepCtrl(400);
      tryEnsureDeviceUnlockedOnce();
    }
  } catch (eUl) {}
  appendLog("跨日继续运行");
  sleepCtrl(600);
  return true;
}

function beginQuotaIdleKeepAwake() {
  if (__quotaIdleKeepAwakeActive) return;
  __quotaIdleKeepAwakeActive = true;
  __quotaIdleKeepAwakeTick = 0;
  try {
    device.keepScreenDim();
  } catch (e0) {
    try {
      device.keepScreenOn();
    } catch (e1) {}
  }
}

function refreshQuotaIdleKeepAwake() {
  if (!__quotaIdleKeepAwakeActive) return;
  __quotaIdleKeepAwakeTick++;
  if (__quotaIdleKeepAwakeTick % __QUOTA_IDLE_DIM_REFRESH_EVERY !== 0) return;
  try {
    device.keepScreenDim();
  } catch (e1) {}
}

function endQuotaIdleKeepAwake() {
  if (!__quotaIdleKeepAwakeActive) return;
  __quotaIdleKeepAwakeActive = false;
  __quotaIdleKeepAwakeTick = 0;
  try {
    device.cancelKeepingAwake();
  } catch (e) {}
}

var __TASK_DONE_KEY = { like: "dLike", fav: "dFav", comment: "dComment", share: "dShare", restart: "dRestart" };

function recordTaskDone(kind) {
  var sk = __TASK_DONE_KEY[kind];
  if (!sk) return;
  ensureTaskCountDayRolled();
  var T = getDailyActionTargets();
  var d = getTaskDoneSnapshot();
  var cap = T[kind];
  if (cap <= 0) return;
  if (d[kind] >= cap) return;
  try {
    var v = d[kind] + 1;
    __stats.put(sk, v);
  } catch (e) {}
  try {
    if (__automationWorkerActive && isSodaPlatformSelected()) updateFloatInfoAsync();
    else updateFloatInfo();
  } catch (e2) {}
  if (isTaskDailyQuotaComplete()) {
    appendLog("今日任务量已达目标");
    try {
      toast("今日任务量已完成");
    } catch (e3) {}
  }
}

/**
 * 随机一类互动：在「目标占比」下全程穿插，避免少数项先满后只剩点赞。
 * 权重 = 剩余次数 × 倍数；倍数由 (当前总完成×该项占比 − 该项已完成) 决定，落后加大、超前缩小（仍保留极小权重避免死锁）。
 */
function pickWeightedRandomWorkAction() {
  var T = getDailyActionTargets();
  var d = getTaskDoneSnapshot();
  var isSoda = isSodaPlatformSelected();
  var Csum = isSoda ? T.like + T.comment : T.like + T.fav + T.comment + T.share;
  if (Csum <= 0) return "like";

  var D = isSoda
    ? d.like + d.comment
    : d.like + d.fav + d.comment + d.share;
  var BLEND = 2.8;
  var pool = [];
  var kinds = isSoda ? ["like", "comment"] : ["like", "fav", "comment", "share"];
  for (var i = 0; i < kinds.length; i++) {
    var k = kinds[i];
    var cap = T[k];
    if (cap <= 0) continue;
    var R = remainingTaskForKind(k);
    if (R <= 0) continue;
    var share = cap / Csum;
    var expected = D * share;
    var lag = expected - d[k];
    var mult = 1 + (BLEND * lag) / Math.max(1, cap);
    if (mult < 0.08) mult = 0.08;
    if (mult > 8) mult = 8;
    var w = R * mult;
    pool.push({ k: k, w: w });
  }
  var sum = 0;
  for (var j = 0; j < pool.length; j++) sum += pool[j].w;
  if (sum <= 0) {
    var fb = [];
    if (isSoda) {
      if (remainingTaskForKind("like") > 0) fb.push("like");
      if (remainingTaskForKind("comment") > 0) fb.push("comment");
    } else {
      if (isTaskTypeEnabled(ui.cb_do_like) && remainingTaskForKind("like") > 0) fb.push("like");
      if (isTaskTypeEnabled(ui.cb_do_fav) && remainingTaskForKind("fav") > 0) fb.push("fav");
      if (isTaskTypeEnabled(ui.cb_do_comment) && remainingTaskForKind("comment") > 0) fb.push("comment");
      if (isTaskTypeEnabled(ui.cb_do_share) && remainingTaskForKind("share") > 0) fb.push("share");
    }
    if (fb.length === 0) return "like";
    return fb[Math.floor(Math.random() * fb.length)];
  }
  var r = Math.random() * sum;
  for (var j = 0; j < pool.length; j++) {
    r -= pool[j].w;
    if (r <= 0) return pool[j].k;
  }
  return pool[pool.length - 1].k;
}

function workActionLabel(k) {
  if (k === "like") return "点赞";
  if (k === "fav") return "收藏";
  if (k === "share") return "分享";
  if (k === "comment") return "评论";
  return k;
}

/**
 * 第11步出作品页：按互动类型返回。
 * 汽水：点赞 2 次、评论 3 次；问道评论亦 3 次（关评论浮层+出播放页+出主页）。
 * @param {string} [act] like|comment|fav|share
 */
function pressBackTwiceAfterWork(act) {
  try {
    var isSoda = isSodaPlatformSelected();
    var forceThird = act === "comment";
    if (isSoda) appendLogProgress(forceThird ? "返回×3" : "返回×2");
    else appendLog(forceThird ? "返回×3" : "返回×2");
    var leadIn = isSoda ? SODA_STEP11_WORK_EXIT_LEAD_IN_MS : PACE_9_11.step11WorkExitLeadIn;
    var back1 = isSoda ? SODA_STEP11_WORK_EXIT_BACK1_MS : PACE_9_11.step11WorkExitBack1;
    var back2 = isSoda ? SODA_STEP11_WORK_EXIT_BACK2_MS : PACE_9_11.step11WorkExitBack2;
    var back3 = isSoda ? SODA_STEP11_WORK_EXIT_BACK3_MS : PACE_9_11.step11WorkExitBack3;
    sleepCtrl(leadIn);
    try {
      back();
    } catch (e0) {}
    sleepCtrl(back1);
    try {
      back();
    } catch (e1) {}
    sleepCtrl(back2);
    if (forceThird) {
      try {
        back();
      } catch (e2c) {}
      sleepCtrl(back3);
      return;
    }
    if (!isSoda) {
      try {
        if (isFollowerListEffectivelyEmpty()) {
          try {
            back();
          } catch (e2) {}
          sleepCtrl(back3);
        }
      } catch (eChk) {}
    }
  } catch (e) {}
}

/**
 * 第11步两次返回后：若当前屏无粉丝列表，则执行「重启脚本获取新对标」（计入重启次数），再进作品并跑一轮随机互动；可连续直至列表恢复或重启配额用尽。
 * @param {boolean} [skipSelf] 为 true 时不执行（供内部连跑时避免嵌套触发）
 */
function tryRestartScriptAfterStep11IfNoFanList(skipSelf) {
  if (skipSelf) return;
  if (__scriptUserStop || __flowEnd < 11) return;
  function hasFollowerListRecoveredQuick() {
    var pollMs = isSodaPlatformSelected() ? 350 : 1800;
    var stepMs = isSodaPlatformSelected() ? 55 : 180;
    var endAt = Date.now() + pollMs;
    while (Date.now() < endAt && !__scriptUserStop) {
      if (isSodaPlatformSelected()) {
        try {
          if (isSodaFanListVisibleQuick()) return true;
        } catch (eS0) {}
      } else {
        try {
          var rows = collectFollowerListRowsDeduped();
          if (rows && rows.length > 0) return true;
        } catch (e0) {}
        try {
          if (!isFollowerListEffectivelyEmpty()) return true;
        } catch (e1) {}
        try {
          var hasFollowTab = !!textMatches(/^关注\s*\d*$/).findOne(80) || !!text("关注").findOne(80);
          var hasFansTab = !!textMatches(/^粉丝\s*\d*$/).findOne(80) || !!text("粉丝").findOne(80);
          if (hasFollowTab && hasFansTab) return true;
        } catch (e2) {}
      }
      sleepCtrl(stepMs);
    }
    return false;
  }
  var maxChain = 35;
  var chain = 0;
  while (chain < maxChain) {
    if (__scriptUserStop || isTaskDailyQuotaComplete()) return;
    sleepCtrl(isSodaPlatformSelected() ? 80 : 650);
    if (hasFollowerListRecoveredQuick()) return;
    appendLog("返回无粉丝列表重启");
    appendLog("10秒后重新获取新对标");
    sleepCtrl(10000);
    if (!runFlowSteps1Through9ForInjectedRestart(__flowEnd, false)) return;
    if (__scriptUserStop || isTaskDailyQuotaComplete()) return;
    if (!randomEnterWorkAfterInjectedRestart()) return;
    runRandomSingleWorkInteraction(true);
    chain++;
  }
}

/** 进入作品后只执行一个互动（火力/库表由任务次数体现）；结束后连按返回两次退出播放/浮层 */
function runRandomSingleWorkInteraction(skipPostStep11FanListRestart) {
  if (__scriptUserStop) return false;
  if (isTaskDailyQuotaComplete()) {
    appendLog("今日量已满，跳过随机互动");
    return false;
  }
  if (!hasUnfinishedInteractiveTask()) {
    appendLog(
      isSodaPlatformSelected()
        ? "今日点赞/评论已达标，本轮不再随机互动"
        : "今日点赞/收藏/评论/分享已达标，本轮不再随机互动"
    );
    return false;
  }
  var act;
  if (__sodaForceLikeOrCommentAfterAd) {
    __sodaForceLikeOrCommentAfterAd = false;
    act = pickSodaForcedLikeOrCommentAfterAd();
  } else {
    act = pickWeightedRandomWorkAction();
  }
  if (act === "fav" || act === "share") appendLog(workActionLabel(act));
  else if (act === "comment") appendLog(workActionLabel(act));
  else if (act === "like" && !isSodaPlatformSelected()) appendLog(workActionLabel(act));
  if (isSodaPlatformSelected()) {
    sleepCtrl(
      typeof SODA_STEP11_BEFORE_ACTION_MS === "number" ? SODA_STEP11_BEFORE_ACTION_MS : 45
    );
  } else {
    sleep(PACE_9_11.step11BeforeAction);
  }
  var ok = false;
  if (act === "like") {
    var LIKE_DEADLINE_FROM_WORK_CLICK_MS = 12000;
    var leftBudget = 6000;
    try {
      if (__lastWorkClickTs > 0) {
        leftBudget = Math.max(1, LIKE_DEADLINE_FROM_WORK_CLICK_MS - (Date.now() - __lastWorkClickTs));
      }
    } catch (eLb) {}
    ok = isSodaPlatformSelected()
      ? clickLikeOnSodaWorkPlayer(leftBudget)
      : clickLikeOnDouyinWorkPlayer(leftBudget);
  } else if (act === "fav") {
    ok = clickCollectOnDouyinWorkPlayer();
  } else if (act === "share") {
    ok = clickShareOnDouyinWorkPlayer();
    sleep(PACE_9_11.step11ShareSheet);
    ok = ok && clickRecommendInShareSheet();
  } else if (act === "comment") {
    if (!clickDouyinWorkCommentBar()) {
      pressBackTwiceAfterWork("comment");
      tryRestartScriptAfterStep11IfNoFanList(skipPostStep11FanListRestart);
      return false;
    }
    sleep(480);
    if (!fetchAndFillDouyinCommentFromServer()) {
      pressBackTwiceAfterWork("comment");
      tryRestartScriptAfterStep11IfNoFanList(skipPostStep11FanListRestart);
      return false;
    }
    sleep(320);
    ok = clickDouyinCommentSend();
  }
  runStep11InteractStayBeforeBack(act);
  pressBackTwiceAfterWork(act);
  if (ok) {
    try {
      if (isSodaPlatformSelected()) {
        if (__currentFanProfileSodaNick) markOperatedSodaNickInWindow(__currentFanProfileSodaNick);
      } else if (__currentFanProfileDyid) {
        markOperatedDyidInWindow(__currentFanProfileDyid);
      }
    } catch (eMark0) {}
    if (act === "like") recordTaskDone("like");
    else if (act === "fav") recordTaskDone("fav");
    else if (act === "share") recordTaskDone("share");
    else if (act === "comment") recordTaskDone("comment");
  }
  tryRestartScriptAfterStep11IfNoFanList(skipPostStep11FanListRestart);
  return ok;
}

function runShareAndRecommendDebug() {
  var ok = clickShareOnDouyinWorkPlayer();
  sleep(900);
  ok = ok && clickRecommendInShareSheet();
  if (ok) recordTaskDone("share");
  return ok;
}

function runCommentFullDebug() {
  if (!clickDouyinWorkCommentBar()) return false;
  sleep(480);
  if (!fetchAndFillDouyinCommentFromServer()) return false;
  sleep(320);
  var ok = clickDouyinCommentSend();
  if (ok) {
    sleepCtrl(1000);
    recordTaskDone("comment");
  }
  return ok;
}

/**
 * 第 7 步：点搜索出的「抖音号」结果进入对标主页。
 * 若第 6 步已 pasteTargetAccountIntoSearch 并设 __currentTargetDbLine，首轮不再取号、不再粘贴，只点结果；
 * 点失败或从第 7 步起跑时才在本函数内取号粘贴。
 */
function completeDouyinSearchOpen(maxRetries) {
  for (var i = 0; i < maxRetries; i++) {
    if (__scriptUserStop) return false;
    var line = null;
    var show = null;
    var reusedFromStep6 = false;
    if (i === 0 && __currentTargetDbLine) {
      line = __currentTargetDbLine;
      show = normalizeDbLine(line);
      reusedFromStep6 = true;
    } else {
      try {
    appendLog("取号尝试 " + (i + 1));
      } catch (eTry) {}
      line = pickRandomDbLine();
    if (!line) {
      appendLog("库为空");
      return false;
    }
      show = normalizeDbLine(line);
    appendLog("取号:" + show);
    if (!pasteValueIntoSearch(show)) {
      __currentTargetDbLine = null;
      return false;
    }
    __currentTargetDbLine = line;
    }
    sleepCtrl(reusedFromStep6 ? 650 : 1000);
    // 先走老逻辑：粘贴后若已出现「抖音号」元素，直接点击进入
    var idNode = null;
    try {
      idNode = findDouyinIdResultNode(1000);
    } catch (eId0) {
      idNode = null;
    }
    if (idNode && clickDouyinIdResult(idNode)) {
      return true;
    }
    // 仅当未出现抖音号元素时，才点搜索并走头像识别
    appendLog("执行搜索");
    clickSearchIcon();
    sleepCtrl(1000);
    var hitMain = clickSearchResultByOcrTarget(show, 3800);
    if (!hitMain) {
      appendLog("结果加载中，再试一次");
      sleepCtrl(900);
      hitMain = clickSearchResultByOcrTarget(show, 3800);
    }
    if (!hitMain) {
      appendLog("无抖音号结果,删号换下一个");
      if (line) removeDbLineFromServer(line);
    __currentTargetDbLine = null;
    clearSearchInput();
      sleepCtrl(900);
      continue;
    }
    return true;
  }
  appendLog("多次失败");
  return false;
}

function pasteTargetAccountIntoSearch() {
  var line = pickRandomDbLine();
  if (!line) {
    appendLog("库为空");
    __currentTargetDbLine = null;
    return false;
  }
  var show = normalizeDbLine(line);
  appendLog("取号:" + show);
  var ok = pasteValueIntoSearch(show);
  if (ok) __currentTargetDbLine = line;
  else __currentTargetDbLine = null;
  return ok;
}

/** 汽水：粉丝列表滑满仍无可换用户 → 重启获取新对标（不计入任务「重启」次数） */
function sodaRestartForFanListNoNewFans(maxStep) {
  if (__scriptUserStop || isTaskDailyQuotaComplete()) return false;
  if (__sodaFanListNoNewFanRestartDone) return true;
  appendLog("当前屏无可换粉丝，重启获取新对标");
  try {
    __followerVisitedNicks = {};
  } catch (eClr) {}
  __sodaNoVideoSkipToNext = false;
  __noWorkLikeEntryDidBack = false;
  var ok = runFlowSteps1Through9ForInjectedRestart(maxStep, false);
  __sodaFanListNoNewFanRestartDone = ok;
  if (!ok) appendLog("重启获取新对标失败");
  return ok;
}

/** 汽水：第11步后连跑用户粉丝列表 10+11 */
function runSodaFollowerListRepeatSteps10And11(maxStep) {
  if (maxStep < 11) return 0;
  var safety = 0;
  var maxExtra = 200;
  var processed = 0;
  while (safety < maxExtra) {
    if (__scriptUserStop) break;
    if (isTaskDailyQuotaComplete()) break;
    var nextOk = clickNextFollowerInListForSoda({ afterStep11: true });
    if (!nextOk) {
      appendLog("粉丝列表已滑" + SODA_FAN_LIST_SCROLL_SWIPES + "屏仍无可换粉丝，重启获取新对标(不计重启次数)");
      sodaRestartForFanListNoNewFans(maxStep);
      break;
    }
    if (maxStep >= 10) {
      var ok10 = tryEnterSodaWorkWithProfileOperateGate(maxStep);
      if (maxStep >= 11 && ok10) {
        if (!prepareSlotForStep11RandomInteraction(maxStep)) {
          if (isTaskDailyQuotaComplete()) break;
          break;
        }
        runRandomSingleWorkInteraction(true);
        if (isTaskDailyQuotaComplete()) break;
        processed++;
      }
    }
    safety++;
  }
  return processed;
}

/** 第 11 步结束已返回×2 回到粉丝列表后：依次点下一行粉丝并重复第 10、11 步（仅当前屏，到底为止） */
function runFollowerListRepeatSteps10And11(maxStep) {
  if (maxStep < 11) return 0;
  var safety = 0;
  var maxExtra = 200;
  var processed = 0;
  while (safety < maxExtra) {
    if (__scriptUserStop) break;
    if (isTaskDailyQuotaComplete()) break;
    var nextOk = clickNextFollowerInList();
    if (!nextOk) {
      // 已排队「下滑满次重启」时不再清访问重扫，避免再滑一整轮
      if (__pendingStuckRestartReason) {
        appendLog("第11步后未选到下一粉丝，结束当前屏连跑");
        break;
      }
      // 兜底：可能是可见行采集抖动/去重状态过严，清空一次本轮已访问并再试一次，避免直接掉到下一轮。
      try { __followerVisitedNicks = {}; } catch (eClrVisited) {}
      sleepCtrl(260);
      nextOk = clickNextFollowerInList();
    }
    if (!nextOk) {
      appendLog("第11步后未选到下一粉丝，结束当前屏连跑");
      break;
    }
    if (maxStep >= 10) {
      var ok10 = tryEnterWorkWithProfileOperateGate(maxStep);
      if (maxStep >= 11 && ok10) {
        if (!prepareSlotForStep11RandomInteraction(maxStep)) {
          if (isTaskDailyQuotaComplete()) break;
          break;
        }
          runRandomSingleWorkInteraction();
          if (isTaskDailyQuotaComplete()) break;
        if (!maybeInjectedRestartAfterStep11Interaction(maxStep)) {
          if (isTaskDailyQuotaComplete()) break;
          break;
        }
        processed++;
      }
    }
    safety++;
  }
  return processed;
}

/**
 * maxStep 为本次执行的「止点」步号（见 __flowEnd）。第 n 步当且仅当 __flowStart ≤ n ≤ maxStep 时执行。
 */
function runFlowFrom(maxStep) {
  if (__scriptUserStop) return;
  if (isSodaPlatformSelected()) {
    runSodaFlowFrom(maxStep);
    return;
  }
  const s = __flowStart < 1 ? 1 : __flowStart;
  __noWorkLikeEntryDidBack = false;
  __step11PrepareNoInjectRemaining = 2;
  ensureTaskCountDayRolled();
  if (isTaskDailyQuotaComplete()) {
    appendLog("今日任务量已达目标，本次不执行");
    return;
  }
  try { appendLog("[诊断] 进入runFlowFrom s=" + s + " maxStep=" + maxStep + " round=" + __continuousRoundIndex); } catch (eDg0) {}
  if (s <= 1 && maxStep >= 1 && __continuousRoundIndex === 0) forceStopApp(DY_PKG, "抖音");
  try { appendLog("[诊断] 步骤1后 scriptUserStop=" + __scriptUserStop); } catch (eDg1) {}
  if (__scriptUserStop) { try { appendLog("[诊断] 步骤1后检测到停止标记，提前return"); } catch (eDg1b) {} return; }
  if (s <= 2 && maxStep >= 2) {
    launchDouyin();
  }
  try { appendLog("[诊断] 步骤2后 scriptUserStop=" + __scriptUserStop); } catch (eDg2) {}
  if (__scriptUserStop) { try { appendLog("[诊断] 步骤2后检测到停止标记，提前return"); } catch (eDg2b) {} return; }
  if (s <= 3 && maxStep >= 3) {
    if (!clickMeTabWith25sRestart(true)) {
      appendLog("未能进入「我」，终止本轮");
      return;
    }
    try { appendLog("[诊断] 步骤3(进入我页)成功"); } catch (eDg3) {}
  }
  var isWendao = isWendaoModeSelected();
  if (s <= 4 && maxStep >= 4) runStep4ByDaoMode("主流程");
  try { appendLog("[诊断] 步骤4后 isWendao=" + isWendao); } catch (eDg4) {}
  var wendaoPickedAtStep5 = false;
  if (s <= 5 && maxStep >= 5) {
    if (isWendao) {
      if (!clickFirstUnpickedFollowerInListForWendao()) {
        appendLog("问道：未选到可用粉丝用户，终止本轮");
        return;
      }
      wendaoPickedAtStep5 = true;
    } else {
      clickSearchIcon();
    }
    try { appendLog("[诊断] 步骤5完成"); } catch (eDg5) {}
  }
  if (s <= 6 && maxStep >= 6) {
    if (isWendao) {
      var followOk = clickFollowOnTargetProfileForWendao();
      var retryN = 0;
      var FOLLOW_RETRY_MAX_WENDAO = 12;
      while (!followOk && retryN < FOLLOW_RETRY_MAX_WENDAO && !__scriptUserStop) {
        appendLog("问道：选择下一个用户");
        if (!clickFirstUnpickedFollowerInListForWendao()) break;
        followOk = clickFollowOnTargetProfileForWendao();
        retryN++;
      }
      if (!followOk) {
        appendLog("问道：点击关注多次失败，继续下一轮");
        return;
      }
    } else {
      pasteTargetAccountIntoSearch();
    }
    try { appendLog("[诊断] 步骤6完成"); } catch (eDg6) {}
  }
  if (s <= 7 && maxStep >= 7) {
    if (isWendao) {
      if (!clickFirstFollowerInFollowListForWendao()) {
        appendLog("问道：关注首行不可用，终止本轮");
        return;
      }
    } else {
      completeDouyinSearchOpen(3);
    }
    try { appendLog("[诊断] 步骤7完成"); } catch (eDg7) {}
  }
  if (__scriptUserStop) { try { appendLog("[诊断] 步骤7后检测到停止标记，提前return"); } catch (eDg7b) {} return; }
  if (s <= 8 && maxStep >= 8) {
    if (isWendao) {
      if (!runWendaoStep8FanGateUploadThenEnterFansList(maxStep)) return;
      resetCurrentTargetOperatedSkipCounter();
    } else {
    if (clickFansOnTargetProfile()) {
      handleEmptyFollowerListByReselect(maxStep);
      resetCurrentTargetOperatedSkipCounter();
    }
    }
    try { appendLog("[诊断] 步骤8完成"); } catch (eDg8) {}
  }
  if (s <= 9 && maxStep >= 9) clickFirstFollowerInList();
  try { appendLog("[诊断] 步骤9后 scriptUserStop=" + __scriptUserStop); } catch (eDg9) {}
  if (__scriptUserStop) { try { appendLog("[诊断] 步骤9后检测到停止标记，提前return"); } catch (eDg9b) {} return; }
  var enteredWork = false;
  if (s <= 10 && maxStep >= 10) enteredWork = tryEnterWorkWithProfileOperateGate(maxStep);
  try { appendLog("[诊断] 步骤10后 enteredWork=" + enteredWork); } catch (eDg10) {}

  if (maxStep === 11) {
    if (enteredWork) {
      if (!prepareSlotForStep11RandomInteraction(maxStep)) {
        if (isTaskDailyQuotaComplete()) return;
        return;
      }
        runRandomSingleWorkInteraction();
        if (isTaskDailyQuotaComplete()) return;
      if (!maybeInjectedRestartAfterStep11Interaction(maxStep)) {
        if (isTaskDailyQuotaComplete()) return;
        appendLog("重启脚本获取新对标失败，停止本轮");
        return;
      }
    }
    // 只要本轮是从 1~9 起跑（含问道常规链路），第10步失败后都应继续点下一粉丝，
    // 避免因 flowStart 异常被误判为“直接结束本轮并继续运行下一轮”。
    if (__startStep <= 9 && !isTaskDailyQuotaComplete()) {
      var repeated = runFollowerListRepeatSteps10And11(maxStep);
      if (!repeated) appendLog("第11步后未连上下一粉丝，转下一轮");
    }
    return;
  }
  if (maxStep === 12) {
    if (clickLikeOnDouyinWorkPlayer()) recordTaskDone("like");
  }
  if (maxStep === 13) {
    if (clickCollectOnDouyinWorkPlayer()) recordTaskDone("fav");
  }
  if (maxStep === 14) runShareAndRecommendDebug();
  if (maxStep >= 15) runCommentFullDebug();
}

function ensureFloatPermission() {
  try {
    if (!floaty.checkPermission()) {
      toast("请先授予悬浮窗权限");
      floaty.requestPermission();
      return false;
    }
  } catch (e) {}
  return true;
}

function createOrShowFloatWindow() {
  const FLOAT_PANEL_W = 155;
  const FLOAT_CTRL_W = 96;
  const FLOAT_CTRL_H = 72;
  const CTRL_DX = -60;
  const CTRL_DY = -110;

  function setCtrlPos(panelX, panelY) {
    if (!__floatCtrlWin) return;
    __floatCtrlWin.setPosition(panelX + CTRL_DX, panelY + CTRL_DY);
  }

  if (__floatInfoWin && __floatCtrlWin) {
    try {
      if (!__floatInfoWin.line_13) {
        try {
          __floatCtrlWin.close();
        } catch (eOldC) {}
        try {
          __floatInfoWin.close();
        } catch (eOldI) {}
        __floatCtrlWin = null;
        __floatInfoWin = null;
      }
    } catch (eOldL) {}
  }
  if (__floatInfoWin && __floatCtrlWin) {
    try { __floatInfoWin.setPosition(__floatPanelX, __floatPanelY); } catch (e) {}
    try { setCtrlPos(__floatPanelX, __floatPanelY); } catch (e) {}
    updateFloatInfo();
    updateAppVersionTitleDisplay();
    startAutomationStuckWatchdogOnce();
    return;
  }

  __floatInfoWin = floaty.rawWindow(
    <frame>
      <card w={FLOAT_PANEL_W} cardBackgroundColor="#88000000" cardCornerRadius="3dp" cardElevation="0dp">
        <vertical padding="7 5">
          <text id="line_1" text={getFloatWindowTitleText()} textColor={COLOR_FLOAT_BLUE_TITLE} textSize="15sp" textStyle="bold" />
          <text id="line_2" text="您的昵称" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_3" text="近期粉丝 0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_4" text="昨日增长 0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_5" text="今日增长 0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_6" text="运行平台 未选" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_7" text="总体比例 0/0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_8" text="点赞 0/0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_9" text="收藏 0/0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_10" text="评论 0/0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
          <text id="line_11" text="分享 0/0" textColor={COLOR_FLOAT_BLUE} textSize="14sp" />
            <text
            id="line_12"
            text="2026-04-12 09:53"
            textColor={COLOR_FLOAT_BLUE}
            textSize="14sp"
            marginTop="1"
            maxLines={1}
            singleLine={true}
              ellipsize="end"
            />
          <text
            id="line_13"
            text="已运行00小时00分钟"
            textColor={COLOR_FLOAT_BLUE}
            textSize="14sp"
            marginTop="0"
            maxLines={1}
            singleLine={true}
            ellipsize="end"
          />
          <frame marginTop="0" bg="#00000000" padding="2 0" h="wrap_content">
            <text id="log" text="日志：" textColor="#FFFFFF" textSize="13sp" lineSpacingExtra="0" maxLines={__logShowLines} ellipsize="end" />
          </frame>
        </vertical>
      </card>
    </frame>
  );
  try { __floatInfoWin.setTouchable(false); } catch (e) {}

  __floatCtrlWin = floaty.window(
    <frame w={FLOAT_CTRL_W} h={FLOAT_CTRL_H}>
      <text id="btn_close" text="×" textColor="#FF3B30" textSize="48sp" textStyle="bold" gravity="center" w="*" h="*" bg="#00000000" />
    </frame>
  );

  __floatInfoWin.setPosition(__floatPanelX, __floatPanelY);
  setCtrlPos(__floatPanelX, __floatPanelY);
  updateFloatInfo();
  updateAppVersionTitleDisplay();
  startAutomationStuckWatchdogOnce();

  let x = 0, y = 0, wx = 0, wy = 0;
  let downX = 0, downY = 0;
  let movedFar = false;
  __floatCtrlWin.btn_close.setOnTouchListener(function(view, event) {
    try {
      if (!__floatInfoWin || !__floatCtrlWin) return false;
      switch (event.getAction()) {
        case event.ACTION_DOWN:
          x = event.getRawX();
          y = event.getRawY();
          downX = x;
          downY = y;
          movedFar = false;
          wx = __floatInfoWin.getX();
          wy = __floatInfoWin.getY();
          return true;
        case event.ACTION_MOVE:
          if (!__floatInfoWin) return true;
          try {
            var dx = event.getRawX() - downX;
            var dy = event.getRawY() - downY;
            if (Math.abs(dx) > 24 || Math.abs(dy) > 24) movedFar = true;
          } catch (eMv0) {}
          __floatPanelX = wx + (event.getRawX() - x);
          __floatPanelY = wy + (event.getRawY() - y);
          __floatInfoWin.setPosition(__floatPanelX, __floatPanelY);
          setCtrlPos(__floatPanelX, __floatPanelY);
          return true;
        case event.ACTION_UP:
          // 放宽点击阈值：防止手指轻微抖动被误判为拖动，导致点叉号不生效
          var upDx = 0, upDy = 0;
          try {
            upDx = Math.abs(event.getRawX() - downX);
            upDy = Math.abs(event.getRawY() - downY);
          } catch (eUp0) {}
          if (!movedFar && upDx <= 24 && upDy <= 24) {
            stopEntireScriptAfterClosingFloat();
          }
          return true;
        case event.ACTION_CANCEL:
          // 某些机型会出现 CANCEL，不应漏掉用户的关闭意图
          if (!movedFar) {
            stopEntireScriptAfterClosingFloat();
          }
          return true;
      }
    } catch (eTouch) {}
    return false;
  });
}

function showFloatWindow() {
  if (__floatCreated) {
    createOrShowFloatWindow();
    return;
  }
  __floatCreated = true;
  threads.start(() => createOrShowFloatWindow());
}

if (ui.btn_start) {
  function __startAfterLicenseAuthorized() {
    if (!ensureFloatPermission()) return;
    __scriptUserStop = false;
    __licenseNetworkPaused = false;
    __networkRecoveredNeedRestart = false;
    __eodSampleNeedRestartFrom1 = false;
    __lastNetworkWaitLogMs = 0;
    __screenCaptureAllowNodeClicked = false;
    showFloatWindow();
    toast("已显示悬浮框");
    appendLog("开始");

    if (__xiuluoModeArmed) {
      __xiuluoModeArmed = false; // 一次性触发，避免误长期停留
    threads.start(() => {
      __automationWorkerActive = true;
        startLicenseHeartbeatWatchdog();
        beginAutomationRunTimeSession();
        try {
          runXiuluoHiddenFlowOnce();
          if (__scriptUserStop) appendLog("已停止");
        } catch (eX) {
          appendLog("异常: " + eX);
        } finally {
          __automationWorkerActive = false;
          endAutomationRunTimeSession();
          try { updateFloatInfo(); } catch (eXF) {}
          __lastAppendLogTimeMs = Date.now();
        }
      });
      return;
    }

    threads.start(() => {
      __automationWorkerActive = true;
      startLicenseHeartbeatWatchdog();
      beginAutomationRunTimeSession();
      __lastAppendLogTimeMs = Date.now();
      __stuckRepeatLogKey = "";
      __stuckRepeatLogFirstMs = 0;
      startAutomationStuckWatchdogOnce();
      snapshotOnlineScheduleForRun();
      snapshotInteractStayForRun();
      runAutomationPreStartCountdown();
      ensureScreenCaptureAllowPollWhileAutomation();
      primeScreenCapturePermissionAtAutomationStart();
      var roundNum = 0;
      var idleQuotaLogged = false;
      try {
        while (!__scriptUserStop) {
          if (__pendingStuckRestartReason) {
            var __rsn = __pendingStuckRestartReason;
            __pendingStuckRestartReason = "";
            tryStuckRestartForRepeatedOrSilent(__rsn);
            if (__scriptUserStop) break;
          }
          waitWhileNetworkPausedBlocking();
          if (__scriptUserStop) break;
          waitWhileOfflineScheduleBlocking();
          if (__scriptUserStop) break;
          if (maybeRunEodFanGrowthSampling()) {
            sleepCtrl(600);
            continue;
          }
          if (__eodSampleNeedRestartFrom1) {
            __eodSampleNeedRestartFrom1 = false;
            try {
              appendLog("采样完成，从第1步开始");
            } catch (eS0) {}
            var _prevFlowStartS = __flowStart;
            var _prevContS = __continuousRoundIndex;
            try {
              __flowStart = 1;
              __continuousRoundIndex = 0;
              __currentTargetDbLine = null;
              __fansTapNoNavigationReselect = false;
              __followerVisitedNicks = {};
              runFlowFrom(11);
            } catch (eS1) {
              try { appendLog("采样后重跑异常: " + eS1); } catch (eS2) {}
            } finally {
              try { __flowStart = _prevFlowStartS; } catch (eSR0) {}
              try { __continuousRoundIndex = _prevContS; } catch (eSR1) {}
            }
            sleepCtrl(600);
            continue;
          }
          if (__networkRecoveredNeedRestart) {
            __networkRecoveredNeedRestart = false;
            // 你要求“从第一步开始”（包含停抖音）。这里不要走“重启获取新对标”支线，
            // 而是临时把 flowStart 拉回 1，并把连续轮次归零，直接跑一轮完整 1～11。
            try {
              appendLog("网络恢复重启，从第1步开始");
            } catch (eN0) {}
            var _prevFlowStart = __flowStart;
            var _prevCont = __continuousRoundIndex;
            try {
              __flowStart = 1;
              __continuousRoundIndex = 0;
              __currentTargetDbLine = null;
              __fansTapNoNavigationReselect = false;
              __followerVisitedNicks = {};
              runFlowFrom(11);
            } catch (eN1) {
              try { appendLog("网络恢复重跑异常: " + eN1); } catch (eN2) {}
            } finally {
              // 恢复用户原有起跑步号（仅本次网络恢复强制从第1步跑一轮）
              try { __flowStart = _prevFlowStart; } catch (eR0) {}
              try { __continuousRoundIndex = _prevCont; } catch (eR1) {}
            }
            sleepCtrl(600);
            continue;
          }
        ensureTaskCountDayRolled();
        if (isTaskDailyQuotaComplete()) {
            if (!idleQuotaLogged) {
              appendLog("今日量已满，等待次日零点继续…");
          try {
                toast("今日量已满，微亮等待零点自动继续");
          } catch (e0) {}
              try {
                beginQuotaIdleKeepAwake();
                appendLog("满额等待：微亮保活至零点（不频繁亮屏）");
              } catch (eQ0) {}
              idleQuotaLogged = true;
            }
            var quotaResumedNewDay = false;
            var qj;
            for (qj = 0; qj < 4 && !__scriptUserStop; qj++) {
              try {
                refreshQuotaIdleKeepAwake();
              } catch (eQ1) {}
              sleepCtrl(15000);
              bumpStuckWatchdogHeartbeat();
              ensureTaskCountDayRolled();
              if (!isTaskDailyQuotaComplete()) {
                quotaResumedNewDay = true;
                break;
              }
            }
            if (quotaResumedNewDay) {
              idleQuotaLogged = false;
              try {
                resumeAutomationAfterQuotaDayRoll();
              } catch (eRes) {}
            }
            continue;
          }
          if (idleQuotaLogged) {
            try { endQuotaIdleKeepAwake(); } catch (eQ2) {}
          }
          idleQuotaLogged = false;
          __lastAppendLogTimeMs = Date.now();
          __stuckRepeatLogKey = "";
          __stuckRepeatLogFirstMs = 0;
          __continuousRoundIndex = roundNum;
          var listOnlyLoop = false;
          try {
            listOnlyLoop = roundNum > 0 && __startStep <= 9 && __flowEnd >= 11;
          } catch (eMode) {
            listOnlyLoop = false;
          }
          if (!listOnlyLoop) {
        appendLog(
          "流程@" + __startStep + (__flowEnd !== __startStep ? "→" + __flowEnd : "")
        );
            var runEnd = __flowEnd;
            try {
              if (isSodaPlatformSelected()) {
                if (__startStep <= 9 && runEnd < 11) runEnd = 11;
                if (__startStep === 10 && runEnd === 10) runEnd = 11;
              } else if (__startStep <= 9 && runEnd < 11) {
                // 兜底：起始步在 1~9 时，流程应至少跑到 11（进入作品+互动）。
                runEnd = 11;
              }
            } catch (eRe0) {}
            runFlowFrom(runEnd);
          } else {
            appendLog("继续从当前粉丝列表");
            __sodaFanListNoNewFanRestartDone = false;
            var processedN = 0;
            try {
              if (isSodaPlatformSelected()) {
                processedN = runSodaFollowerListRepeatSteps10And11(11) || 0;
              } else {
                processedN = runFollowerListRepeatSteps10And11(11) || 0;
              }
            } catch (eList) {
              processedN = 0;
            }
            if (processedN <= 0 && !__scriptUserStop) {
              if (isSodaPlatformSelected() && !__sodaFanListNoNewFanRestartDone) {
                sodaRestartForFanListNoNewFans(11);
              }
              sleepCtrl(1200);
            }
          }
          roundNum++;
          sleepCtrl(600);
          continue;
        }
        if (__scriptUserStop) {
          appendLog("已停止");
        }
      } catch (e) {
        appendLog("异常: " + e);
      } finally {
        try { endQuotaIdleKeepAwake(); } catch (eQ3) {}
        __automationWorkerActive = false;
        try { __platformRunSnapshot = ""; } catch (ePfEnd) {}
        endAutomationRunTimeSession();
        try {
          updateFloatInfo();
        } catch (eFl) {}
        __lastAppendLogTimeMs = Date.now();
      }
    });
  }

  function __onStartButtonTap() {
    // 勾选记忆与当前进程可能不一致：点开始前按 UI 勾选强制对齐再跑
    try {
      var uiProfile = readLiudaoScriptProfileFromUi();
      setLiudaoScriptProfile(uiProfile);
      if (!isLiudaoScriptProfileMatched()) {
        try {
          appendLog(
            "机型未对齐，正在切换到" +
              (uiProfile === "oppo_a72" ? "OPPO加固" : "通用") +
              "模式…"
          );
        } catch (eAlignLog) {}
        toast(
          uiProfile === "oppo_a72"
            ? "正在加载 OPPO加固模式…"
            : "正在加载通用版…"
        );
        threads.start(function () {
          if (!tryLiudaoScriptProfileHandoff(true)) {
            try {
              toast("机型脚本切换失败，请检查网络后重试");
            } catch (eAlignFail) {}
          }
        });
        return;
      }
    } catch (eAlign) {}
    try { __daoceModeRunSnapshot = getDaoceMode(); } catch (eMode0) { __daoceModeRunSnapshot = ""; }
    try {
      __platformRunSnapshot =
        ui.pf_soda && ui.pf_soda.isChecked && ui.pf_soda.isChecked() ? "soda" : "official";
    } catch (ePf0) {
      __platformRunSnapshot = "official";
    }
    var savedCode = loadLocalActivatedCardCode();
    // TEMP: 临时注释掉在线授权校验，直接放行（调试用，记得恢复）
    /*
    // 每次点击开始都在线校验一次：可及时识别“已解绑/已过期”
    try { appendLog("开始前授权校验中…"); } catch (eL4) {}
    toast("校验授权中…");
    threads.start(() => {
      var vr = validateLicenseOnlineForStart();
      ui.run(() => {
        if (vr && vr.ok) {
          try {
            appendLog(
              "开始前授权校验通过 到期=" + formatExpireAt(vr.expire_at || 0)
            );
          } catch (eL5) {}
          __startAfterLicenseAuthorized();
        } else if (isLicenseValidateTransientFailure(vr) && ensureLicenseValidBeforeStart()) {
          try {
            appendLog("授权校验超时，本地授权未过期，继续运行 到期=" + formatExpireAt(loadLocalLicenseExpire()));
          } catch (eL7) {}
          toast("网络超时，按本地授权启动");
          __startAfterLicenseAuthorized();
        } else {
          try { appendLog("开始拦截：授权校验失败 " + ((vr && vr.msg) ? vr.msg : "")); } catch (eL6) {}
          if (vr && String(vr.msg || "") === "client_too_old") {
            var tip = "脚本版本过旧，请更新到最新版";
            if (vr.min_client_ver) tip += "（最低版本 " + String(vr.min_client_ver) + "）";
            toast(tip);
          } else if (isLicenseValidateTransientFailure(vr)) {
            toast("连接授权服务器超时，请检查网络后重试");
          } else if (!savedCode) {
            toast("请先激活授权码");
          } else {
            toast("授权码无效或已过期" + ((vr && vr.msg) ? ("：" + vr.msg) : ""));
          }
        }
      });
    });
    */
    __startAfterLicenseAuthorized();
  }

  ui.btn_start.on("click", () => {
    __onStartButtonTap();
  });

  // 长按「开始」5秒才弹出单步调试起点选择，避免误触
  var __startBtnHoldTimer = null;
  var __startBtnHoldFired = false;
  var __startBtnDownX = 0;
  var __startBtnDownY = 0;
  var __START_BTN_LONG_PRESS_MS = 3000;
  ui.btn_start.setOnTouchListener(function (view, event) {
    try {
      var act = event.getAction();
      if (act === event.ACTION_DOWN) {
        __startBtnHoldFired = false;
        __startBtnDownX = event.getX();
        __startBtnDownY = event.getY();
        if (__startBtnHoldTimer) {
          try { clearTimeout(__startBtnHoldTimer); } catch (e0) {}
          __startBtnHoldTimer = null;
        }
        __startBtnHoldTimer = setTimeout(function () {
          __startBtnHoldTimer = null;
          __startBtnHoldFired = true;
          try {
    chooseStartStepDialog();
          } catch (e2) {}
        }, __START_BTN_LONG_PRESS_MS);
        return true;
      }
      if (act === event.ACTION_MOVE) {
        // 手指移出按钮区域则取消长按（避免滑动误触）
        var x = event.getX();
        var y = event.getY();
        var w = view.getWidth();
        var h = view.getHeight();
        var pad = 30;
        var out = x < -pad || y < -pad || x > w + pad || y > h + pad;
        if (out) {
          if (__startBtnHoldTimer) {
            try { clearTimeout(__startBtnHoldTimer); } catch (e3) {}
            __startBtnHoldTimer = null;
          }
        }
        return true;
      }
      if (act === event.ACTION_UP || act === event.ACTION_CANCEL) {
        if (__startBtnHoldTimer) {
          try { clearTimeout(__startBtnHoldTimer); } catch (e4) {}
          __startBtnHoldTimer = null;
        }
        // 未触发长按：视为点击开始
        if (!__startBtnHoldFired && act === event.ACTION_UP) {
          __onStartButtonTap();
        }
        return true;
      }
    } catch (e) {}
    return true;
  });
}
