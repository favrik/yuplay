(function () {


    "use strict";

    /** Class: yuplay_player
     *  Youtube video player widget.
     */
    var yuplay_player = function () {
        /** PrivateVariables: yuplay_player variables
         *
         *  yp - Youtube Player id.
         *  container - DOM Element that contains the player.
         *  play_list - A reference to the play_list widget.
         *  current - The current video that is playing/paused on the player.
         *  callbacks - Array holding the funtions that will be called when 
         *    player becomes ready.
         */
        this.yp = null;
        this.container = null;
        this.playlist = null;
        this.current = 0;
        this.on_status_update_callback = function () {};
        this.on_error_callback = function () {};
        this.on_ready_callbacks = []; // they will be called when the player becomes ready!
        this.State = {
            ENDED:      0, // STOPPED
            READY:     -1, // or unstarted
            BUFFERING:  3, // Sometimes it says playing, while it's really buffering
            PLAYING:    1,
            PAUSED:     2,
            QUEUED:     5
        };
        this.Register = {
           STOPPED: false,
           INTERRUPTED: false
        };
    };

    yuplay_player.prototype = {
        attach_events: function (buttons) {
            var context = this;

            // Setup Play Button event
            buttons.play.click(function () {
                context.on_ready_callbacks.push(context.play_all);
            });

            buttons.stop.click(function () { context.stop(); });
            buttons.next.click(function () { context.next(); });
            buttons.prev.click(function () { context.prev(); });
            buttons.full.click(function () { context.yp.setSize(400, 300); });
        }, 

        /** PrivateFunction: status_quo
         *  Handles the state of the player.
         *
         *  For now, this function 1) controls the continuous play portion of 
         *  the player. And 2) calls the registered callbacks when the player
         *  becomes ready.
         *
         *  Parameters:
         *      (Integer) state - The player state (playing, buffering, etc.).
         */
        status_quo: function (state) {
            this.log_state(state);

            if (state === this.State.ENDED 
                && !this.Register.INTERRUPT && !this.Register.STOPPED) { // ENDED
                this.next(); 
            }

            if (state === this.State.READY) { // READY, but really unstarted
                for (var i = 0; i < this.on_ready_callbacks.length; i++) {
                    this.on_ready_callbacks[i]();
                }

                this.setup_new_play_all_click();
            }

            if (state === this.State.PLAYING) {
                this.Register.INTERRUPT = false;
            }
        },

        log_state: function (state) {
            for (var st in this.State) {
                if (this.State[st] === state) {
                    console.info('Player state: ' + state + ' ' + st);
                }
            }
        },

        /** PrivateFunction: setup_new_play_all_click
         *  Hacked-up function to replace the Play button click event.
         *
         *  This has to be done because there's a delay between the document 
         *  being ready, and the Youtube Flash Player becoming ready. So the 
         *  first time you click the Play button, it doesn't try to play the
         *  video immediatly, but when the player is ready.
         */
        setup_new_play_all_click: function () {
            var context = this;
            $('#play_b').unbind('click').click(function () { context.play_all(); });
        },

        play: function () {
            var video = null;

            if (arguments.length > 0) {
                video = arguments[0];    
            }

            if (video !== null) {
                console.log('playing: '+ this.current + ' ' + video.id);
                if (this.yp) {
                    this.yp.loadVideoById(video.id, 0);
                }
            }

            this.yp.playVideo();
        },

        play_all: function () {
            console.log(this);

            if (this.playlist.length() > 0) {
                this.current = 0;
                this.yp.unMute();
                this.yp.setVolume(100);
                this.play(this.playlist.get(this.current));
            }
        },

        next: function () {
            // Have we arrived at the last video in the list?
            if (this.playlist.length() === (this.current + 1)) {
                this.yp.clearVideo();

                return;
            }
            this.current++;
            this.yp.clearVideo();
            this.Register.INTERRUPT = true;
            this.play(this.playlist.get(this.current));
            console.log('next: ' + this.current + ' ' + this.playlist.get(this.current).id);
        },

        prev: function () {
            // Let's do a cyclic player
            this.current--;
            if (this.current < 0) {
                this.current = 0;
            }
            this.Register.INTERRUPT = true;
            this.play(this.playlist.get(this.current));
            console.log('prev: ' + this.current + ' ' + this.playlist.get(this.current).id);
        },

        stop: function () {
            this.Register.STOPPED = true;
            this.yp.stopVideo();
            this.yp.clearVideo();
        },

        pause: function () {
            this.yp.pauseVideo();
        },

        init: function (options) {
            this.yp = options.yp_id;
            this.container = options.container;
            this.playlist = options.playlist;
            this.on_error_callback = options.error_callback;
            this.on_status_update_callback = options.status_update_callback;
            this.attach_events(options.buttons);
        },

        start: function () {
            this.yp = document.getElementById(this.yp);
            this.yp.addEventListener("onStateChange", this.on_status_update_callback);
            this.yp.addEventListener("onError", this.on_error_callback);
        },

        call_on_ready: function (func) {
            this.on_ready_callbacks.push(func); 
        },

        update: function (state) {
            this.status_quo(state); 
        }
    };

    yuplay.player = new yuplay_player();


})();
