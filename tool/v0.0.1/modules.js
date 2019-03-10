
var TASK = TASK || {};
TASK.________________start________________ = function(){}

TASK.Spec = {
    'CHAR' : {
        'PRIORITIES'     : ' ABCDEFGHIJKLMNOPQRSTUVWXYZ_',
        'PRIO_PREFIX'    : '(',
        'PRIO_SUFFIX'    : ')',
        'TODO'           : ' ',
        'DONE'           : 'x',
        'BLANK_DATETIME' : '          ',
        'BLANK_TASKNAME' : '',
    },
    'MIN' : {
        'LINE_LENGTH' : 28,
    }
}

TASK.Config = {
    'DEFAULT_PRIORITY' : '_',
    'USE_AUTO_REMOVING_BLANK_LINE_IN_SORTING' : true,
    'TEXTAREA_FONTSIZE_PIXEL' : 16,
    'TEXTAREA_HEIGHT_PIXEL' : 182,
}

TASK.TaskFactory = (function(){
    var TaskFactory = function(){
    }

    var p = TaskFactory.prototype;

    p.create_with_emptyname = function(){
        var task = TASK.Task();
    }

    return TaskFactory;
})();

TASK.Task = (function(){

    //
    //                             +-- 28+n,  Taskname(with contexts)(with projects)
    //                             |
    //                  +----------|-- 17+10, Creation Date
    //                  |          |
    //       +----------|----------|-- 6+10,  Completion Date
    //       |          |          |
    //   +---|----------|----------|-- 2+3,   Priority
    //   |   |          |          |
    // +-|---|----------|----------|-- 0+1,   Done Mark
    // | |   |          |          |
    // | |   |          |          |
    // 01234567890123456789012345678
    //   (A)            2017-07-14 TASK created
    // x (A) 2017-07-16 2017-07-14 TASK finished
    //                  2017-07-14 TASK created and no-priority
    // x     2017-07-16 2017-07-14 TASK finished and no-priority

    var Task = function(taskname){
        this._init(taskname);
    }

    var p = Task.prototype;

    p._init = function(taskname){
        this._is_done          = false;
        this._priority         = TASK.Config.DEFAULT_PRIORITY;
        this._datestr_finished = TASK.Spec.CHAR.BLANK_DATETIME;
        this._datestr_created  = DATETIME.todaystr();
        this.clear_taskname()
        if(taskname === void 0){
            this.set_taskname(TASK.Spec.CHAR.BLANK_TASKNAME);
        }
    }

    p.from_string_with_blankline_guard = function(line){
        if(line.trim().length === 0){
            this._init();
            return;
        }
       this.from_string(line);
    }

    p.from_string = function(line){
        if(line.length < TASK.Spec.MIN.LINE_LENGTH){
            throw new Error('[Task] from_string() too short line given. "' + line + '"');
        }

        // Spec で定義しようと思ったけどめんどくさくなったのでいったんハードコード.

        var done_mark = line.substr(0, 1);
        if(done_mark === TASK.Spec.CHAR.DONE){
            this._is_done = true;
        }else if(done_mark === TASK.Spec.CHAR.TODO){
            this._is_done = false;
        }else{
            throw new Error('[Task] from_string() invalid done mark. "' + line + '"');
        }

        var prio_str = line.substr(2, 3);
        var prio_char_pre = prio_str.charAt(0);
        var prio_char = prio_str.charAt(1);
        var prio_char_suf = prio_str.charAt(2);
        if(prio_char_pre !== TASK.Spec.CHAR.PRIO_PREFIX){
            throw new Error('[Task] from_string() invalid priority, prefix. "' + line + '"');
        }
        if(this.is_valid_priochar(prio_char) == false){
            throw new Error('[Task] from_string() invalid priority, priority char. "' + line + '"');
        }
        if(prio_char_suf !== TASK.Spec.CHAR.PRIO_SUFFIX){
            throw new Error('[Task] from_string() invalid priority, suffix. "' + line + '"');
        }
        this._priority = prio_char;

        var completion_datestr = line.substr(6, 10);
        if(completion_datestr === TASK.Spec.CHAR.BLANK_DATETIME){
            {}; //pass
        }else if(DATETIME.is_invalid_datestr(completion_datestr)){
            throw new Error('[Task] from_string() invalid completion date. "' + line + '"');
        }else{
            {}; //pass
        }
        this._datestr_finished = completion_datestr;

        var creation_datestr = line.substr(17, 10);
        if(creation_datestr === TASK.Spec.CHAR.BLANK_DATETIME){
            {}; //pass
        }else if(DATETIME.is_invalid_datestr(creation_datestr)){
            throw new Error('[Task] from_string() invalid creation date. "' + line + '"');
        }else{
            {}; //pass
        }
        this._datestr_created = creation_datestr;

        this._taskname = line.substr(28);
    }

    p.to_string = function(){
        var DELIM = ' ';

        var donestr = TASK.Spec.CHAR.TODO;
        if(this._is_done){
            donestr = TASK.Spec.CHAR.DONE;
        }

        var PRIO_PRE = TASK.Spec.CHAR.PRIO_PREFIX;
        var PRIO_SUF = TASK.Spec.CHAR.PRIO_SUFFIX;
        var priostr = PRIO_PRE + this._priority + PRIO_SUF;

        var finished_at = this._datestr_finished;

        var created_at = this._datestr_created;

        var taskname = this._taskname;

        var line = donestr + DELIM +
                   priostr + DELIM +
                   finished_at + DELIM +
                   created_at + DELIM +
                   taskname;
        return line
    }

    p.start = function(){
        this._is_done = false;
        this._clear_completion_date();
    }

    p.end = function(){
        this._is_done = true;
        this._set_today_to_completion_date();
    }

    p.toggle_status = function(){
        if(this._is_done){
            this.start();
            return;
        }
        this.end();
    }

    p.get_taskname = function(taskname){
        return this._taskname;
    }

    p.set_taskname = function(taskname){
        this._taskname = taskname;
    }

    p.clear_taskname = function(){
        this._taskname = TASK.Spec.CHAR.BLANK_TASKNAME;
    }

    // @param priochar A correct char of priority
    p.set_priority = function(priochar){
        var is_valid_priochar = this.is_valid_priochar(priochar)
        var is_not_valid = !is_valid_priochar;
        if(is_not_valid){
            throw new Error('[Task] invalid priority "' + priochar + '", not 1-length or unsupported char.');
        }
        this._priority = priochar;
    }

    // @return prio char
    p.get_priority = function(){
        return this._priority;
    }

    // @todo Do move to static method
    p.is_valid_priochar = function(priochar){
        if(priochar.length != 1){
            return false;
        }
        var table = TASK.Spec.CHAR.PRIORITIES;
        if(table.indexOf(priochar) == -1){
            return false;
        }
        return true;
    }

    p.shift_priority = function(diff_idx){
        var cur_priochar = this.get_priority();

        var table = TASK.Spec.CHAR.PRIORITIES;
        var found_idx = table.indexOf(cur_priochar);
        if(found_idx == -1){
            return;
        }

        var new_idx = found_idx + diff_idx;
        var tablesize = table.length;
        if(new_idx >= tablesize ){
            new_idx = tablesize - new_idx;
        }
        if(new_idx < 0 ){
            new_idx = tablesize + new_idx;
        }
        var new_priochar = table.charAt(new_idx);
        this._priority = new_priochar;
    }

    p.is_creation_date_empty = function(){
        return this._datestr_created === TASK.Spec.CHAR.BLANK_DATETIME;
    }

    p.walk_creation_date = function(days){
        if(this.is_creation_date_empty()){
            // 日が未指定ならいったん無視で. @todo どうしましょ
            return;
        }
        var before_datestr = this._datestr_created;
        var dtobj = DATETIME.datestr_to_dtobj(before_datestr);
        dtobj.walk(days);
        var after_datestr = dtobj.to_string();
        this._datestr_created = after_datestr;
    }

    p.walk_creation_date_to_today = function(){
        this._datestr_created = DATETIME.todaystr();
    }

    p._clear_completion_date = function(){
        this._datestr_finished = TASK.Spec.CHAR.BLANK_DATETIME;
    }

    p._set_today_to_completion_date = function(){
        this._datestr_finished = DATETIME.todaystr();
    }

    p.xxx = function(){
    }

    return Task;
})();

