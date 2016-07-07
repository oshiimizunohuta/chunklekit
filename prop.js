/**
 * Properties
 * Since 2013-11-19 07:43:37
 * @author しふたろう
 */

//canvas
var DISPLAY_SCALERATE = 2;//キャンバス基本サイズ拡大倍数
var VIEWMULTI = DISPLAY_SCALERATE;
var CHIPCELL_SIZE = 8;//基本サイズ1辺り 8*8
var DISPLAY_WIDTH = 320;//キャンバス表示基本幅
var DISPLAY_HEIGHT = 240;//キャンバス表示基本高
var UI_SCREEN_ID = 'screen'; //イベント取得・拡大表示用

var SCROLL_MAX_SPRITES_DRAW = 32; //スプライト最大描画数
var SCROLL_MAX_SPRITES_STACK = 2048; //スプライト最大スタック数

var IMAGE_DIR = './img/'; //画像ファイル読み込みパス(URLフルパスも可)

//wordprint

var WORDPRINT_FONT8PX = 'font8p';
var WORDPRINT_FONT4V6PX = 'font4v6p';
var WORDPRINT_FONT12PX = 'font12p';



//keyevent
var KEYCONTROLL_HOLDTIME = 16; //キー固定判定時間[fps]


