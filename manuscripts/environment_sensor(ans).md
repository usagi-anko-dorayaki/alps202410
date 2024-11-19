# 温湿度測定システムの開発（解答例）

## 目的

## 基本機能の実装

### 準備 Level 1.0

```c:user.cfg
/* 初期化ルーチンの追加 */
ATT_INI( {TA_NULL, 0, initialize} );

/* タスクの生成 */
CRE_TSK(MAIN_TASK, {TA_ACT, 0, main_task, MAIN_PRIORITY, STACK_SIZE, NULL});
CRE_TSK(ENV_TASK, {TA_ACT, 0, env_task, MID_PRIORITY, STACK_SIZE, NULL});
CRE_TSK(DATA_CHANGE_TASK, {TA_ACT, 0, data_change_task, MID_PRIORITY, STACK_SIZE, NULL});
CRE_TSK(LCD_TASK, {TA_ACT, 0, lcd_task, MID_PRIORITY, STACK_SIZE, NULL});
```

```c:user.h
/* RTOSのタスク */
extern void main_task(intptr_t exinf);
extern void env_task(intptr_t exinf);
extern void data_change_task(intptr_t exinf);
extern void lcd_task(intptr_t exinf);
```

```c:main.c
/**
 * 最初に実行されるタスク（RTOSリソース）
 *
 * 引数: exinf 拡張情報
 */
void main_task(intptr_t exinf)
{

  SVC_PERROR(syslog_msk_log(0, LOG_UPTO(LOG_INFO))); // syslog関数のメッセージの優先度を設定
  
  syslog(LOG_NOTICE, "MAIN_TASK has been started.");

  while (1) {
    slp_tsk();
  }
}

void env_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "ENV_TASK has been started.");

  while (1) {
    slp_tsk();
  }
}

void data_change_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "DATA_CHANGE_TASK has been started.");

  while (1) {
    slp_tsk();
  }
}

void lcd_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "LCD_TASK has been started.");

  while (1) {
    slp_tsk();
  }
}
```

### MAIN_TASKの実装 Level 1.1

```c:main.c(initialize)
/**
 * 初期化用の関数（RTOSリソース）
 * 
 * user.cfgのATT_INIに登録しているので、RTOS起動時に自動で実行される。
 * 引数	: exinf 拡張情報
 */
void initialize(intptr_t exinf)
{
  // 初期処理を記述する
  init_fcled(); // フルカラーLEDの初期化
  
}
```

```c:main.c(MAIN_TASK)
/**
 * 最初に実行されるタスク（RTOSリソース）
 *
 * フルカラーLEDの青色を1秒間隔で点滅する。
 * user.cfgのCRE_TASKで指定しているので、タスクとして実行される。
 * 引数: exinf 拡張情報
 */
void main_task(intptr_t exinf)
{
  SVC_PERROR(syslog_msk_log(0, LOG_UPTO(LOG_INFO))); // syslog関数のメッセージの優先度を設定
  
  syslog(LOG_NOTICE, "MAIN_TASK has been started.");

  // ここに処理を記述します。
  int blue_on = false; // 青色の点灯状態

  while (1) {
    // ここに処理を記述します。
    blue_on = !blue_on; // 点灯状態を反転
    if (blue_on) {
      fcled_onoff(0, 0, ON); // 青色を点灯
    } else {
      fcled_onoff(0, 0, OFF); // 青色を消灯
    }
    dly_tsk(1000); // 1秒間待ち状態
  }
}
```

### ENV_TASKの実装 Level 1.2

```c:main.c(グローバル変数)
/* グローバル変数 */
short temp10; // 温度データ（10倍値）
short humi10; // 湿度データ（10倍値）
```

```c:main.c(initialize)
void initialize(intptr_t exinf)
{
  // 初期処理を記述する
  init_fcled(); // フルカラーLEDの初期化
  init_riic(); // 温湿度センサーで使用するI2Cの初期化
}
```

```c:main.c(ENV_TASK)
#define SENSOR_I2C_ADDR 0x8a // 温湿度センサーのI2Cアドレス

/**
 * 温湿度センサーからデータを取得
 * 
 * 1秒間隔で温湿度センサーからデータを取得します。
 * 引数: exinf 拡張情報
 */
void env_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "ENV_TASK has been started.");

  while (1) {
    sht31_measure(SENSOR_I2C_ADDR, &temp10, &humi10); // 温湿度を取得
    
    /* for Debug */
    syslog(LOG_NOTICE, "temp is %d.", temp10);
    syslog(LOG_NOTICE, "humi is %d.", humi10);

    dly_tsk(1000);
  }
}
```

