<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Cviebrock\EloquentSluggable\SluggableInterface;
use Cviebrock\EloquentSluggable\SluggableTrait;

class Page extends Model implements SluggableInterface
{
    use SluggableTrait;

    protected $sluggable = [
        'build_from' => 'title',
        'save_to'    => 'slug',
    ];

    protected $fillable = [
    	'title', 
    	'contentTitle', 
    	'contentLeft', 
    	'contentRight'
    ];

    public function getRouteKeyName()
    {
        return 'slug';
    }

}