var DATETIME = DATETIME || {};
DATETIME.________________start________________ = function(){}

DATETIME.init = function(){
    moment.locale('ja');
}

// @param datestr A string with YYYY-MM-DD format.
DATETIME.datestr_to_dtobj = function(datestr){
    var dtobj = new DATETIME.Datetime();
    dtobj.from_string(datestr);
    return dtobj;
}

DATETIME.todaystr = function(){
    var dtobj = new DATETIME.Datetime();
    return dtobj.to_string();
}

DATETIME.is_invalid_datestr = function(datestr){
    var is_valid = moment(datestr).isValid();
    return !is_valid;
}

DATETIME.Datetime = (function(){
    var Datetime = function(){
        this._moment = moment();

        this._format = 'YYYY-MM-DD'
    }

    var p = Datetime.prototype;

    p.walk = function(days){
        if(days === 0){
            return;
        }
        this._moment.add(days, 'day');
    }

    p.to_string = function(){
        var obj = this._moment;
        var fmt = this._format;
        return obj.format(fmt);
    }

    // @param datestr A string with YYYY-MM-DD format.
    p.from_string = function(datestr){
        this._moment = moment(datestr, this._format)
    }

    return Datetime;
})();


var DATASTORAGE = DATASTORAGE || {};
DATASTORAGE.________________start________________ = function(){}