### DATA_CHANGE_TASKの実装 Level 1.3

```c:main.c(定数とグローバル変数)
#define TEMP_STR_LEN 10 // 温度の文字列の長さ
#define HUMI_STR_LEN 10 // 湿度の文字列の長さ

/* グローバル変数 */
short temp10; // 温度データ（10倍値）
short humi10; // 湿度データ（10倍値）
char temp[TEMP_STR_LEN]; // 温度の文字列データ
char humi[HUMI_STR_LEN]; // 湿度の文字列データ
```

```c:main.c(initialize)
void initialize(intptr_t exinf)
{
  // 初期処理を記述する
  init_fcled(); // フルカラーLEDの初期化
  init_riic(); // 温湿度センサーで使用するI2Cの初期化
}
```

```c:mani.c(ENV_TASK)
#define SENSOR_I2C_ADDR 0x8a // 温湿度センサーのI2Cアドレス

/**
 * 温湿度センサーからデータを取得
 * 
 * 1秒間隔で温湿度センサーからデータを取得します。
 * 引数: exinf 拡張情報
 */
void env_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "ENV_TASK has been started.");

  while (1) {
    sht31_measure(SENSOR_I2C_ADDR, &temp10, &humi10); // 温湿度を取得
    wup_tsk(DATA_CHANGE_TASK); // DATA_CHANGE_TASKを起床
    
    /* for Debug */
    syslog(LOG_NOTICE, "temp is %d.", temp10);
    syslog(LOG_NOTICE, "humi is %d.", humi10);

    dly_tsk(1000);
  }
}
```

```c:main.c(DATA_CHANGE_TASK)
/**
 * 温湿度データを文字列データに変換
 * 
 * 起床されたらグローバル変数からデータを取得して、文字列データに変換して
 * グローバル変数に保存します。
 * 引数: exinf 拡張情報
 */
void data_change_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "DATA_CHANGE_TASK has been started.");

  while (1) {
    slp_tsk();
    temp2string(temp10, temp); // 温度データを文字列データに変換
    humi2string(humi10, humi); // 湿度データを文字列データに変換

    /* for Debug */
    syslog(LOG_NOTICE, "temp is %s.", temp);
    syslog(LOG_NOTICE, "humi is %s.", humi);
  }
}
```

### LCD_TASKの実装 Level 1.4

```c:main.c(initialize)
void initialize(intptr_t exinf)
{
  // 初期処理を記述する
  init_fcled(); // フルカラーLEDの初期化
  init_riic(); // 温湿度センサーで使用するI2Cの初期化
  init_lcd(); // LCDを初期化
}
```

```c:main.c(DATA_CHANGE_TASK)
void data_change_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "DATA_CHANGE_TASK has been started.");

  while (1) {
    slp_tsk();
    temp2string(temp10, temp); // 温度データを文字列データに変換
    humi2string(humi10, humi); // 湿度データを文字列データに変換
    wup_tsk(LCD_TASK); // LCD_TASKを起床

    /* for Debug */
    syslog(LOG_NOTICE, "temp is %s.", temp);
    syslog(LOG_NOTICE, "humi is %s.", humi);
  }
}
```

```c:main.c(LCD_TASK)
#define LCD_TEMP_POS_COL 0 // LCDに温度データを表示するときのX座標
#define LCD_TEMP_POS_LINE 0 // LCDに温度データを表示するときのY座標
#define LCD_HUMI_POS_COL 9 // LCDに湿度データを表示するときのX座標
#define LCD_HUMI_POS_LINE 0 // LCDに湿度データを表示するときのY座標

/**
 * 温湿度データをLCDに表示
 * 
 * 起床されたらグローバル変数からデータを取得して、文字列データをLCDに表示
 * します。
 * 引数: exinf 拡張情報
 */
void lcd_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "LCD_TASK has been started.");

  while (1) {
    slp_tsk();
    lcd_clear(); // 表示をクリア
    dly_tsk(1); // lcd_clearのバグ対策
    lcd_cur(LCD_TEMP_POS_COL, LCD_TEMP_POS_LINE); // カーソルを左上に移動
    lcd_string(temp); // 温度を表示
    lcd_cur(LCD_HUMI_POS_COL, LCD_HUMI_POS_LINE); // カーソルを湿度データを表示する位置に移動
    lcd_string(humi); // 湿度データを表示
  }
}
```

