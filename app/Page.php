<?php

namespace App;

use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Dimsav\Translatable\Translatable;

class Page extends Model
{
    use LogsActivity;
    use Translatable;

    /**
     * returnController for catch all routes.
     * @return string
     */
    public function returnController()
    {
        return 'PagesController';
    }

    protected $fillable = [
        'title',
        'slug',
        'content01',
        'content02',
        'content03',
        'content04',
        'content05',
        'content06',
        'content07',
        'content08',
        'content09',
        'content10',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'template_id',
        'head_code',
        'body_start_code',
        'body_end_code',
    ];

    public $translatedAttributes = [
        'title',
        'slug',
        'content01',
        'content02',
        'content03',
        'content04',
        'content05',
        'content06',
        'content07',
        'content08',
        'content09',
        'content10',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected static $logAttributes = [
        'title',
        'slug',
        'content01',
        'content02',
        'content03',
        'content04',
        'content05',
        'content06',
        'content07',
        'content08',
        'content09',
        'content10',
        'meta_title',
        'meta_description',
        'meta_keywords',
        'template_id',
        'head_code',
        'body_start_code',
        'body_end_code',
    ];

    protected $with = [
        'template',
        'menu',
        'translations',
    ];

    protected $appends = [
        'link',
    ];

    public function getLinkAttribute()
    {
        if ($this->slug == 'home') {
            return '/';
        }

        return '/page/'.$this->slug;
    }

    // Menu::class Morph Relation
    public function menu()
    {
        return $this->morphMany(Menu::class, 'morpher');
    }

    // Template::class Relation
    public function template()
    {
        return $this->belongsTo(Template::class);
    }
}