// データ整理
//   key
// - lines   : 言わずもがな.
// - config  : 静的な設定. Task.Config.
// - context : 動的な設定というか状態情報. カーソル位置くらい?

// @param storage_inst A window.localStorage
// @return A DataManager instance.
DATASTORAGE.init_and_get_instance = function(storage_inst){
    var localstorage_manager = new DATASTORAGE.LocalStorageManager(storage_inst);
    var datamanager = new DATASTORAGE.DataManager(localstorage_manager);
    return datamanager;
}

DATASTORAGE.DataManager = (function(){
    // @param localstorage_manager A LocalStorageManager instance.
    var DataManager = function(localstorage_manager){
        this._manager = localstorage_manager;
        this.KEY_LINES = 'lines';
    }

    var p = DataManager.prototype;

    p.get_lines_by_array = function(){
        var manager = this._manager;
        var key = this.KEY_LINES;
        var lines_by_str = manager.get_with_key(key);
        if(lines_by_str === null){
            return [];
        }
        var lines_by_array = lines_by_str.split(DATASTORAGE.LINEBREAK_FOR_SAVING);
        return lines_by_array;
    }

    p.save_lines_array_to = function(lines_by_array){
        // textarea => local storage
        // local storage では改行が保存されない(半角スペースに変換される)ので
        // 改行を意味する区切り文字を別途用意する必要がある.
        var lines_by_string = lines_by_array.join(separator=DATASTORAGE.LINEBREAK_FOR_SAVING);
        this._save_lines_string_to(lines_by_string);
    }

    p._save_lines_string_to = function(lines_by_string){
        var manager = this._manager;
        var key = this.KEY_LINES;
        var value = lines_by_string;
        manager.add_item(key, value);
    }

    return DataManager;
})();

DATASTORAGE.LINEBREAK_FOR_SAVING = '<br>';

DATASTORAGE.LocalStorageManager = (function(){
    // @param storage_inst a window.localStorage
    var LocalStorageManager = function(storage_inst){
        this._storage = storage_inst;
    }

    var p = LocalStorageManager.prototype;

    p.add_item = function(k, v){
        this._storage.setItem(k, v);
    }

    p.remove_item = function(k){
        this._storage.removeItem(k);
    }

    p.reset = function(){
        this._storage.clear();
    }

    p._get_all_keys = function(){
        var ls = this._storage;
        return Object.keys(ls);
    }

    // @return An array of the object {'key':'...', 'value':'...'}
    // keys() 列挙のせいか Local Storage の仕様か知らんが
    // 順番に規則性が見られない（少なくとも追加順ではない）ので
    // with array 要らんかもなぁ……
    p.get_all_with_array = function(){
        var all_keys = this._get_all_keys();
        var return_values = [];
        for(var i=0;i<all_keys.length;i++){
            var curkey = all_keys[i];
            var curvalue = this.get_with_key(curkey);
            var return_value = {
                'key'   : curkey,
                'value' : curvalue
            };
            return_values.push(return_value);
        }
        return return_values;
    }

    // @return An object
    p.get_all_with_object = function(){
        var ls = this._storage;
        var all_keys = Object.keys(ls);
        var return_values = {};
        for(var i=0;i<all_keys.length;i++){
            var curkey = all_keys[i];
            var curvalue = this.get_with_key(curkey);
            return_values[curkey] = curvalue;
        }
        return return_values;
    }

    // @retval null if the key 'k' is not found.
    p.get_with_key = function(k){
        return this._storage.getItem(k);
    }

    return LocalStorageManager;
})();

