(function () {


    "use strict";

    /** Class: yuplay_playlist
     *  YuPlay playlist widget.
     */
    var yuplay_playlist = function () {
        /** PrivateVariables: yuplay_playlist variables
         *
         *  container - jQuery DOM Element that contains the playlist.
         *  playlist - jQuery DOM Element for the playlist widget
         *  toggle - 
         *  items - Array holding the video items that will be called when 
         *    player becomes ready.
         */
        var container = null,
            playlist  = null,
            toggle    = false,
            items     = [],

        /** PrivateFunction: in_list
         *  Check if an item is inside the playlist.
         *
         *  This is just a helper function.
         *
         *  Parameters:
         *      (String) needle - The item we are searching for.
         *      (Array) haystack - The search array.
         *
         *  Returns:
         *      true if needle is inside the haystack, false otherwise.
         */
        in_list = function (needle, haystack) {
            var result = false,
                i;

            for (i = 0; i < haystack.length; i++) {
                if (needle === haystack[i].url) {
                    result = true;
                    break;
                }
            }
            return result;
        },

        /** PrivateFunction: _add
         *  Add an item to the playlist.
         *
         *  Parameters:
         *      (Integer) video - The video information object.
         */
        _add = function (video) {
            if (items.length === 0) {
                // Doing this because we initialize the playlist with an Action message
                playlist.empty();
                container.show();
            }

            if (!in_list(video.url, items)) {
                var class_li = toggle ? {className: 'alter'} : {},
                    dom = null;
                
                class_li.id = 'pl' + items.length;
                toggle = !toggle;
                
                items.push(video);
                
                dom = $.LI(class_li, video.title);
                playlist.append(dom);
            }
        },

        /** PrivateFunction: _remove
         *  Handles.
         *
         *  Parameters:
         *      (Integer) state - The player state (playing, buffering, etc.).
         */
        _remove = function (video_id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i] === video_id) {
                    items.splice(i, 1);
                }
            }
            $('#' + video_id).remove();
        };

        // Public instance methods
        return {
            init: function (options) {
                container = options.container;
                playlist = options.playlist;

                playlist.click(function (e) {
                    console.info($(e.target).get(0).id);
                });
            },

            add: function (video) {
                _add(video);
            },

            remove: function (video_id) {
                _remove(video_id);
            },

            get: function (position) { 
                if (items[position] !== undefined) { 
                    return items[position];
                }
                return false;
            },

            show: function () { 
                container.show();
            },

            clear:  function () { 
                items = [];
                playlist.empty();
            },

            length: function () {
                return items.length;
            }
        };
    };

    yuplay = yuplay || {};
    yuplay.playlist = yuplay_playlist();


})();
