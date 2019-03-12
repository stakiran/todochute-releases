'use strict';

var VERSION = 'v0.1.0';
var mod_config = CONFIG;
var mod_datetime = DATETIME;
var mod_task = TASK;
var mod_textarea = TEXTAREA;
var mod_textarea_event = TEXTAREA_EVENT;
var mod_infobar = INFOBAR;
var mod_dialog = DIALOG;
var mod_datastorage = DATASTORAGE;
var mod_displayswitcher = DISPLAYSWITCHER;

$(function(){
    // 1: prepare GUI
    // --------------

    // mode buttons

    var display_switcher = new mod_displayswitcher.DisplaySwitcher();

    $("#button_to_reset_config").click(function(){
        var instruction_text =
            'Config(設定)を初期値に戻します。\n' +
            '続行する場合は「initialize config」とタイプしてください。\n' +
            '(一致するまで先に進めません)\n' +
            '続行しない場合は ESC キーや未入力 Enter などでキャンセルしてください。';
        var reset_password = 'initialize config';
        var does_user_say_reset_ok = mod_dialog.prompt_only_specific_sentence(instruction_text, reset_password);
        if(does_user_say_reset_ok){
            mod_config.load_default_config();
            ta_config.load();
        }
    });

    $("#button_to_open_tasklist").click(function(){
        if(!ta_config.is_your_config_writing_ok()){
            return;
        }
        ta_config.save();
        storage.save_config_to(mod_config.Config);

        ta_tasklist.set_fontsize(mod_config.Config.TEXTAREA_FONTSIZE_PIXEL);
        ta_tasklist.set_height(mod_config.Config.TEXTAREA_HEIGHT_PIXEL);

        display_switcher.show_tasklist();
    });

    $("#button_to_open_config").click(function(){
        // TaskList textarea height は二通りの設定経路がある.
        // - 1: textarea の高さをユーザーが(枠を D&D して)直接変えた.
        // - 2: Config 画面で TEXTAREA_HEIGHT_PIXEL の値をユーザーが変えた.
        // 2 は Config 画面から離れる時に反映する.
        // 1 は Config 画面を開く時に反映する(ここでやってる)
        var current_tasklist_textarea_height = ta_tasklist.get_current_height();
        CONFIG.update_tasklist_height_config(current_tasklist_textarea_height);

        ta_config.load();
        display_switcher.show_config();
    });

    // 2: prepare config firstly
    //    because config is used from any places.
    // -----------------

    var storage = mod_datastorage.init_and_get_instance(window.localStorage);
    var config_in_storage_by_str = storage.get_config_by_str();
    mod_config.load_saved_config(config_in_storage_by_str);

    // 3: prepare each parts
    // ---------------------

    // init instances

    var ta_tasklist_selector = '#ta_tasklist';
    var ta_tasklist = new TEXTAREA.TextAreaTaskList(ta_tasklist_selector);
    var ta_config_selector = '#ta_config';
    var ta_config = new mod_textarea.TextAreaConfig(ta_config_selector);


    // construct relationship with instances

    var params_ta_tasklist = {
        'textarea_selector' : ta_tasklist_selector,
        'textarea_instance' : ta_tasklist,
    };
    var event_tasklist = new mod_textarea_event.EventTaskList(params_ta_tasklist);

    var params_ta_config = {
        'textarea_selector' : ta_config_selector,
        'textarea_instance' : ta_config,
    };
    var event_config = new mod_textarea_event.EventConfig(params_ta_config);

    //var view_infobar = new mod_infobar.InfoBar();
    //ta.add_observer_on_update_status(view_infobar);
    var observer_do_save_on_sort = {
        update : function(params){
            var savee_lines_by_array = params.lines;
            storage.save_lines_array_to(savee_lines_by_array);
        }
    };
    ta_tasklist.add_observer_on_sort(observer_do_save_on_sort);

    // init data
    // ---------

    var the_last_lines_on_your_localstorage = storage.get_lines_by_array();
    ta_tasklist.from_array_for_initial_loading(the_last_lines_on_your_localstorage);
    ta_tasklist.load_from_config();

    // 4: initial display set
    // ----------------------

    display_switcher.show_tasklist();
    ta_tasklist.focus();
});