var TEXTAREA = TEXTAREA || {};
TEXTAREA.________________start________________ = function(){}

TEXTAREA.LINEBREAK = '\n';
TEXTAREA.LINEBREAK_LENGTH = '\n'.length;

TEXTAREA.TextArea = (function(){
    var TextArea = function(target_textarea_selector){
        this._selector = target_textarea_selector;
        this._jqueryelm = $(target_textarea_selector);

        this._x = -1;
        this._y = -1;
        this._p = -1; // selectionStart など一次元上の現在位置

        this._observers_on_update_status = [];
        this._observers_on_sort = [];
    }

    var p = TextArea.prototype;

    p._get_element_by_jquery = function(){
        return this._jqueryelm;
    }

    p._get_element_by_dom = function(){
        return this._jqueryelm[0];
    }

    p._get_content_by_str = function(){
        var elm = this._get_element_by_jquery();
        return elm.val();
    }

    p._get_content_by_lines = function(){
        var content_by_str = this._get_content_by_str();
        return content_by_str.split(TEXTAREA.LINEBREAK);
    }

    p._get_pos_p = function(){
        var dom = this._get_element_by_dom();
        var p = dom.selectionStart;
        this._p = p;
        return p;
    }

    p.load_from_config = function(){
        this.set_height(TASK.Config.TEXTAREA_HEIGHT_PIXEL);
        this.set_fontsize(TASK.Config.TEXTAREA_FONTSIZE_PIXEL);
    }

    p.set_height = function(height_by_px){
        var jq = this._get_element_by_jquery();
        jq.css('height', height_by_px);
    }

    p.set_fontsize = function(fontsize_by_px){
        var jq = this._get_element_by_jquery();
        jq.css('font-size', fontsize_by_px);
    }

    p.get_current_height = function(){
        var jq = this._get_element_by_jquery();
        return jq.css('height');
    }

    p._get_pos_xy = function(){
        var content_by_lines = this._get_content_by_lines();
        var current_ppos = this._get_pos_p();

        // y: n行目   0-origin
        // x: x文字目 0-origin
        // lines は linebreak 無しの配列だが selectionStart は有りで計算されるため
        // 計算過程で linebreak 分の文字数考慮が必要.
        var x = -1;
        var y = -1;
        var linelen_total = 0;
        for(var i=0;i<content_by_lines.length;i++){
            var thisline = content_by_lines[i];
            var thisline_len = thisline.length + TEXTAREA.LINEBREAK_LENGTH;
            linelen_total += thisline_len;
            if(current_ppos < linelen_total){
                y = i;
                x = current_ppos - (linelen_total - thisline_len);
                break;
            }
        }
        this._x = x;
        this._y = y;
        return [x, y];
    }

    p._set_cursor_pos = function(p){
        var dom = this._get_element_by_dom();
        dom.selectionStart = p;
        dom.selectionEnd = p;
        // x,y も変わるので再計算
        this.update_status();
    }

    p._set_cursor_pos_with_xy = function(x, y){
        var content_by_lines = this._get_content_by_lines();

        var p = -1;
        var linelen_total = 0;
        for(var i=0;i<content_by_lines.length;i++){
            var thisline = content_by_lines[i];
            var thisline_len = thisline.length + TEXTAREA.LINEBREAK_LENGTH;
            linelen_total += thisline_len;

            var parsing_y = i;
            if(y != parsing_y){
                continue;
            }

            // ここに来た = 指定行 y の位置まで parse してきた.

            // 「y 行目までの長さ linelen_total」から
            // 「今 parse している行の長さ thisline_len」を引くと
            // 「y-1 行目までの長さ」がわかる.
            // これに x を足したのが, 指定 xy に該当する一次元上の位置 p になるはず.
            p = x + (linelen_total - thisline_len);
            break;
        }
        this._set_cursor_pos(p);
    }

    // カーソル情報 p, x, y を現在の内容で更新する.
    // リアルタイム反映したいなら呼び出し元で onchange 等に入れて.
    p.update_status = function(){
        this._get_pos_xy();
        this._execute_on_update_status();
    }

    // @param observer An object which has `update(params)` method.
    p.add_observer_on_update_status = function(observer){
        this._observers_on_update_status.push(observer);
    }

    // @param observer An object which has `update(params)` method.
    p.add_observer_on_sort = function(observer){
        this._observers_on_sort.push(observer);
    }

    p._execute_on_update_status = function(){
        var params = {
            'cursor' : {
                'x' : this._x,
                'y' : this._y,
                'p' : this._p,
            },
        };

        var observers = this._observers_on_update_status;
        for(var i=0;i<observers.length;i++){
            var observer = observers[i];
            observer.update(params);
        }
    }

    p._execute_on_sort = function(lines_by_array){
        var params = {
            'lines' : lines_by_array,
        };

        var observers = this._observers_on_sort;
        for(var i=0;i<observers.length;i++){
            var observer = observers[i];
            observer.update(params);
        }
    }

    p.from_array_for_initial_loading = function(lines_by_array){
        this.from_array(lines_by_array);
        this.update_status();
    }

    p.from_array = function(lines_by_array){
        var lines_by_str = lines_by_array.join(separator=TEXTAREA.LINEBREAK);
        this._jqueryelm.val(lines_by_str);
    }

    p.to_array = function(){
        var lines_by_str = this._jqueryelm.val();
        var lines_by_array = lines_by_str.split(TEXTAREA.LINEBREAK);
        return lines_by_array;
    }

    p.get_current_line = function(){
        this.update_status();
        var lines = this._get_content_by_lines();
        var targetidx = this._y;
        var curline = lines[targetidx];
        return curline;
    }

    p.delete_current_line = function(){
        // [カーソル位置再計算の図示]
        //
        // -------
        // ---I--
        // ---
        //
        // | 削除する
        // V
        //
        // -------
        // --- ★この時カーソル位置はどうする？

        this.update_status();

        var old_y = this._y;

        var lines = this._get_content_by_lines();
        if(lines.length === 0){
            return;
        }
        var targetidx = this._y;

        // 削除対象行以外で新たな array をつくることで削除の代替にする
        var newlines = [];
        for(var i=0;i<lines.length;i++){
            if(i === targetidx){
                continue;
            }
            var line = lines[i];
            newlines.push(line);
        }

        this.from_array(newlines);

        var new_y = old_y;
        // x 位置はとりあえずタスク名の先頭で.
        var new_x = TASK.Spec.MIN.LINE_LENGTH;
        this._set_cursor_pos_with_xy(new_x, new_y);
    }

    p.replace_current_line = function(newline){
        this.update_status();
        var old_x = this._x;
        var old_y = this._y;

        var lines = this._get_content_by_lines();
        var targetidx = this._y;
        lines[targetidx] = newline;
        this.from_array(lines);

        this._set_cursor_pos_with_xy(old_x, old_y);
    }

    p.add_line_to_current = function(addee_line){
        // [カーソル位置再計算の図示(空行挿入時)]
        //
        // --------
        // --I--
        // ---
        //
        //  | 空行を上に挿入
        //  V
        //
        // --------
        //
        // --I--
        // ---
        //
        //  | カーソルを挿入箇所に移動させる(X位置だけ左にずらせばいい)
        //  V
        //
        // --------
        // I
        // ----
        // ---
        //
        // ※ 非空行挿入時は？
        //    → さらに挿入行長だけ X を右にずらす.
        //       編集するのは大体末尾の taskname のはず.

        this.update_status();

        var old_cursor_pos = this._p;
        var old_x = this._x;

        var lines = this.to_array();

        var insert_target_idx = this._y;
        var how_many_remove = 0;
        var addee = addee_line;
        lines.splice(insert_target_idx, how_many_remove, addee)

        this.from_array(lines);

        var new_cursor_pos_at_linefirst = old_cursor_pos - old_x;
        var new_cursor_pos_at_lineend = new_cursor_pos_at_linefirst + addee_line.length;
        var new_cursor_pos = new_cursor_pos_at_lineend;
        this._set_cursor_pos(new_cursor_pos);
    }

    p.add_blank_line_to_current = function(){
        var blankline = '';
        this.add_line_to_current(blankline);
    }

    p.clone_current_line = function(){
        var curline = this.get_current_line();
        this.add_line_to_current(curline);
    }

    // @return a new lines.
    p._remove_dustline = function(lines){
        var newlines = [];
        for(var i=0;i<lines.length;i++){
            var line = lines[i];

            if(TASK.Config.USE_AUTO_REMOVING_BLANK_LINE_IN_SORTING){
                if(line.trim().length === 0){
                    continue;
                }
            }

            newlines.push(line);
        }
        return newlines;
    }

    p.sort_lines = function(){
        this.update_status();
        var old_x = this._x;
        var old_y = this._y;

        var lines = this.to_array();
        lines.sort(function(a, b){
            if( a < b ) return -1;
            if( a > b ) return 1;
        });

        lines = this._remove_dustline(lines);

        this.from_array(lines);
        this._set_cursor_pos_with_xy(old_x, old_y);

        this._execute_on_sort(lines);
    }

    p.focus = function(){
        this._get_element_by_jquery().focus();
    }

    return TextArea;
})();

