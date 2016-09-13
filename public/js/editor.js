"use strict";
class Editor {

    constructor() {
        this.editorPanel = $('#editor-panel');
        this.editorPanelCollapse = $('#modal-toggle');
        //this.page = {};
        this.page = {"widgets":{"content":[]}};
        this.page_id = 0;
        this.editorFrame = $("#editorIFrame");
        this.data = '';
        this.collection;
        this.collection_id = 0;
        this.editorLocale = 'en';

    }

    showLoadingIndicator() {
        $('#editor-loading').show();
    };

    hideLoadingIndicator() {
        $('#editor-loading').fadeOut();
    };


    initPanel() {
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });

        this.editorFrame.on('load',() => {
            $('a[target!=_blank]', this.editorFrame.contents()).attr('target', '_top');
            this.initRegions();
        });

        this.editorPanel.draggable({
            handle: ".modal-header",
            iframeFix: true,
            cursor: "move",
            containment: "document",
            stop: () => {
                this.savePanelState();
                this.editorPanel.css({ height: 'auto' });
            }
        });

        this.buildWidgetsList();


        /**
         * Boostrap tooltips
         */
        // $('[data-toggle="tooltip"]').tooltip({
        //     animation: false
        // }); 

        $(window).resize(() => {
            let windowWidth = $(window).width();
            let windowHeight = $(window).height();
            let left = $("#editor-panel").position().left;
            let width = $("#editor-panel").width();
            let top = $("#editor-panel").position().top;
            let height = $("#editor-panel").height();
            if (windowWidth < left + width) {
                let newLeft = left - ((left + width) - windowWidth);
                if (newLeft < 0) { newLeft = 0; }
                $("#editor-panel").css({ left: newLeft });
            }
            if (windowHeight < top + height) {
                let newTop = top - ((top + height) - windowHeight);
                if (newTop < 0) { newTop = 0; }
                $("#editor-panel").css({ top: newTop });
            }
            this.savePanelState();
        });

        $('.modal-header select', this.editorPanel).on('change', (e) => {
            e.preventDefault();
            this.editorLocale = $(e.target).val();
            this.loadPages();
            this.loadMenu( this.getMenuID() );
        });

        $('.modal-header .tb-collapse', this.editorPanel).on('click', (e) => {
            e.preventDefault();
            this.editorPanelCollapse.slideToggle(250, () => {
                this.savePanelState();
            });
            $('.modal-header .tb-collapse i').toggleClass('fa-caret-up').toggleClass('fa-caret-down');
        });

        $('.modal-header .tb-refresh', this.editorPanel).on('click', (e) => {
            e.preventDefault();
            this.editorFrame.get(0).contentWindow.location.reload(true);
        });

        $("#tabs").tabs({
            activate: (event, ui) => {
                this.savePanelState();
            },
            create: (event, ui) => {
                this.restorePanelState();
            }
        });

        $(".tabs").tabs({});


        /**
         *	Open new page dialog
         */
        $('#tab-pages', this.editorPanel).on('click', '.btn-create', (e) => {
            e.preventDefault();
            this.addPage();
        });

        /**
         *	Load page in window
         */
        $('#tab-pages', this.editorPanel).on('click', '.load', (e) => {
            e.preventDefault();
            let src = $(e.target).data('url');
            window.top.location.href = src;
        });

        /**
         *	Open edit page dialog
         */
        $('#tab-pages', this.editorPanel).on('click', '.settings', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            this.page_id = parent.data('id');
            this.editPage();
        });

        /**
         *  Duplicate a page
         */
        $('#tab-pages', this.editorPanel).on('click', '.duplicate', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            let page_id = parent.data('id');
            this.showLoadingIndicator();
            $.ajax({
                type: 'POST',
                url: '/admin/page/duplicate',
                data: 'id=' + page_id,
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            }).done((data) => {
                this.data = data;
                this.loadPageURL();
            });
        });

        /**
         *	Delete a page
         */
        $('#tab-pages', this.editorPanel).on('click', '.delete', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            let page_id = parent.data('id');

            let message = 'Are you sure you want to delete page?';

            this.showConfirmationDialog(message, () => {
                this.showLoadingIndicator();
                $.ajax({
                    type: 'POST',
                    url: '/admin/page/'+page_id,
                    data: {
                        '_method': 'delete'
                    },
                    dataType: 'json',
                    error: (xhr, ajaxOptions, thrownError) => {
                        console.log(xhr.status);
                        console.log(thrownError);
                    }
                }).done(() => {
                    parent.slideUp(() => {
                        parent.remove();
                        this.hideLoadingIndicator();
                    });
                });
            });
        });










        /**
        /* Menu funtions
        */
        $('.nestable').nestable({
            maxDepth: 2
        }).on('change', () => {
            this.showLoadingIndicator();
            $.ajax({
                type: 'POST',
                url: '/admin/menu/sortorder',
                data: JSON.stringify($('.nestable').nestable('asNestedSet')),
                contentType: "json",
                /*headers: {
                    'X-CSRF-Token': $('meta[name="_token"]').attr('content')
                },*/
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            }).done(() => {
                this.hideLoadingIndicator();
            });
        });


        /**
         *	Open new menu dialog
         */
        $('#tab-menus', this.editorPanel).on('click', '.btn-create', (e) => {
            e.preventDefault();
            //let menu_type_id = $('#menuSelector').find('option:selected').val();
            this.addMenu( this.getMenuID() );
        });

        /**
         *  Load menu in window
         */
        $('#tab-menus', this.editorPanel).on('click', '.load', (e) => {
            e.preventDefault();
            let src = $(e.target).data('url');
            let target = $(e.target).data('target');
            if(target == '') {
                window.top.location.href = src;
            } else {
                window.open(src);
            }
        });


        /**
         *  Open edit menu dialog
         */
        $('#tab-menus', this.editorPanel).on('click', '.edit', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            this.menu_type_id = parent.data('id');
            this.editMenu();
        });


        /**
         *	Toggle menu active state
         */
        $('#tab-menus', this.editorPanel).on('click', '.toggleActive', (e) => {
            e.preventDefault();
            this.showLoadingIndicator();
            let menu_type_id = $(e.target).parents('.dd-item').data('id');
            let active = $(e.target).data('active');
            $.ajax({
                type: 'POST',
                url: '/admin/menu/active',
                data: 'id=' + menu_type_id + '&active=' + active,
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            }).done(() => {
                $(e.target).toggleClass("fa-circle-o").toggleClass("fa-circle");
                this.hideLoadingIndicator();
            });
        });


        /**
         *	Delete a menu
         */
        $('#tab-menus', this.editorPanel).on('click', '.delete', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            let menu_type_id = parent.data('id');

            let message = 'Are you sure you want to delete menu item?';

            this.showConfirmationDialog(message, () => {
                this.showLoadingIndicator();
                $.ajax({
                    type: 'POST',
                    url: '/admin/menu/'+menu_type_id,
                    data: {
                        '_method': 'delete'
                    },
                    dataType: 'json',
                    error: (xhr, ajaxOptions, thrownError) => {
                        console.log(xhr.status);
                        console.log(thrownError);
                    }
                }).done(() => {
                    parent.slideUp(() => {
                        parent.remove();
                        this.hideLoadingIndicator();
                    });
                });
            });
        });

        /**
         *	Select a menu
         */
        $('#menuSelector', this.editorPanel).on('change', (e) => {
            //let menu_type_id = $('#menuSelector').find('option:selected').val();
            this.loadMenu( this.getMenuID() );
        });

        /**
         *  Menu item type form select
         */
        $('body').on('change','#menuTypeSelector', (e) => {
            this.renderMenuTypeSelect();
        });


        /**
         *  Open edit collection dialog
         */
        $('#tab-collections', this.editorPanel).on('click', '.openCollection', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            this.collection = parent.data('collection');
            //console.log(this.collection)
            this.editCollection(this.collection);
        });

        /**
         *  Tab collections tab1
         *  Load collection in iframe
         */

        $('body').on('click', '#collection-tab1 .btn-create', (e) => {
            e.preventDefault();
            this.addCollectionItem();
        });

        /**
         *  Tab collections tab1
         *  Load collection in iframe
         */
        $('body').on('click', '#tab-collection-tab1 .load', (e) => {
            e.preventDefault();
            let src = $(e.target).data('url');
            //this.editorFrame = src;
            // this.editorFrame.attr('src',src);
            window.top.location.href = src;
        });

        $('body').on('click', '#collectionItems .edit', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            this.collection_id = parent.data('id');
            this.editCollectionItem();
        });

        $('body').on('click', '#collectionItems .delete', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            this.collection_id = parent.data('id');

            let message = 'Are you sure you want to delete this item?';

            this.showConfirmationDialog(message, () => {
                this.showLoadingIndicator();
                $.ajax({
                    type: 'POST',
                    url: '/admin/blog/'+this.collection_id,
                    data: {
                        '_method': 'delete'
                    },
                    dataType: 'json',
                    error: (xhr, ajaxOptions, thrownError) => {
                        console.log(xhr.status);
                        console.log(thrownError);
                    }
                }).done(() => {
                    this.loadCollectionItems();
                    $('#collection-tab1-left').html('');
                    // parent.slideUp(() => {
                    //     parent.remove();
                    //     this.hideLoadingIndicator();
                    // });
                });
            });
        });

        $('body').on('click', 'button.submit', (e) => {
            e.preventDefault();
            let form = $(e.target).parents('form');
            this.submitCollectionForm(form);
        });
        
        // collection pagination
        $('body').on('click', '#collection-edit .pagination a', (e) => {
            e.preventDefault();
            this.showLoadingIndicator();
            let href = $(e.target).attr('href');
            $.ajax({
                type: 'GET',
                url: href,
                error: (xhr, ajaxOptions, thrownError) => {
                    console.log(xhr.status);
                    console.log(thrownError);
                }
            }).done((html) => {
                $('#collectionItemsOuter').html(html)
                this.hideLoadingIndicator();
            });
        });
        

        

        /**
         *  Tab settings logs
         *  Load collection in iframe
         */
        $('#tab-settings', this.editorPanel).on('click', '.openLogs', (e) => {
            e.preventDefault();
            let parent = $(e.target).parents('.dd-item');
            this.setting = parent.data('setting');
            //console.log(this.setting)
            this.editSetting(this.setting);
        });

    }

    /**
     *  Editor edit collection window
     */
    editCollection() {
        this.openDialog({
            id: 'collection-edit',
            title: 'Edit',
            modal: true,
            width: 800,
            url: '/admin/'+this.collection+'/collectionIndex',
            type: 'ajax',
            onAfterShow: () => {
                this.loadCollectionItems();
            },
            // callback: () => {
            // //     //this.loadPages();
            // //     // alert('yo');
            // //this.loadCollectionItems(collection);
            // },
            buttons: {
            //     ok: 'Save',
            //     Cancel: () => {
            //         this.dialog.dialog("close");
            //     }
            }
        });
    };

    /**
     *  Editor load all collection items
     */
    loadCollectionItems() {
        this.showLoadingIndicator();
        $.ajax({
            type: 'GET',
            url: '/admin/'+this.collection+'/listCollectionItems',
            //data: 'id='+menu_type_id,
            error: (xhr, ajaxOptions, thrownError) => {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }).done((html) => {
            $('#collectionItemsOuter').html(html)
            this.hideLoadingIndicator();
        });
    }

    /**
     *  Editor add collection item
     */
    addCollectionItem() {
        this.showLoadingIndicator();
        $.ajax({
            type: 'GET',
            url: '/' + this.editorLocale + '/admin/'+this.collection+'/create',
            //data: 'id='+menu_type_id,
            error: (xhr, ajaxOptions, thrownError) => {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }).done((html) => {
            $('#collection-tab1-left').html(html)
            $('#collection-tab1-left .tabs').tabs();
            this.hideLoadingIndicator();
        });
    };

    /**
     *  Editor edit collection window
     */
    editCollectionItem() {
        this.showLoadingIndicator();
        $.ajax({
            type: 'GET',
            url: '/' + this.editorLocale + '/admin/'+this.collection+'/' + this.collection_id + '/settings',
            //data: 'id='+menu_type_id,
            error: (xhr, ajaxOptions, thrownError) => {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }).done((html) => {
            $('#collection-tab1-left').html(html)
            $('#collection-tab1-left .tabs').tabs();
            this.hideLoadingIndicator();
        });
    };

    submitCollectionForm(form) {
        // if (options.type == 'ajax') {
            this.showLoadingIndicator();
            //let form = $('#collection-edit form:visible');
            let formData = form.serialize();
            let action = form.attr('action');
            $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: action, // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                error: (data) => {
                        this.hideLoadingIndicator();
                        $("input").parent().removeClass('has-error');
                        $("input").prev().find('span').remove();
                        let errors = data.responseJSON;
                        console.log(errors);
                        $.each( errors, ( key, value ) => {
                            $("input[name="+key+"]").parent().addClass('has-error');
                            $("input[name="+key+"]").prev().append(' <span class="has-error">'+value+'</span>');
                           })
                    }
            }).done((data) => {
                //this.hideLoadingIndicator();
                console.log(data)
                if(data == true) {
                    this.hideLoadingIndicator();
                } else {
                     this.collection_id = data.id;
                     this.loadCollectionItems(this.collection);
                    this.editCollectionItem();
                }
               
                //this.data = data;
                //dialog.dialog('close');
                //dialog.remove();
                // if (typeof(options.callback) === 'function') {
                //     options.callback();
                // }

            });
        // } else {
        //     form.submit()
        // }
    }

    /**
     *  Editor edit page window
     */
    editSetting(setting) {
        this.openDialog({
            id: 'setting-edit',
            title: 'Edit',
            modal: false,
            width: 800,
            url: '/admin/'+setting,
            type: 'ajax',
            // callback: () => {
            //     this.loadPages();
            // },
            buttons: {
            //     ok: 'Save',
            //     Cancel: () => {
            //         this.dialog.dialog("close");
            //     }
            }
        });
    };

    /**
     * Menu Popup create edit
     * Render selection
     */
    renderMenuTypeSelect() {
        let dropdown = $('#menuTypeItemSelector');
        if(dropdown.length) {
            let external = $('#menuTypeExternalInput');
            let selected = $('#menuTypeSelector').find('option:selected').val();
            if(selected == 'External') {
                dropdown.hide();
                external.show();
            } else {
                dropdown.show();
                external.hide();
                $('#external_link').val('');
                $.ajax({
                    type: 'GET',
                    url: '/admin/menuSelectorType/' + selected,
                    //data: 'id='+menu_type_id,
                    error: (xhr, ajaxOptions, thrownError) => {
                        console.log(xhr.status);
                        console.log(thrownError);
                    }
                }).done((data) => {
                    dropdown.empty();
                    //ele.append('<option value="0">-- Auswahl --</option>');
                    let selected = 0;
                    if($('#morpher_id_orig').length) {
                        selected = $('#morpher_id_orig').text();
                    }
                    for (var i = 0; i < data.length; i++) {
                        let sel = '';
                        if(data[i].id == selected) {
                            sel = ' selected="selected"';
                        }
                        dropdown.append('<option value="' + data[i].id + '"' + sel + '>' + data[i].title + '</option>');
                    }
                });
            }
        }
    }

    /**
     *  Editor load all pages
     */
    loadPages() {
        this.showLoadingIndicator();
        $.ajax({
            type: 'GET',
            url: '/admin/page/listPages/'+ this.editorLocale,
            //data: 'id='+menu_type_id,
            error: (xhr, ajaxOptions, thrownError) => {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }).done((html) => {
            $('#pageItems').html(html)
            this.hideLoadingIndicator();
        });
    }

    /**
     *	Editor edit page window
     */
    editPage() {
        this.openDialog({
            id: 'page-edit',
            title: 'Edit',
            modal: true,
            url: '/'+this.editorLocale+'/admin/page/' + this.page_id + '/settings',
            type: 'ajax',
            callback: () => {
                this.loadPages();
            },
            buttons: {
                ok: 'Save',
                Cancel: () => {
                    this.dialog.dialog("close");
                }
            }
        });
    };


    /**
     * Editor add page window
     */
    addPage() {
        this.openDialog({
            id: 'page-add',
            title: 'Create a new Page',
            modal: true,
            url: '/admin/page/create',
            type: 'ajax',
            buttons: {
                ok: 'Create',
                Cancel: () => {
                    this.dialog.dialog("close");
                }
            },
            callback: () => {
                this.loadPageURL();
            },
        });
    };

    loadPageURL() {
        window.top.location.href = '/page/'+this.data.slug;
    }


    /**
     * save Editor State
     */
    savePanelState() {
        let activeLanguage = this.editorLocale;
        let activeTab = $('#tabs').tabs("option", "active");
        // let active menu
        let activeMenu = $('#menuSelector', this.editorPanel).val();
        localStorage.setItem("editor-panel", JSON.stringify({
            position: this.editorPanel.position(),
            locale: activeLanguage,
            tab: activeTab,
            menu: activeMenu,
            expanded: $('#modal-toggle:visible', this.editorPanel).length
        }));
    };


    /**
     * restore Editor State
     */
    restorePanelState() {
        this.editorPanel.fadeIn();
        let panelState = {};
        if (!localStorage.getItem("editor-panel")) {
            panelState = {
                position: { left: 50, top: 150 },
                locale: this.editorLocale,
                tab: 0,
                menu: 1,
                expanded: true
            };
        } else {
            panelState = JSON.parse(localStorage.getItem("editor-panel"))
        }
        this.editorPanel.css(panelState.position);
        this.editorLocale = panelState.locale;
        $("#editorLocales > [value=" + panelState.locale + "]").attr("selected", "true");
        $('#tabs').tabs("option", "active", panelState.tab);
        $("#menuSelector > [value=" + panelState.menu + "]").attr("selected", "true");
        this.loadPages();
        this.loadMenu(panelState.menu);
        if (!panelState.expanded) {
            this.editorPanelCollapse.hide();
            $('.modal-header .tb-collapse i').toggleClass('fa-caret-up').toggleClass('fa-caret-down');
        }
    };

    
    /**
    *  Get active Menu id
    */
   getMenuID() {
        return $('#menuSelector').find('option:selected').val();
   }

   /**
     *  Editor load selected menu
     */
    loadMenu(menu_type_id) {
        this.showLoadingIndicator();
        $.ajax({
            type: 'GET',
            url: '/admin/menu/listMenus/' + menu_type_id + '/' + this.editorLocale,
            //data: 'id='+menu_type_id,
            error: (xhr, ajaxOptions, thrownError) => {
                console.log(xhr.status);
                console.log(thrownError);
            }
        }).done((html) => {
            $('#menuItems').html(html)
            this.savePanelState();
            this.hideLoadingIndicator();
        });
    }


    /**
     *  Editor edit menu window
     */
    editMenu() {
        this.openDialog({
            id: 'menu-edit',
            title: 'Edit',
            modal: true,
            url: '/admin/menu/' + this.menu_type_id + '/settings'+ '/' + this.editorLocale,
            type: 'ajax',
            onAfterShow: () => {
                this.renderMenuTypeSelect();
            },
            callback: () => {
                this.loadMenu( this.getMenuID() );
            },
            cache: false,
            buttons: {
                ok: 'Save',
                Cancel: () => {
                    this.dialog.dialog("close");
                }
            }
        });
    };



    addMenu(menu_type_id) {
        this.openDialog({
            id: 'menu-add',
            title: 'Create a new menu',
            modal: true,
            url: '/'+this.editorLocale+'/admin/menu/create/' + menu_type_id,
            type: 'ajax',
            onAfterShow: () => {
                this.renderMenuTypeSelect();
                // if($('#menuTypeItemSelector').length) {
                //     let ele = $('#menuTypeItemSelector');
                //     let selected = $('#menuTypeSelector').find('option:selected').val();
                //     $.ajax({
                //         type: 'GET',
                //         url: '/'+this.editorLocale+'/admin/menuSelectorType/' + selected,
                //         //data: 'id='+menu_type_id,
                //         error: (xhr, ajaxOptions, thrownError) => {
                //             console.log(xhr.status);
                //             console.log(thrownError);
                //         }
                //     }).done((data) => {
                //         ele.empty();
                //         //ele.append('<option value="0">-- Auswahl --</option>');
                //         let selected = $('#morpher_id_orig').text();
                //         for (var i = 0; i < data.length; i++) {
                //             let sel = '';
                //             if(data[i].id == selected) {
                //                 sel = ' selected="selected"';
                //             }
                //             ele.append('<option value="' + data[i].id + '"' + sel + '>' + data[i].title + '</option>');
                //         }
                //     });
                // }
            },
            callback: () => {
                this.loadMenu(menu_type_id);
            },
            buttons: {
                ok: 'Create',
                Cancel: () => {
                    this.dialog.dialog("close");
                }
            }
        });
    };
    

    openDialog(options) {
        //$('#'+options.id).remove();
        var formDom = $('<div></div>').attr('id', options.id);
        $.ajax({
                url: options.url,
            })
            .done((html) => {
                formDom.hide().append(html);
                if (formDom.find('.tabs').length === 1) {
                    $('.tabs', formDom).tabs({
                        /*activate: function(){
                            if (typeof(options.onTabChange) === 'function'){
                                options.onTabChange(formDom);
                            }
                        }*/
                    });
                }
                $('body').append(formDom);
                this.showDialog(options);
            });
    }



    showDialog(options) {
        var dialog = $('#' + options.id);

        var buttons = {};
        if(typeof(options.buttons.ok) !== 'undefined') {
            buttons[options.buttons.ok] = () => {
                var form = $('form', dialog);
                this.submitForm(dialog, form, options);
            };
        }
        // buttons['Close'] = () => {
        //     dialog.dialog('close');
        //     dialog.remove();
        // };

        dialog.dialog({
            title: options.title,
            modal: options.modal,
            buttons: buttons,
            width: typeof(options.width) === 'undefined' ? 450 : options.width,
            minWidth: 300,
            minHeight: 600,
            /*position: {
                my: "center top",
                at: "center top+50",
                of: window
            },*/
            open:function () {

                //$(this).closest('.ui-dialog').find(".ui-dialog-buttonset .ui-button:first").addClass("green");

                if (typeof(options.onAfterShow) === 'function'){
                    options.onAfterShow();
                }

            },
            close: function( event, ui ) {
                dialog.remove();
            }
        });
    };

    submitForm(dialog, form, options) {
        if (options.type == 'ajax') {
            var formData = form.serialize();
            let action = form.attr('action');
            $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: action, // the url where we want to POST
                data: formData, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                error: (data) => {
                        $("input").parent().removeClass('has-error');
                        $("input").prev().find('span').remove();
                        let errors = data.responseJSON;
                        console.log(errors);
                        $.each( errors, ( key, value ) => {
                            $("input[name="+key+"]").parent().addClass('has-error');
                            $("input[name="+key+"]").prev().append(' <span class="has-error">'+value+'</span>');
                           })
                    }
            }).done((data) => {
                this.data = data;
                dialog.dialog('close');
                //dialog.remove();
                if (typeof(options.callback) === 'function') {
                    options.callback();
                }

            });
        } else {
            form.submit()
        }
    }

    showConfirmationDialog(message, onConfirm, onCancel) {

        var buttons = {};

        buttons["yes"] = function() {
            if (typeof(onConfirm) === 'function') { onConfirm(); }
            $(this).dialog('close');
        };

        buttons["no"] = function() {
            if (typeof(onCancel) === 'function') { onCancel(); }
            $(this).dialog('close');
        };

        $('<div class="message-text inlinecms"></div>').append(message).dialog({
            title: "confirmation",
            modal: true,
            resizable: false,
            width: 350,
            buttons: buttons,
            open: function() {
                $(this).closest('.ui-dialog').find(".ui-dialog-buttonset .ui-button:first").addClass("green");
                $(this).closest('.ui-dialog').find(".ui-dialog-buttonset .ui-button:last").addClass("red");
            }
        });

    };



    buildWidgetsList() {

        var widgetsList = $('#tab-elements .list ul' , this.editorPanel);

        // for(var i in this.options.widgetsList){

        //     var widgetId = this.options.widgetsList[i];

        //     var title = this.widgetHandlers[widgetId].getTitle();
        //     var icon = this.widgetHandlers[widgetId].getIcon();

        //     var item = $('<li></li>').attr('data-id', widgetId).addClass('inlinecms-widget-element');
        //     item.html('<i class="fa '+icon+'"></i>');
        //     item.attr('title', title);
        //     item.tooltip({
        //         track: true,
        //         show: false,
        //         hide: false
        //     });

        //     widgetsList.append(item);

        // }


        //var widgetId = this.options.widgetsList['text'];

       // var title = this.widgetHandlers[widgetId].getTitle();
       //  var icon = this.widgetHandlers[widgetId].getIcon();

        var item = $('<li></li>').attr('data-id', 'text').addClass('inlinecms-widget-element');
                item.html('<i class="fa fa-font"></i>');
                item.attr('title', 'Text');
            item.tooltip({
                track: true,
                show: false,
                hide: false
            });

             widgetsList.append(item);

        // }

        $('li', widgetsList).draggable({
            helper: "clone",
            iframeFix: true
        });

    };

    initRegions() {
        //alert('fsfs,');
        $('.jodelRegion', this.editorFrame.contents()).each((i,elm)=>{
            var region = $(elm);

            var dropZone = $('<div></div>').addClass('drop-helper').addClass('inlinecms');
            dropZone.html('<i class="fa fa-plus-circle"></i>');

            region.append(dropZone);

            $('.drop-helper', region).hide();

            if (region.hasClass('inlinecms-region-fixed')) { return; }

            region.droppable({
                accept: ".inlinecms-widget-element",
                over: () => {
                    $('.drop-helper', region).show();
                },
                out: () => {
                    $('.drop-helper', region).hide();
                },
                drop: ( event, ui ) => {
                    $('.drop-helper', region).hide();
                    this.addWidget(region, ui.draggable.data('id'));
                }
            });

            region.sortable({
                handle: '.b-move',
                update: function( event, ui ){
                    this.reorderWidgets(region.data('region-id'));
                }
            });

        });

    };

    getMaxWidgetId(regionId){

        var maxId = 0;

        for (var index in this.page.widgets[regionId]){

            var widget = this.page.widgets[regionId][index];

            if (widget.id > maxId){
                maxId = widget.id;
            }

        }

        return maxId;

    };


    addWidget(regionDom, handlerId){

        var regionId = regionDom.data('region-id');
        var widgetId = this.getMaxWidgetId(regionId)+1;
        //var widgetId = 1;

        var widget = {
            id: widgetId,
            handler: handlerId,
            content: 'Spme text',
            domId: 'inlinecms-widget-' + regionId + widgetId,
            options: []
        };
        //console.log(widget);

        var dom = $('<div></div>')
                    .attr('id', widget.domId)
                    .addClass('inlinecms-widget')
                    .addClass('inlinecms-widget-'+handlerId)
                    .data('id', widgetId);

        dom.append('<div class="inlinecms-content"><div class="jodelTextarea" data-field="content02">fdsfsdfsdf</div></div>');

        $('.drop-helper', regionDom).before(dom);

        //var handler = this.widgetHandlers[ widget.handler ];
        var handler = 'text';
        //handler.createWidget(regionId, widget, function(widget){
            //cms.buildWidgetToolbar(dom, handler);
            //this.page.widgets[regionId].push(widget);

            this.editorFrame.get(0).contentWindow.initTinyMCE();
            //ajax to save new element to region
            console.log(regionId);
            $.ajax({
                type: 'POST', // define the type of HTTP verb we want to use (POST for our form)
                url: 'admin/page/addElement', // the url where we want to POST
                data: {'id' : regionId }, // our data object
                dataType: 'json', // what type of data do we expect back from the server
                encode: true,
                error: (data) => {
                    
                    }
            }).done((data) => {
                return true;
            });
        //});

        //this.setChanges();

    };




}

$(function() {

    let editor = new Editor();
    editor.initPanel()


});
