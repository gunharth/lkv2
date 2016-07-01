<?php

Route::auth();

/**
 * Homepage
 */
Route::get('/', 'PagesController@index');

/**
 * Pages
 */
Route::post('page/delete', 'PagesController@postDelete');
Route::get('page/{page}/settings', 'PagesController@settings');
Route::post('page/{page}', 'PagesController@update');
Route::resource('page', 'PagesController');

/**
 * Blog
 */
Route::get('blog/indexEditor', 'PostsController@indexEditor');
Route::get('blog/{post}', 'PostsController@show');
Route::get('blog/{post}/edit', 'PostsController@edit');
Route::get('blog', 'PostsController@index');
Route::post('blog/{post}', 'PostsController@update');
Route::resource('blog', 'PostsController');

/**
 * Menu
 */
Route::post('menu/sortorder', 'MenusController@postOrder');
Route::post('menu/active', 'MenusController@postActive');
Route::post('menu/delete', 'MenusController@postDelete');
Route::get('menu/{menu}/settings', 'MenusController@settings');
Route::post('blog/{id}', 'MenusController@update');
Route::resource('menu', 'MenusController');


/**
 * Admin
 */
// Route::get('forms/page/{page}', function () {
//     return view('page.forms.create');
// });

Route::group(['prefix' => 'admin'], function () {
    
    /**
     *  Editor
     *  Catch all route for create & edit 
     */
    Route::get('forms/{type}/{action}/{id?}', function ($type, $action, $id=null) {
        $templates = \App\Template::where('active', 1)->lists('name', 'id');
        return view('admin.forms.'.$type.'.'.$action, compact('templates', 'id'));
    });

    /**
     * Editor: Tab Menus
     * List and reload all Menus for selected nav
     * Type: ajax
     */
    Route::get('menu/listMenus/{id}', function ($id) {
        $html = '';
        foreach (\App\Menu::where('menu_id', $id)->get()->toHierarchy() as $node) {
            $html .= renderEditorMenus($node);
        }
        return $html;
    });

    /**
     * Editor: Tab Pages
     * List and reload all pages
     * Type: ajax
     */
    Route::get('page/listPages', function () {
        $html = '';
        foreach (\App\Page::orderBy('title')->get() as $page) {
            $html .= renderPage($page);
        }
        return $html;
    });
    /**
     * Editor: Menu Popup: create and edit
     * Fill the select filed on Menu Type change
     * Type: ajax
     */
    Route::get('menuSelectorType/{type}', function ($type) {
        $model = '\App\\'.$type;
        return $model::orderBy('title')->get();
    });
});

/**
 *  Manually register elfinder again to override slug
 */
Route::group(['prefix' => 'elfinder'], function () {
    Route::get('/', 'ElfinderController@showIndex');
    Route::any('connector', ['as' => 'elfinder.connector', 'uses' => 'ElfinderController@showConnector']);
    Route::get('popup/{input_id}', ['as' => 'elfinder.popup', 'uses' => 'ElfinderController@showPopup']);
    Route::get('filepicker/{input_id}', ['as' => 'elfinder.filepicker', 'uses' => 'ElfinderController@showFilePicker']);
    Route::get('tinymce', ['as' => 'elfinder.tinymce', 'uses' => 'ElfinderController@showTinyMCE']);
    Route::get('tinymce4', ['as' => 'elfinder.tinymce4', 'uses' => 'ElfinderController@showTinyMCE4']);
    Route::get('ckeditor', ['as' => 'elfinder.ckeditor', 'uses' => 'ElfinderController@showCKeditor4']);
});


/**
 *  Catch all route for slugs
 */
Route::get('{slug}', function ($slug) {
    $categories = explode('/', $slug);
    $main = App\Menu::where('slug', end($categories))->first();
    reset($categories);

    if ($main) {
        $ancestors = $main->getAncestors();
        $valid = true;
        foreach ($ancestors as $i => $category) {
            if ($category->slug !== $categories[$i]) {
                $valid = false;
                break;
            }
        }
        if ($valid) {
            $app = app();
            $model = new $main->morpher_type;
            $controller = $app->make('App\Http\Controllers\\'.$model->returnController());
            return $controller->callAction('showID', $parameters = array($main->morpher_id));
        }
    }
    App::abort('404');
})->where('slug', '^(?!_debugbar)[A-Za-z0-9_/-]+');
