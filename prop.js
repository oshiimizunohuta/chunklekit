/**
 * @name Properties
 * @since 2013-11-19 07:43:37
 * @author bitchunk
 * @version 0.1.0
 */

//canvas
export const
DISPLAY_SCALERATE = 2//キャンバス基本サイズ拡大倍数
, VIEWMULTI = DISPLAY_SCALERATE
, CHIPCELL_SIZE = 8//基本サイズ1辺り 8*8
, DISPLAY_WIDTH = 320//キャンバス表示基本幅
, DISPLAY_HEIGHT = 240//キャンバス表示基本高
, UI_SCREEN_ID = 'screen' //イベント取得・拡大表示用

, SCROLL_MAX_SPRITES_DRAW = 32 //スプライト最大描画数
, SCROLL_MAX_SPRITES_STACK = 2048 //スプライト最大スタック数

, SPRITE_ORDER_DEFAULT = 128
//wordprint

, WORDPRINT_FONT8PX = 'font8p'
, WORDPRINT_FONT4V6PX = 'font4v6p'
, WORDPRINT_FONT12PX = 'font12p'



//keyevent
, KEYCONTROLL_HOLDTIME = 16 //キー固定判定時間[fps]

/**
 * 画像データをセットする
 * @param {type} dir
 * @returns {undefined}
 */
, CKImageDir = function(dir){
	IMAGE_DIR = dir.replace(/\/+$/, '') + '/'
	return IMAGE_DIR
}


/**
 * 拡大縮小済み画面サイズ
 * @returns {___anonymous22047_22111}
 */
//, getDisplaySize = function()
//{
//	return {w: (VIEWMULTI * DISPLAY_WIDTH), h: (VIEWMULTI * DISPLAY_HEIGHT)};
////	return {w: (DISPLAY_WIDTH), h: (DISPLAY_HEIGHT)};
//}

/**
 * 拡大縮小なしスクロールサイズ	
 * @returns 
 */
//, getScrollSize = function()
//{
//	return {w: (DISPLAY_WIDTH), h: (DISPLAY_HEIGHT)};
//}


//TODO パレット画像から色配列を取得する仕組みを作る
//TODO パレットを名前から取得できるようにする
//TODO パレットを輝度変更できるような２次元配列
, COLOR_TRANSPARENT = [0, 0, 0, 0]
, COLOR_BLACK = [0, 0, 1, 255]
, COLOR_GRAY = [124, 124, 124, 255]
, COLOR_LGRAY = [188, 188, 188, 255]
, COLOR_WHITE = [252, 252, 252, 255]
, COLOR_HLGREEN = [184, 248, 184, 255]
, COLOR_OCEAN = [0, 64, 88, 255]
, COLOR_RED = [248, 56, 0, 255] //canvasdraw.jsを上書き

, COLOR_MIDNIGHT = [0, 0, 188, 255]
, COLOR_MEDBLUE = [0, 88, 248, 255]
, COLOR_ROYALBLUE = [104, 136, 252, 255]
, COLOR_CORNFLOWER = [184, 184, 248, 255]

, COLOR_FOREST = [0, 120, 0, 255]
, COLOR_LIMEGREEN = [0, 184, 0, 255]
, COLOR_GREENYELLOW = [184, 248, 24, 255]
, COLOR_LGREENYELLOW = [216, 248, 120, 255]

, COLOR_BLUE = [0, 0, 252, 255]

, COLOR_WHEAT = [252, 224, 168, 255]

, COLOR_ORANGERED = [248, 56, 0, 255]
, COLOR_CORAL = [248, 120, 88, 255]
, COLOR_PEACHPUFF = [240, 208, 176, 255]

, COLOR_CARROT = [228, 92, 16, 255]
, COLOR_SANDYBROWN = [252, 160, 68, 255]
, COLOR_MOCCASIN = [252, 224, 168, 255]

, COLOR_DARKGOLDENROD = [172, 124, 0, 255]
, COLOR_BRIGHTYELLOW = [248, 184, 0, 255]
, COLOR_KHAKI = [248, 216, 120, 255]

, COLOR_VEGETABLE = [0, 168, 0, 255]
, COLOR_CREAMGREEN = [88, 216, 84, 255]
, COLOR_PALEGREEN = [184, 248, 184, 255]

, COLOR_POWDERBLUE = [0, 120, 248, 255]
, COLOR_DAYFLOWER = [60, 188, 252, 255]
, COLOR_LBLUE = [164, 228, 252, 255]
//, COLOR_LBLUE = [164, 228, 252, 255]

, COLOR_SLATEBLUE = [104, 68, 252, 255]
, COLOR_MEDPURPLE = [152, 120, 248, 255]
, COLOR_IRISVIOLET = [216, 184, 248, 255]

, COLOR_VIOMAGENTA = [216, 0, 204, 255]
, COLOR_VIOLET = [248, 120, 248, 255]
, COLOR_LPLUM = [248, 184, 248, 255]


export let
IMAGE_DIR = './img/' //画像ファイル読み込みパス(URLフルパスも可)

