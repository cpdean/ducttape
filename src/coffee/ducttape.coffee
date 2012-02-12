define ['cmd', 'keybindings', 'ui', 'pkgmgr', 'objectviewer'], (Cmd, KeyBindings, UI, PkgMgr, objectviewer) ->
    (config = {}) ->

        # sanitize configuration:
        config ?= {}
        config.global_ref ?= "\u0111"
        config.initial_buffer ?= config.global_ref

        # main DuctTape function
        dt = -> specials.internals.exec.apply specials, arguments

        # special variables, accessible through dt()
        specials =
            config: config
            internals: {}
            session:
                history: []

        # define exec function invoked upon dt() calls
        specials.internals.exec = (command, args...) ->
            if command?
                if (command of specials) and (args.length == 0)
                    specials[command]
                else
                    fn = internals.cmd.get command
                    (fn ? badCommand(command)).apply dt, args
            else
                "DuctTape pre 0.001; Welcome!"

        # instantiate classes
        specials.internals.cmd = new Cmd()
        specials.session.keybindings = new KeyBindings()
        specials.internals.pkgmgr = new (PkgMgr(dt))()
        specials.internals.ui = new (UI(dt))()

        ov = objectviewer(dt)


        # define and populate the 'builtin' package:
        specials.internals.pkgmgr.def "builtin", {
            description: "Contains stuff packaged with DuctTape.",
            author: "Peter Neumark",
            website: "http://peterneumark.com" 
            }
        specials.internals.pkgmgr.addFun "builtin", {
                name: 'captureEvent',
                description: 'Prevents event bubbling',
                args: [{name: 'ev', description: 'JS event'}]
            }, specials.internals.ui.captureEvent, false
        specials.internals.pkgmgr.addFun "builtin", {
                name: 'last'
                description: 'Returns last evaluated command and the result'
            }, -> specials.session.history[specials.session.history.length - 1]
        specials.internals.pkgmgr.addFun "builtin", {
                name: 'compile',
                args: [{name: 'src', description: 'CoffeeScript source'} ],
                description: 'Compiles CoffeeScript code to JavaScript.'
            }, (src) ->
                if src.length == 0
                    src 
                else
                    CoffeeScript.compile(src, {'bare': on})
        specials.internals.pkgmgr.addFun "builtin", {
                name: 'stringValue',
                args: [{name: 'value', description: 'A JavaScript value to be converted to a string (if possible)'}],
                description: 'Returns a string representation of the argument or throws and exception if not possible'
            }, ov.stringValue

        specials.internals.pkgmgr.addFun "builtin", {
                name: 'ov',
                args: [{name: 'object', description: 'A JavaScript object to be displayed in a DOM element'}],
                description: 'In objectviewer.coffee'
            }, ov.objectViewer

        specials.internals.pkgmgr.addFun "builtin", {
                name: 'show',
                args: [{name: 'value', description: 'A JavaScript value to be displayed as a string or DOM element'}],
                # TODO: argument 2!
                description: 'In objectviewer.coffee'
            }, ov.showValue

        # initialize UI when DOM is ready:
        $ -> specials.internals.ui.init()
        # local helper functions
        badCommand = (name) ->
            -> "No such command: '#{ name }'"

        # Registers global reference
        window[config.global_ref] = dt