## 周期ハンドラの実装 Level 2.1

```c:user.cfg
/* 周期ハンドラの生成 */
CRE_CYC(DATA_ACQ_TIMING_HANDLER, {TA_NULL, 0, data_acq_TIMING_handler, 1000, 0});
```

```c:main.h
/* RTOSのハンドラ */
extern void data_acq_TIMING_handler(intptr_t exinf);
```

```c:main.c(DATA_ACQ_TIMING_HANDLER)
/**
 * 温湿度データ収集タイミング生成ハンドラ
 * 
 * 温湿度データ収集タイミングを生成します。
 * 起動するとENV_TASKを起床します。
 *
 * 引数: exinf 拡張情報
 */
void data_acq_TIMING_handler(intptr_t exinf)
{
  iwup_tsk(ENV_TASK);
}
```

```c:main.c(ENV_TASK)
#define SENSOR_I2C_ADDR 0x8a // 温湿度センサーのI2Cアドレス

/**
 * 温湿度センサーからデータを取得
 * 
 * 1秒間隔で温湿度センサーからデータを取得します。
 * 引数: exinf 拡張情報
 */
void env_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "ENV_TASK has been started.");

  while (1) {
    slp_tsk();

    sht31_measure(SENSOR_I2C_ADDR, &temp10, &humi10); // 温湿度を取得
    wup_tsk(DATA_CHANGE_TASK); // DATA_CHANGE_TASKを起床
    
    /* for Debug */
    syslog(LOG_NOTICE, "temp is %d.", temp10);
    syslog(LOG_NOTICE, "humi is %d.", humi10);
  }
}
```

### スイッチによる制御 Level 2.2

```c:user.cfg
/* Level 2 */
CRE_TSK(SWITCH_TASK,      {TA_ACT, 0, switch_task,       HIGH_PRIORITY, STACK_SIZE, NULL});

/* 周期ハンドラの生成 */
CRE_CYC(DATA_ACQ_TIMING_HANDLER, {TA_NULL, 0, data_acq_TIMING_handler, 1000, 0});
```

```c:user.h
/* RTOSのタスク */
extern void main_task(intptr_t exinf);
extern void env_task(intptr_t exinf);
extern void data_change_task(intptr_t exinf);
extern void lcd_task(intptr_t exinf);

/* Level 2*/
extern void switch_task(intptr_t exinf);
```

```c:main.c(initialize)
void initialize(intptr_t exinf)
{
  // 初期処理を記述する
  init_fcled(); // フルカラーLEDの初期化
  init_riic(); // 温湿度センサーで使用するI2Cの初期化
  init_lcd(); // LCDを初期化
  init_tsw(); // スイッチの初期化
}
```

```c:main.c(SWITCH_TASK)
/**
 * スイッチを監視するタスク
 * 
 * 定期的にスイッチ（TSW1と2）の状態を確認します。
 * スイッチの状態で温湿度データ収集タイミング生成ハンドラを制御します。
 *
 * 引数: exinf 拡張情報
 */
void switch_task(intptr_t exinf)
{
  static int old_tsw1; // 1つ前のTSW1の状態
  static int now_tsw1; // 今のTSW1の状態
  static int old_tsw2; // 2つ前のTSW2の状態
  static int now_tsw2; // 今のTSW2の状態

  while (1) {
    now_tsw1 = tsw_bit(1); // TSW1の状態を取得
    if ((now_tsw1 != old_tsw1) && (old_tsw1 == OFF)) {
      syslog(LOG_NOTICE, "TSW1 is pressed.");
      sta_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを開始
    }
    old_tsw1 = now_tsw1; // 今の状態を保存

    now_tsw2 = tsw_bit(2); // TSW2の状態を取得
    if ((now_tsw2 != old_tsw2) && (old_tsw2 == OFF)) {
      syslog(LOG_NOTICE, "TSW2 is pressed.");
      stp_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを停止
    }
    old_tsw2 = now_tsw2; // 今の状態を保存

    dly_tsk(10); // 監視周期は10ミリ秒
  }
}
```

### LEDの色で動作モードを表示 Level 2.2a