var TEXTAREA_EVENT = TEXTAREA_EVENT || {};
TEXTAREA_EVENT.________________start________________ = function(){}

TEXTAREA_EVENT.K = {
    'DELETE' : 46,
    '0' : 48,
    '1' : 49,
    '2' : 50,
    '3' : 51,
    '4' : 52,
    '5' : 53,
    '6' : 54,
    '7' : 55,
    '8' : 56,
    '9' : 57,
    'A' : 65,
    'B' : 66,
    'C' : 67,
    'D' : 68,
    'E' : 69,
    'F' : 70,
    'G' : 71,
    'H' : 72,
    'I' : 73,
    'J' : 74,
    'K' : 75,
    'L' : 76,
    'M' : 77,
    'N' : 78,
    'O' : 79,
    'P' : 80,
    'Q' : 81,
    'R' : 82,
    'S' : 83,
    'T' : 84,
    'U' : 85,
    'V' : 86,
    'W' : 87,
    'X' : 88,
    'Y' : 89,
    'Z' : 90,
};

TEXTAREA_EVENT.Triggers = (function(){
    // @param params parameters to use from callbacks.
    // {
    //   "textarea_selector" : A selector string of an <textarea>
    //   "textarea_instance" : instance of TextArea.
    // }
    var Triggers = function(params){
        this._params = params;

        this._stickflags = {};

        this._define_events();
    }

    var p = Triggers.prototype;

    p._define_events = function(days){
        var selector   = this._params['textarea_selector'];
        var ta         = this._params['textarea_instance'];
        var stickflags = this._stickflags;
        var K          = TEXTAREA_EVENT.K;

        $(selector).keydown(function(e){
            var keycode = e.keyCode;
            var mod_alt = e.altKey;
            var mod_ctrl = e.ctrlKey;
            var mod_shift = e.shiftKey;

            if(mod_alt && !mod_shift && !mod_ctrl){
                if(keycode==K.DELETE){
                    if(!('a_delete' in stickflags)){
                        stickflags['a_delete'] = '';
                        ta.delete_current_line();
                    }
                    e.preventDefault();
                }
                if(keycode==K.A){
                    if(!('a_a' in stickflags)){
                        stickflags['a_a'] = '';
                        var task = new TASK.Task();
                        ta.add_line_to_current(task.to_string());
                    }
                    // 2: but not working yet in IE(11) with use 1:, why?
                    //
                    // 1: Test for IE support.
                    // in IE, also use `e.retuyrnValue = false`.
                    // See: https://stackoverflow.com/questions/1000597/event-preventdefault-function-not-working-in-ie
                    //e.preventDefault(); // not working in IE
                    //e.preventDefault ? e.preventDefault() : (e.returnValue = false);
                    e.preventDefault();
                }
                if(keycode==K.C){
                    if(!('a_c' in stickflags)){
                        stickflags['a_c'] = '';
                        ta.clone_current_line();
                    }
                    e.preventDefault();
                }
                if(keycode==K.E){
                    if(!('a_e' in stickflags)){
                        stickflags['a_e'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        curtask.walk_creation_date(1);
                        var newtaskline = curtask.to_string();

                        ta.replace_current_line(newtaskline);

                    }
                    e.preventDefault();
                }
                if(keycode==K.J){
                    if(!('a_j' in stickflags)){
                        stickflags['a_j'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        var diff = 1;
                        curtask.shift_priority(diff);

                        var newtaskline = curtask.to_string();
                        ta.replace_current_line(newtaskline);
                    }
                    e.preventDefault();
                }
                if(keycode==K.K){
                    if(!('a_k' in stickflags)){
                        stickflags['a_k'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        var diff = -1;
                        curtask.shift_priority(diff);

                        var newtaskline = curtask.to_string();
                        ta.replace_current_line(newtaskline);
                    }
                    e.preventDefault();
                }
                if(keycode==K.P){
                    if(!('a_p' in stickflags)){
                        stickflags['a_p'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        var new_priochar = DIALOG.prompt_only_priochar(curtask);
                        var emptystring = '';
                        if(new_priochar !== emptystring){
                            curtask.set_priority(new_priochar);
                            var newtaskline = curtask.to_string();
                            ta.replace_current_line(newtaskline);
                        }

                        // prompt 出す系だとダイアログを閉じた直後に
                        //   if(('a_p' in stickflags) && keycode==K.P){
                        // この部分が通過しない( p の keyup が検出されない)せいで
                        // 「二度押さないともう一度ダイアログが出ない」現象が起きる.
                        // これを防ぐために, ここでクリアしてしまう.
                        delete stickflags['a_p'];
                    }
                    e.preventDefault();
                }
                if(keycode==K.S){
                    if(!('a_s' in stickflags)){
                        stickflags['a_s'] = '';
                        ta.sort_lines();
                    }
                    e.preventDefault();
                }
                if(keycode==K.T){
                    if(!('a_t' in stickflags)){
                        stickflags['a_t'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        curtask.walk_creation_date_to_today();
                        var newtaskline = curtask.to_string();

                        ta.replace_current_line(newtaskline);
                    }
                    e.preventDefault();
                }
                if(keycode==K.W){
                    if(!('a_w' in stickflags)){
                        stickflags['a_w'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        var text_prefix = 'Current Task [' + curtask.to_string() + ']' + '\n' + '\n';
                        var walkvalue = DIALOG.prompt_only_date_walking_value(text_prefix);
                        if(walkvalue !== 0){
                            curtask.walk_creation_date(walkvalue);
                            var newtaskline = curtask.to_string();
                            ta.replace_current_line(newtaskline);
                        }
                        delete stickflags['a_w'];
                    }
                    e.preventDefault();
                }
                if(keycode==K.X){
                    if(!('a_x' in stickflags)){
                        stickflags['a_x'] = '';

                        var curtaskline = ta.get_current_line();
                        var curtask = new TASK.Task();
                        curtask.from_string_with_blankline_guard(curtaskline);

                        curtask.toggle_status();
                        var newtaskline = curtask.to_string();

                        ta.replace_current_line(newtaskline);
                    }
                    e.preventDefault();
                }
            }

        });

        $(selector).keyup(function(e){
            var keycode = e.keyCode;
            var mod_alt = e.altKey;
            var mod_ctrl = e.ctrlKey;
            var mod_shift = e.shiftKey;
            // Alt
            if(('a_delete' in stickflags) && keycode==K.DELETE){
                delete stickflags['a_delete'];
            }
            if(('a_a' in stickflags) && keycode==K.A){
                delete stickflags['a_a'];
            }
            if(('a_c' in stickflags) && keycode==K.C){
                delete stickflags['a_c'];
            }
            if(('a_e' in stickflags) && keycode==K.E){
                delete stickflags['a_e'];
            }
            if(('a_j' in stickflags) && keycode==K.J){
                delete stickflags['a_j'];
            }
            if(('a_k' in stickflags) && keycode==K.K){
                delete stickflags['a_k'];
            }
            if(('a_p' in stickflags) && keycode==K.P){
                delete stickflags['a_p'];
            }
            if(('a_s' in stickflags) && keycode==K.S){
                delete stickflags['a_s'];
            }
            if(('a_t' in stickflags) && keycode==K.T){
                delete stickflags['a_t'];
            }
            if(('a_w' in stickflags) && keycode==K.W){
                delete stickflags['a_w'];
            }
            if(('a_x' in stickflags) && keycode==K.X){
                delete stickflags['a_x'];
            }
        });
    }

    return Triggers;
})();

var INFOBAR = INFOBAR || {};
INFOBAR.________________start________________ = function(){}

INFOBAR.InfoBar = (function(){
    var InfoBar = function(){
        this._selector = '#infobar';
    }

    var p = InfoBar.prototype;

    p.update = function(params){
        var cursor = params.cursor;
        var x = cursor.x.toString();
        var y = cursor.y.toString();
        var p = cursor.p.toString();

        var template = '(x,y)={{x}},{{y}}, p={{p}}';
        var displaystr = template.replace('{{x}}', x).replace('{{y}}', y).replace('{{p}}', p);
        $(this._selector).text(displaystr);
    }

    return InfoBar;
})();

var DIALOG = DIALOG || {};
DIALOG.________________start________________ = function(){}

// @return an empty string if empty input or canceled.
DIALOG.prompt = function(instruction_text, default_value){
    var retstr = window.prompt(instruction_text, default_value);
    if(retstr === null){
        var empty_string = '';
        return empty_string;
    }
    return retstr;
}

// @param value_if_canceled An integer which be set if canceled.
// @return An integer
DIALOG.prompt_only_integer = function(instruction_text, default_value, value_if_canceled){
    var defval = default_value;
    while(true){
        var retstr = DIALOG.prompt(instruction_text, defval);
        if(retstr.length === 0){
            return value_if_canceled;
        }

        var retint = parseInt(retstr)
        if(isNaN(retint)){
            continue;
        }

        return retint;
    }
}

DIALOG.prompt_only_date_walking_value = function(text_prefix, text_suffix){
    var prefix = text_prefix || '';
    var suffix = text_suffix || '';
    var INSTRUCTION_WALK_CREATION_DATE =
        prefix +
        'Please input a day diff.' + '\n' +
        '   0: No walk' + '\n' +
        '  +1: Walk to tomorrow' + '\n' +
        '  +7: Walk to after 1 week.' + '\n' +
        '  -1: Walk to yesterday.' + '\n' +
        '  ...' + '\n' +
        suffix;
    var defval = 0;
    var value_if_canceled = 0;
    return DIALOG.prompt_only_integer(INSTRUCTION_WALK_CREATION_DATE, defval, value_if_canceled);
}

// @param task A Task instance.
// @return A new priority char
// @retval empty string if canceled.
DIALOG.prompt_only_priochar = function(task){
    var cur_taskline = task.to_string();

    var INSTRUCTION_PRIO_INPUT =
        'Curent task: [' + cur_taskline + '] ' + '\n' +
        'Please input a priority char. (Each of "' + TASK.Spec.CHAR.PRIORITIES + '", and not case-sensitive.';
    var cur_priochar = task.get_priority();

    while(true){
        var new_priochar = DIALOG.prompt(INSTRUCTION_PRIO_INPUT, cur_priochar);
        new_priochar = new_priochar.toUpperCase();
        if(new_priochar.trim().length === 0){
            var emptystring = ''
            return emptystring;
        }
        if(!task.is_valid_priochar(new_priochar)){
            continue;
        }
        return new_priochar;
    }
}
