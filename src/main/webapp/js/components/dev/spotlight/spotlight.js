define(function (require) {

    var link = document.createElement("link");
    link.type = "text/css";
    link.rel = "stylesheet";
    link.href = "geppetto/js/components/dev/spotlight/spotlight.css";
    document.getElementsByTagName("head")[0].appendChild(link);

    var React = require('react'),
        $ = require('jquery'),
        typeahead = require('typeahead'),
        bh = require('bloodhound'),
        handlebars = require('handlebars');

    var GEPPETTO = require('geppetto');

    var Spotlight = React.createClass({
        mixins: [
            require('jsx!mixins/bootstrap/modal')
        ],

        componentDidMount: function () {

            var space = 32;
            var escape = 27;

            $(document).keydown(function (e) {
                if (GEPPETTO.isKeyPressed("ctrl") && e.keyCode == space) {
                    $("#spotlight").show();
                    $("#typeahead").focus();
                    var selection = GEPPETTO.G.getSelection();
                    if(selection.length>0){
                        var instance = selection[selection.length-1];
                        $(".typeahead").typeahead('val',instance.getInstancePath());
                        $("#typeahead").trigger(jQuery.Event("keypress",{which:13}));
                    }
                }
            });

            $(document).keydown(function (e) {
                if ($("#spotlight").is(':visible') && e.keyCode == escape) {
                    $("#spotlight").hide();
                }
            });

            $('#typeahead').keydown(this, function (e) {
                    if (e.which == 9 || e.keyCode == 9) {
                        e.preventDefault();
                }
            });

            $('#typeahead').keypress(this, function (e) {
                if (e.which == 13 || e.keyCode == 13) {

                    if (!this.instance || this.instance.getInstancePath() != $('#typeahead').val()) {
                        var instancePath = $('#typeahead').val();
                        this.instance = Instances.getInstance(instancePath);
                        e.data.loadToolbarFor(this.instance);
                    }

                    if(this.instance) {
                        if ($(".spotlight-toolbar").length == 0) {
                            e.data.loadToolbarFor(this.instance);
                        }

                        $(".tt-menu").hide();
                        $(".spotlight-button").eq(0).focus();
                    }

                }
            });



            GEPPETTO.on(Events.Experiment_loaded, (function () {

                instances.add(GEPPETTO.ModelFactory.allPaths);

            }));


            var instances = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('path'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
            });

            Handlebars.registerHelper('geticon', function(metaType) {
                return new Handlebars.SafeString("<icon class='fa " + GEPPETTO.Resources.Icon[metaType]+"' style='margin-right:5px; color:" + GEPPETTO.Resources.Colour[metaType]+";'/>");
            });

            $('#typeahead').typeahead({
                    hint: true,
                    highlight: true,
                    minLength: 1
                },
                {
                    name: 'instances',
                    source: instances,
                    limit: 50,
                    display: 'path',
                    templates: {
                    empty: ['<div class="empty-message">', 'No suggestions', '</div>'].join('\n'),
                    suggestion: Handlebars.compile('<div>{{geticon metaType}} {{path}}</div>')
                }
            });

            $('.twitter-typeahead').addClass("typeaheadWrapper");

        },

        BootstrapMenuMaker: {
            named: function (constructor, name, def, instance) {
                return constructor.bind(this)(def, name, instance).attr('id', name);
            },


            buttonCallback: function (button, bInstance) {
                var instance=bInstance;
                var that=this;
                return function () {
                    button.actions.forEach(function (action) {
                        GEPPETTO.Console.executeCommand(that.getCommand(action,instance))
                    });
                }
            },

            statefulButtonCallback: function (button, name, bInstance) {
                var that=this;
                var instance=bInstance;
                return function () {
                    var condition=that.execute(button.condition,instance);
                    var actions=button[condition].actions;
                    actions.forEach(function (action) {
                        GEPPETTO.Console.executeCommand(that.getCommand(action,instance));
                    });
                    that.switchStatefulButtonState(button, name, condition);
                }
            },

            switchStatefulButtonState : function(button, name, condition) {
                $("#"+name)
                    .attr('title', button[condition].tooltip)
                    .removeClass(button[condition].icon)
                    .addClass(button[!condition].icon);
                $("#"+name+" .spotlight-button-label").html(button[!condition].label);
            },

            getCommand:function(action,instance){
                return action.split("$instance$").join(instance.getInstancePath());
            },

            execute:function(action, instance){
                return eval(this.getCommand(action, instance));
            },

            createButton: function (button, name, instance) {
                var label=null;
                var buttonElement=null;

                if(button.hasOwnProperty("condition")){
                    var condition=this.execute(button.condition, instance);
                    var b=button[condition];
                    label=$("<div class='spotlight-button-label'>").html(b.label);
                    buttonElement= $('<button>')
                        .addClass('btn btn-default btn-lg fa spotlight-button')
                        .addClass(b.icon)
                        .attr('data-toogle', 'tooltip')
                        .attr('data-placement', 'bottom')
                        .attr('title', b.tooltip)
                        .attr('container', 'body')
                        .on('click', this.statefulButtonCallback(button, name, instance));
                }
                else {
                    label=$("<div class='spotlight-button-label'>").html(button.label);
                    buttonElement = $('<button>')
                        .addClass('btn btn-default btn-lg fa spotlight-button')
                        .addClass(button.icon)
                        .attr('data-toogle', 'tooltip')
                        .attr('data-placement', 'bottom')
                        .attr('title', button.tooltip)
                        .attr('container', 'body')
                        .on('click', this.buttonCallback(button, instance));
                }

                buttonElement.append(label);
                return buttonElement;
            },

            createButtonGroup: function (bgName, bgDef, bgInstance) {
                var that = this;
                var instance = bgInstance;s
                var bg = $('<div>')
                    .addClass('btn-group')
                    .attr('role', 'group')
                    .attr('id', bgName);
                $.each(bgDef, function (bName, bData) {
                    var button=that.named(that.createButton, bName, bData, instance);
                    bg.append(button)
                    $(button).keypress(that, function (e) {
                        if(e.which == 13 || e.keyCode == 13)  // enter
                        {
                            if(button.hasOwnProperty("condition")) {
                                e.data.statefulButtonCallback(button, instance);
                            }
                            else{
                                e.data.buttonCallback(button, instance);
                            }

                        }
                    });
                    $(button).keydown(that, function (e) {
                        if(e.which == 27 || e.keyCode == 27)  // escape
                        {
                            $(".spotlight-toolbar").remove();
                            $('#typeahead').focus();
                            e.stopPropagation();
                        }
                    });
                    $(button).keydown(function (e) {
                        if(e.which == 9 || e.keyCode == 9)  // tab
                        {
                            e.preventDefault();
                            var next=$(this).next();
                            if(next.length==0)
                            {
                                next=$(".spotlight-button").eq(0);
                            }
                            $(next).focus();
                        }
                    });
                    $(button).mouseover(function (e) {
                        $(button).focus();
                    });
                    $(button).mouseout(function (e) {
                        $(".typeahead-wrapper").focus();
                    })
                });
                return bg;
            },

            generateToolbar: function (buttonGroups, instance) {
                var that = this;
                var tbar = $('<div>').addClass('spotlight-toolbar');
                $.each(buttonGroups, function (groupName, groupDef) {
                    if(instance.get("capabilities").indexOf(groupName)!=-1) {
                        tbar.append(that.createButtonGroup(groupName, groupDef, instance));
                    }
                });
                return tbar;
            }
        },

        loadToolbarFor: function(instance){
            $(".spotlight-toolbar").remove();
            $('#spotlight').append(this.BootstrapMenuMaker.generateToolbar(this.configuration.SpotlightBar,instance));

        },

        render: function () {
            return <input id = "typeahead" className = "typeahead" type = "text" placeholder = "Lightspeed Search" />
        },


        configuration: {
            "SpotlightBar": {
                "VisualCapability": {
                    "buttonOne":{
                        "condition":"$instance$.isSelected()",
                        "false": {
                            "actions": ["$instance$.select(true)"],
                            "icon": "fa-hand-stop-o",
                            "label": "Unselected",
                            "tooltip": "Select"
                        },
                        "true": {
                            "actions": ["$instance$.deselect(true)"],
                            "icon": "fa-hand-rock-o",
                            "label": "Selected",
                            "tooltip": "Deselect"
                        },
                    },
                    "buttonTwo": {
                        "condition":"$instance$.isVisible()",
                        "false": {
                            "actions": [
                                "$instance$.show(true)"
                            ],
                            "icon": "fa-eye-slash",
                            "label": "Hidden",
                            "tooltip": "Show"
                        },
                        "true":{
                            "actions": [
                                "$instance$.hide(true)"
                            ],
                            "icon": "fa-eye",
                            "label": "Visible",
                            "tooltip": "Hide"
                        }

                    },
                    "buttonThree": {
                        "actions": [
                            "$instance$.zoomTo()"
                        ],
                        "icon": "fa-search-plus",
                        "label": "Zoom",
                        "tooltip": "Zoom"
                    },
                },
                "ParameterCapability": {
                    "buttonOne": {
                        "actions": [
                            "$instance$.setValue($value)"
                        ],
                        "icon": "fa-i-cursor",
                        "label": "Set value",
                        "tooltip": "Set parameter value"
                    }
                },
                "StateVariableCapability": {
                    "watch":{
                        "condition":"$instance$.isWatched()",
                        "false": {
                            "actions": ["$instance$.setWatched(true)"],
                            "icon": "fa-circle-o",
                            "label": "Not recorded",
                            "tooltip": "Record the state variable"
                        },
                        "true": {
                            "actions": ["$instance$.setWatched(false)"],
                            "icon": "fa-dot-circle-o",
                            "label": "Recorded",
                            "tooltip": "Stop recording the state variable"
                        }
                    },
                    "plot": {
                        "actions": [
                            "G.addWidget(0).plotData($instance$).setName('$instance$')",
                        ],
                        "icon": "fa-area-chart ",
                        "label": "Plot",
                        "tooltip": "Plot state variable"
                    }
                }
            }

        },
    });

    React.renderComponent(Spotlight({}, ''), document.getElementById("spotlight"));
});