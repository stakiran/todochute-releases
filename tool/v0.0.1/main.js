'use strict';

var VERSION = 'v0.0.1';
var mod_datetime = DATETIME;
var mod_task = TASK;
var mod_textarea = TEXTAREA;
var mod_textarea_event = TEXTAREA_EVENT;
var mod_infobar = INFOBAR;
var mod_dialog = DIALOG;
var mod_datastorage = DATASTORAGE

$(function(){
    // prepare instances
    // -----------------

    var ta_selector = '#editspace';
    var ta = new TEXTAREA.TextArea(ta_selector);

    var storage = mod_datastorage.init_and_get_instance(window.localStorage);

    // relationship
    // ------------

    var params = {
        'textarea_selector' : ta_selector,
        'textarea_instance' : ta,
    };
    var ta_event = new mod_textarea_event.Triggers(params);

    //var view_infobar = new mod_infobar.InfoBar();
    //ta.add_observer_on_update_status(view_infobar);
    var observer_do_save_on_sort = {
        update : function(params){
            var savee_lines_by_array = params.lines;
            storage.save_lines_array_to(savee_lines_by_array);
        }
    };
    ta.add_observer_on_sort(observer_do_save_on_sort);

    // initialization
    // --------------

    var the_last_lines_on_your_localstorage = storage.get_lines_by_array();
    ta.from_array_for_initial_loading(the_last_lines_on_your_localstorage);
    ta.load_from_config();

    ta.focus();
});