```c:main.c(グローバル変数)
/* グローバル変数 */
short temp10; // 温度データ（10倍値）
short humi10; // 湿度データ（10倍値）
char temp[TEMP_STR_LEN]; // 温度の文字列データ
char humi[HUMI_STR_LEN]; // 湿度の文字列データ

#define MODE_DATA_ACQ_START 0x01 // 温湿度データ収集中
#define MODE_DATA_ACQ_STOP  0x02 // 温湿度データ収集停止

int mode = MODE_DATA_ACQ_STOP; // 最初は停止状態
```

```c:main.c(MAIN_TASK)
void main_task(intptr_t exinf)
{

  SVC_PERROR(syslog_msk_log(0, LOG_UPTO(LOG_INFO))); // syslog関数のメッセージの優先度を設定
  
  syslog(LOG_NOTICE, "MAIN_TASK has been started.");

  int turn_on = OFF; // LEDの点灯状態

  while (1) {
    turn_on = ~turn_on; // 点灯状態を反転 
    if (mode == MODE_DATA_ACQ_START) { // 温湿度データ収集中
      fcled_onoff(OFF, OFF, turn_on); // 赤色を点灯
    } else if (mode == MODE_DATA_ACQ_STOP) { // 温湿度データ収集停止中
      fcled_onoff(turn_on, OFF, OFF); // 青色を点灯
    }
    dly_tsk(1000); // 1秒間待ち状態
  }
}
```

```c:main.c(SWITCH_TASK)
void switch_task(intptr_t exinf)
{
  static int old_tsw1; // 1つ前のTSW1の状態
  static int now_tsw1; // 今のTSW1の状態
  static int old_tsw2; // 2つ前のTSW2の状態
  static int now_tsw2; // 今のTSW2の状態

  while (1) {
    now_tsw1 = tsw_bit(1); // TSW1の状態を取得
    if ((now_tsw1 != old_tsw1) && (old_tsw1 == OFF)) {
      syslog(LOG_NOTICE, "TSW1 is pressed.");
      sta_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを開始
      mode = MODE_DATA_ACQ_START; // 開始状態へ
    }
    old_tsw1 = now_tsw1; // 今の状態を保存

    now_tsw2 = tsw_bit(2); // TSW2の状態を取得
    if ((now_tsw2 != old_tsw2) && (old_tsw2 == OFF)) {
      syslog(LOG_NOTICE, "TSW2 is pressed.");
      stp_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを停止
      mode = MODE_DATA_ACQ_STOP; // 停止状態へ
    }
    old_tsw2 = now_tsw2; // 今の状態を保存

    dly_tsk(10); // 監視周期は10ミリ秒
  }
}
```

### Beep音の導入 Level 2.2b

```c:user.cfg
CRE_TSK(SPEAKER_TASK,     {TA_ACT, 0, speaker_task,      HIGH_PRIORITY, STACK_SIZE, NULL});
```

```c:user.h
extern void speaker_task(intptr_t exinf);
```

```c:main.c(initialize)
void initialize(intptr_t exinf)
{
  // 初期処理を記述する
  init_fcled(); // フルカラーLEDの初期化
  init_riic(); // 温湿度センサーで使用するI2Cの初期化
  init_lcd(); // LCDを初期化
  init_tsw(); // スイッチの初期化
  init_speaker(); // スピーカーの初期化
}
```

```c:main.c(SPEAKER_TASK)
/**
 * スピーカーを制御するタスク
 * 
 * 起床されると0.1秒間「ラ」音を鳴らします。
 *
 * 引数: exinf 拡張情報
 */
void speaker_task(intptr_t exinf)
{
  syslog(LOG_NOTICE, "SPEAKER_TASK has been started.");

  speaker_onkai(RA1);

  while (1) {
    slp_tsk();

    speaker_start();
    dly_tsk(100);
    speaker_stop();
  }

}
```

