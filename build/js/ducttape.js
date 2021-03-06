
(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     cmd.coffee - The DuctTape command interpreter.
  
  */  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  define('cmd',[], function() {
    return function(dtObj) {
      var Cmd, badCommand;
      badCommand = function(name) {
        return function() {
          return "No such command: " + name;
        };
      };
      return Cmd = (function() {
        function Cmd() {
          this.exec = __bind(this.exec, this);          this.cmdStore = {
            v: {
              attr: {
                description: "Get a DuctTape system variable."
              },
              value: function(varName) {
                if (varName in dtObj) {
                  return dtObj[varName];
                } else {
                  throw new Error("No such system variable: " + varName);
                }
              }
            },
            o: {
              attr: {
                description: "Get a DuctTape object from the package manager."
              },
              value: function(fullName) {
                var tmp;
                tmp = fullName.split(':');
                return dtObj.internals.pkgmgr.load(tmp[0], tmp[1]);
              }
            }
          };
        }
        Cmd.prototype.exec = function() {
          var args, command, fn, ret, tmp, _ref;
          command = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          if ((command != null) && ("string" === typeof command)) {
            if (args.length === 0) {
              tmp = command.split(' ');
              command = tmp[0];
              args = tmp.slice(1);
            }
            fn = (_ref = this.cmdStore[command]) != null ? _ref.value : void 0;
            return (fn != null ? fn : badCommand(command)).apply(this, args);
          } else {
            return ret = "Sorry, can't help you with that! No action registered for value '" + command + "'!";
          }
        };
        return Cmd;
      })();
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     keybindings.coffee - Defines and triggers keybindings.
  
  */  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty;
  define('keybindings',[], function() {
    var KeyBindings;
    return KeyBindings = (function() {
      function KeyBindings(store) {
        this.store = store != null ? store : {};
        this.trigger = __bind(this.trigger, this);
        this.bind = __bind(this.bind, this);
      }
      KeyBindings.prototype.bind = function(ev) {
        if (!((ev != null ? ev.keyCode : void 0) != null)) {
          throw new Error("keyCode of key event descriptor must be set");
        }
        if (!(this.store[ev.keyCode] != null)) {
          this.store[ev.keyCode] = [];
        }
        return this.store[ev.keyCode].push(ev);
      };
      KeyBindings.prototype.trigger = function(ev) {
        var attr, differences, i, l, val;
        if ((!((ev != null ? ev.keyCode : void 0) != null)) || (!(this.store[ev.keyCode] != null))) {
          return false;
        }
        l = this.store[ev.keyCode];
        i = 0;
        attr = null;
        while (i < l.length) {
          differences = (function() {
            var _ref, _results;
            _ref = l[i];
            _results = [];
            for (attr in _ref) {
              if (!__hasProp.call(_ref, attr)) continue;
              val = _ref[attr];
              if ((ev[attr] != null) && ev[attr] !== val) {
                _results.push(attr);
              }
            }
            return _results;
          })();
          if (differences.length === 0) {
            return l[i].action(ev);
          }
          i++;
        }
        return false;
      };
      return KeyBindings;
    })();
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     ui.coffee - The DuctTape UI.
  
  */  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __slice = Array.prototype.slice;
  define('ui',[], function() {
    return function(dt) {
      var HistoryBrowser, UI, config, lib, pkg, session, show, ui;
      config = dt('v config');
      session = dt('v session');
      show = (dt('o objectViewer:show')).value;
      HistoryBrowser = (function() {
        function HistoryBrowser(ui) {
          this.ui = ui;
          this.editBuffer = this.ui.editor.getSession().getValue();
          this.pos = null;
        }
        HistoryBrowser.prototype.back = function() {
          if (!(this.pos != null)) {
            this.pos = session.history.length;
          }
          if (this.pos > 0) {
            this.pos--;
          }
          return this.ui.resetEditorContents(session.history[this.pos].coffee);
        };
        HistoryBrowser.prototype.forward = function() {
          this.pos++;
          if (this.pos >= session.history.length) {
            this.ui.resetEditorContents(this.editBuffer);
            return false;
          } else {
            this.ui.resetEditorContents(session.history[this.pos].coffee);
            return true;
          }
        };
        return HistoryBrowser;
      })();
      UI = (function() {
        function UI(editor_div_id) {
          this.editor_div_id = editor_div_id != null ? editor_div_id : "editor";
          this.format_command = __bind(this.format_command, this);
          this.display = __bind(this.display, this);
          this.scrollToBottom = __bind(this.scrollToBottom, this);
          this.resetEditorContents = __bind(this.resetEditorContents, this);
          this.insertText = __bind(this.insertText, this);
          this.update = __bind(this.update, this);
          this.updateTimeout = __bind(this.updateTimeout, this);
          this.init = __bind(this.init, this);
          this.editor = null;
          this.editor_div = document.getElementById(this.editor_div_id);
          this.coffee_source = "";
          this.js_source = "";
          this.timeoutHandle = null;
          this.UPDATE_DELAY = 300;
          this.historyBrowser = null;
        }
        UI.prototype.init = function() {
          if (this.editor != null) {
            return false;
          }
          this.init_ace();
          this.init_ui();
          return this.resetEditorContents();
        };
        UI.prototype.init_ace = function() {
          var bind, trigger;
          this.editor = ace.edit(this.editor_div_id);
          this.editor.getSession().setMode(new (ace.require("ace/mode/coffee").Mode)());
          this.editor.getSession().setTabSize(4);
          this.editor.getSession().setUseSoftTabs(true);
          this.editor.getSession().setUseWrapMode(false);
          this.editor.setHighlightActiveLine(true);
          this.editor.setShowPrintMargin(false);
          this.editor.renderer.setShowGutter(false);
          this.editor.renderer.setHScrollBarAlwaysVisible(false);
          this.editor.getSession().on("change", this.updateTimeout);
          bind = session.keybindings.bind;
          trigger = session.keybindings.trigger;
          this.editor.setKeyboardHandler({
            handleKeyboard: __bind(function(_1, _2, _3, _4, ev) {
              if ((ev != null) && trigger(ev)) {
                return lib.captureEvent(ev);
              }
            }, this)
          });
          bind({
            description: 'Execute contents of buffer.',
            keyCode: 13,
            shiftKey: false,
            action: __bind(function() {
              if (this.js_source.length > 0) {
                this.historyBrowser = null;
                this.update();
                this.execute(this.coffee_source, this.js_source);
                this.clear_src_buffers();
                this.resetEditorContents();
                this.scrollToBottom();
              }
              return true;
            }, this)
          });
          bind({
            description: 'Insert DuctTape symbol (\u0111).',
            keyCode: 68,
            altKey: true,
            action: __bind(function() {
              this.editor.insert('\u0111');
              return true;
            }, this)
          });
          bind({
            description: 'Toggle generated javascript window.',
            keyCode: 113,
            action: __bind(function() {
              if (config.showGeneratedJS) {
                $('#jsSource').hide();
              } else {
                this.updateGeneratedJS();
                $('#jsSource').show();
                this.scrollToBottom();
              }
              config.showGeneratedJS = !config.showGeneratedJS;
              return true;
            }, this)
          });
          bind({
            description: 'Browse command history (previous).',
            keyCode: 38,
            action: __bind(function() {
              var _ref;
              if (this.editor.getCursorPosition().row === 0) {
                                if ((_ref = this.historyBrowser) != null) {
                  _ref;
                } else {
                  this.historyBrowser = new HistoryBrowser(this);
                };
                this.historyBrowser.back();
                return true;
              } else {
                return false;
              }
            }, this)
          });
          return bind({
            description: 'Browse command history (next).',
            keyCode: 40,
            action: __bind(function() {
              if ((this.historyBrowser != null) && this.editor.getCursorPosition().row === (this.editor.getSession().getValue().split('\n').length - 1)) {
                if (!this.historyBrowser.forward()) {
                  this.historyBrowser = null;
                }
                return true;
              } else {
                return false;
              }
            }, this)
          });
        };
        UI.prototype.init_ui = function() {
          return $('#menuhelp').click(__bind(function(ev) {
            lib.captureEvent(ev);
            lib.run("(" + (dt.symbol()) + " 'o help:help').value()");
            return false;
          }, this));
        };
        UI.prototype.updateGeneratedJS = function() {
          return $('#jsSource pre').text(this.js_source);
        };
        UI.prototype.updateTimeout = function() {
          if (this.timeoutHandle != null) {
            window.clearTimeout(this.timeoutHandle);
          }
          return this.timeoutHandle = setTimeout(this.update, this.UPDATE_DELAY);
        };
        UI.prototype.update = function() {
          var _ref;
          if (this.timeoutHandle != null) {
            window.clearTimeout(this.timeoutHandle);
          }
          this.timeoutHandle = null;
          this.coffee_source = this.editor.getSession().getValue().trim();
          try {
            this.js_source = (_ref = (dt('v internals')).corelib.compile(this.coffee_source)) != null ? _ref.trim() : void 0;
            $("#ok").show();
            $("#parseerror").hide();
            if (config.showGeneratedJS) {
              return this.updateGeneratedJS();
            }
          } catch (error) {
            this.js_source = "";
            $("#ok").hide();
            $("#parseerror").show().text(error.message);
            return this.scrollToBottom();
          }
        };
        UI.prototype.clear_src_buffers = function() {
          this.js_source = "";
          return this.coffee_source = "";
        };
        UI.prototype.insertText = function(text) {
          var currentValue, cursor;
          cursor = this.editor.getCursorPosition();
          cursor.column += text.length;
          currentValue = this.editor.getSession().getValue();
          this.editor.getSession().setValue(currentValue === (dt('config')).initial_buffer ? text : currentValue + text);
          this.scrollToBottom();
          return this.editor.moveCursorToPosition(cursor);
        };
        UI.prototype.resetEditorContents = function(newContents) {
          var lines;
          if (newContents == null) {
            newContents = config.initial_buffer;
          }
          lines = newContents.split('\n');
          this.editor.gotoLine(0);
          this.editor.getSession().setValue(newContents);
          return this.editor.moveCursorToPosition({
            column: lines[lines.length - 1].length,
            row: lines.length - 1
          });
        };
        UI.prototype.scrollToBottom = function() {
          $("html, body").animate({
            scrollTop: $(document).height()
          }, 200);
          return $('textarea', this.editor_div).focus();
        };
        UI.prototype.formatEx = function(ex) {
          var _ref, _ref2;
          return $("<div class=\"eval_result\"><span class=\"label label-warning\"> <strong>Exception</strong> (" + ((_ref = ex != null ? ex.type : void 0) != null ? _ref : "") + ") </span>&nbsp;<strong>" + ((_ref2 = ex != null ? ex.message : void 0) != null ? _ref2 : "") + "</strong>" + ((ex != null ? ex.stack : void 0) != null ? '<pre>' + ex.stack + '</pre>' : '') + "</div>");
        };
        UI.prototype.detach = function(content) {
          var msg, oldParent, _ref;
          if (((_ref = content.parents().last()) != null ? _ref[0] : void 0) instanceof HTMLHtmlElement) {
            oldParent = content.parents().first();
            msg = $("<div class='eval_result'><h2>This content has been moved!</h2>Sorry, it seems the content that used to be here is now somewhere else. No worries, though, <a href='#'>you can always get it back</a>.</div>");
            msg.find('a').click(__bind(function(ev) {
              lib.captureEvent(ev);
              this.detach(content);
              content.appendTo(oldParent);
              return msg.detach();
            }, this));
            content.detach();
            msg.appendTo(oldParent);
          }
          return content;
        };
        UI.prototype.display = function(expr, where, decorator) {
          var div;
          if (where == null) {
            where = $('#interactions');
          }
          if (decorator == null) {
            decorator = $('<div class="eval_result"></div>');
          }
          div = decorator.append(this.detach(show(expr)));
          if (typeof where === "object") {
            where.append(div);
          }
          return null;
        };
        UI.prototype.execute = function(coffee_stmt, js_stmt, silent) {
          var evalexpr, exception, historyEntry, result;
          if (silent == null) {
            silent = false;
          }
          evalexpr = js_stmt != null ? js_stmt : (dt('v internals')).corelib.compile(coffee_stmt);
          exception = null;
          result = null;
          try {
            return result = (dt('v internals')).corelib.execJS(evalexpr);
          } catch (error) {
            return exception = error;
          } finally {
            (dt('v session')).history.push(historyEntry = {
              js: js_stmt,
              coffee: coffee_stmt,
              value: exception != null ? exception : result,
              timestamp: new Date()
            });
            if (silent === false) {
              $('#interactions').append(this.format_command);
            }
            if ((result !== null) || (exception !== null)) {
              this.display((function() {
                try {
                  if (exception != null) {
                    return this.formatEx(exception);
                  } else {
                    return result;
                  }
                } catch (renderEx) {
                  historyEntry.renderEx = renderEx;
                  return $('<div><h3>Error displaying value</h3></div>').append(this.formatEx(renderEx));
                }
              }).call(this));
            }
          }
        };
        UI.prototype.format_command = function() {
          var div_inner, div_outer, lines;
          lines = $('div.ace_content', this.editor_div).find('div.ace_line').clone();
          div_inner = $("<div class='highlighted_expr ace_editor ace_text-layer'></div>");
          div_inner.append(lines);
          div_outer = $("<div class='" + (this.editor.getTheme().cssClass) + " alert alert-info'></div>");
          div_outer.append(div_inner);
          return div_outer;
        };
        return UI;
      })();
      ui = new UI();
      lib = {
        captureEvent: function(ev) {
          ev.preventDefault();
          return ev.stopPropagation();
        },
        run: function(expr, silent) {
          var div;
          if (silent == null) {
            silent = false;
          }
          if (silent === false) {
            div = $("<div class='alert alert-info'></div>");
            div.text(expr);
            $("#interactions").append(div);
          }
          ui.execute(expr, null, true);
          return ui.scrollToBottom();
        },
        asyncValue: function(loadingMsg) {
          var div;
          if (loadingMsg == null) {
            loadingMsg = 'loading...';
          }
          div = $('<div class="eval_result"></div>');
          ui.display(loadingMsg, $('#interactions'), div);
          return function() {
            var values;
            values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            div.children().remove();
            if (values.length === 0) {
              values = values[0];
            }
            return ui.display(values, false, div);
          };
        }
      };
      return pkg = {
        name: 'ui',
        attr: {
          description: 'The User Interface package of DuctTape. The lib object contains the API of the DuctTape GUI.',
          author: 'Peter Neumark',
          url: 'https://github.com/neumark/ducttape',
          version: '1.0'
        },
        value: {
          init: {
            attr: {
              description: 'Initialializes the DuctTape user interface.',
              makePublic: true
            },
            value: ui.init
          },
          insertText: {
            attr: {
              description: 'Inserts text in the the edit buffer.'
            },
            value: ui.insertText
          },
          setText: {
            attr: {
              description: 'Replaces the current edit buffer with the provided text'
            },
            value: ui.resetEditorContents
          },
          lib: {
            attr: {
              description: 'A library of useful functions for programming the DuctTape UI.'
            },
            value: lib
          },
          display: {
            attr: {
              description: 'Displays the result of an expression in the interactions window.',
              makePublic: true
            },
            value: ui.display
          }
        }
      };
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     pkgmgr.coffee - the DuctTape package manager.
     PkgMgr is organized around the concept of Values With Metadata (VWM).
     See corelib for details.
  
     Packages are VWM's, as are the objects contained within.
     Deeper in the object hierarchy there can be "plain old objects" as well.
  */  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  }, __slice = Array.prototype.slice;
  define('pkgmgr',[], function() {
    return function(dt) {
      var Pkg, PkgMgr, VWM;
      VWM = (dt('v internals')).corelib.VWM;
      Pkg = (function() {
        __extends(Pkg, VWM);
        function Pkg(pkgSpec) {
          this.toHTML = __bind(this.toHTML, this);          var key, obj, _ref;
          Pkg.__super__.constructor.call(this, pkgSpec);
          if (!this.hasAttributes(["author", "description", "url"])) {
            throw new Error("InvalidPackageSpecification");
          }
          _ref = this.value;
          for (key in _ref) {
            if (!__hasProp.call(_ref, key)) continue;
            obj = _ref[key];
            this.save(new VWM(key, obj));
          }
        }
        Pkg.prototype.save = function(vwm) {
          if (!vwm.hasAttributes(["description"])) {
            throw new Error("InvalidObjectSpecification");
          }
          this.value[vwm.name] = vwm;
          if (vwm.attr.makePublic === true) {
            dt[vwm.name] = this.value[vwm.name].value;
            return dt[vwm.name]['\u0111id'] = this.name + ':' + vwm.name;
          }
        };
        Pkg.prototype.load = function(name) {
          return this.value[name];
        };
        Pkg.prototype.toHTML = function() {
          var dl, name, pkgDesc, _fn, _ref, _ref2, _ref3;
          pkgDesc = $(" <div>\n     <h2>" + this.name + "</h2>\n     <table>\n         <tr><td><b>Author&nbsp;</b></td><td>" + ((_ref = this.attr.author) != null ? _ref : "") + "</td></tr>\n         <tr><td><b>URL&nbsp;</b></td><td><a href=\"" + this.attr.url + "\" target='_blank'>" + this.attr.url + "</a></td></tr>\n         <tr><td><b>Version&nbsp;</b></td><td>" + ((_ref2 = this.attr.version) != null ? _ref2 : "") + "</td></tr>\n     </table>\n     <p><!-- description --></p>\n     <p>Package Contents:\n         <dl></dl>\n     </p>\n</div>");
          pkgDesc.find('p').first().append((dt('o help:displayMarkDown')).value(this.attr.description));
          dl = pkgDesc.find('dl');
          _ref3 = this.value;
          _fn = __bind(function(name) {
            var mdSrc;
            dl.append($("<dt>" + name + "</dt>"));
            mdSrc = this.value[name].attr.makePublic === true ? "_Available as:_ [" + (dt.symbol()) + "." + name + "](/pseudoURL/insert)<br />" : "";
            mdSrc += this.value[name].attr.description;
            return dl.append($("<dd></dd>").append((dt('o help:displayMarkDown')).value(mdSrc)));
          }, this);
          for (name in _ref3) {
            if (!__hasProp.call(_ref3, name)) continue;
            _fn(name);
          }
          return pkgDesc;
        };
        return Pkg;
      })();
      return PkgMgr = (function() {
        function PkgMgr(store) {
          this.store = store != null ? store : {};
          this.listPackages = __bind(this.listPackages, this);
          this.load = __bind(this.load, this);
          this.save = __bind(this.save, this);
          this.definePackage = __bind(this.definePackage, this);
          this.definePackage({
            name: 'pkgmgr',
            attr: {
              author: 'Peter Neumark',
              url: 'https://github.com/neumark/ducttape',
              version: '1.0',
              description: "Use this package to load custom packages into **DuctTape**."
            },
            value: {
              definePackage: {
                attr: {
                  description: "loads a new package into DuctTape.",
                  makePublic: true
                },
                value: this.definePackage
              },
              save: {
                attr: {
                  description: "Add a Value With Metadata to an existing package."
                },
                value: this.save
              },
              load: {
                attr: {
                  description: "Retrieve a reference to a Value With Metadata object."
                },
                value: this.load
              },
              listPackages: {
                attr: {
                  description: "Displays the list of currently loaded packages and their contents.",
                  makePublic: true
                },
                value: this.listPackages
              }
            }
          });
        }
        PkgMgr.prototype.definePackage = function(pkgSpec) {
          var pkg;
          pkg = new Pkg(pkgSpec);
          if (this.store[pkg.name] != null) {
            throw new Error("PkgExists");
          }
          this.store[pkg.name] = pkg;
          return true;
        };
        PkgMgr.prototype.save = function() {
          var args, pkg;
          pkg = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
          return this.pkgDefinedGuard(pkg, function() {
            this.store[pkg].save(new VWM(args));
            return true;
          });
        };
        PkgMgr.prototype.load = function(pkg, name) {
          return this.pkgDefinedGuard(pkg, function() {
            return this.store[pkg].load(name);
          });
        };
        PkgMgr.prototype.listPackages = function() {
          var out, pkgName, _fn, _ref;
          out = $("<div />");
          _ref = this.store;
          _fn = __bind(function(pkgName) {
            out.append(this.store[pkgName].toHTML());
            return out.append("<hr />");
          }, this);
          for (pkgName in _ref) {
            if (!__hasProp.call(_ref, pkgName)) continue;
            _fn(pkgName);
          }
          out.find("hr").last().detach();
          return out;
        };
        PkgMgr.prototype.pkgDefinedGuard = function(pkgName, fn) {
          if (!(this.store[pkgName] != null)) {
            throw new Error("UndefinedPackage");
          }
          return fn.call(this);
        };
        return PkgMgr;
      })();
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     objectviewer.coffee - code for the objectViewer package, registered at
     startup in ducttape.coffee
  
  */  var __hasProp = Object.prototype.hasOwnProperty, __indexOf = Array.prototype.indexOf || function(item) {
    for (var i = 0, l = this.length; i < l; i++) {
      if (this[i] === item) return i;
    }
    return -1;
  };
  define('objectviewer',[], function() {
    return function(dt) {
      var objectViewer_MAXSTRLEN, ov, pkg;
      objectViewer_MAXSTRLEN = 40;
      ov = {
        htmlEncode: function(str) {
          return jQuery('<div />').text(str).html();
        },
        showValue: function(val, container) {
          if (((val != null ? val.toHTML : void 0) != null) && (typeof val.toHTML === "function")) {
            return val.toHTML();
          } else if (((val != null ? val.jquery : void 0) != null) || (val instanceof HTMLElement)) {
            return val;
          } else {
            try {
              return $("<span>" + (ov.htmlEncode(ov.stringValue(val))) + "</span>");
            } catch (e) {
              if ((e.message != null) && (e.message === "complexTypeError")) {
                return ov.objectViewer(val);
              } else {
                throw e;
              }
            }
          }
        },
        stringValue: function(val) {
          var i;
          switch (typeof val) {
            case "string":
              return '"' + val + '"';
            case "number":
            case "boolean":
            case "undefined":
            case "function":
              return val + "";
            case "object":
              if (val != null) {
                if (val.constructor === Array.prototype.constructor) {
                  return "[" + ((function() {
                    var _i, _len, _results;
                    _results = [];
                    for (_i = 0, _len = val.length; _i < _len; _i++) {
                      i = val[_i];
                      _results.push(ov.stringValue(i));
                    }
                    return _results;
                  })()).join(", ") + "]";
                } else if (val.toString !== Object.prototype.toString) {
                  return val.toString();
                } else {
                  throw new Error("complexTypeError");
                }
              } else {
                return "null";
              }
              break;
            default:
              return "(cannot display " + (typeof val) + ")";
          }
        },
        objectType: function(obj) {
          var n, _ref, _ref2;
          n = (_ref = obj != null ? (_ref2 = obj.constructor) != null ? _ref2.name : void 0 : void 0) != null ? _ref : 'Unknown';
          if ((n === "") && (obj != null ? obj.constructor : void 0) === $) {
            n = "jQuery";
          }
          return n;
        },
        hasChildren: function(obj) {
          return obj != null;
        },
        objectViewer: function(obj) {
          var get_children, get_node_data, mk_keylist, mk_node, object_viewer, refname;
          refname = "" + (dt.symbol()) + ".ov.cache[" + ov.objectViewer.cache.length + "]";
          ov.objectViewer.cache.push(obj);
          mk_node = function(key, value, visible) {
            var ret, value_str;
            if (visible == null) {
              visible = true;
            }
            value_str = null;
            try {
              value_str = ov.stringValue(value);
            } catch (e) {
              value_str = "Object of type " + (ov.objectType(value));
            }
            if (value_str.length > objectViewer_MAXSTRLEN) {
              value_str = value_str.substr(0, objectViewer_MAXSTRLEN) + "...";
            }
            ret = {
              data: {
                title: "<span class='objectViewer_" + (visible === true ? "" : "hidden") + "key'>" + key + "</span>: <span class='objectViewer_value'>" + value_str + "</span>",
                attr: {
                  object_key: key,
                  "class": 'objectViewer_item'
                }
              }
            };
            if (ov.hasChildren(value)) {
              ret.state = "closed";
              ret.children = [];
            }
            return ret;
          };
          get_children = function(parent) {
            var key, kl, visible, _i, _len, _results;
            kl = null;
            try {
              kl = Object.getOwnPropertyNames(parent);
            } catch (e) {
              if (!(typeof o !== "undefined" && o !== null)) {
                return [];
              }
              kl = (function() {
                var _results;
                _results = [];
                for (key in o) {
                  if (!__hasProp.call(o, key)) continue;
                  _results.push(key);
                }
                return _results;
              })();
            }
            if ((parent != null) && (parent['__proto__'] != null)) {
              kl.push('__proto__');
            }
            visible = Object.keys(parent);
            _results = [];
            for (_i = 0, _len = kl.length; _i < _len; _i++) {
              key = kl[_i];
              _results.push(mk_node(key, parent[key], __indexOf.call(visible, key) >= 0));
            }
            return _results;
          };
          mk_keylist = function(domnode) {
            var i;
            return ((function() {
              var _i, _len, _ref, _results;
              _ref = domnode.parents('li').children('a');
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                i = _ref[_i];
                if ($(i).attr('object_key') !== void 0) {
                  _results.push($(i).attr('object_key'));
                }
              }
              return _results;
            })()).reverse();
          };
          get_node_data = function(nodeid) {
            var k, keylist, node, nodedata;
            nodedata = null;
            if (nodeid === -1) {
              nodedata = mk_node('Object', obj);
              nodedata.state = "open";
              delete nodedata.data.attr.object_key;
              nodedata.children = get_children(obj);
            } else {
              keylist = mk_keylist(nodeid.children('a').first());
              node = obj;
              node = ((function() {
                var _i, _len, _results;
                _results = [];
                for (_i = 0, _len = keylist.length; _i < _len; _i++) {
                  k = keylist[_i];
                  _results.push((node = node[k]));
                }
                return _results;
              })())[keylist.length - 1];
              nodedata = get_children(node);
            }
            return nodedata;
          };
          object_viewer = $("<div class='eval_result'></div>");
          object_viewer.jstree({
            json_data: {
              data: function(nodeid, cb) {
                var nodedata;
                nodedata = get_node_data(nodeid);
                return cb(nodedata);
              }
            },
            core: {
              html_titles: true
            },
            themes: {
              icons: false
            },
            plugins: ["themes", "json_data", "crrm"]
          });
          object_viewer.on('click', 'a.objectViewer_item', function(ev) {
            var kl;
            kl = mk_keylist($(ev.currentTarget));
            (dt('o ui:lib')).value.captureEvent(ev);
            return (dt('o ui:insertText')).value(kl.length === 0 ? refname : "" + refname + "['" + (kl.join("']['")) + "']");
          });
          return object_viewer;
        }
      };
      ov.objectViewer.cache = [];
      return pkg = {
        name: 'objectViewer',
        attr: {
          description: 'A collection of functions for displaying JavaScript values.',
          author: 'Peter Neumark',
          url: 'https://github.com/neumark/ducttape',
          version: '1.0'
        },
        value: {
          ov: {
            attr: {
              description: 'Object Viewer',
              makePublic: true
            },
            value: ov.objectViewer
          },
          show: {
            attr: {
              description: 'Show a JavaScript value, regardless of type.',
              makePublic: true
            },
            value: ov.showValue
          }
        }
      };
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     corelib.coffee - Classes and functions used by DuctTape internally.
  
  */  var __slice = Array.prototype.slice;
  define('corelib',[], function() {
    var VWM;
    return {
      VWM: VWM = (function() {
        VWM.prototype.doc = "A VWM has 3 parts:\n- name              unique id (within namespace) - string\n- attr              attributes - object (dictionary)\n- value             the actual value - any truthy javascript value";
        function VWM() {
          var vwm, _ref;
          vwm = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          _ref = (function() {
            var _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
            switch (vwm != null ? vwm.length : void 0) {
              case 1:
                if ((((_ref = vwm[0]) != null ? _ref.length : void 0) != null) === 3) {
                  return vwm[0];
                } else {
                  return [(_ref2 = vwm[0]) != null ? _ref2.name : void 0, (_ref3 = vwm[0]) != null ? _ref3.attr : void 0, (_ref4 = vwm[0]) != null ? _ref4.value : void 0];
                }
                break;
              case 2:
                return [vwm != null ? vwm[0] : void 0, vwm != null ? (_ref5 = vwm[1]) != null ? _ref5.attr : void 0 : void 0, vwm != null ? (_ref6 = vwm[1]) != null ? _ref6.value : void 0 : void 0];
              case 3:
                return vwm;
              default:
                return [];
            }
          })(), this.name = _ref[0], this.attr = _ref[1], this.value = _ref[2];
          if ((!(this.name != null)) || (!(this.attr != null)) || (!this.value)) {
            throw new Error("Bad VWM format");
          }
          if ((typeof this.attr) !== "object") {
            throw new Error("VWM attr field must be an object");
          }
        }
        VWM.prototype.hasAttributes = function(attrList) {
          var f, missing;
          missing = (function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = attrList.length; _i < _len; _i++) {
              f = attrList[_i];
              if (!(this.attr[f] != null)) {
                _results.push(f);
              }
            }
            return _results;
          }).call(this);
          return missing.length === 0;
        };
        return VWM;
      })(),
      compile: function(src) {
        if (src.length === 0) {
          return src;
        } else {
          return CoffeeScript.compile(src, {
            'bare': true
          });
        }
      },
      execJS: function(jsSrc) {
        return window.eval(jsSrc.replace(/\n/g, "") + "\n");
      }
    };
  });
}).call(this);

(function() {
  /*
  
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     FileSystem interface for DuctTape
  
     FS provides a uniform way of accessing hierarchical information like the unix
     filesystem or the DOM tree. It contains the following parts:
     * The UI: a small "prompt" which can show the current directory, or
       whatever you like.
     * Commands: commands to navigate and manipulate the filesystem:
       mount, unmount, ls, pwd, cd
     * The FSILib object, which provides the FSI API for modules whishing to
       implement access to a particular service.
  */  define('fs',[], function() {
    return function(dt) {
      var mkSessionData, pkg, session;
      session = dt('v session');
      mkSessionData = function(path, obj) {
        return {
          currentPath: path,
          currentObject: obj
        };
      };
      return pkg = {
        name: "fs",
        attr: {
          description: "FileSystem inteface package",
          author: "Peter Neumark",
          version: "1.0",
          url: "https://github.com/neumark/ducttape"
        },
        value: {
          mount: {
            attr: {
              description: "Attach new FS adaptor.",
              makePublic: true
            },
            value: function(root) {
              var _ref;
              return (_ref = session.fs) != null ? _ref : session.fs = mkSessionData([], root);
            }
          },
          pwd: {
            attr: {
              description: "Print current directory.",
              makePublic: true
            },
            value: function() {
              var _ref, _ref2;
              return ((_ref = (_ref2 = session.fs) != null ? _ref2.currentPath : void 0) != null ? _ref : []).join('/');
            }
          },
          co: {
            attr: {
              description: "Displays current object.",
              makePublic: true
            },
            value: function() {
              var _ref, _ref2;
              return (_ref = session.fs) != null ? (_ref2 = _ref.currentObject) != null ? _ref2.getContents((dt('o ui:lib')).value.asyncValue()) : void 0 : void 0;
            }
          },
          ls: {
            attr: {
              description: "Lists children of current object.",
              makePublic: true
            },
            value: function() {
              var _ref, _ref2;
              return (_ref = session.fs) != null ? (_ref2 = _ref.currentObject) != null ? _ref2.getChildren((dt('o ui:lib')).value.asyncValue()) : void 0 : void 0;
            }
          }
        }
      };
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     shellutils.coffee - "shell utility functions", to make the DuctTape
     command more convenient for users.
  
  */  var __slice = Array.prototype.slice;
  define('shellutils',[], function() {
    return function(dt) {
      var pkg;
      return pkg = {
        name: 'shellUtils',
        attr: {
          description: 'Utilities functions to make DuctTape more shell-like.',
          author: 'Peter Neumark',
          url: 'https://github.com/neumark/ducttape',
          version: '1.0'
        },
        value: {
          last: {
            attr: {
              description: 'Displays the last executed command and result.',
              makePublic: true
            },
            value: function() {
              var h;
              h = (dt('v session')).history;
              if (h.length > 0) {
                return h[h.length - 1];
              } else {
                return "This is the first command.";
              }
            }
          },
          clear: {
            attr: {
              description: 'Clears prior interactions from the display.',
              makePublic: true
            },
            value: function() {
              $('#interactions').children().remove();
              return null;
            }
          },
          symbol: {
            attr: {
              description: 'Returns global name of DuctTape function.',
              makePublic: true
            },
            value: function() {
              return (dt('v config')).globalRef + '';
            }
          },
          history: {
            attr: {
              description: 'Prints history of formerly executed commands.',
              makePublic: true
            },
            value: function() {
              var c, h, uiLib, _fn, _i, _len, _ref;
              uiLib = (dt('o ui:lib')).value;
              c = $('<div class="eval_result"></div>');
              _ref = (dt('v session')).history;
              _fn = function(h) {
                return c.append($("<span><a style='display:block;' href='#'>" + h.coffee + "</a></span>").find('a').click(function(ev) {
                  uiLib.captureEvent(ev);
                  return uiLib.run(h.coffee);
                }));
              };
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                h = _ref[_i];
                _fn(h);
              }
              return c;
            }
          },
          setvar: {
            attr: {
              description: 'Sets window.varName to the given value.',
              makePublic: true
            },
            value: function(name, value) {
              return window[name] = value;
            }
          },
          curry: {
            attr: {
              description: 'Curries functions, setting this to window'
            },
            value: function() {
              var args, fun;
              fun = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
              return function() {
                var laterArgs;
                laterArgs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                return function() {
                  var laterArgs;
                  laterArgs = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
                  return fun.apply(window, args.concat(laterArgs));
                };
              };
            }
          },
          lib: {
            attr: {
              description: 'Library of functions useful for command-line programs'
            },
            value: {
              log: function(expr, source, level) {
                if (source == null) {
                  source = '';
                }
                if (level == null) {
                  level = 'info';
                }
                return (dt('o ui:display')).value(expr);
              }
            }
          }
        }
      };
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     help.coffee - Contains code and content for the help system.
  
  */  var __hasProp = Object.prototype.hasOwnProperty;
  define('help',[], function() {
    return function(dt) {
      var converter, displayMarkDown, fixLinks, pkg, uiLib;
      uiLib = (dt('o ui:lib')).value;
      fixLinks = function(div) {
        return div.find('a').replaceWith(function() {
          var a, link;
          a = $(this);
          switch (a.attr('href')) {
            case "/pseudoURL/run":
              link = $("<a href='#'>" + (a.attr('title') ? a.attr('title') : a.text()) + "</a>");
              link.click(function(ev) {
                uiLib.captureEvent(ev);
                return uiLib.run(a.text());
              });
              return link;
            case "/pseudoURL/insert":
              link = $("<a href='#'>" + (a.attr('title') ? a.attr('title') : a.text()) + "</a>");
              link.click(function(ev) {
                uiLib.captureEvent(ev);
                return (dt('o ui:insertText')).value(a.text());
              });
              return link;
            case "/pseudoURL/replace":
              return (dt('o objectViewer:show')).value((dt('v internals')).corelib.execJS((dt('v internals')).corelib.compile(a.text())));
            default:
              return $("<a href='" + (a.attr('href')) + "' target='_blank'>" + (a.text()) + "</a>");
          }
        });
      };
      displayMarkDown = function(md) {
        var result;
        result = $("<div class='eval_result'>" + converter.makeHtml(md) + "</div>");
        fixLinks(result);
        return result;
      };
      converter = new Showdown.converter();
      return pkg = {
        name: 'help',
        attr: {
          description: "Contains the DuctTape help system. Use this package to add documentation for your own packages.<br />\nThe most important item in this package is the help command.",
          author: 'Peter Neumark',
          url: 'https://github.com/neumark/ducttape',
          version: '1.0'
        },
        value: {
          help: {
            attr: {
              description: 'Function implementing the help command.',
              makePublic: true
            },
            value: function(section) {
              var helpText, vwm;
              if ((section != null ? section[dt.symbol() + 'id'] : void 0) != null) {
                try {
                  vwm = dt('o ' + section[dt.symbol() + 'id']);
                } catch (e) {
                  return "Error retrieving help for " + section[dt.symbol() + 'id'];
                }
                if (vwm.attr.description != null) {
                  return displayMarkDown(vwm.attr.description);
                } else {
                  return "No description for " + section[dt.symbol() + 'id'];
                }
              } else {
                                if (section != null) {
                  section;
                } else {
                  section = 'main';
                };
                helpText = pkg.value.helpStore.value[section];
                if (helpText != null) {
                  return displayMarkDown(helpText);
                } else {
                  return "No such help item: " + section;
                }
              }
            }
          },
          listSections: {
            attr: {
              description: 'Utility function for listing help sections.'
            },
            value: function() {
              var dom, key;
              dom = $(converter.makeHtml(((function() {
                var _ref, _results;
                _ref = pkg.value.helpStore.value;
                _results = [];
                for (key in _ref) {
                  if (!__hasProp.call(_ref, key)) continue;
                  _results.push("*   [\u0111.help '" + key + "'](/pseudoURL/run \"" + key + "\")");
                }
                return _results;
              })()).join("\n")));
              fixLinks(dom);
              return dom;
            }
          },
          displayMarkDown: {
            attr: {
              description: 'Returns a DOM element with parsed MarkDown, correctly links to DuctTape PseudoURLs.'
            },
            value: displayMarkDown
          },
          helpStore: {
            attr: {
              description: 'Help contents stored in this object. Should be JSON.stringify-able.'
            },
            value: {
              main: "# DuctTape help #\nthis is the _main_ section, which can be reached via [\u0111.help()](/pseudoURL/run) or [\u0111.help main](/pseudoURL/run).\n\n## Available help sections  \n[(\u0111 'o help:listSections').value()](/pseudoURL/replace)\n## Help for a function or object\nFor any DuctTape function or object, view the related documentation by typing **\u0111.help _function_**\n\nExample: [\u0111.help \u0111.show](/pseudoURL/run)\n",
              intro: "# Welcome to DuctTape #\n_DuctTape_ is an [open source](https://github.com/neumark/ducttape) [CoffeeScript](http://coffeescript.org) [REPL](http://en.wikipedia.org/wiki/REPL) for the web.\n\n## Getting Started ##\nAny valid CoffeeScript expression typed into the console will be translated to JavaScript and executed.\nDuctTape will display the result.\nThe [\u0111.help()](/pseudoURL/run) function can be used to get help about objects included in DuctTape.\nFor example, [\u0111.help \u0111.show](/pseudoURL/run) will describe the _show_ command.\n\n## Key bindings ##\n\n<table><thead><tr><td><b>Key</b></td><td><b>Action</b></td></tr></thead>\n<tbody>\n<tr><td>Enter  </td><td>Executes current statement.</td></tr>\n<tr><td>Shift+Enter &nbsp;</td><td> Start a new line (multiline expressions are allowed).</td></tr>\n<tr><td>F2  </td><td>Toggles display of generated JavaScript source.</td></tr>\n<tr><td>Alt+D  </td><td>Insert the <i>DuctTape symbol</i> (\u0111).</td></tr>\n<tr><td>up  </td><td>Browse command history (go back).</td></tr>\n<tr><td>down  </td><td>Browse command history (go forward).</td></tr>\n</tbody></table>\n\n## Useful functions ##\nDuctTape comes with a few convenience functions to make your life easier:\n\n[\u0111.history()](/pseudoURL/run): List previous commands.\n\n[\u0111.last()](/pseudoURL/run): Get the last command issued, along with its result.\n\n[\u0111.clear()](/pseudoURL/run): Erase the result of previous commands.\n\n[\u0111.ov window](/pseudoURL/run): Browse any javascript object (in this case, _window_).\n\nTo view the list of all currently loaded packages and their contents, run [\u0111.listPackages()](/pseudoURL/run).\n\n## DuctTape is extensible ##\nThanks to it's modular architecture, anyone can add commands to DuctTape.\nWrite your own custom packages, and use DuctTape for whatever you want!\n\n## Get Involved! ##\nDo you enjoy using DuctTape, have feature requests or need help developing custom packages?\n\nLet me know! You can find me on [GitHub](https://github.com/neumark).\n\n**Have fun!**\n"
            }
          }
        }
      };
    };
  });
}).call(this);

(function() {
  /*
     Copyright 2012 Peter Neumark
  
     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at
  
         http://www.apache.org/licenses/LICENSE-2.0
  
     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
  
     ducttape.coffee - main source file, defines the ducttape function.
  
  */  define('ducttape',['cmd', 'keybindings', 'ui', 'pkgmgr', 'objectviewer', 'corelib', 'fs', 'shellutils', 'help'], function(Cmd, KeyBindings, ui, PkgMgr, objectviewer, corelib, fs, shellUtils, help) {
    var DuctTape, dt, dtobj, _ref;
    DuctTape = (function() {
      function DuctTape(config) {
        var _base, _base2, _base3, _ref, _ref2, _ref3, _ref4;
        this.config = config;
                if ((_ref = this.config) != null) {
          _ref;
        } else {
          this.config = {};
        };
                if ((_ref2 = (_base = this.config).globalRef) != null) {
          _ref2;
        } else {
          _base.globalRef = "\u0111";
        };
                if ((_ref3 = (_base2 = this.config).initial_buffer) != null) {
          _ref3;
        } else {
          _base2.initial_buffer = "";
        };
                if ((_ref4 = (_base3 = this.config).showGeneratedJS) != null) {
          _ref4;
        } else {
          _base3.showGeneratedJS = false;
        };
        this.internals = {
          cmd: new (Cmd(this))(),
          corelib: corelib
        };
        this.session = {
          history: [],
          keybindings: new KeyBindings()
        };
      }
      return DuctTape;
    })();
    dtobj = new DuctTape((_ref = window.ducttape_config) != null ? _ref : {});
    dt = dtobj.exec = function() {
      return dtobj.internals.cmd.exec.apply(dtobj.cmd, arguments);
    };
    dtobj.internals.pkgmgr = new (PkgMgr(dt))();
    dtobj.internals.pkgmgr.definePackage(objectviewer(dt));
    dtobj.internals.pkgmgr.definePackage(ui(dt));
    dtobj.internals.pkgmgr.definePackage(fs(dt));
    dtobj.internals.pkgmgr.definePackage(shellUtils(dt));
    dtobj.internals.pkgmgr.definePackage(help(dt));
    dt.toHTML = function() {
      return (dt('o help:help')).value('intro');
    };
    window[dtobj.config.globalRef] = dt;
    return dt;
  });
}).call(this);