```c:main.c(SWITCH_TASK)
void switch_task(intptr_t exinf)
{
  static int old_tsw1; // 1つ前のTSW1の状態
  static int now_tsw1; // 今のTSW1の状態
  static int old_tsw2; // 2つ前のTSW2の状態
  static int now_tsw2; // 今のTSW2の状態

  while (1) {
    now_tsw1 = tsw_bit(1); // TSW1の状態を取得
    if ((now_tsw1 != old_tsw1) && (old_tsw1 == OFF)) {
      wup_tsk(SPEAKER_TASK); // 音を鳴らす
      syslog(LOG_NOTICE, "TSW1 is pressed.");
      sta_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを開始
      mode = MODE_DATA_ACQ_START; // 開始状態へ
    }
    old_tsw1 = now_tsw1; // 今の状態を保存

    now_tsw2 = tsw_bit(2); // TSW2の状態を取得
    if ((now_tsw2 != old_tsw2) && (old_tsw2 == OFF)) {
      wup_tsk(SPEAKER_TASK); // 音を鳴らす
      syslog(LOG_NOTICE, "TSW2 is pressed.");
      stp_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを停止
      mode = MODE_DATA_ACQ_STOP; // 停止状態へ
    }
    old_tsw2 = now_tsw2; // 今の状態を保存

    dly_tsk(10); // 監視周期は10ミリ秒
  }
}
```

## イベントフラグの導入 Level 3

```c:user.cfg
/* イベントフラグの生成 */
CRE_FLG(FLG_ENV, {TA_NULL, 0});
```

```c:main.c(イベント定数の定義)
/* イベントフラグで使用するイベント */
#define EVENT_START 0x01 // 開始イベント
#define EVENT_STOP  0x02 // 停止イベント
```

```c:main.c(SWITCH_TASK)
void switch_task(intptr_t exinf)
{
  static int old_tsw1; // 1つ前のTSW1の状態
  static int now_tsw1; // 今のTSW1の状態
  static int old_tsw2; // 2つ前のTSW2の状態
  static int now_tsw2; // 今のTSW2の状態

  while (1) {
    now_tsw1 = tsw_bit(1); // TSW1の状態を取得
    if ((now_tsw1 != old_tsw1) && (old_tsw1 == OFF)) {
      wup_tsk(SPEAKER_TASK); // 音を鳴らす
      syslog(LOG_NOTICE, "TSW1 is pressed.");
      set_flg(FLG_ENV, EVENT_START); // 開始イベントを設定
    }
    old_tsw1 = now_tsw1; // 今の状態を保存

    now_tsw2 = tsw_bit(2); // TSW2の状態を取得
    if ((now_tsw2 != old_tsw2) && (old_tsw2 == OFF)) {
      wup_tsk(SPEAKER_TASK); // 音を鳴らす
      syslog(LOG_NOTICE, "TSW2 is pressed.");
      set_flg(FLG_ENV, EVENT_STOP); // 停止イベントを設定
    }
    old_tsw2 = now_tsw2; // 今の状態を保存

    dly_tsk(10); // 監視周期は10ミリ秒
  }
}
```

```c:main.c(MAIN_TASK)
void main_task(intptr_t exinf)
{
  SVC_PERROR(syslog_msk_log(0, LOG_UPTO(LOG_INFO))); // syslog関数のメッセージの優先度を設定
  
  syslog(LOG_NOTICE, "MAIN_TASK has been started.");

  int mode = MODE_DATA_ACQ_STOP; // 最初は停止状態
  fcled_onoff(ON, OFF, OFF); // 青色を点灯
  
  FLGPTN flgptn; // イベントフラグの状態
  
  while (1) {
    wai_flg(FLG_ENV, EVENT_START | EVENT_STOP, TWF_ORW, &flgptn); // イベントの発生待ち 
    if (flgptn & EVENT_START) { // 開始イベントのとき
      clr_flg(FLG_ENV, ~EVENT_START); // 開始イベントをクリア
      
      if (mode != MODE_DATA_ACQ_START) {
        mode = MODE_DATA_ACQ_START; // 状態をデータ収集モードに変更
        fcled_onoff(OFF, OFF, ON); // 赤色を点灯
        
        sta_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを開始
      }
    }
    if (flgptn & EVENT_STOP) { // 停止イベントのとき
      clr_flg(FLG_ENV, ~EVENT_STOP); // 停止イベントをクリア
  
      if (mode != MODE_DATA_ACQ_STOP) {
        mode = MODE_DATA_ACQ_STOP; // 状態を停止モードに
        fcled_onoff(ON, OFF, OFF); // 青色を点灯
      
        stp_cyc(DATA_ACQ_TIMING_HANDLER); // 周期ハンドラを停止
      }
    }
  }
}
```

## データ構造の導入 Level 4

### 構造体の利用 Level 4.1

### 排他制御の実装 Level 4.2

## データキューの導入 Level 5